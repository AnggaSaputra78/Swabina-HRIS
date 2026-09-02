import { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../services/api';
import { Wallet, CheckCircle, Clock, Banknote, Plus, Trash2, X, Search } from 'lucide-react';

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(n || 0);

const initialForm = {
  employeeId: '',
  employeeName: '',
  position: '',
  department: '',
  month: '',
  basicSalary: 0,
  allowances: 0,
  deductions: 0,
};

export default function PenggajianPage() {
  const [payroll, setPayroll] = useState([]);
  const [employees, setEmployees] = useState([]); // 👈 BARU: daftar karyawan dari MongoDB
  const [stats, setStats] = useState({ total: 0, paid: 0, unpaid: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('Semua');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status !== 'Semua') params.append('status', status);

      const [listRes, statsRes, empRes] = await Promise.all([
        api.get(`/payroll?${params.toString()}`),
        api.get('/payroll/stats'),
        api.get('/employees'), // 👈 BARU: ambil data karyawan dari MongoDB
      ]);
      setPayroll(listRes.data);
      setStats(statsRes.data);
      setEmployees(empRes.data);
    } catch (error) {
      console.error('❌ Gagal fetch penggajian:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, status]);

  // 👇 BARU: saat karyawan dipilih, jabatan & departemen terisi otomatis
  const handleSelectEmployee = (e) => {
    const id = e.target.value;
    const emp = employees.find((x) => x._id === id);
    if (emp) {
      setForm({
        ...form,
        employeeId: emp._id,
        employeeName: emp.name,
        position: emp.position || '',
        department: emp.department || '',
      });
    } else {
      setForm({ ...form, employeeId: '', employeeName: '', position: '', department: '' });
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payroll', form);
      setShowModal(false);
      setForm(initialForm);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menambahkan data penggajian');
    }
  };

  const markPaid = async (id) => {
    try {
      await api.put(`/payroll/${id}`, { status: 'Dibayar' });
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus data penggajian ini?')) return;
    try {
      await api.delete(`/payroll/${id}`);
      fetchData();
    } catch (error) {
      console.error(error);
    }
  };

  const previewTotal =
    (Number(form.basicSalary) || 0) +
    (Number(form.allowances) || 0) -
    (Number(form.deductions) || 0);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* ===== HEADER ===== */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Manajemen Penggajian</h1>
            <p className="text-sm text-gray-500">Kelola gaji karyawan PT Swabina Gatra</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
          >
            <Plus size={18} /> Tambah Gaji
          </button>
        </div>

        {/* ===== STAT CARDS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Data Gaji', value: stats.total, icon: Wallet, color: 'text-blue-600 bg-blue-100' },
            { label: 'Sudah Dibayar', value: stats.paid, icon: CheckCircle, color: 'text-green-600 bg-green-100' },
            { label: 'Belum Dibayar', value: stats.unpaid, icon: Clock, color: 'text-yellow-600 bg-yellow-100' },
            { label: 'Total Penggajian', value: formatRupiah(stats.totalAmount), icon: Banknote, color: 'text-purple-600 bg-purple-100' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
              <div className={`p-3 rounded-lg ${s.color}`}>
                <s.icon size={22} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ===== FILTER ===== */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama karyawan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Semua</option>
            <option>Dibayar</option>
            <option>Belum Dibayar</option>
          </select>
        </div>

        {/* ===== TABEL ===== */}
        {loading ? (
          <p className="text-gray-500">Memuat data...</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-5 py-3">Karyawan</th>
                  <th className="px-5 py-3">Periode</th>
                  <th className="px-5 py-3">Gaji Pokok</th>
                  <th className="px-5 py-3">Tunjangan</th>
                  <th className="px-5 py-3">Potongan</th>
                  <th className="px-5 py-3">Total</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payroll.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{p.employeeName}</p>
                      <p className="text-xs text-gray-500">{p.position} • {p.department}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{p.month || '-'}</td>
                    <td className="px-5 py-3">{formatRupiah(p.basicSalary)}</td>
                    <td className="px-5 py-3 text-green-600">+{formatRupiah(p.allowances)}</td>
                    <td className="px-5 py-3 text-red-600">-{formatRupiah(p.deductions)}</td>
                    <td className="px-5 py-3 font-semibold">{formatRupiah(p.total)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        p.status === 'Dibayar' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right space-x-2">
                      {p.status !== 'Dibayar' && (
                        <button
                          onClick={() => markPaid(p._id)}
                          className="text-green-600 hover:text-green-800 text-xs font-medium"
                        >
                          Tandai Dibayar
                        </button>
                      )}
                      <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {payroll.length === 0 && (
                  <tr>
                    <td colSpan="8" className="px-5 py-8 text-center text-gray-500">
                      Belum ada data penggajian. Klik "Tambah Gaji" untuk menambahkan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ===== MODAL TAMBAH GAJI ===== */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Tambah Data Gaji</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleAdd} className="space-y-4">
                {/* 👇 BARU: Dropdown karyawan dari MongoDB */}
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Nama Karyawan (dari database)</label>
                  <select
                    required
                    value={form.employeeId}
                    onChange={handleSelectEmployee}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="">-- Pilih Karyawan --</option>
                    {employees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                  {employees.length === 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      Belum ada data karyawan. Tambahkan dulu di menu Karyawan.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input
                    placeholder="Jabatan (otomatis)"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50"
                  />
                  <input
                    placeholder="Departemen (otomatis)"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-gray-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">Periode Gaji</label>
                  <input
                    required
                    type="month"
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    required
                    type="number"
                    placeholder="Gaji Pokok"
                    value={form.basicSalary}
                    onChange={(e) => setForm({ ...form, basicSalary: e.target.value })}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Tunjangan"
                    value={form.allowances}
                    onChange={(e) => setForm({ ...form, allowances: e.target.value })}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Potongan"
                    value={form.deductions}
                    onChange={(e) => setForm({ ...form, deductions: e.target.value })}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="bg-blue-50 rounded-lg p-3 text-sm flex justify-between">
                  <span className="text-gray-600">Total Gaji (otomatis):</span>
                  <span className="font-bold text-blue-700">{formatRupiah(previewTotal)}</span>
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
                >
                  Simpan Data Gaji
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}