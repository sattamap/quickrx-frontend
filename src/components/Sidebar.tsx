import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-gray-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-gray-200 px-6">
        <h1 className="text-2xl font-bold text-blue-600">
          QuickRx
        </h1>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `block rounded-lg px-4 py-3 text-sm font-medium ${
              isActive
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`
          }
        >
          Dashboard
        </NavLink>

        <NavLink
          to="/patients"
          className={({ isActive }) =>
            `block rounded-lg px-4 py-3 text-sm font-medium ${
              isActive
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`
          }
        >
          Patients
        </NavLink>

        <NavLink
          to="/prescriptions"
          className={({ isActive }) =>
            `block rounded-lg px-4 py-3 text-sm font-medium ${
              isActive
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`
          }
        >
          Prescriptions
        </NavLink>

        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `block rounded-lg px-4 py-3 text-sm font-medium ${
              isActive
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:bg-gray-50"
            }`
          }
        >
          Settings
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;