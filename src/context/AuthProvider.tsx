import { useCallback, useEffect, useState, type ReactNode } from "react";

import {
  getCurrentUser,
  login as loginApi,
  logout as logoutApi,
  refreshAccessToken,
  type AuthUser,
  type LoginInput,
} from "../services/authApi";

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
  setAuthSessionExpiredHandler,
} from "../services/apiClient";

import { AuthContext } from "./AuthContext";

import {
  connectBookingSocket,
  disconnectBookingSocket,
} from "../lib/bookingSocket";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setAuthSessionExpiredHandler(() => {
      clearAccessToken();
      disconnectBookingSocket(); //disconnects the socket
      setUser(null);
    });

    return () => {
      setAuthSessionExpiredHandler(null);
    };
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      const existingAccessToken = getAccessToken();

      /*
       * If an access token already exists in memory,
       * try to use it first.
       */
      if (existingAccessToken) {
        try {
          const currentUser = await getCurrentUser(existingAccessToken);

          setUser(currentUser);

          return;
        } catch {
          /*
           * Access token may have expired.
           * Clear it and attempt refresh.
           */
          clearAccessToken();
        }
      }

      /*
       * No usable access token.
       *
       * Ask the backend to issue a new access token
       * using the HttpOnly refresh cookie.
       */
      const result = await refreshAccessToken();

      setAccessToken(result.accessToken);

      setUser(result.user);
    } catch {
      /*
       * No valid authentication session.
       *
       * This is normal for a new/unauthenticated user.
       */
      clearAccessToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    /*
     * Start authentication bootstrap asynchronously.
     *
     * setTimeout prevents the React
     * set-state-in-effect rule from treating the
     * state updates inside initializeAuth() as
     * synchronous effect updates.
     */
    const timer = window.setTimeout(() => {
      void initializeAuth();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [initializeAuth]);

  const login = useCallback(async (data: LoginInput): Promise<AuthUser> => {
    const result = await loginApi(data);

    setAccessToken(result.accessToken);
    setUser(result.user);

    return result.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      /*
       * Always clear local authentication state.
       */
      clearAccessToken();
      //  Disconnect on logout for socket
      disconnectBookingSocket();
      setUser(null);
    }
  }, []);

  // Connect the booking socket for doctors and receptionists.
  useEffect(() => {
    if (
      isLoading ||
      (user?.role !== "doctor" && user?.role !== "receptionist")
    ) {
      disconnectBookingSocket();
      return;
    }

    const accessToken = getAccessToken();

    if (!accessToken) {
      disconnectBookingSocket();
      return;
    }

    let socket: ReturnType<typeof connectBookingSocket>;

    try {
      socket = connectBookingSocket(accessToken);
    } catch (error: unknown) {
      console.error("Unable to initialize booking socket:", error);
      return;
    }

    const handleConnectError = (error: Error) => {
      console.error("Booking socket connection failed:", error.message);
    };

    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect_error", handleConnectError);
      disconnectBookingSocket();
    };
  }, [user, isLoading]);

  const value = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
