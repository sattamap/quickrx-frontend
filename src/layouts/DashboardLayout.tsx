
import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleOpenSidebar = () => {
    setIsSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 print:bg-white">
      {/* Sidebar: hidden in print preview */}
      <div className="print:hidden">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
        />
      </div>

      <div className="lg:pl-64 print:pl-0">
        {/* Top bar: hide QuickRx, menu, and logout when printing */}
        <div className="print:hidden">
          <TopBar onMenuClick={handleOpenSidebar} />
        </div>

        {/* Main content: remove padding when printing */}
        <main className="p-4 sm:p-6 print:p-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
