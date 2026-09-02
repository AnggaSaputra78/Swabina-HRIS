import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DetailModal from '../components/ui/DetailModal';
import { api } from '../lib/api';
import {
  TrendingUp, Award, Clock, Users, Star, Plus, Pencil, Trash2, X, Save,
  Loader2, AlertTriangle, BarChart3, Target, CheckCircle2, Calendar, User,
} from 'lucide-react';

const categoryStyle = {
  Excellent: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Good: 'bg-blue-100 text-blue-700 border-blue-200',
  Average: 'bg-amber-100 text-amber-700 border-amber-200',
  Poor: 'bg-red-100 text-red-700 border-red-200',
};

const categoryProgressColor = {
  Excellent: 'bg-emerald-500',
  Good: 'bg-blue-500',
  Average: 'bg-amber-500',
  Poor: 'bg-red-500',
};

const statusStyle = {
  Draft: 'bg-slate-100 text-slate-700',
  Submitted: 'bg-sky-100 text-sky-700',
  Reviewed: 'bg-emerald-100 text-emerald-700',
};

const periods = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026', 'Jan 2026', 'Feb 2026', 'Mar 2026'];
const metricLabels = {
  quality: 'Kualitas Kerja',
  productivity: 'Produktivitas',
  teamwork: 'Kerjasama Tim',
  initiative: 'Inisiatif',
  discipline: 'Kedisiplinan',
};

const initialForm = {
  employeeId: '', period: 'Q1 2026', reviewer: '',
  quality: 3, productivity: 3, teamwork: 3, initiative: 3, discipline: 3,
  strengths: '', improvements: '', feedback: '', status: 'Draft',
};

export default function KinerjaPage() {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total: 0, reviewed: 0, pending: 0, excellent: 0, avgScore: 0 });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterPeriod, setFilterPeriod] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [filterDept, setFilterDept] = useState('Semua');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const [detailItem, setDetailItem] = useState(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const params = {};
      if (filterPeriod !== 'Semua') params.period = filterPeriod;
      if (filterStatus !== 'Semua') params.status = filterStatus;
      if (filterDept !== 'Semua') params.dept = filterDept;

      const [listData, statsData, empData] = await Promise.all([
        api.getPerformanceList(params),
        api.getPerformanceStats(),
        api.getEmployees(),
      ]);
      setReviews(listData);
      setStats(statsData);
      setEmployees(empData);
    } catch (err) {
      setError('Gagal memuat data kinerja. Pastikan backend berjalan di http://localhost:5000');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const delay = setTimeout(fetchData, 300);
    return () => clearTimeout(delay);
  }, [filterPeriod, filterStatus, filterDept]);

  const openAdd = () => {
    setEditingId(null);
    setForm(initialForm);
    setIsModalOpen(true);
  };

  const openEdit = (r) => {
    setEditingId(r._id);
    setForm({
      employeeId: r.employeeId || '',
      period: r.period || 'Q1 2026',
      reviewer: r.reviewer || '',
      quality: r.quality || 3,
      productivity: r.productivity || 3,
      teamwork: r.teamwork || 3,
      initiative: r.initiative || 3,
      discipline: r.discipline || 3,
      strengths: r.strengths || '',
      improvements: r.improvements || '',
      feedback: r.feedback || '',
      status: r.status || 'Draft',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emp = employees.find((x) => x._id === form.employeeId);
    if (!emp) return alert('Pilih karyawan terlebih dahulu');
    setSaving(true);
    try {
      const payload = {
        ...form,
        employeeName: emp.name,
        nik: emp.nik,
        dept: emp.dept || emp.department,
        position: emp.position || emp.role,
        avatar: emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
      };
      if (editingId) await api.updatePerformance(editingId, payload);
      else await api.createPerformance(payload);
      setIsModalOpen(false);
      fetchData();
    } catch (err) { alert('Gagal menyimpan: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus review kinerja ini?')) return;
    try { await api.deletePerformance(id); fetchData(); }
    catch (err) { alert('Gagal menghapus: ' + err.message); }
  };

  // Preview skor real-time saat mengisi form
  const previewScore = Math.round(
    ((Number(form.quality) + Number(form.productivity) + Number(form.teamwork) +
      Number(form.initiative) + Number(form.discipline)) / 5) * 20
  );
  const previewCategory =
    previewScore >= 90 ? 'Excellent' : previewScore >= 75 ? 'Good' :
    previewScore >= 60 ? 'Average' : 'Poor';

  const statCards = [
    { icon: BarChart3, label: 'Total Review', value: stats.total, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { icon: CheckCircle2, label: 'Sudah Direview', value: stats.reviewed, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { icon: Clock, label: 'Menunggu', value: stats.pending, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
    { icon: Award, label: 'Rata-rata Skor', value: stats.avgScore, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Penilaian Kinerja</h1>
            <p className="text-sm text-slate-500 mt-1">Evaluasi & monitoring performa karyawan PT Swabina Gatra.</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
            <Plus className="h-4 w-4" /> Tambah Penilaian
          </button>
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
        <div className="flex flex-col lg:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
            <option value="Semua">Semua Periode</option>
            {periods.map((p) => <option key={p}>{p}</option>)}
          </select>
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
            <option value="Semua">Semua Departemen</option>
            {['HRD', 'IT', 'Finance', 'Marketing', 'Operasional'].map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
            <option value="Semua">Semua Status</option>
            <option>Draft</option><option>Submitted</option><option>Reviewed</option>
          </select>
        </div>

        {/* Tabel */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" /><p className="mt-2 text-sm">Memuat data kinerja...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Karyawan</th>
                    <th className="px-6 py-4 font-semibold">Periode</th>
                    <th className="px-6 py-4 font-semibold">Reviewer</th>
                    <th className="px-6 py-4 font-semibold">Skor</th>
                    <th className="px-6 py-4 font-semibold">Kategori</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reviews.length > 0 ? reviews.map((r) => (
                    <tr key={r._id} onClick={() => setDetailItem(r)} className="cursor-pointer hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-xs ${r.avatarBg || 'bg-slate-200 text-slate-700'}`}>
                            {r.avatar || '?'}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{r.employeeName}</p>
                            <p className="text-xs text-slate-500">{r.position} • {r.dept}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {r.period}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{r.reviewer || '-'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-extrabold text-slate-900">{r.totalScore}</span>
                          <div className="h-2 w-16 rounded-full bg-slate-100 overflow-hidden">
                            <div className={`h-full ${categoryProgressColor[r.category]}`} style={{ width: `${r.totalScore}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${categoryStyle[r.category]}`}>
                          {r.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[r.status]}`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => openEdit(r)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Edit"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(r._id)} className="rounded-lg p-2 text-red-400 hover:bg-red-50" title="Hapus"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" className="px-6 py-8 text-center text-slate-500">Tidak ada data kinerja untuk filter ini.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Penilaian' : 'Tambah Penilaian Kinerja'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 hover:bg-slate-100"><X className="h-5 w-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Info Karyawan & Periode */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Karyawan</label>
                  <select required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900">
                    <option value="">— Pilih Karyawan —</option>
                    {employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.name} ({emp.dept || emp.department})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Periode</label>
                  <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    {periods.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reviewer (Atasan)</label>
                <input value={form.reviewer} onChange={(e) => setForm({ ...form, reviewer: e.target.value })}
                  placeholder="Nama atasan / HR" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>

              {/* Metrics */}
              <div className="rounded-xl border border-slate-200 p-4">
                <h3 className="mb-4 text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Target className="h-4 w-4 text-slate-600" /> Penilaian Aspek Kinerja (Skala 1-5)
                </h3>
                <div className="space-y-4">
                  {Object.entries(metricLabels).map(([key, label]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-slate-700">{label}</label>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((v) => (
                            <button key={v} type="button" onClick={() => setForm({ ...form, [key]: v })}
                              className={`p-0.5 ${form[key] >= v ? 'text-amber-400' : 'text-slate-300'}`}>
                              <Star className="h-5 w-5" fill={form[key] >= v ? 'currentColor' : 'none'} />
                            </button>
                          ))}
                          <span className="ml-2 text-sm font-bold text-slate-900 w-6 text-right">{form[key]}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Preview Skor */}
                <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
                  <span className="text-sm font-semibold text-slate-700">Total Skor:</span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-extrabold text-slate-900">{previewScore}</span>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${categoryStyle[previewCategory]}`}>
                      {previewCategory}
                    </span>
                  </div>
                </div>
              </div>

              {/* Feedback */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kekuatan</label>
                  <textarea value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })}
                    rows="2" placeholder="Hal yang sudah baik..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Area Pengembangan</label>
                  <textarea value={form.improvements} onChange={(e) => setForm({ ...form, improvements: e.target.value })}
                    rows="2" placeholder="Hal yang perlu ditingkatkan..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Feedback Keseluruhan</label>
                <textarea value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })}
                  rows="2" placeholder="Catatan untuk karyawan..." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option>Draft</option><option>Submitted</option><option>Reviewed</option>
                </select>
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

      {/* Modal Detail */}
      <DetailModal isOpen={!!detailItem} onClose={() => setDetailItem(null)}
        title="Detail Penilaian Kinerja" subtitle={detailItem?.employeeName}
        icon={TrendingUp} iconBg="bg-blue-50" iconColor="text-blue-600">
        {detailItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold ${detailItem.avatarBg || 'bg-slate-200 text-slate-700'}`}>
                {detailItem.avatar || '?'}
              </div>
              <div className="flex-1">
                <p className="text-lg font-bold text-slate-900">{detailItem.employeeName}</p>
                <p className="text-xs text-slate-500">{detailItem.position} • {detailItem.dept}</p>
              </div>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${categoryStyle[detailItem.category]}`}>
                {detailItem.category}
              </span>
            </div>

            {/* Big Score */}
            <div className="rounded-xl bg-gradient-to-br from-slate-900 to-slate-700 p-5 text-center text-white">
              <p className="text-xs opacity-80">Total Skor</p>
              <p className="text-5xl font-extrabold">{detailItem.totalScore}</p>
              <p className="mt-1 text-sm opacity-80">Periode {detailItem.period}</p>
            </div>

            {/* Metrics Breakdown */}
            <div className="space-y-2">
              {Object.entries(metricLabels).map(([key, label]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-32 text-xs text-slate-600">{label}</span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${categoryProgressColor[detailItem.category]}`}
                      style={{ width: `${(detailItem[key] / 5) * 100}%` }} />
                  </div>
                  <span className="w-6 text-right text-sm font-bold text-slate-900">{detailItem[key]}</span>
                </div>
              ))}
            </div>

            {/* Feedback */}
            {detailItem.strengths && (
              <div className="rounded-xl bg-emerald-50 p-3 text-sm">
                <p className="text-xs font-semibold text-emerald-700 mb-1">💪 Kekuatan</p>
                <p className="text-emerald-900">{detailItem.strengths}</p>
              </div>
            )}
            {detailItem.improvements && (
              <div className="rounded-xl bg-amber-50 p-3 text-sm">
                <p className="text-xs font-semibold text-amber-700 mb-1">🎯 Area Pengembangan</p>
                <p className="text-amber-900">{detailItem.improvements}</p>
              </div>
            )}
            {detailItem.feedback && (
              <div className="rounded-xl border border-slate-200 p-3 text-sm">
                <p className="text-xs font-semibold text-slate-700 mb-1">📝 Feedback</p>
                <p className="text-slate-700">{detailItem.feedback}</p>
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm">
              <span className="text-slate-500">Reviewer:</span>
              <span className="font-semibold text-slate-900">{detailItem.reviewer || '-'}</span>
            </div>
          </div>
        )}
      </DetailModal>
    </DashboardLayout>
  );
}