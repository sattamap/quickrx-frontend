import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

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
} from "../services/apiClient";

import { AuthContext } from "./AuthContext";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({
  children,
}: AuthProviderProps) => {
  const [user, setUser] =
    useState<AuthUser | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const initializeAuth = useCallback(
    async () => {
      try {
        const existingAccessToken =
          getAccessToken();

        /*
         * If an access token already exists in memory,
         * try to use it first.
         */
        if (existingAccessToken) {
          try {
            const currentUser =
              await getCurrentUser(
                existingAccessToken,
              );

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
        const result =
          await refreshAccessToken();

        setAccessToken(
          result.accessToken,
        );

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
    },
    [],
  );

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

  const login = useCallback(
    async (data: LoginInput) => {
      const result =
        await loginApi(data);

      /*
       * Access token is stored ONLY in memory.
       */
      setAccessToken(
        result.accessToken,
      );

      setUser(result.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } finally {
      /*
       * Always clear local authentication state.
       */
      clearAccessToken();
      setUser(null);
    }
  }, []);

  const value = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};