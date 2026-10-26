
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../context/useAuth";
import type { AuthUser } from "../services/authApi";

type UserRole = AuthUser["role"];

interface RoleRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

const getHomePath = (role: UserRole): string => {
  switch (role) {
    case "admin":
      return "/admin";
    case "receptionist":
      return "/receptionist";
    case "doctor":
    default:
      return "/dashboard";
  }
};

const RoleRoute = ({
  children,
  allowedRoles,
}: RoleRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-600">
          Checking authentication...
        </p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return (
      <Navigate
        to={getHomePath(user.role)}
        replace
      />
    );
  }

  return <>{children}</>;
};

export default RoleRoute;
