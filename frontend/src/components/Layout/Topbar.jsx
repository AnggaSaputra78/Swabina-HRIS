import { Menu, LayoutDashboard, Settings, Bell, Users } from 'lucide-react';

export default function Topbar({ sidebarCollapsed, setSidebarCollapsed, setMobileMenuOpen }) {
  return (
    <header className="topbar sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        {/* Hamburger - Mobile */}
        <button
          type="button"
          aria-label="Open navigation"
          className="lg:hidden rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Collapse - Desktop */}
        <button
          type="button"
          aria-label="Collapse sidebar"
          className="hidden lg:inline-flex rounded-lg border border-slate-200 p-2 hover:bg-slate-50"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          <LayoutDashboard className="h-5 w-5" />
        </button>

        {/* Breadcrumb & Title */}
        <div className="min-w-0 flex-1">
          <p className="text-slate-500 text-sm hidden sm:block">PT Swabina Gatra / HRIS</p>
          <h1 id="page-heading" className="truncate text-xl font-bold text-slate-900">Dashboard</h1>
        </div>

        {/* Dark Mode Toggle */}
        <button
          id="dark-toggle"
          type="button"
          aria-label="Toggle dark mode"
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
        >
          <Settings className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <button
          type="button"
          aria-label="Open notifications"
          className="relative rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 hover:bg-slate-50"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* Profile */}
        <button
          id="profile-button"
          type="button"
          className="flex items-center gap-3 rounded-xl p-1.5 text-left hover:bg-slate-50"
        >
          <div className="h-9 w-9 rounded-xl bg-navy flex items-center justify-center text-white font-bold text-sm">
            R
          </div>
          <span className="hidden sm:block">
            <span className="block font-semibold text-sm">Rizky Pratama</span>
            <span className="block text-xs text-slate-500">HR Administrator</span>
          </span>
        </button>
      </div>
    </header>
  );
}