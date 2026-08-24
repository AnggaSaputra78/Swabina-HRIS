import { useNavigate, useLocation } from 'react-router-dom'; // <-- Tambahkan useLocation
import {
  LayoutDashboard, Users, CalendarCheck, CalendarDays, WalletCards,
  BriefcaseBusiness, Building2, ChartNoAxesCombined, FolderClosed,
  PieChart, Bell, UserCog, Settings, Activity, X
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Users, label: 'Karyawan', path: '/karyawan' },
  { icon: CalendarCheck, label: 'Absensi', path: '/absensi' },
  { icon: CalendarDays, label: 'Cuti', path: '/cuti' },
  { icon: WalletCards, label: 'Penggajian', path: '/penggajian' },
  { icon: BriefcaseBusiness, label: 'Rekrutmen', path: '/rekrutmen' },
  { icon: Building2, label: 'Departemen', path: '/departemen' },
  { icon: ChartNoAxesCombined, label: 'Kinerja', path: '/kinerja' },
  { icon: FolderClosed, label: 'Dokumen', path: '/dokumen' },
  { icon: PieChart, label: 'Laporan', path: '/laporan' },
  { icon: Bell, label: 'Notifikasi', path: '/notifikasi', badge: 4 },
  { icon: UserCog, label: 'Pengguna', path: '/pengguna' },
  { icon: Settings, label: 'Pengaturan', path: '/pengaturan' },
];

export default function Sidebar({ sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation(); // <-- Baca URL saat ini

  const handleMenuClick = (path) => {
    setMobileMenuOpen(false); // Tutup menu jika di mobile
    navigate(path);           // Pindah halaman
  };

  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-50 flex shrink-0 flex-col bg-slate-900 p-4 text-white transition-all duration-300 ease-in-out
        ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
    >
      {/* Brand */}
      <div className="mb-5 flex items-center justify-between px-2 py-2">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white font-extrabold text-slate-900">
            SG
          </div>
          <div className={`whitespace-nowrap transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0' : 'opacity-100'}`}>
            <p className="font-bold">PT Swabina Gatra</p>
            <p className="opacity-70 text-sm">HRIS Portal</p>
          </div>
        </div>
        <button
          className="lg:hidden rounded-lg p-2 hover:bg-white/10"
          onClick={() => setMobileMenuOpen(false)}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          
          // <-- PERBAIKAN UTAMA: Cek keaktifan berdasarkan URL, bukan state manual
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.label}
              onClick={() => handleMenuClick(item.path)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition
                ${isActive 
                  ? 'bg-white/10 text-white font-semibold' 
                  : 'text-white/80 hover:bg-white/10 hover:text-white'}
              `}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className={`transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0' : 'opacity-100'}`}>
                {item.label}
              </span>
              {item.badge && (
                <span className={`ml-auto rounded-full bg-orange-400 px-2 py-0.5 text-xs font-bold text-slate-900 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-4 rounded-xl bg-white/10 p-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-300">
            <Activity className="h-5 w-5" />
          </div>
          <div className={`transition-opacity duration-300 ${sidebarCollapsed ? 'lg:opacity-0' : 'opacity-100'}`}>
            <p className="font-semibold text-sm">Sistem Normal</p>
            <p className="mt-0.5 opacity-70 text-xs">Semua modul aktif</p>
          </div>
        </div>
      </div>
    </aside>
  );
}