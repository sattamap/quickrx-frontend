import { apiRequest } from "./apiClient";

export type BookingStatus = "waiting" | "called" | "completed" | "cancelled";

export interface Booking {
  id: string;
  patientName: string;
  doctorId?: string;
  serialNumber: number;
  bookingDate: string;
  status: BookingStatus;
  bookedAt?: string;
  createdAt?: string;
}

export interface AvailableDoctor {
  id: string;
  name: string;
}

export interface CreateBookingInput {
  patientName: string;
  doctorId: string;
}

/**
 * Fetch approved, active doctors available for booking.
 */
export const getAvailableDoctors = async (): Promise<AvailableDoctor[]> => {
  return apiRequest<AvailableDoctor[]>("/bookings/doctors");
};

/**
 * Create a serial booking for a patient.
 * The backend assigns the serial number and booking date.
 */
export const createBooking = async (
  input: CreateBookingInput,
): Promise<Booking> => {
  return apiRequest<Booking>("/bookings", {
    method: "POST",
    body: JSON.stringify(input),
  });
};

/**
 * Fetch today's bookings created by the authenticated receptionist.
 */
export const getMyTodayBookings = async (): Promise<Booking[]> => {
  return apiRequest<Booking[]>("/bookings/mine/today");
};

/**
 * Fetch the authenticated doctor's queue for today.
 * Keep this function for the doctor dashboard.
 */
export const getTodayBookings = async (): Promise<Booking[]> => {
  return apiRequest<Booking[]>("/bookings/today");
};

export const getMyBookingsByDate = async (date: string): Promise<Booking[]> =>
  apiRequest<Booking[]>(`/bookings/mine?date=${encodeURIComponent(date)}`);
