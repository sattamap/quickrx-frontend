import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({
  children,
}: ProtectedRouteProps) => {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth();

  const location = useLocation();

  /**
   * Authentication is still being restored from
   * the refresh session.
   *
   * Don't redirect yet.
   */
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-700" />

          <p className="mt-3 text-sm text-slate-600">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  /**
   * No authenticated user.
   *
   * Send them to login and remember the page they
   * originally attempted to access.
   */
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;