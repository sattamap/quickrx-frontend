
import { useCallback, useEffect, useState } from "react";

import {
  getTodayBookings,
  type Booking,
  type BookingStatus,
} from "../../services/bookingApi";

import { getBookingSocket } from "../../lib/bookingSocket";
import { apiRequest } from "../../services/apiClient";

const DoctorQueue = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadBookings = useCallback(async () => {
    try {
      setError("");
      const result = await getTodayBookings();
      setBookings(result);
    } catch (loadError: unknown) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load today's queue.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    const fetchBookings = async () => {
      try {
        setError("");

        const result = await getTodayBookings();

        if (isActive) {
          setBookings(result);
        }
      } catch (loadError: unknown) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load today's queue.",
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    const timer = window.setTimeout(() => {
      void fetchBookings();
    }, 0);

    const socket = getBookingSocket();

    const handleBookingUpdated = () => {
      void fetchBookings();
    };

    socket?.on("booking:updated", handleBookingUpdated);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
      socket?.off("booking:updated", handleBookingUpdated);
    };
  }, []);

  const changeStatus = async (
    bookingId: string,
    status: BookingStatus,
  ) => {
    try {
      setUpdatingId(bookingId);
      setError("");

      await apiRequest<Booking>(
        `/bookings/${encodeURIComponent(bookingId)}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      );

      // Update this queue immediately after the API succeeds.
      await loadBookings();
    } catch (updateError: unknown) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Unable to update booking status.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const waitingCount = bookings.filter(
    (booking) => booking.status === "waiting",
  ).length;

  const calledCount = bookings.filter(
    (booking) => booking.status === "called",
  ).length;

  const completedCount = bookings.filter(
    (booking) => booking.status === "completed",
  ).length;

  if (isLoading) {
    return (
      <p className="p-4 text-sm text-slate-500">
        Loading today's queue...
      </p>
    );
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      {/* Queue heading */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Today's patient queue
          </h2>
          <p className="text-sm text-slate-500">
            {bookings.length} patient
            {bookings.length === 1 ? "" : "s"} booked
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadBookings()}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      {/* Queue statistics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">
            Waiting
          </p>
          <p className="mt-1 text-2xl font-bold text-amber-900">
            {waitingCount}
          </p>
        </div>

        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-800">
            Called
          </p>
          <p className="mt-1 text-2xl font-bold text-blue-900">
            {calledCount}
          </p>
        </div>

        <div className="rounded-lg border border-green-100 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">
            Completed Patients
          </p>
          <p className="mt-1 text-2xl font-bold text-green-900">
            {completedCount}
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {/* Patient queue table */}
      {bookings.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          No bookings for today.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500">
              <tr>
                <th className="px-3 py-3">Serial</th>
                <th className="px-3 py-3">Patient</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {bookings.map((booking) => {
                const isFinal =
                  booking.status === "completed" ||
                  booking.status === "cancelled";

                return (
                  <tr key={booking.id}>
                    <td className="px-3 py-3 font-semibold">
                      {booking.serialNumber}
                    </td>

                    <td className="px-3 py-3">
                      {booking.patientName}
                    </td>

                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                          booking.status === "waiting"
                            ? "bg-amber-100 text-amber-800"
                            : booking.status === "called"
                              ? "bg-blue-100 text-blue-800"
                              : booking.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      {isFinal ? (
                        <span className="text-slate-400">
                          No actions
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {booking.status === "waiting" && (
                            <button
                              type="button"
                              disabled={updatingId === booking.id}
                              onClick={() =>
                                void changeStatus(booking.id, "called")
                              }
                              className="rounded-md bg-blue-600 px-3 py-1.5 text-white disabled:opacity-50"
                            >
                              {updatingId === booking.id
                                ? "Updating..."
                                : "Call"}
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={updatingId === booking.id}
                            onClick={() =>
                              void changeStatus(booking.id, "completed")
                            }
                            className="rounded-md bg-green-700 px-3 py-1.5 text-white disabled:opacity-50"
                          >
                            Complete
                          </button>

                          <button
                            type="button"
                            disabled={updatingId === booking.id}
                            onClick={() =>
                              void changeStatus(booking.id, "cancelled")
                            }
                            className="rounded-md border border-red-200 px-3 py-1.5 text-red-700 disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default DoctorQueue;
