
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useAuth } from "../context/useAuth";
import { getAccessToken } from "../services/apiClient";
import { connectBookingSocket } from "../lib/bookingSocket";
import {
  createBooking,
  getAvailableDoctors,
  getMyTodayBookings,
  getMyBookingsByDate,
  type AvailableDoctor,
  type Booking,
} from "../services/bookingApi";

const getLocalDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const ReceptionistDashboard = () => {
  const { user, logout } = useAuth();

  const [doctors, setDoctors] = useState<AvailableDoctor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [patientName, setPatientName] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isBooking, setIsBooking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [selectedDate, setSelectedDate] = useState(getLocalDateString);

  // Listen for live updates to today's bookings.
  useEffect(() => {
    if (selectedDate !== getLocalDateString()) {
      return;
    }

    const accessToken = getAccessToken();

    if (!accessToken) {
      return;
    }

    let socket: ReturnType<typeof connectBookingSocket>;

    try {
      socket = connectBookingSocket(accessToken);
    } catch (socketError: unknown) {
      console.error("Unable to connect to booking updates:", socketError);
      return;
    }

    interface BookingUpdatedEvent {
      doctorId: string;
      bookingDate: string;
      reason: "created" | "status_changed";
    }

    let isActive = true;

    const handleBookingUpdated = (event: BookingUpdatedEvent) => {
      if (
        !isActive ||
        event.bookingDate !== getLocalDateString() ||
        selectedDate !== getLocalDateString()
      ) {
        return;
      }

      void getMyBookingsByDate(getLocalDateString())
        .then((latestBookings) => {
          if (isActive) {
            setBookings(latestBookings);
            setError("");
          }
        })
        .catch((refreshError: unknown) => {
          if (isActive) {
            console.error(
              "Failed to refresh receptionist bookings:",
              refreshError,
            );
            setError("Unable to refresh bookings. Please try again.");
          }
        });
    };

    socket.on("booking:updated", handleBookingUpdated);

    return () => {
      isActive = false;
      socket.off("booking:updated", handleBookingUpdated);
    };
  }, [selectedDate]);

  const today = getLocalDateString();
  const isToday = selectedDate === today;

  // Load bookings for a selected date.
  const loadBookingsByDate = useCallback(async (date: string) => {
    if (!date) {
      setError("Please select a date.");
      return;
    }

    setIsLoading(true);
    setError("");
    setNotice("");

    try {
      const result = await getMyBookingsByDate(date);
      setBookings(result);
    } catch (loadError: unknown) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load bookings for the selected date.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load doctors and today's bookings after creating a serial.
  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const [availableDoctors, todayBookings] = await Promise.all([
        getAvailableDoctors(),
        getMyTodayBookings(),
      ]);

      setDoctors(availableDoctors);
      setBookings(todayBookings);
      setSelectedDate(getLocalDateString());

      setDoctorId((currentDoctorId) => {
        if (availableDoctors.some((doctor) => doctor.id === currentDoctorId)) {
          return currentDoctorId;
        }

        return availableDoctors[0]?.id ?? "";
      });
    } catch (loadError: unknown) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load the receptionist dashboard.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial dashboard load.
  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      try {
        const [availableDoctors, todayBookings] = await Promise.all([
          getAvailableDoctors(),
          getMyTodayBookings(),
        ]);

        if (cancelled) return;

        setDoctors(availableDoctors);
        setBookings(todayBookings);

        setDoctorId((currentDoctorId) => {
          if (
            availableDoctors.some((doctor) => doctor.id === currentDoctorId)
          ) {
            return currentDoctorId;
          }

          return availableDoctors[0]?.id ?? "";
        });
      } catch (loadError: unknown) {
        if (cancelled) return;

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load the receptionist dashboard.",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    const timer = window.setTimeout(() => {
      void fetchDashboard();
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  // Book a new patient serial.
  const handleBookSerial = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");

    const trimmedPatientName = patientName.trim();

    if (!trimmedPatientName || !doctorId) {
      setError("Please enter the patient's name and select a doctor.");
      return;
    }

    setIsBooking(true);

    try {
      const booking = await createBooking({
        patientName: trimmedPatientName,
        doctorId,
      });

      setNotice(
        `Serial booked successfully. Serial number: ${booking.serialNumber}.`,
      );

      setPatientName("");
      await loadDashboard();
    } catch (bookingError: unknown) {
      setError(
        bookingError instanceof Error
          ? bookingError.message
          : "Unable to book the serial. Please try again.",
      );
    } finally {
      setIsBooking(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (logoutError: unknown) {
      console.error("Logout failed:", logoutError);
      setError("Unable to log out. Please try again.");
    }
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);

    if (date) {
      void loadBookingsByDate(date);
    }
  };

  // Calculate statistics from the currently displayed date.
  const waitingCount = bookings.filter(
    (booking) => booking.status === "waiting",
  ).length;

  const calledCount = bookings.filter(
    (booking) => booking.status === "called",
  ).length;

  const completedCount = bookings.filter(
    (booking) => booking.status === "completed",
  ).length;

  const getDoctorName = (id?: string) =>
    doctors.find((doctor) => doctor.id === id)?.name ?? "Doctor unavailable";

  const statusClasses: Record<Booking["status"], string> = {
    waiting: "bg-amber-100 text-amber-800",
    called: "bg-blue-100 text-blue-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-slate-100 text-slate-600",
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            QuickRx Reception
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome, {user?.name}
          </p>
        </div>

        <button
          type="button"
          onClick={() => void handleLogout()}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
        >
          Logout
        </button>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Page heading */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">
            Receptionist Dashboard
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Book patient serials and view bookings by date.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Success message */}
        {notice && (
          <div
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
          >
            {notice}
          </div>
        )}

        {/* Book a serial */}
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h3 className="text-lg font-semibold text-slate-900">
            Book a Serial
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Enter the patient's name and select an available doctor.
          </p>

          <form
            onSubmit={handleBookSerial}
            className="mt-5 grid gap-4 sm:grid-cols-2"
          >
            <div>
              <label
                htmlFor="patientName"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Patient name
              </label>
              <input
                id="patientName"
                name="patientName"
                value={patientName}
                onChange={(event) => setPatientName(event.target.value)}
                maxLength={150}
                required
                disabled={isBooking || isLoading}
                placeholder="Enter patient name"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label
                htmlFor="doctorId"
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Select doctor
              </label>
              <select
                id="doctorId"
                name="doctorId"
                value={doctorId}
                onChange={(event) => setDoctorId(event.target.value)}
                required
                disabled={isBooking || isLoading || doctors.length === 0}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50"
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.name}
                  </option>
                ))}
              </select>
            </div>

            {doctors.length === 0 && !isLoading && (
              <p className="text-sm text-amber-700 sm:col-span-2">
                No approved, active doctors are currently available for
                booking.
              </p>
            )}

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={
                  isBooking || isLoading || !patientName.trim() || !doctorId
                }
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isBooking ? "Booking..." : "Book Serial"}
              </button>
            </div>
          </form>
        </section>

        {/* Booking statistics */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              {isToday ? "Today's bookings" : "Bookings on selected date"}
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {bookings.length}
            </p>
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-amber-800">Waiting</p>
            <p className="mt-2 text-3xl font-bold text-amber-900">
              {waitingCount}
            </p>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-blue-800">Called</p>
            <p className="mt-2 text-3xl font-bold text-blue-900">
              {calledCount}
            </p>
          </div>

          <div className="rounded-xl border border-green-100 bg-green-50 p-5 shadow-sm">
            <p className="text-sm font-medium text-green-800">
              Completed Patients
            </p>
            <p className="mt-2 text-3xl font-bold text-green-900">
              {completedCount}
            </p>
          </div>
        </section>

        {/* Booking history */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {isToday ? "Today's Bookings" : `Bookings for ${selectedDate}`}
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                View bookings created by your receptionist account for today
                or a previous date.
              </p>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div>
                <label
                  htmlFor="booking-date"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Select date
                </label>
                <input
                  id="booking-date"
                  type="date"
                  value={selectedDate}
                  max={today}
                  onChange={(event) => handleDateChange(event.target.value)}
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
                  onClick={() => {
                    const date = getLocalDateString();
                    setSelectedDate(date);
                    void loadBookingsByDate(date);
                  }}
                  disabled={isLoading}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Today
                </button>
              )}
            </div>
          </div>

          {isLoading ? (
            <p className="p-6 text-sm text-slate-500">
              Loading bookings...
            </p>
          ) : bookings.length === 0 ? (
            <p className="p-6 text-sm text-slate-500">
              No bookings were found for {isToday ? "today" : selectedDate}.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-5 py-3 font-medium">Serial</th>
                    <th className="px-5 py-3 font-medium">Patient</th>
                    <th className="px-5 py-3 font-medium">Doctor</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {booking.serialNumber}
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {booking.patientName}
                      </td>
                      <td className="px-5 py-4 text-slate-700">
                        {getDoctorName(booking.doctorId)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusClasses[booking.status]}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default ReceptionistDashboard;
