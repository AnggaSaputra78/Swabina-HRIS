import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DetailModal from '../components/ui/DetailModal';
import { api } from '../lib/api';
import {
  Plus, Mail, Building2, X, Save, Trash2, Pencil,
  Loader2, Phone, WalletCards, User, AlertTriangle
} from 'lucide-react';

const emptyForm = { name: '', role: '', dept: 'IT', status: 'Aktif', email: '', phone: '', salary: '' };
const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n || 0);

export default function KaryawanPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filterDept, setFilterDept] = useState('Semua');
  const [filterStatus, setFilterStatus] = useState('Semua');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [reviewEmployee, setReviewEmployee] = useState(null);

  const fetchEmployees = async () => {
    setLoading(true); setError(null);
    try {
      const data = await api.getEmployees({ dept: filterDept, status: filterStatus });
      // 🔍 LOG DIAGNOSTIK — lihat ini di Console browser
      console.log('🟢 DATA DARI MONGODB:', data.length, 'karyawan', data);
      setEmployees(data);
    } catch (err) {
      console.error('🔴 GAGAL FETCH:', err);
      setError('Gagal memuat data. Pastikan backend jalan di http://localhost:5000');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    const delay = setTimeout(fetchEmployees, 300);
    return () => clearTimeout(delay);
  }, [filterDept, filterStatus]);

  const openAddModal = () => { setEditingEmployee(null); setFormData(emptyForm); setIsModalOpen(true); };
  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({ name: emp.name, role: emp.role, dept: emp.dept, status: emp.status, email: emp.email, phone: emp.phone || '', salary: emp.salary || '' });
    setIsModalOpen(true);
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...formData, salary: Number(formData.salary) || 0 };
      if (editingEmployee) await api.updateEmployee(editingEmployee._id, payload);
      else await api.createEmployee(payload);
      setIsModalOpen(false); setFormData(emptyForm); setEditingEmployee(null); fetchEmployees();
    } catch (err) { alert('Gagal menyimpan: ' + err.message); }
    finally { setSaving(false); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm('Yakin menghapus karyawan ini dari database?')) return;
    try { await api.deleteEmployee(id); fetchEmployees(); }
    catch (err) { alert('Gagal menghapus: ' + err.message); }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Manajemen Karyawan</h1>
            <p className="text-sm text-slate-500 mt-1">Data tersinkron realtime dengan MongoDB (sama seperti Dashboard).</p>
          </div>
          <button onClick={openAddModal} className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
            <Plus className="h-4 w-4" /> Tambah Karyawan
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle className="h-5 w-5 shrink-0" /><span>{error}</span>
            <button onClick={fetchEmployees} className="ml-auto rounded-lg bg-red-600 px-3 py-1.5 font-semibold text-white hover:bg-red-700">Coba Lagi</button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
            <option value="Semua">Semua Departemen</option>
            <option value="IT">IT</option><option value="Human Resource">Human Resource</option><option value="Marketing">Marketing</option><option value="Finance">Finance</option><option value="Operasional">Operasional</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm">
            <option value="Semua">Semua Status</option>
            <option value="Aktif">Aktif</option><option value="Cuti">Cuti</option><option value="Non-Aktif">Non-Aktif</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" /><p className="mt-2 text-sm">Memuat data dari MongoDB...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Karyawan</th>
                    <th className="px-6 py-4 font-semibold">NIK</th>
                    <th className="px-6 py-4 font-semibold">Jabatan</th>
                    <th className="px-6 py-4 font-semibold">Departemen</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {employees.length > 0 ? employees.map((emp) => (
                    <tr key={emp._id} onClick={() => setReviewEmployee(emp)} className="cursor-pointer hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-200 font-bold text-slate-700 text-xs">{emp.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}</div>
                          <div>
                            <p className="font-semibold text-slate-900">{emp.name}</p>
                            <p className="flex items-center gap-1 text-xs text-slate-500"><Mail className="h-3 w-3" /> {emp.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-slate-600">{emp.nik}</td>
                      <td className="px-6 py-4 text-slate-700">{emp.role}</td>
                      <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"><Building2 className="h-3 w-3" /> {emp.dept}</span></td>
                      <td className="px-6 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${emp.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : emp.status === 'Cuti' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{emp.status}</span></td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button onClick={() => openEditModal(emp)} className="rounded-lg p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600" title="Edit"><Pencil className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(emp._id)} className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600" title="Hapus"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="6" className="px-6 py-8 text-center text-slate-500">Tidak ada data karyawan yang sesuai.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
            <p className="text-xs text-slate-500">Menampilkan {employees.length} karyawan dari database</p>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">{editingEmployee ? 'Edit Karyawan' : 'Tambah Karyawan Baru'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="rounded-lg p-1 hover:bg-slate-100"><X className="h-5 w-5 text-slate-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input required placeholder="Nama Lengkap" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <input required type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <input placeholder="No. Telepon" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Jabatan" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                <input type="number" placeholder="Gaji (Rp)" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select value={formData.dept} onChange={(e) => setFormData({ ...formData, dept: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option>IT</option><option>Human Resource</option><option>Marketing</option><option>Finance</option><option>Operasional</option>
                </select>
                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                  <option>Aktif</option><option>Cuti</option><option>Non-Aktif</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Batal</button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{editingEmployee ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DetailModal isOpen={!!reviewEmployee} onClose={() => setReviewEmployee(null)} title="Profil Karyawan" subtitle={reviewEmployee?.role} icon={User} iconBg="bg-sky-50" iconColor="text-sky-600">
        {reviewEmployee && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-lg font-bold text-slate-700">{reviewEmployee.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}</div>
              <div><p className="text-lg font-bold text-slate-900">{reviewEmployee.name}</p><p className="font-mono text-xs text-slate-500">{reviewEmployee.nik}</p></div>
              <span className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ${reviewEmployee.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : reviewEmployee.status === 'Cuti' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}`}>{reviewEmployee.status}</span>
            </div>
            <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
              <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-slate-400" /><span className="text-slate-500">Departemen</span><span className="ml-auto font-semibold">{reviewEmployee.dept}</span></div>
              <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /><span className="text-slate-500">Email</span><span className="ml-auto font-semibold">{reviewEmployee.email}</span></div>
              <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /><span className="text-slate-500">Telepon</span><span className="ml-auto font-semibold">{reviewEmployee.phone || '-'}</span></div>
              <div className="flex items-center gap-2"><WalletCards className="h-4 w-4 text-slate-400" /><span className="text-slate-500">Gaji</span><span className="ml-auto font-semibold">{formatRupiah(reviewEmployee.salary)}</span></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setReviewEmployee(null); openEditModal(reviewEmployee); }} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"><Pencil className="h-4 w-4" /> Edit</button>
              <button onClick={() => { setReviewEmployee(null); handleDelete(reviewEmployee._id); }} className="flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /> Hapus</button>
            </div>
          </div>
        )}
      </DetailModal>
    </DashboardLayout>
  );
}