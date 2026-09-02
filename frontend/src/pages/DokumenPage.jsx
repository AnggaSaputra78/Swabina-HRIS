import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DetailModal from '../components/ui/DetailModal';
import { api } from '../lib/api';
import {
  FileText, FolderOpen, AlertTriangle, CheckCircle2, Clock, Plus,
  Pencil, Trash2, X, Save, Loader2, Download, Eye, Calendar, Hash,
  Building2, User, File, Upload, Grid3x3, List, ChevronDown,
} from 'lucide-react';

const categoryIcons = {
  'Kontrak': FileText, 'Sertifikat': File, 'Ijazah': File,
  'NPWP': File, 'BPJS': File, 'KTP': File, 'KK': File, 'SIM': File,
  'Lainnya': FileText,
};

const categoryColors = {
  'Kontrak': 'bg-blue-100 text-blue-700',
  'Sertifikat': 'bg-purple-100 text-purple-700',
  'Ijazah': 'bg-emerald-100 text-emerald-700',
  'NPWP': 'bg-amber-100 text-amber-700',
  'BPJS': 'bg-rose-100 text-rose-700',
  'KTP': 'bg-sky-100 text-sky-700',
  'KK': 'bg-orange-100 text-orange-700',
  'SIM': 'bg-indigo-100 text-indigo-700',
  'Lainnya': 'bg-slate-100 text-slate-700',
};

const statusStyle = {
  'Aktif': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Expired': 'bg-red-100 text-red-700 border-red-200',
  'Menunggu Renewal': 'bg-amber-100 text-amber-700 border-amber-200',
  'Draft': 'bg-slate-100 text-slate-700 border-slate-200',
};

const statusIcons = {
  'Aktif': CheckCircle2,
  'Expired': AlertTriangle,
  'Menunggu Renewal': Clock,
  'Draft': FileText,
};

const categories = ['Kontrak', 'Sertifikat', 'Ijazah', 'NPWP', 'BPJS', 'KTP', 'KK', 'SIM', 'Lainnya'];
const statuses = ['Aktif', 'Expired', 'Menunggu Renewal', 'Draft'];

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const formatDate = (d) => {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const getDaysLeft = (expiryDate) => {
  if (!expiryDate) return null;
  const days = Math.ceil((new Date(expiryDate) - new Date()) / (1000*60*60*24));
  return days;
};

const initialForm = {
  employeeId: '', name: '', category: 'Kontrak', type: 'PDF', size: 0,
  issueDate: new Date().toISOString().slice(0, 10),
  expiryDate: '', documentNumber: '', issuer: '', notes: '', status: 'Aktif',
};

export default function DokumenPage() {
  const [documents, setDocuments] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, renewal: 0, expired: 0, categories: {} });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterCat, setFilterCat] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');
  const [viewMode, setViewMode] = useState('grid');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const [detailItem, setDetailItem] = useState(null);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const params = {};
      if (filterCat !== 'Semua') params.category = filterCat;
      if (filterStatus !== 'Semua') params.status = filterStatus;

      const [docsData, statsData, empData] = await Promise.all([
        api.getDocuments(params),
        api.getDocumentStats(),
        api.getEmployees(),
      ]);
      setDocuments(docsData);
      setStats(statsData);
      setEmployees(empData);
    } catch (err) {
      setError('Gagal memuat dokumen. Pastikan backend berjalan di http://localhost:5000');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const delay = setTimeout(fetchData, 300);
    return () => clearTimeout(delay);
  }, [filterCat, filterStatus]);

  const openAdd = () => { setEditingId(null); setForm(initialForm); setIsModalOpen(true); };

  const openEdit = (d) => {
    setEditingId(d._id);
    setForm({
      employeeId: d.employeeId || '', name: d.name || '',
      category: d.category || 'Kontrak', type: d.type || 'PDF', size: d.size || 0,
      issueDate: d.issueDate ? new Date(d.issueDate).toISOString().slice(0, 10) : '',
      expiryDate: d.expiryDate ? new Date(d.expiryDate).toISOString().slice(0, 10) : '',
      documentNumber: d.documentNumber || '', issuer: d.issuer || '',
      notes: d.notes || '', status: d.status || 'Aktif',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const emp = employees.find((x) => x._id === form.employeeId);
    if (!emp) return alert('Pilih karyawan terlebih dahulu');
    setSaving(true);
    try {
      const av = emp.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      const payload = {
        ...form,
        employeeName: emp.name,
        nik: emp.nik,
        dept: emp.dept || emp.department,
        avatar: av,
        uploadedBy: 'HR Administrator',
      };
      if (editingId) await api.updateDocument(editingId, payload);
      else await api.createDocument(payload);
      setIsModalOpen(false);
      fetchData();
    } catch (err) { alert('Gagal menyimpan: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus dokumen ini?')) return;
    try { await api.deleteDocument(id); fetchData(); }
    catch (err) { alert('Gagal menghapus: ' + err.message); }
  };

  const statCards = [
    { icon: FolderOpen, label: 'Total Dokumen', value: stats.total, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { icon: CheckCircle2, label: 'Dokumen Aktif', value: stats.active, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { icon: Clock, label: 'Menunggu Renewal', value: stats.renewal, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
    { icon: AlertTriangle, label: 'Expired', value: stats.expired, iconBg: 'bg-red-50', iconColor: 'text-red-600' },
  ];

  const getCategoryIcon = (cat) => categoryIcons[cat] || FileText;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Dokumen</h1>
            <p className="text-sm text-slate-500 mt-1">Arsip digital dokumen karyawan PT Swabina Gatra.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-slate-200 bg-white p-1">
              <button onClick={() => setViewMode('grid')} className={`rounded-lg p-2 ${viewMode === 'grid' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
                <Grid3x3 className="h-4 w-4" />
              </button>
              <button onClick={() => setViewMode('list')} className={`rounded-lg p-2 ${viewMode === 'list' ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>
                <List className="h-4 w-4" />
              </button>
            </div>
            <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
              <Plus className="h-4 w-4" /> Upload Dokumen
            </button>
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

        {/* Category Breakdown */}
        {Object.keys(stats.categories || {}).length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Distribusi Kategori Dokumen</h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.categories).map(([cat, count]) => {
                const Icon = getCategoryIcon(cat);
                return (
                  <div key={cat} className={`flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm ${categoryColors[cat] || ''}`}>
                    <Icon className="h-4 w-4" />
                    <span className="font-semibold">{cat}</span>
                    <span className="rounded-full bg-white/50 px-2 py-0.5 text-xs font-bold">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex flex-col lg:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
            <option value="Semua">Semua Kategori</option>
            {categories.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
            <option value="Semua">Semua Status</option>
            {statuses.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" /><p className="mt-2 text-sm">Memuat dokumen...</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
            Tidak ada dokumen untuk filter ini.
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {documents.map((d) => {
              const CatIcon = getCategoryIcon(d.category);
              const StatusIcon = statusIcons[d.status] || FileText;
              const daysLeft = getDaysLeft(d.expiryDate);
              return (
                <article key={d._id} onClick={() => setDetailItem(d)}
                  className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:border-slate-300 transition-all cursor-pointer">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${categoryColors[d.category] || 'bg-slate-100 text-slate-700'}`}>
                      <CatIcon className="h-6 w-6" />
                    </div>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle[d.status]}`}>
                      <StatusIcon className="h-3 w-3" /> {d.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 line-clamp-1">{d.name}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">{d.category} • {d.type}</p>

                  <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-bold ${d.avatarBg || 'bg-slate-200 text-slate-700'}`}>
                      {d.avatar || '?'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-900">{d.employeeName}</p>
                      <p className="truncate text-slate-500">{d.dept}</p>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between">
                      <span>Tanggal Terbit</span>
                      <span className="font-semibold text-slate-700">{formatDate(d.issueDate)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Expired</span>
                      <span className={`font-semibold ${daysLeft !== null && daysLeft <= 30 ? 'text-red-600' : 'text-slate-700'}`}>
                        {formatDate(d.expiryDate)}
                      </span>
                    </div>
                    {daysLeft !== null && daysLeft > 0 && daysLeft <= 30 && (
                      <p className="text-[11px] text-amber-600 font-medium mt-1">⚠️ {daysLeft} hari lagi expired</p>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-end gap-1 border-t border-slate-100 pt-3" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => openEdit(d)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(d._id)} className="rounded-lg p-2 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Dokumen</th>
                    <th className="px-6 py-4 font-semibold">Karyawan</th>
                    <th className="px-6 py-4 font-semibold">Nomor</th>
                    <th className="px-6 py-4 font-semibold">Terbit</th>
                    <th className="px-6 py-4 font-semibold">Expired</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {documents.map((d) => {
                    const CatIcon = getCategoryIcon(d.category);
                    const StatusIcon = statusIcons[d.status] || FileText;
                    const daysLeft = getDaysLeft(d.expiryDate);
                    return (
                      <tr key={d._id} onClick={() => setDetailItem(d)} className="cursor-pointer hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${categoryColors[d.category] || 'bg-slate-100 text-slate-700'}`}>
                              <CatIcon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{d.name}</p>
                              <p className="text-xs text-slate-500">{d.category} • {d.type} • {formatBytes(d.size)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${d.avatarBg || 'bg-slate-200'}`}>
                              {d.avatar || '?'}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{d.employeeName}</p>
                              <p className="text-xs text-slate-500">{d.dept}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-600">{d.documentNumber || '-'}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{formatDate(d.issueDate)}</td>
                        <td className="px-6 py-4 text-sm">
                          <div>
                            <p className={daysLeft !== null && daysLeft <= 30 ? 'text-red-600 font-semibold' : 'text-slate-600'}>
                              {formatDate(d.expiryDate)}
                            </p>
                            {daysLeft !== null && daysLeft > 0 && daysLeft <= 30 && (
                              <p className="text-[11px] text-amber-600">{daysLeft} hari lagi</p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle[d.status]}`}>
                            <StatusIcon className="h-3 w-3" /> {d.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEdit(d)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Pencil className="h-4 w-4" /></button>
                            <button onClick={() => handleDelete(d._id)} className="rounded-lg p-2 text-red-400 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Dokumen' : 'Upload Dokumen Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 hover:bg-slate-100"><X className="h-5 w-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Karyawan</label>
                <select required value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900">
                  <option value="">— Pilih Karyawan —</option>
                  {employees.map((emp) => <option key={emp._id} value={emp._id}>{emp.name} ({emp.dept || emp.department})</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nama Dokumen</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="misal: Kontrak Kerja 2026"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tipe</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                    <option>PDF</option><option>JPG</option><option>PNG</option>
                    <option>DOCX</option><option>XLSX</option><option>Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nomor Dokumen</label>
                  <input value={form.documentNumber} onChange={(e) => setForm({ ...form, documentNumber: e.target.value })}
                    placeholder="DOC-2026-001"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Penerbit</label>
                  <input value={form.issuer} onChange={(e) => setForm({ ...form, issuer: e.target.value })}
                    placeholder="BNSP / PT / dll"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Terbit</label>
                  <input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Expired</label>
                  <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Catatan (opsional)</label>
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows="2" placeholder="Catatan tambahan..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-sm text-blue-700">
                💡 <strong>Info:</strong> Pada versi demo, file fisik tidak di-upload. Metadata dokumen akan tersimpan di database. Untuk produksi, Anda bisa integrasikan dengan S3/Cloudinary.
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detail */}
      <DetailModal isOpen={!!detailItem} onClose={() => setDetailItem(null)}
        title="Detail Dokumen" subtitle={detailItem?.name}
        icon={FileText} iconBg="bg-blue-50" iconColor="text-blue-600">
        {detailItem && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {(() => {
                const CatIcon = getCategoryIcon(detailItem.category);
                return (
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${categoryColors[detailItem.category] || 'bg-slate-100 text-slate-700'}`}>
                    <CatIcon className="h-7 w-7" />
                  </div>
                );
              })()}
              <div className="flex-1">
                <p className="text-lg font-bold text-slate-900">{detailItem.name}</p>
                <p className="text-xs text-slate-500">{detailItem.category} • {detailItem.type} • {formatBytes(detailItem.size)}</p>
              </div>
              {(() => {
                const StatusIcon = statusIcons[detailItem.status] || FileText;
                return (
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyle[detailItem.status]}`}>
                    <StatusIcon className="h-3 w-3" /> {detailItem.status}
                  </span>
                );
              })()}
            </div>

            {/* Karyawan Info */}
            <div className="rounded-xl bg-slate-50 p-4 flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${detailItem.avatarBg || 'bg-slate-200 text-slate-700'}`}>
                {detailItem.avatar || '?'}
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900">{detailItem.employeeName}</p>
                <p className="text-xs text-slate-500">{detailItem.nik} • {detailItem.dept}</p>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500 flex items-center gap-1"><Hash className="h-3 w-3" /> Nomor Dokumen</p>
                <p className="mt-1 font-mono text-sm font-semibold text-slate-900">{detailItem.documentNumber || '-'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500 flex items-center gap-1"><Building2 className="h-3 w-3" /> Penerbit</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{detailItem.issuer || '-'}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500 flex items-center gap-1"><Calendar className="h-3 w-3" /> Tanggal Terbit</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatDate(detailItem.issueDate)}</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3">
                <p className="text-xs text-slate-500 flex items-center gap-1"><Clock className="h-3 w-3" /> Expired</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{formatDate(detailItem.expiryDate)}</p>
                {(() => {
                  const d = getDaysLeft(detailItem.expiryDate);
                  if (d === null) return null;
                  if (d < 0) return <p className="text-[11px] text-red-600 font-semibold mt-0.5">⚠️ Expired {-d} hari lalu</p>;
                  if (d <= 30) return <p className="text-[11px] text-amber-600 font-semibold mt-0.5">⚠️ {d} hari lagi</p>;
                  return <p className="text-[11px] text-emerald-600 mt-0.5">✓ Masih {d} hari</p>;
                })()}
              </div>
            </div>

            {detailItem.notes && (
              <div className="rounded-xl border border-slate-200 p-3 text-sm">
                <p className="text-xs text-slate-500 mb-1">Catatan</p>
                <p className="text-slate-700">{detailItem.notes}</p>
              </div>
            )}

            <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500 flex items-center justify-between">
              <span>Diupload oleh: <strong className="text-slate-700">{detailItem.uploadedBy || '-'}</strong></span>
              <span>{formatDate(detailItem.createdAt)}</span>
            </div>

            <div className="flex gap-2">
              <button onClick={() => openEdit(detailItem)} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
                <Pencil className="h-4 w-4" /> Edit Dokumen
              </button>
              <button onClick={() => { setDetailItem(null); handleDelete(detailItem._id); }}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </DetailModal>
    </DashboardLayout>
  );
}