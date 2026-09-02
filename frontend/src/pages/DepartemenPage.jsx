import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DetailModal from '../components/ui/DetailModal';
import { api } from '../lib/api';
import {
  Building2, Users, TrendingUp, Crown, Plus, Pencil, Trash2, X, Save,
  Loader2, AlertTriangle, MapPin, User, ArrowUpRight, Mail, Phone,
} from 'lucide-react';

const colorOptions = [
  'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700',
  'bg-emerald-100 text-emerald-700', 'bg-orange-100 text-orange-700',
  'bg-sky-100 text-sky-700', 'bg-rose-100 text-rose-700',
  'bg-amber-100 text-amber-700',
];

const initialForm = { name: '', code: '', manager: '', location: '', description: '', color: colorOptions[0] };

export default function DepartemenPage() {
  const [departments, setDepartments] = useState([]);
  const [stats, setStats] = useState({ totalDepartments: 0, totalEmployees: 0, avg: 0, largest: '-' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const [detailDept, setDetailDept] = useState(null);
  const [detailEmployees, setDetailEmployees] = useState([]);

  const fetchData = async () => {
    setLoading(true); setError(null);
    try {
      const [deptData, statsData] = await Promise.all([
        api.getDepartments(),
        api.getDepartmentStats(),
      ]);
      setDepartments(deptData);
      setStats(statsData);
    } catch (err) {
      setError('Gagal memuat data departemen. Pastikan backend berjalan di http://localhost:5000');
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditingId(null); setForm(initialForm); setIsModalOpen(true); };

  const openEdit = (d) => {
    setEditingId(d._id);
    setForm({
      name: d.name || '', code: d.code || '', manager: d.manager || '',
      location: d.location || '', description: d.description || '',
      color: d.color || colorOptions[0],
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) await api.updateDepartment(editingId, form);
      else await api.createDepartment(form);
      setIsModalOpen(false);
      fetchData();
    } catch (err) { alert('Gagal menyimpan: ' + err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus departemen ini?')) return;
    try { await api.deleteDepartment(id); fetchData(); }
    catch (err) { alert('Gagal menghapus: ' + err.message); }
  };

  const openDetail = async (d) => {
    setDetailDept(d);
    try { setDetailEmployees(await api.getDepartmentEmployees(d._id)); }
    catch { setDetailEmployees([]); }
  };

  const filtered = departments;

  const statCards = [
    { icon: Building2, label: 'Total Departemen', value: stats.totalDepartments, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
    { icon: Users, label: 'Total Karyawan', value: stats.totalEmployees, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { icon: TrendingUp, label: 'Rata-rata / Departemen', value: stats.avg, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
    { icon: Crown, label: 'Terbesar', value: stats.largest, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Departemen</h1>
            <p className="text-sm text-slate-500 mt-1">Kelola struktur organisasi PT Swabina Gatra.</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
            <Plus className="h-4 w-4" /> Tambah Departemen
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
                  <span className="text-xl font-extrabold text-slate-900 truncate ml-2">{s.value}</span>
                </div>
                <p className="mt-3 text-sm text-slate-500">{s.label}</p>
              </article>
            );
          })}
        </div>

        {/* Grid Departemen */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" /><p className="mt-2 text-sm">Memuat data departemen...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((d) => (
              <article key={d._id} className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <span className={`rounded-xl p-2.5 ${d.color || 'bg-blue-100 text-blue-700'}`}><Building2 className="h-5 w-5" /></span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{d.code || '-'}</span>
                </div>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{d.name}</h3>
                <p className="mt-1 text-sm text-slate-500 line-clamp-2">{d.description || 'Tidak ada deskripsi.'}</p>

                <div className="mt-4 space-y-1.5 text-sm text-slate-600">
                  <p className="flex items-center gap-2"><User className="h-4 w-4 text-slate-400" /> {d.manager || 'Belum ada kepala'}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> {d.location || '-'}</p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <button onClick={() => openDetail(d)} className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800">
                    <Users className="h-4 w-4" /> {d.employeeCount} Karyawan <ArrowUpRight className="h-3 w-3" />
                  </button>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(d)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Edit"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(d._id)} className="rounded-lg p-2 text-red-400 hover:bg-red-50" title="Hapus"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </article>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
                Tidak ada departemen yang cocok.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Departemen' : 'Tambah Departemen'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 hover:bg-slate-100"><X className="h-5 w-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Departemen</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="misal: HRD" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kode</label>
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="HR-01" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Lokasi</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Lantai 2" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kepala Departemen</label>
                <input value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })}
                  placeholder="Nama kepala departemen" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows="2" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Warna Kartu</label>
                <div className="flex gap-2 flex-wrap">
                  {colorOptions.map((c) => (
                    <button key={c} type="button" onClick={() => setForm({ ...form, color: c })}
                      className={`h-8 w-8 rounded-lg ${c.split(' ')[0]} border-2 ${form.color === c ? 'border-slate-900' : 'border-transparent'}`} />
                  ))}
                </div>
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

      {/* Modal Detail Karyawan */}
      <DetailModal
        isOpen={!!detailDept}
        onClose={() => setDetailDept(null)}
        title="Karyawan Departemen"
        subtitle={detailDept?.name}
        icon={Building2} iconBg="bg-blue-50" iconColor="text-blue-600"
      >
        {detailDept && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-xs text-slate-500">Kepala</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{detailDept.manager || '-'}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 text-center">
                <p className="text-xs text-slate-500">Jumlah Karyawan</p>
                <p className="mt-1 text-sm font-bold text-slate-900">{detailDept.employeeCount}</p>
              </div>
            </div>
            {detailEmployees.length > 0 ? (
              <div className="space-y-2">
                {detailEmployees.map((emp) => (
                  <div key={emp._id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                      {(emp.name || '?').split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{emp.name}</p>
                      <p className="truncate text-xs text-slate-500">{emp.role || emp.position || 'Staff'} • {emp.email}</p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${emp.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {emp.status || 'Aktif'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-slate-400">Belum ada karyawan di departemen ini.</p>
            )}
          </div>
        )}
      </DetailModal>
    </DashboardLayout>
  );
}