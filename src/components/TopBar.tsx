import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../context/useAuth";

interface TopBarProps {
  onMenuClick: () => void;
}

function TopBar({
  onMenuClick,
}: TopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);

  const doctorName =
    user?.name?.trim() || "Doctor";

  const initials = doctorName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((name) =>
      name.charAt(0).toUpperCase(),
    )
    .join("");

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);

      // AuthProvider clears the local access token/user
      // even if the server-side logout request fails.
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 hover:text-gray-900 lg:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.8}
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>

        <h2 className="text-lg font-semibold text-gray-900">
          QuickRx
        </h2>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Doctor information */}
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-gray-900">
            Dr. {doctorName}
          </p>

          <p className="text-xs text-gray-500">
            Ophthalmologist
          </p>
        </div>

        {/* Avatar */}
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 font-medium text-blue-600">
          {initials || "D"}
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoggingOut
            ? "Logging out..."
            : "Logout"}
        </button>
      </div>
    </header>
  );
}

export default TopBar;