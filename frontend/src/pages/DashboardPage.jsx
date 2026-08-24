import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import DetailModal from '../components/ui/DetailModal';
import { api } from '../lib/api';
import {
  Users, CalendarCheck, CalendarDays, WalletCards, BriefcaseBusiness,
  PieChart, TrendingUp, Clock, Bell, FileText, UserPlus, CheckCircle2,
  AlertTriangle, Megaphone, ArrowUpRight, Activity, User, Loader2, Mail, Phone, Building2
} from 'lucide-react';

// Data historis kehadiran (static, karena butuh tren 12 bulan)
const attendanceData = [
  { month: 'Jan', value: 73 }, { month: 'Feb', value: 85 }, { month: 'Mar', value: 92 },
  { month: 'Apr', value: 81 }, { month: 'Mei', value: 88 }, { month: 'Jun', value: 76 },
  { month: 'Jul', value: 95 }, { month: 'Agu', value: 84 }, { month: 'Sep', value: 90 },
  { month: 'Okt', value: 86 }, { month: 'Nov', value: 93 }, { month: 'Des', value: 72 },
];

const quickActions = [
  { icon: UserPlus, label: 'Tambah Karyawan', path: '/karyawan', bg: 'bg-blue-50', color: 'text-blue-700', hover: 'hover:bg-blue-100' },
  { icon: CalendarCheck, label: 'Absen Masuk', path: '/absensi', bg: 'bg-emerald-50', color: 'text-emerald-700', hover: 'hover:bg-emerald-100' },
  { icon: CalendarDays, label: 'Tinjau Cuti', path: '/cuti', bg: 'bg-amber-50', color: 'text-amber-700', hover: 'hover:bg-amber-100' },
  { icon: WalletCards, label: 'Penggajian', path: '/penggajian', bg: 'bg-orange-50', color: 'text-orange-700', hover: 'hover:bg-orange-100' },
  { icon: FileText, label: 'Buat Laporan', path: '/laporan', bg: 'bg-purple-50', color: 'text-purple-700', hover: 'hover:bg-purple-100' },
  { icon: BriefcaseBusiness, label: 'Rekrutmen', path: '/rekrutmen', bg: 'bg-sky-50', color: 'text-sky-700', hover: 'hover:bg-sky-100' },
];

// Format angka ke Rupiah singkat (Jt / M)
const formatCompact = (n) => {
  n = n || 0;
  if (n >= 1_000_000_000) return 'Rp ' + (n / 1_000_000_000).toFixed(1) + ' M';
  if (n >= 1_000_000) return 'Rp ' + (n / 1_000_000).toFixed(1) + ' Jt';
  return 'Rp ' + n.toLocaleString('id-ID');
};

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

export default function DashboardPage() {
  const navigate = useNavigate();

  // ===== STATE DATA DARI MONGODB =====
  const [stats, setStats] = useState({
    totalEmployees: 0, activeEmployees: 0, onLeave: 0,
    pendingLeaves: 0, totalSalary: 0, attendanceRate: 0,
  });
  const [activities, setActivities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [newEmployees, setNewEmployees] = useState([]);
  const [deptData, setDeptData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ===== STATE MODAL REVIEW =====
  const [reviewItem, setReviewItem] = useState(null);

  // ===== AMBIL SEMUA DATA DARI MONGODB =====
  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, actData, annData, leaveData, empData] = await Promise.all([
        api.getStats(),
        api.getActivities(),
        api.getAnnouncements(),
        api.getLeaves(),
        api.getEmployees(),
      ]);

      setStats(statsData);
      setActivities(actData);
      setAnnouncements(annData);
      setLeaves(leaveData);
      setNewEmployees(empData.slice(0, 3)); // 3 karyawan terbaru

      // Hitung distribusi departemen dari data karyawan asli
      const deptMap = {};
      empData.forEach((e) => { deptMap[e.dept] = (deptMap[e.dept] || 0) + 1; });
      const total = empData.length || 1;
      const colors = ['bg-slate-900', 'bg-sky-500', 'bg-orange-500', 'bg-emerald-500', 'bg-purple-500'];
      const deptArr = Object.entries(deptMap)
        .map(([name, count], i) => ({
          name, count,
          percent: Math.round((count / total) * 100),
          color: colors[i % colors.length],
        }))
        .sort((a, b) => b.count - a.count);
      setDeptData(deptArr);
    } catch (err) {
      setError('Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ===== APPROVE CUTI (UPDATE MONGODB) =====
  const handleApproveLeave = async (id) => {
    try {
      await api.approveLeave(id);
      setLeaves((prev) => prev.filter((l) => l._id !== id));
      setReviewItem(null);
    } catch (err) {
      alert('Gagal menyetujui cuti: ' + err.message);
    }
  };

  // ===== STAT CARDS (dari data MongoDB + link ke halaman karyawan) =====
  const statCards = [
    { icon: Users, label: 'Karyawan Aktif', value: stats.activeEmployees, sub: `dari ${stats.totalEmployees} total`, trend: '+3.2%', trendUp: true, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', link: '/karyawan?status=Aktif' },
    { icon: CalendarCheck, label: 'Tingkat Kehadiran', value: `${stats.attendanceRate}%`, sub: 'hari ini', trend: 'Realtime', trendUp: true, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', link: '/karyawan' },
    { icon: CalendarDays, label: 'Cuti Pending', value: stats.pendingLeaves, sub: 'menunggu approval', trend: `${stats.onLeave} cuti`, trendUp: false, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', link: '/karyawan?status=Cuti' },
    { icon: UserPlus, label: 'Sedang Cuti', value: stats.onLeave, sub: 'karyawan', trend: 'Aktif', trendUp: false, iconBg: 'bg-sky-50', iconColor: 'text-sky-600', link: '/karyawan?status=Cuti' },
    { icon: WalletCards, label: 'Total Penggajian', value: formatCompact(stats.totalSalary), sub: 'karyawan aktif', trend: '+5.1%', trendUp: true, iconBg: 'bg-orange-50', iconColor: 'text-orange-600', link: '/karyawan' },
    { icon: AlertTriangle, label: 'Total Karyawan', value: stats.totalEmployees, sub: 'terdaftar', trend: 'DB', trendUp: true, iconBg: 'bg-red-50', iconColor: 'text-red-600', link: '/karyawan' },
  ];

  // ===== RENDER ISI MODAL REVIEW =====
  const renderReviewContent = () => {
    if (!reviewItem) return null;
    const d = reviewItem.data;

    switch (reviewItem.type) {
      case 'activity':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full font-bold ${d.avatarBg}`}>{d.avatar}</div>
              <div>
                <p className="font-bold text-slate-900">{d.name}</p>
                <p className="text-sm text-slate-500">{d.time}</p>
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-500">Aktivitas</p>
              <p className="mt-1 font-semibold text-slate-900">{d.activity}</p>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">Modul Terkait</span>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${d.moduleColor}`}>{d.module}</span>
            </div>
          </div>
        );

      case 'announcement':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${d.tagColor}`}>{d.tag}</span>
              <span className="text-sm text-slate-500">{d.date}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{d.title}</h3>
            <p className="text-sm leading-relaxed text-slate-600">
              Ini adalah detail pengumuman resmi dari PT Swabina Gatra. Seluruh karyawan diharapkan memperhatikan informasi ini dan menyesuaikan jadwal kerja masing-masing.
            </p>
            <div className="rounded-xl border border-slate-100 p-4 text-sm text-slate-500">
              📌 Dipublikasikan oleh: <span className="font-semibold text-slate-700">HR Department</span>
            </div>
          </div>
        );

      case 'leave':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full font-bold ${d.avatarBg}`}>{d.avatar}</div>
              <div>
                <p className="font-bold text-slate-900">{d.employeeName}</p>
                <p className="text-sm text-slate-500">{d.type}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Durasi</p>
                <p className="mt-1 font-bold text-slate-900">{d.duration}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Status</p>
                <p className="mt-1 font-bold text-amber-600">{d.status}</p>
              </div>
            </div>
            <button
              onClick={() => handleApproveLeave(d._id)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white hover:bg-emerald-700 transition-colors"
            >
              <CheckCircle2 className="h-5 w-5" /> Setujui Pengajuan Cuti
            </button>
          </div>
        );

      case 'employee':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-lg font-bold text-slate-700">
                {d.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
              </div>
              <div>
                <p className="text-lg font-bold text-slate-900">{d.name}</p>
                <p className="text-sm text-slate-500">{d.role}</p>
              </div>
            </div>
            <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex items-center gap-2 text-slate-600"><span className="font-mono text-xs text-slate-400">NIK</span> <span className="ml-auto font-semibold">{d.nik}</span></div>
              <div className="flex items-center gap-2 text-slate-600"><Building2 className="h-4 w-4 text-slate-400" /> <span className="ml-auto font-semibold">{d.dept}</span></div>
              <div className="flex items-center gap-2 text-slate-600"><Mail className="h-4 w-4 text-slate-400" /> <span className="ml-auto font-semibold">{d.email}</span></div>
              <div className="flex items-center gap-2 text-slate-600"><Phone className="h-4 w-4 text-slate-400" /> <span className="ml-auto font-semibold">{d.phone || '-'}</span></div>
              <div className="flex items-center gap-2 text-slate-600"><WalletCards className="h-4 w-4 text-slate-400" /> <span className="ml-auto font-semibold">{formatRupiah(d.salary)}</span></div>
              <div className="flex items-center gap-2 text-slate-600">
                <span className={`ml-auto rounded-full px-2.5 py-0.5 text-xs font-semibold ${d.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{d.status}</span>
              </div>
            </div>
            <button
              onClick={() => { setReviewItem(null); navigate(`/karyawan?search=${encodeURIComponent(d.name)}`); }}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Lihat di Halaman Karyawan
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-32 text-slate-400">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="mt-3 text-sm">Memuat data dari MongoDB...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Error Banner */}
        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
            <button onClick={fetchAll} className="ml-auto rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700">Coba Lagi</button>
          </div>
        )}

        {/* ===== HEADER ===== */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-500">Selamat Datang Kembali 👋</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">Dashboard HRIS</h1>
            <p className="mt-2 text-sm text-slate-500">Ringkasan realtime dari database PT Swabina Gatra</p>
          </div>
          <button onClick={() => navigate('/laporan')} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <PieChart className="h-4 w-4" /> Laporan
          </button>
        </div>

        {/* ===== STAT CARDS (klik → halaman karyawan dengan filter) ===== */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <article
                key={i}
                onClick={() => navigate(stat.link)}
                className="cursor-pointer rounded-xl border border-slate-100 bg-white p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-xl ${stat.iconBg} p-2.5 ${stat.iconColor}`}><Icon className="h-5 w-5" /></span>
                  <span className={`flex items-center gap-1 text-xs font-semibold ${stat.trendUp ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {stat.trendUp ? <TrendingUp className="h-3 w-3" /> : <Clock className="h-3 w-3" />}{stat.trend}
                  </span>
                </div>
                <p className="mt-4 text-xs sm:text-sm text-slate-500">{stat.label}</p>
                <p className="mt-1 text-xl sm:text-2xl font-extrabold text-slate-900">{stat.value}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{stat.sub}</p>
              </article>
            );
          })}
        </div>

        {/* ===== CHARTS ===== */}
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Attendance Chart */}
          <article className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Kehadiran Karyawan</h3>
                <p className="mt-1 text-sm text-slate-500">Tren kehadiran 12 bulan terakhir</p>
              </div>
              <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">2026</span>
            </div>
            <div className="mt-6 flex h-48 sm:h-56 items-end justify-between gap-1.5 sm:gap-2">
              {attendanceData.map((bar, i) => (
                <div key={i} className="group flex flex-1 flex-col items-center gap-2">
                  <div className="relative w-full flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t-lg transition-all group-hover:opacity-80 ${bar.value >= 90 ? 'bg-slate-900' : bar.value >= 80 ? 'bg-sky-500' : 'bg-slate-300'}`}
                      style={{ height: `${bar.value}%` }}
                      title={`${bar.month}: ${bar.value}%`}
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs text-slate-500">{bar.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-600">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-900"></span> Sangat Baik (≥90%)</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-sky-500"></span> Baik (80-89%)</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-300"></span> Cukup (&lt;80%)</span>
            </div>
          </article>

          {/* Department Distribution (dari MongoDB, klik → filter karyawan) */}
          <article className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Distribusi Departemen</h3>
            <p className="mt-1 text-sm text-slate-500">Klik departemen untuk melihat karyawan</p>
            <div className="mt-6 flex flex-col items-center gap-6">
              <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 via-sky-500 to-orange-500">
                <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
                  <strong className="text-lg text-slate-900">{stats.totalEmployees}</strong>
                  <span className="text-xs text-slate-500">Karyawan</span>
                </div>
              </div>
              <div className="w-full space-y-1">
                {deptData.map((dept, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(`/karyawan?dept=${encodeURIComponent(dept.name)}`)}
                    className="flex cursor-pointer items-center justify-between rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50 transition-colors"
                    title={`Lihat karyawan ${dept.name}`}
                  >
                    <span className="flex items-center gap-2 text-slate-600">
                      <span className={`h-2.5 w-2.5 rounded-full ${dept.color}`}></span>
                      {dept.name} <span className="text-xs text-slate-400">({dept.count})</span>
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-slate-900">
                      {dept.percent}% <ArrowUpRight className="h-3 w-3 text-slate-400" />
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </div>

        {/* ===== ACTIVITIES & RIGHT COLUMN ===== */}
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Activity Table (klik → review) */}
          <article className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm xl:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">Aktivitas Terkini</h3>
                <p className="mt-1 text-sm text-slate-500">Klik baris untuk melihat detail</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-4 sm:px-5 py-3 font-semibold">Karyawan</th>
                    <th className="px-4 sm:px-5 py-3 font-semibold">Aktivitas</th>
                    <th className="px-4 sm:px-5 py-3 font-semibold">Modul</th>
                    <th className="px-4 sm:px-5 py-3 font-semibold text-right">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activities.map((act) => (
                    <tr
                      key={act._id}
                      onClick={() => setReviewItem({ type: 'activity', title: 'Detail Aktivitas', subtitle: act.name, icon: Activity, iconBg: 'bg-blue-50', iconColor: 'text-blue-600', data: act })}
                      className="cursor-pointer hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 sm:px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-xs ${act.avatarBg}`}>{act.avatar}</div>
                          <span className="font-semibold text-slate-900">{act.name}</span>
                        </div>
                      </td>
                      <td className="px-4 sm:px-5 py-4 text-slate-600">{act.activity}</td>
                      <td className="px-4 sm:px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${act.moduleColor}`}>{act.module}</span></td>
                      <td className="px-4 sm:px-5 py-4 text-right text-xs text-slate-500">{act.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </article>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Pending Leaves (klik → review + approve) */}
            <article className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Cuti Menunggu</h3>
                <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-700">{leaves.length}</span>
              </div>
              <div className="mt-4 space-y-3">
                {leaves.length > 0 ? leaves.map((leave) => (
                  <div
                    key={leave._id}
                    onClick={() => setReviewItem({ type: 'leave', title: 'Review Pengajuan Cuti', subtitle: leave.employeeName, icon: CalendarDays, iconBg: 'bg-amber-50', iconColor: 'text-amber-600', data: leave })}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-100 p-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-xs ${leave.avatarBg}`}>{leave.avatar}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{leave.employeeName}</p>
                      <p className="text-xs text-slate-500">{leave.type} • {leave.duration}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </div>
                )) : (
                  <p className="py-4 text-center text-sm text-slate-400">Tidak ada pengajuan cuti pending 🎉</p>
                )}
              </div>
            </article>

            {/* New Employees (dari MongoDB, klik → review profil) */}
            <article className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
                <User className="h-5 w-5 text-sky-500" /> Karyawan Terbaru
              </h3>
              <div className="mt-4 space-y-3">
                {newEmployees.map((emp) => (
                  <div
                    key={emp._id}
                    onClick={() => setReviewItem({ type: 'employee', title: 'Profil Karyawan', subtitle: emp.role, icon: User, iconBg: 'bg-sky-50', iconColor: 'text-sky-600', data: emp })}
                    className="flex cursor-pointer items-center gap-3 rounded-lg p-2 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-200 font-bold text-sm text-slate-700">
                      {emp.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{emp.name}</p>
                      <p className="text-xs text-slate-500">{emp.dept}</p>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </article>
          </div>
        </div>

        {/* ===== BOTTOM ROW ===== */}
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Announcements (klik → review) */}
          <article className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-2">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
              <Megaphone className="h-5 w-5 text-orange-500" /> Pengumuman Perusahaan
            </h3>
            <div className="mt-4 space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann._id}
                  onClick={() => setReviewItem({ type: 'announcement', title: 'Detail Pengumuman', subtitle: ann.date, icon: Bell, iconBg: 'bg-orange-50', iconColor: 'text-orange-600', data: ann })}
                  className="flex cursor-pointer items-center gap-4 rounded-lg border border-slate-100 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><Bell className="h-5 w-5" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-900">{ann.title}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{ann.date}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${ann.tagColor}`}>{ann.tag}</span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" />
                </div>
              ))}
            </div>
          </article>

          {/* Quick Actions (klik → navigate) */}
          <article className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="text-base font-bold text-slate-900">Aksi Cepat</h3>
            <p className="mt-1 text-sm text-slate-500">Pintasan ke modul utama</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    onClick={() => navigate(action.path)}
                    className={`flex flex-col items-start gap-2 rounded-xl ${action.bg} p-3.5 text-left text-xs font-semibold ${action.color} ${action.hover} transition-colors`}
                  >
                    <Icon className="h-5 w-5" /> {action.label}
                  </button>
                );
              })}
            </div>
          </article>
        </div>
      </div>

      {/* ===== MODAL REVIEW ===== */}
      <DetailModal
        isOpen={!!reviewItem}
        onClose={() => setReviewItem(null)}
        title={reviewItem?.title}
        subtitle={reviewItem?.subtitle}
        icon={reviewItem?.icon}
        iconBg={reviewItem?.iconBg}
        iconColor={reviewItem?.iconColor}
      >
        {renderReviewContent()}
      </DetailModal>
    </DashboardLayout>
  );
}