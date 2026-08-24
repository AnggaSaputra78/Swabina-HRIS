import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      {/* 1. Render Sidebar di sini */}
      <Sidebar
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      {/* 2. Area Konten Utama */}
      <div className="flex flex-1 flex-col min-w-0">
        <Topbar
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          setMobileMenuOpen={setMobileMenuOpen}
        />
        
        <main className="flex-1 p-6">
          {/* 3. Render konten dari DashboardPage di sini */}
          {children}
        </main>
      </div>
    </div>
  );
}