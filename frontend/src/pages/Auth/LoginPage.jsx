import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// ✅ DIPERBAIKI: Naik 2 tingkat (../../) karena file ini ada di dalam folder 'auth'
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';

import { Shield, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa email dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-canvas">
      {/* Left Panel - Login Form */}
      <section className="relative flex flex-col justify-between p-10 lg:p-16 bg-white">
        {/* Logo & Brand */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy">
              <span className="text-white font-extrabold text-xl">SG</span>
            </div>
            <div>
              <h1 className="font-extrabold tracking-tight text-slate-900">PT Swabina Gatra</h1>
              <p className="text-slate-500 mt-0.5">HRIS Portal</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="max-w-xl py-12">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 bg-emerald-50 text-emerald-700">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-semibold">Secure Login</span>
          </div>

          <h2 className="font-extrabold tracking-tight leading-tight text-3xl text-slate-900">
            Selamat Datang Kembali
          </h2>
          <p className="text-slate-600 mt-5 max-w-lg leading-7">
            Masuk ke sistem HRIS untuk mengelola data karyawan, absensi, penggajian, dan kebutuhan HR lainnya.
          </p>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@swabina.id"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:bg-white focus:border-navy focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:bg-white focus:border-navy focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-navy px-6 py-3.5 font-bold text-white shadow-soft hover:bg-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-pulse">Memproses...</span>
              ) : (
                <>
                  <span>Masuk ke Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-7 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <Lock className="mt-0.5 h-5 w-5 text-blue-700" />
            <p className="text-sm text-slate-600 leading-6">
              Sistem ini hanya untuk karyawan PT Swabina Gatra yang berwenang. 
              Semua aktivitas dicatat untuk tujuan audit.
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-sm text-slate-400">
          © 2026 PT Swabina Gatra. All rights reserved.
        </p>
      </section>

      {/* Right Panel - Illustration */}
      <section className="relative hidden overflow-hidden lg:block bg-navy">
        <div className="absolute inset-0 bg-gradient-to-t from-[#082d4e]/95 via-[#0f4c81]/35 to-transparent"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-14">
            <div className="mb-5 flex justify-center gap-2">
              <span className="h-1.5 w-14 rounded-full bg-orange-400"></span>
              <span className="h-1.5 w-6 rounded-full bg-white/50"></span>
            </div>
            <h2 className="text-4xl font-bold leading-tight max-w-xl mx-auto">
              Sistem HRIS Terintegrasi
            </h2>
            <p className="text-white/80 mt-4 max-w-xl mx-auto leading-7 text-lg">
              Kelola sumber daya manusia dengan lebih efisien, modern, dan terstruktur 
              dalam satu platform.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}