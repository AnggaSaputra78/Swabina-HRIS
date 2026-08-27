import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import api from '../services/api'; // Sesuaikan path api.js Anda
import {
  Briefcase, Users, UserCheck, Hourglass, Search, Plus, X,
  MapPin, Banknote, CalendarDays, Trash2, Building2, Phone, Mail,
} from 'lucide-react';

const STATUS_COLORS = {
  Baru: 'bg-blue-100 text-blue-700',
  Screening: 'bg-yellow-100 text-yellow-700',
  Interview: 'bg-purple-100 text-purple-700',
  Offering: 'bg-cyan-100 text-cyan-700',
  Diterima: 'bg-green-100 text-green-700',
  Ditolak: 'bg-red-100 text-red-700',
};

const STATUS_LIST = Object.keys(STATUS_COLORS);

const initialJobForm = {
  title: '', department: '', location: '', type: 'Full Time',
  salary: '', deadline: '', description: '',
};

const initialCandidateForm = { name: '', email: '', phone: '', position: '' };

export default function Rekrutmen() {
  const [activeTab, setActiveTab] = useState('lowongan');
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showJobModal, setShowJobModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [jobForm, setJobForm] = useState(initialJobForm);
  const [candidateForm, setCandidateForm] = useState(initialCandidateForm);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [jobsRes, candRes] = await Promise.all([
        api.get('/recruitment/jobs'),
        api.get('/recruitment/candidates'),
      ]);
      setJobs(jobsRes.data);
      setCandidates(candRes.data);
    } catch (error) {
      console.error('Gagal memuat data rekrutmen:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ================= HANDLERS =================
  const handleAddJob = async (e) => {
    e.preventDefault();
    try {
      await api.post('/recruitment/jobs', jobForm);
      setShowJobModal(false);
      setJobForm(initialJobForm);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menambahkan lowongan');
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Hapus lowongan ini?')) return;
    await api.delete(`/recruitment/jobs/${id}`);
    fetchData();
  };

  const handleAddCandidate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/recruitment/candidates', candidateForm);
      setShowCandidateModal(false);
      setCandidateForm(initialCandidateForm);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal menambahkan kandidat');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    await api.put(`/recruitment/candidates/${id}`, { status });
    fetchData();
  };

  const handleDeleteCandidate = async (id) => {
    if (!window.confirm('Hapus kandidat ini?')) return;
    await api.delete(`/recruitment/candidates/${id}`);
    fetchData();
  };

  // ================= DERIVED DATA =================
  const filteredJobs = jobs.filter((j) =>
    (j.title + j.department).toLowerCase().includes(search.toLowerCase())
  );

  const filteredCandidates = candidates.filter((c) =>
    (c.name + c.position).toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    openJobs: jobs.filter((j) => j.status === 'Terbuka').length,
    totalCandidates: candidates.length,
    inProgress: candidates.filter((c) => ['Screening', 'Interview', 'Offering'].includes(c.status)).length,
    hired: candidates.filter((c) => c.status === 'Diterima').length,
  };

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

  const getInitials = (name) =>
    name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  // ================= RENDER =================
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Rekrutmen</h1>
          <p className="text-sm text-gray-500">Kelola lowongan pekerjaan dan kandidat pelamar PT Swabina Gatra</p>
        </div>
        <button
          onClick={() => (activeTab === 'lowongan' ? setShowJobModal(true) : setShowCandidateModal(true))}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
        >
          <Plus size={18} />
          {activeTab === 'lowongan' ? 'Tambah Lowongan' : 'Tambah Kandidat'}
        </button>
      </div>

      {/* ===== STAT CARDS ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Lowongan Aktif', value: stats.openJobs, icon: Briefcase, color: 'text-blue-600 bg-blue-100' },
          { label: 'Total Kandidat', value: stats.totalCandidates, icon: Users, color: 'text-indigo-600 bg-indigo-100' },
          { label: 'Dalam Proses', value: stats.inProgress, icon: Hourglass, color: 'text-yellow-600 bg-yellow-100' },
          { label: 'Diterima', value: stats.hired, icon: UserCheck, color: 'text-green-600 bg-green-100' },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
            <div className={`p-3 rounded-lg ${s.color}`}>
              <s.icon size={22} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ===== TABS & SEARCH ===== */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-2">
          {[
            { id: 'lowongan', label: 'Lowongan Pekerjaan' },
            { id: 'kandidat', label: 'Kandidat Pelamar' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-64"
          />
        </div>
      </div>

      {/* ===== KONTEN: LOWONGAN ===== */}
      {activeTab === 'lowongan' && (
        loading ? <p className="text-gray-500">Memuat data...</p> :
        filteredJobs.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
            Belum ada lowongan. Klik "Tambah Lowongan" untuk membuat yang baru.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredJobs.map((job) => (
              <div key={job._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition">
                <div className="flex items-start justify-between">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Briefcase size={20} /></div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${job.status === 'Terbuka' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                    {job.status}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{job.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Building2 size={14} /> {job.department}
                  </p>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p className="flex items-center gap-2"><MapPin size={14} /> {job.location || '-'}</p>
                  <p className="flex items-center gap-2"><Banknote size={14} /> {job.salary || '-'}</p>
                  <p className="flex items-center gap-2"><CalendarDays size={14} /> Deadline: {formatDate(job.deadline)}</p>
                </div>
                <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-auto">
                  <span className="text-xs text-gray-500">
                    {candidates.filter((c) => c.position === job.title).length} pelamar
                  </span>
                  <button onClick={() => handleDeleteJob(job._id)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* ===== KONTEN: KANDIDAT ===== */}
      {activeTab === 'kandidat' && (
        loading ? <p className="text-gray-500">Memuat data...</p> :
        filteredCandidates.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 text-center text-gray-500">
            Belum ada kandidat. Klik "Tambah Kandidat" untuk menambahkan pelamar.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-5 py-3">Kandidat</th>
                  <th className="px-5 py-3">Posisi</th>
                  <th className="px-5 py-3">Kontak</th>
                  <th className="px-5 py-3">Tanggal Daftar</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCandidates.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-semibold text-xs">
                          {getInitials(c.name)}
                        </div>
                        <span className="font-medium text-gray-800">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{c.position || '-'}</td>
                    <td className="px-5 py-3 text-gray-500">
                      <p className="flex items-center gap-1"><Mail size={13} /> {c.email}</p>
                      <p className="flex items-center gap-1"><Phone size={13} /> {c.phone || '-'}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(c.createdAt)}</td>
                    <td className="px-5 py-3">
                      <select
                        value={c.status}
                        onChange={(e) => handleUpdateStatus(c._id, e.target.value)}
                        className={`text-xs font-medium rounded-full px-2 py-1 border-0 cursor-pointer focus:outline-none ${STATUS_COLORS[c.status]}`}
                      >
                        {STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => handleDeleteCandidate(c._id)} className="text-red-500 hover:text-red-700">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* ===== MODAL: TAMBAH LOWONGAN ===== */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Tambah Lowongan</h2>
              <button onClick={() => setShowJobModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddJob} className="space-y-4">
              <input required placeholder="Judul Posisi (misal: Staff HRD)" value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <div className="grid grid-cols-2 gap-3">
                <input required placeholder="Departemen" value={jobForm.department}
                  onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Lokasi" value={jobForm.location}
                  onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={jobForm.type} onChange={(e) => setJobForm({ ...jobForm, type: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Full Time</option><option>Part Time</option><option>Kontrak</option><option>Magang</option>
                </select>
                <input placeholder="Range Gaji (misal: 4-6 Juta)" value={jobForm.salary}
                  onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="text-xs text-gray-500">Batas Akhir Lamaran</label>
                <input type="date" value={jobForm.deadline}
                  onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <textarea placeholder="Deskripsi pekerjaan..." rows={3} value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition">
                Simpan Lowongan
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ===== MODAL: TAMBAH KANDIDAT ===== */}
      {showCandidateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Tambah Kandidat</h2>
              <button onClick={() => setShowCandidateModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddCandidate} className="space-y-4">
              <input required placeholder="Nama Lengkap" value={candidateForm.name}
                onChange={(e) => setCandidateForm({ ...candidateForm, name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input required type="email" placeholder="Email" value={candidateForm.email}
                onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input placeholder="No. Telepon" value={candidateForm.phone}
                onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <input required list="job-options" placeholder="Posisi yang dilamar" value={candidateForm.position}
                onChange={(e) => setCandidateForm({ ...candidateForm, position: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <datalist id="job-options">
                {jobs.map((j) => <option key={j._id} value={j.title} />)}
              </datalist>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition">
                Simpan Kandidat
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
    </DashboardLayout>
  );
}