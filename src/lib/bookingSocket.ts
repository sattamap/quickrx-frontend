
import { io, type Socket } from "socket.io-client";

let bookingSocket: Socket | null = null;
let connectedToken: string | null = null;

export const connectBookingSocket = (accessToken: string): Socket => {
  if (!accessToken.trim()) {
    throw new Error("An access token is required for the booking socket.");
  }

  // Reuse the socket while the same token is in use.
  if (bookingSocket && connectedToken === accessToken) {
    if (!bookingSocket.connected && !bookingSocket.active) {
      bookingSocket.connect();
    }

    return bookingSocket;
  }

  // Replace an existing connection if credentials change.
  if (bookingSocket) {
    bookingSocket.disconnect();
  }

  const serverUrl = import.meta.env.VITE_SOCKET_URL;

  if (!serverUrl) {
    throw new Error("VITE_SOCKET_URL is not configured.");
  }

  connectedToken = accessToken;

  bookingSocket = io(serverUrl, {
    auth: { token: accessToken },
    withCredentials: true,
    autoConnect: true,
  });

  return bookingSocket;
};

export const getBookingSocket = (): Socket | null => bookingSocket;

export const disconnectBookingSocket = (): void => {
  bookingSocket?.disconnect();
  bookingSocket = null;
  connectedToken = null;
};
