import { useState, useEffect, useContext } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DetailModal from '../components/ui/DetailModal';
import { AuthContext } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  CalendarDays, CheckCircle2, XCircle, Clock, FileText, X, Save, Trash2,
  Loader2, AlertTriangle, Download, ShieldCheck, Calendar, Check, Ban
} from 'lucide-react';

const avatarColors = [
  'bg-blue-100 text-blue-700', 'bg-pink-100 text-pink-700', 'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700', 'bg-sky-100 text-sky-700', 'bg-purple-100 text-purple-700',
  'bg-indigo-100 text-indigo-700', 'bg-rose-100 text-rose-700',
];
const getInitials = (name = '') => name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
const getAvatarBg = (name = 'A') => avatarColors[(name.charCodeAt(0) || 0) % avatarColors.length];
const statusStyle = {
  Pending: 'bg-amber-100 text-amber-700',
  Disetujui: 'bg-emerald-100 text-emerald-700',
  Ditolak: 'bg-red-100 text-red-700',
};
const leaveTypes = ['Cuti Tahunan', 'Cuti Sakit', 'Cuti Melahirkan', 'Cuti Penting', 'Cuti Tanpa Gaji'];
const todayStr = () => new Date().toISOString().slice(0, 10);
const calcDuration = (start, end) => {
  if (!start || !end) return '';
  const diff = (new Date(end) - new Date(start)) / 86400000 + 1;
  return diff > 0 ? `${diff} hari` : '';
};

export default function CutiPage() {
  const { user } = useContext(AuthContext);
  const adminName = user?.name || user?.username || user?.email || 'Administrator';
  const adminRole = user?.role || 'HR Administrator';

  const [records, setRecords] = useState([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterType, setFilterType] = useState('Semua');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);
  const [formData, setFormData] = useState({ employeeId: '', type: 'Cuti Tahunan', startDate: todayStr(), endDate: todayStr(), reason: '' });

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const [leaveData, statsData, empData] = await Promise.all([
        api.getLeaveList({ status: filterStatus, type: filterType }),
        api.getLeaveStats(),
        api.getEmployees(),
      ]);
      setRecords(leaveData); setStats(statsData); setEmployees(empData);
    } catch (err) {
      setError('Gagal memuat data cuti. Pastikan backend berjalan di http://localhost:5000');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const delay = setTimeout(fetchData, 300);
    return () => clearTimeout(delay);
  }, [filterStatus, filterType]);

  const openAddModal = () => {
    setFormData({ employeeId: '', type: 'Cuti Tahunan', startDate: todayStr(), endDate: todayStr(), reason: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emp = employees.find((x) => x._id === formData.employeeId);
    if (!emp) return alert('Pilih karyawan terlebih dahulu');
    const duration = calcDuration(formData.startDate, formData.endDate);
    if (!duration) return alert('Rentang tanggal tidak valid (tanggal akhir harus ≥ tanggal mulai).');
    setSaving(true);
    try {
      await api.createLeave({
        employeeName: emp.name, nik: emp.nik, dept: emp.dept,
        type: formData.type, startDate: formData.startDate, endDate: formData.endDate,
        duration, reason: formData.reason, status: 'Pending',
        avatar: getInitials(emp.name), avatarBg: getAvatarBg(emp.name),
      });
      setIsModalOpen(false); fetchData();
    } catch (err) { alert('Gagal menyimpan: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleApprove = async (rec) => {
    try { await api.approveLeaveRequest(rec._id); setReviewItem(null); fetchData(); }
    catch (err) { alert('Gagal menyetujui: ' + err.message); }
  };
  const handleReject = async (rec) => {
    if (!window.confirm('Tolak pengajuan cuti ini?')) return;
    try { await api.rejectLeaveRequest(rec._id); setReviewItem(null); fetchData(); }
    catch (err) { alert('Gagal menolak: ' + err.message); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data cuti ini?')) return;
    try { await api.deleteLeave(id); fetchData(); }
    catch (err) { alert('Gagal menghapus: ' + err.message); }
  };

  const handleExport = () => {
    if (records.length === 0) return alert('Tidak ada data untuk diekspor.');
    const headers = ['Nama', 'NIK', 'Departemen', 'Jenis Cuti', 'Mulai', 'Selesai', 'Durasi', 'Status', 'Alasan'];
    const rows = records.map((r) => [r.employeeName, r.nik, r.dept, r.type, r.startDate, r.endDate, r.duration, r.status, r.reason || '']);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `pengajuan-cuti-${todayStr()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const statCards = [
    { icon: Clock, label: 'Menunggu Approval', value: stats.pending, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
    { icon: CheckCircle2, label: 'Disetujui', value: stats.approved, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { icon: XCircle, label: 'Ditolak', value: stats.rejected, iconBg: 'bg-red-50', iconColor: 'text-red-600' },
    { icon: FileText, label: 'Total Pengajuan', value: stats.total, iconBg: 'bg-slate-100', iconColor: 'text-slate-700' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Admin */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900">Manajemen Cuti</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold text-white">
                <ShieldCheck className="h-3.5 w-3.5" /> ADMIN
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">Kelola & setujui pengajuan cuti seluruh karyawan PT Swabina Gatra.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white text-xs font-bold">{getInitials(adminName)}</div>
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
                <CalendarDays className="h-4 w-4" /> Ajukan Cuti
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

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Filter */}
        <div className="flex flex-col lg:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
            <option value="Semua">Semua Jenis</option>
            {leaveTypes.map((t) => <option key={t}>{t}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
            <option value="Semua">Semua Status</option>
            <option>Pending</option><option>Disetujui</option><option>Ditolak</option>
          </select>
          <button onClick={() => { setFilterStatus('Semua'); setFilterType('Semua'); }} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Reset</button>
        </div>

        {/* Tabel */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" /><p className="mt-2 text-sm">Memuat data cuti...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Karyawan</th>
                    <th className="px-6 py-4 font-semibold">Jenis Cuti</th>
                    <th className="px-6 py-4 font-semibold">Durasi</th>
                    <th className="px-6 py-4 font-semibold">Tanggal</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.length > 0 ? records.map((rec) => (
                    <tr key={rec._id} onClick={() => setReviewItem(rec)} className="cursor-pointer hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-xs ${rec.avatarBg || 'bg-slate-200 text-slate-700'}`}>{rec.avatar || getInitials(rec.employeeName)}</div>
                          <div>
                            <p className="font-semibold text-slate-900">{rec.employeeName}</p>
                            <p className="font-mono text-xs text-slate-500">{rec.nik} • {rec.dept}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{rec.type}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">{rec.duration}</td>
                      <td className="px-6 py-4 text-slate-600 text-xs">{rec.startDate} → {rec.endDate}</td>
                      <td className="px-6 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[rec.status]}`}>{rec.status}</span></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          {rec.status === 'Pending' && (
                            <>
                              <button onClick={() => handleApprove(rec)} className="rounded-lg bg-emerald-50 p-2 text-emerald-600 hover:bg-emerald-100" title="Setujui"><Check className="h-4 w-4" /></button>
                              <button onClick={() => handleReject(rec)} className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100" title="Tolak"><Ban className="h-4 w-4" /></button>
                            </>
                          )}
                          <button onClick={() => handleDelete(rec._id)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600" title="Hapus"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Tidak ada pengajuan cuti untuk filter ini.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
            <p className="text-xs text-slate-500">Menampilkan {records.length} pengajuan cuti</p>
          </div>
        </div>
      </div>

      {/* Modal Ajukan Cuti */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">Ajukan Cuti</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 hover:bg-slate-100"><X className="h-5 w-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Karyawan</label>
                <select required value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900">
                  <option value="">— Pilih Karyawan —</option>
                  {employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.name} ({emp.nik})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jenis Cuti</label>
                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  {leaveTypes.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai</label>
                  <input required type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Selesai</label>
                  <input required type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Durasi: <span className="font-semibold text-slate-900">{calcDuration(formData.startDate, formData.endDate) || '—'}</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Alasan (opsional)</label>
                <textarea value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} rows="3" placeholder="Tuliskan alasan pengajuan cuti..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Ajukan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      <DetailModal isOpen={!!reviewItem} onClose={() => setReviewItem(null)} title="Detail Pengajuan Cuti" subtitle={reviewItem?.employeeName} icon={CalendarDays} iconBg="bg-amber-50" iconColor="text-amber-600">
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
              <div className="rounded-xl bg-slate-50 p-4 text-center"><p className="text-xs text-slate-500">Jenis</p><p className="mt-1 text-xs font-bold text-slate-900">{reviewItem.type}</p></div>
              <div className="rounded-xl bg-slate-50 p-4 text-center"><p className="text-xs text-slate-500">Durasi</p><p className="mt-1 text-sm font-bold text-slate-900">{reviewItem.duration}</p></div>
              <div className="rounded-xl bg-slate-50 p-4 text-center"><p className="text-xs text-slate-500">Status</p><p className="mt-1 text-sm font-bold text-slate-900">{reviewItem.status}</p></div>
            </div>
            <div className="rounded-xl border border-slate-100 p-4 text-sm">
              <p className="text-slate-500 text-xs">Periode</p>
              <p className="mt-1 font-semibold text-slate-700">{reviewItem.startDate} s/d {reviewItem.endDate}</p>
            </div>
            {reviewItem.reason && (
              <div className="rounded-xl border border-slate-100 p-4 text-sm">
                <p className="text-slate-500 text-xs">Alasan</p>
                <p className="mt-1 text-slate-700">{reviewItem.reason}</p>
              </div>
            )}
            {reviewItem.status === 'Pending' && (
              <div className="flex gap-3">
                <button onClick={() => handleApprove(reviewItem)} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">
                  <Check className="h-4 w-4" /> Setujui
                </button>
                <button onClick={() => handleReject(reviewItem)} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700">
                  <Ban className="h-4 w-4" /> Tolak
                </button>
              </div>
            )}
            <button onClick={() => { setReviewItem(null); handleDelete(reviewItem._id); }} className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
              <Trash2 className="h-4 w-4" /> Hapus Pengajuan
            </button>
          </div>
        )}
      </DetailModal>
    </DashboardLayout>
  );
}