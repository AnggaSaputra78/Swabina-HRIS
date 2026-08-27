import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import LoginPage from './pages/Auth/LoginPage';
import DashboardPage from './pages/DashboardPage';
import KaryawanPage from './pages/KaryawanPage';
import AbsenPage from './pages/AbsenPage';
import CutiPage from './pages/CutiPage';
import Rekrutmen from './pages/Rekrutmen';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<DashboardPage />} />
          <Route path="/karyawan" element={<KaryawanPage />} />
          <Route path="/absensi" element={<AbsenPage />} />
          <Route path="/cuti" element={<CutiPage />} />   {/* ← TAMBAH (path sesuai sidebar) */}
          <Route path="/rekrutmen" element={<Rekrutmen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;