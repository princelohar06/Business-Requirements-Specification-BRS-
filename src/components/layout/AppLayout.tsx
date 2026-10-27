import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans">
      <Navbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} sidebarCollapsed={sidebarCollapsed} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main
          className={`flex-1 transition-all duration-300 ease-in-out p-6 md:p-8 overflow-y-auto ${
            sidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
        >
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
