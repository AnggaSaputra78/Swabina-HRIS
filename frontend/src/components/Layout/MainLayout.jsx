import { Outlet, Link } from 'react-router-dom';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function MainLayout() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="flex h-screen bg-canvas">
      {/* Sidebar */}
      <aside className="w-64 bg-navy text-white flex flex-col p-4">
        <div className="mb-8 flex items-center gap-3">
          <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-navy font-bold">SG</div>
          <div>
            <h1 className="font-bold">Swabina Gatra</h1>
            <p className="text-xs opacity-70">HRIS Portal</p>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white text-navy font-semibold">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/employees" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/10 transition">
            <Users size={20} /> Karyawan
          </Link>
        </nav>

        <button onClick={logout} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-500/20 text-red-300 transition mt-auto">
          <LogOut size={20} /> Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-slate-800">Selamat Datang, {user?.name || 'User'}</h2>
        </header>
        <Outlet />
      </main>
    </div>
  );
}