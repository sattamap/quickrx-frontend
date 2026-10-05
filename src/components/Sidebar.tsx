import { NavLink } from "react-router-dom";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const navLinkClass = ({
    isActive,
  }: {
    isActive: boolean;
  }) =>
    `block rounded-lg px-4 py-3 text-sm font-medium ${
      isActive
        ? "bg-blue-50 text-blue-600"
        : "text-gray-600 hover:bg-gray-50"
    }`;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 ease-in-out ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
          <h1 className="text-2xl font-bold text-blue-600">
            QuickRx
          </h1>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className={navLinkClass}
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/patients"
            onClick={onClose}
            className={navLinkClass}
          >
            Patients
          </NavLink>

          <NavLink
            to="/prescriptions"
            onClick={onClose}
            className={navLinkClass}
          >
            Prescriptions
          </NavLink>

          <NavLink
            to="/settings"
            onClick={onClose}
            className={navLinkClass}
          >
            Settings
          </NavLink>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;