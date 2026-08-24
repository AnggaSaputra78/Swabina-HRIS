import { useState, useEffect, useContext } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DetailModal from '../components/ui/DetailModal';
import { AuthContext } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  CalendarCheck, Clock, LogIn, LogOut, Search, X, Save, Trash2,
  Loader2, AlertTriangle, CheckCircle2, XCircle, FileText, Calendar,
  Download, ShieldCheck, Building2, Users, Percent
} from 'lucide-react';

const avatarColors = [
  'bg-blue-100 text-blue-700', 'bg-pink-100 text-pink-700', 'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700', 'bg-sky-100 text-sky-700', 'bg-purple-100 text-purple-700',
  'bg-indigo-100 text-indigo-700', 'bg-rose-100 text-rose-700',
];
const getInitials = (name = '') => name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
const getAvatarBg = (name = 'A') => avatarColors[(name.charCodeAt(0) || 0) % avatarColors.length];
const statusStyle = {
  Hadir: 'bg-emerald-100 text-emerald-700',
  Terlambat: 'bg-amber-100 text-amber-700',
  Izin: 'bg-sky-100 text-sky-700',
  Sakit: 'bg-purple-100 text-purple-700',
  Alpha: 'bg-red-100 text-red-700',
};
const nowTime = () => new Date().toTimeString().slice(0, 5);
const todayStr = () => new Date().toISOString().slice(0, 10);
const autoStatus = (time) => (time && time <= '08:00' ? 'Hadir' : 'Terlambat');
const noClock = ['Izin', 'Sakit', 'Alpha'];

export default function AbsenPage() {
  // ===== IDENTITAS ADMIN (dari AuthContext) =====
  const { user } = useContext(AuthContext);
  const adminName = user?.name || user?.username || user?.email || 'Administrator';
  const adminRole = user?.role || 'HR Administrator';

  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ hadir: 0, terlambat: 0, izin: 0, alpha: 0, total: 0 });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterDept, setFilterDept] = useState('Semua');
  const [filterDate, setFilterDate] = useState(todayStr());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);
  const [formData, setFormData] = useState({
    employeeId: '', date: todayStr(), clockIn: nowTime(), clockOut: '', status: 'Hadir', note: '',
  });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const [attData, statsData, empData] = await Promise.all([
        api.getAttendance({ search: searchQuery, status: filterStatus, date: filterDate }),
        api.getAttendanceStats({ date: filterDate }),
        api.getEmployees(),
      ]);
      setRecords(attData); setStats(statsData); setEmployees(empData);
    } catch (err) {
      setError('Gagal memuat data absensi. Pastikan backend berjalan di http://localhost:5000');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const delay = setTimeout(fetchData, 300);
    return () => clearTimeout(delay);
  }, [searchQuery, filterStatus, filterDate]);

  // Filter departemen (client-side, khusus admin drill-down)
  const displayedRecords = records.filter((r) => filterDept === 'Semua' || r.dept === filterDept);
  const attendanceRate = stats.total > 0 ? Math.round(((stats.hadir + stats.terlambat) / stats.total) * 100) : 0;

  const openAddModal = () => {
    setFormData({ employeeId: '', date: filterDate || todayStr(), clockIn: nowTime(), clockOut: '', status: autoStatus(nowTime()), note: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emp = employees.find((x) => x._id === formData.employeeId);
    if (!emp) return alert('Pilih karyawan terlebih dahulu');
    setSaving(true);
    try {
      await api.createAttendance({
        employeeName: emp.name, nik: emp.nik, dept: emp.dept, date: formData.date,
        clockIn: noClock.includes(formData.status) ? '' : formData.clockIn,
        clockOut: formData.clockOut, status: formData.status, note: formData.note,
        avatar: getInitials(emp.name), avatarBg: getAvatarBg(emp.name),
      });
      setIsModalOpen(false); fetchData();
    } catch (err) { alert('Gagal menyimpan: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleClockOut = async (rec) => {
    try { await api.updateAttendance(rec._id, { clockOut: nowTime() }); fetchData(); }
    catch (err) { alert('Gagal absen pulang: ' + err.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data absensi ini?')) return;
    try { await api.deleteAttendance(id); fetchData(); }
    catch (err) { alert('Gagal menghapus: ' + err.message); }
  };

  // ===== FITUR ADMIN: EXPORT CSV =====
  const handleExport = () => {
    if (displayedRecords.length === 0) return alert('Tidak ada data untuk diekspor.');
    const headers = ['Nama', 'NIK', 'Departemen', 'Tanggal', 'Jam Masuk', 'Jam Pulang', 'Status', 'Keterangan'];
    const rows = displayedRecords.map((r) => [r.employeeName, r.nik, r.dept, r.date, r.clockIn || '', r.clockOut || '', r.status, r.note || '']);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `absensi-${filterDate || 'semua-tanggal'}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const statCards = [
    { icon: Users, label: 'Total Karyawan', value: employees.length, iconBg: 'bg-slate-100', iconColor: 'text-slate-700' },
    { icon: CheckCircle2, label: 'Hadir', value: stats.hadir, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { icon: Clock, label: 'Terlambat', value: stats.terlambat, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
    { icon: FileText, label: 'Izin / Sakit', value: stats.izin, iconBg: 'bg-sky-50', iconColor: 'text-sky-600' },
    { icon: XCircle, label: 'Alpha', value: stats.alpha, iconBg: 'bg-red-50', iconColor: 'text-red-600' },
    { icon: Percent, label: 'Tingkat Kehadiran', value: `${attendanceRate}%`, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* ===== HEADER ADMIN ===== */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">Manajemen Absensi</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
                <ShieldCheck className="h-3.5 w-3.5" /> ADMIN
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">Panel Administrator — kelola & pantau kehadiran seluruh karyawan PT Swabina Gatra.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* Identitas Admin */}
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold">
                {getInitials(adminName)}
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-900">{adminName}</p>
                <p className="text-slate-500">{adminRole}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleExport} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <Download className="h-4 w-4" /> Export
              </button>
              <button onClick={openAddModal} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                <LogIn className="h-4 w-4" /> Absen Masuk
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle className="h-5 w-5 shrink-0" /><span>{error}</span>
            <button onClick={fetchData} className="ml-auto rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700">Coba Lagi</button>
          </div>
        )}

        {/* ===== STAT CARDS ADMIN ===== */}
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Ringkasan {filterDate ? `tanggal ${filterDate}` : 'semua tanggal'} • seluruh departemen
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {statCards.map((s, i) => {
              const Icon = s.icon;
              return (
                <article key={i} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-xl ${s.iconBg} p-2.5 ${s.iconColor}`}><Icon className="h-5 w-5" /></span>
                    <span className="text-2xl font-extrabold text-slate-900">{s.value}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-500">{s.label}</p>
                </article>
              );
            })}
          </div>
        </div>

        {/* ===== FILTER ADMIN ===== */}
        <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari nama karyawan..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
          </div>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900">
              <option value="Semua">Semua Departemen</option>
              <option>IT</option><option>Human Resource</option><option>Marketing</option><option>Finance</option><option>Operasional</option>
            </select>
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
            <option value="Semua">Semua Status</option>
            <option>Hadir</option><option>Terlambat</option><option>Izin</option><option>Sakit</option><option>Alpha</option>
          </select>
          <button onClick={() => { setFilterDate(''); setFilterStatus('Semua'); setFilterDept('Semua'); setSearchQuery(''); }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Reset</button>
        </div>

        {/* ===== TABEL ADMIN ===== */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" /><p className="mt-2 text-sm">Memuat data absensi...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Karyawan</th>
                    <th className="px-6 py-4 font-semibold">NIK</th>
                    <th className="px-6 py-4 font-semibold">Tanggal</th>
                    <th className="px-6 py-4 font-semibold">Masuk</th>
                    <th className="px-6 py-4 font-semibold">Pulang</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Keterangan</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedRecords.length > 0 ? displayedRecords.map((rec) => (
                    <tr key={rec._id} onClick={() => setReviewItem(rec)} className="cursor-pointer hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-xs ${rec.avatarBg || 'bg-slate-200 text-slate-700'}`}>{rec.avatar || getInitials(rec.employeeName)}</div>
                          <div>
                            <p className="font-semibold text-slate-900">{rec.employeeName}</p>
                            <p className="text-xs text-slate-500">{rec.dept}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">{rec.nik}</td>
                      <td className="px-6 py-4 text-slate-600">{rec.date}</td>
                      <td className="px-6 py-4 font-mono text-slate-700">{rec.clockIn || '—'}</td>
                      <td className="px-6 py-4 font-mono text-slate-700">{rec.clockOut || '—'}</td>
                      <td className="px-6 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[rec.status]}`}>{rec.status}</span></td>
                      <td className="px-6 py-4 text-slate-500 text-xs max-w-[160px] truncate">{rec.note || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          {!rec.clockOut && !noClock.includes(rec.status) && (
                            <button onClick={() => handleClockOut(rec)} className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100" title="Absen Pulang">
                              <LogOut className="h-3.5 w-3.5" /> Pulang
                            </button>
                          )}
                          <button onClick={() => handleDelete(rec._id)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600" title="Hapus">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="8" className="px-6 py-8 text-center text-slate-500">Tidak ada data absensi untuk filter ini.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
            <p className="text-xs text-slate-500">Menampilkan {displayedRecords.length} dari {records.length} catatan absensi</p>
          </div>
        </div>
      </div>

      {/* ===== MODAL ABSEN MASUK ===== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Absen Masuk Karyawan</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 hover:bg-slate-100"><X className="h-5 w-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Karyawan</label>
                <select required value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900">
                  <option value="">— Pilih Karyawan —</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>{emp.name} ({emp.nik})</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal</label>
                  <input required type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <option>Hadir</option><option>Terlambat</option><option>Izin</option><option>Sakit</option><option>Alpha</option>
                  </select>
                </div>
              </div>
              {!noClock.includes(formData.status) && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Jam Masuk</label>
                    <input type="time" value={formData.clockIn} onChange={(e) => setFormData({ ...formData, clockIn: e.target.value, status: autoStatus(e.target.value) })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Jam Pulang (opsional)</label>
                    <input type="time" value={formData.clockOut} onChange={(e) => setFormData({ ...formData, clockOut: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Keterangan (opsional)</label>
                <input type="text" value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} placeholder="Contoh: Dinas luar, surat dokter..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL DETAIL ===== */}
      <DetailModal isOpen={!!reviewItem} onClose={() => setReviewItem(null)} title="Detail Absensi" subtitle={reviewItem?.employeeName} icon={CalendarCheck} iconBg="bg-emerald-50" iconColor="text-emerald-600">
        {reviewItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold ${reviewItem.avatarBg || 'bg-slate-200 text-slate-700'}`}>{reviewItem.avatar || getInitials(reviewItem.employeeName)}</div>
              <div>
                <p className="text-lg font-bold text-slate-900">{reviewItem.employeeName}</p>
                <p className="font-mono text-xs text-slate-500">{reviewItem.nik} • {reviewItem.dept}</p>
              </div>
              <span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[reviewItem.status]}`}>{reviewItem.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-slate-50 p-4 text-center"><p className="text-xs text-slate-500">Tanggal</p><p className="mt-1 text-sm font-bold text-slate-900">{reviewItem.date}</p></div>
              <div className="rounded-xl bg-slate-50 p-4 text-center"><p className="text-xs text-slate-500">Masuk</p><p className="mt-1 text-sm font-bold text-slate-900">{reviewItem.clockIn || '—'}</p></div>
              <div className="rounded-xl bg-slate-50 p-4 text-center"><p className="text-xs text-slate-500">Pulang</p><p className="mt-1 text-sm font-bold text-slate-900">{reviewItem.clockOut || '—'}</p></div>
            </div>
            {reviewItem.note && (
              <div className="rounded-xl border border-slate-100 p-4 text-sm">
                <p className="text-slate-500 text-xs">Keterangan</p>
                <p className="mt-1 text-slate-700">{reviewItem.note}</p>
              </div>
            )}
            <div className="flex gap-3">
              {!reviewItem.clockOut && !noClock.includes(reviewItem.status) && (
                <button onClick={() => { handleClockOut(reviewItem); setReviewItem(null); }} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
                  <LogOut className="h-4 w-4" /> Absen Pulang Sekarang
                </button>
              )}
              <button onClick={() => { setReviewItem(null); handleDelete(reviewItem._id); }} className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" /> Hapus
              </button>
            </div>
          </div>
        )}
      </DetailModal>
    </DashboardLayout>
  );
}