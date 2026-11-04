import { useCallback, useEffect, useRef, useState } from "react";

import {
  getTodayBookings,
  getDoctorBookingsByDate,
  type Booking,
  type BookingStatus,
} from "../../services/bookingApi";

import { getBookingSocket } from "../../lib/bookingSocket";
import { apiRequest } from "../../services/apiClient";

/**
 * Returns today's date in the browser's local timezone as YYYY-MM-DD.
 * The browser should use Bangladesh local time for this application.
 */
const getLocalDateString = (): string => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

interface BookingUpdatedEvent {
  doctorId: string;
  bookingDate: string;
  reason: "created" | "status_changed";
}

const DoctorQueue = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState(getLocalDateString);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Prevent older requests from overwriting results for a newer selected date.
  const requestIdRef = useRef(0);

  const today = getLocalDateString();
  const isToday = selectedDate === today;

  /**
   * Load the authenticated doctor's bookings for a selected date.
   */
  const loadBookingsByDate = useCallback(
    async (date: string, showLoading = true) => {
      if (!date) {
        setError("Please select a date.");
        return;
      }

      const requestId = ++requestIdRef.current;

      if (showLoading) {
        setIsLoading(true);
      }

      setError("");

      try {
        const result =
          date === getLocalDateString()
            ? await getTodayBookings()
            : await getDoctorBookingsByDate(date);

        if (requestId === requestIdRef.current) {
          setBookings(result);
        }
      } catch (loadError: unknown) {
        if (requestId === requestIdRef.current) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load bookings for the selected date.",
          );
        }
      } finally {
        if (requestId === requestIdRef.current && showLoading) {
          setIsLoading(false);
        }
      }
    },
    [],
  );

  /**
   * Load bookings whenever the selected date changes.
   * Listen for realtime updates only while viewing today's queue.
   */
  useEffect(() => {
    let isActive = true;

    const fetchBookings = async () => {
      await loadBookingsByDate(selectedDate);
    };

    const timer = window.setTimeout(() => {
      if (isActive) {
        void fetchBookings();
      }
    }, 0);

    const socket = isToday ? getBookingSocket() : null;

    const handleBookingUpdated = (event: BookingUpdatedEvent) => {
      if (
        !isActive ||
        !isToday ||
        event.bookingDate !== getLocalDateString()
      ) {
        return;
      }

      // Refresh today's queue without showing the full loading screen.
      void loadBookingsByDate(selectedDate, false);
    };

    socket?.on("booking:updated", handleBookingUpdated);

    return () => {
      isActive = false;
      window.clearTimeout(timer);
      requestIdRef.current += 1;
      socket?.off("booking:updated", handleBookingUpdated);
    };
  }, [selectedDate, isToday, loadBookingsByDate]);

  /**
   * Update booking status.
   * Backend currently allows status updates only for today's bookings.
   */
  const changeStatus = async (
    bookingId: string,
    status: BookingStatus,
  ) => {
    if (!isToday) {
      setError("Only today's bookings can be updated.");
      return;
    }

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

      await loadBookingsByDate(selectedDate, false);
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

  // Calculate statistics for the currently selected date.
  const waitingCount = bookings.filter(
    (booking) => booking.status === "waiting",
  ).length;

  const calledCount = bookings.filter(
    (booking) => booking.status === "called",
  ).length;

  const completedCount = bookings.filter(
    (booking) => booking.status === "completed",
  ).length;

  const statusClasses: Record<BookingStatus, string> = {
    waiting: "bg-amber-100 text-amber-800",
    called: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-slate-100 text-slate-600",
  };

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      {/* Queue heading and date selection */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {isToday ? "Today's patient queue" : "Patient booking history"}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {bookings.length} patient
            {bookings.length === 1 ? "" : "s"} booked
            {isToday ? " today" : ` on ${selectedDate}`}
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label
              htmlFor="doctor-booking-date"
              className="mb-1 block text-sm font-medium text-slate-700"
            >
              Select date
            </label>

            <input
              id="doctor-booking-date"
              type="date"
              value={selectedDate}
              max={today}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            type="button"
            onClick={() => void loadBookingsByDate(selectedDate)}
            disabled={isLoading || !selectedDate}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Refresh"}
          </button>

          {!isToday && (
            <button
              type="button"
              onClick={() => setSelectedDate(today)}
              disabled={isLoading}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Today
            </button>
          )}
        </div>
      </div>

      {/* Historical booking notice */}
      {!isToday && (
        <p className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
          You are viewing historical bookings. Booking status changes are
          available only for today's queue.
        </p>
      )}

      {/* Error message */}
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {/* Queue statistics */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-amber-100 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Waiting</p>
          <p className="mt-1 text-2xl font-bold text-amber-900">
            {waitingCount}
          </p>
        </div>

        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-sm font-medium text-blue-800">Called</p>
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

      {/* Patient queue table */}
      {isLoading ? (
        <p className="py-6 text-center text-sm text-slate-500">
          Loading bookings...
        </p>
      ) : bookings.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">
          No bookings found for {isToday ? "today" : selectedDate}.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-left text-sm">
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

                    <td className="px-3 py-3">{booking.patientName}</td>

                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClasses[booking.status]}`}
                      >
                        {booking.status}
                      </span>
                    </td>

                    <td className="px-3 py-3">
                      {!isToday ? (
                        <span className="text-slate-400">
                          Historical record
                        </span>
                      ) : isFinal ? (
                        <span className="text-slate-400">No actions</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {booking.status === "waiting" && (
                            <button
                              type="button"
                              disabled={updatingId !== null}
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
                            disabled={updatingId !== null}
                            onClick={() =>
                              void changeStatus(booking.id, "completed")
                            }
                            className="rounded-md bg-green-700 px-3 py-1.5 text-white disabled:opacity-50"
                          >
                            Complete
                          </button>

                          <button
                            type="button"
                            disabled={updatingId !== null}
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