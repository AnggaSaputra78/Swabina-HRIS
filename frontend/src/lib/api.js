import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token otomatis
apiClient.interceptors.request.use((config) => {
  const raw = localStorage.getItem('userInfo');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const token = parsed.token || parsed.accessToken;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {}
  }
  return config;
});

// Handle 401 → redirect login
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userInfo');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // ===== DASHBOARD =====
  getStats: async () => (await apiClient.get('/dashboard/stats')).data,
  getActivities: async () => (await apiClient.get('/dashboard/activities')).data,
  getAnnouncements: async () => (await apiClient.get('/dashboard/announcements')).data,
  getLeaves: async () => (await apiClient.get('/dashboard/leaves')).data,
  getEmployees: async (params) => (await apiClient.get('/employees', { params })).data,
  approveLeave: async (id) => (await apiClient.put(`/leaves/${id}`, { status: 'Disetujui' })).data,

  // ===== CUTI (untuk CutiPage.jsx) =====
  getLeaveList: async (params) => (await apiClient.get('/leaves', { params })).data,
  getLeaveStats: async () => (await apiClient.get('/leaves/stats')).data,
  createLeave: async (data) => (await apiClient.post('/leaves', data)).data,
  approveLeaveRequest: async (id) => (await apiClient.put(`/leaves/${id}`, { status: 'Disetujui' })).data,
  rejectLeaveRequest: async (id) => (await apiClient.put(`/leaves/${id}`, { status: 'Ditolak' })).data,
  deleteLeave: async (id) => (await apiClient.delete(`/leaves/${id}`)).data,

  // ===== KARYAWAN =====
  createEmployee: async (data) => (await apiClient.post('/employees', data)).data,
  updateEmployee: async (id, data) => (await apiClient.put(`/employees/${id}`, data)).data,
  deleteEmployee: async (id) => (await apiClient.delete(`/employees/${id}`)).data,

  // ===== ABSENSI =====
  getAttendance: async (params) => (await apiClient.get('/attendance', { params })).data,
  getAttendanceStats: async (params) => (await apiClient.get('/attendance/stats', { params })).data,
  createAttendance: async (data) => (await apiClient.post('/attendance', data)).data,

  // ===== PENGAJIAN =====
  getPayroll: async (params) => (await apiClient.get('/payroll', { params })).data,
  getPayrollStats: async () => (await apiClient.get('/payroll/stats')).data,
  createPayroll: async (data) => (await apiClient.post('/payroll', data)).data,
  updatePayroll: async (id, data) => (await apiClient.put(`/payroll/${id}`, data)).data,
  deletePayroll: async (id) => (await apiClient.delete(`/payroll/${id}`)).data,

  // ===== REKRUTMEN =====
  getJobs: async () => (await apiClient.get('/recruitment/jobs')).data,
  createJob: async (data) => (await apiClient.post('/recruitment/jobs', data)).data,
  deleteJob: async (id) => (await apiClient.delete(`/recruitment/jobs/${id}`)).data,
  getCandidates: async () => (await apiClient.get('/recruitment/candidates')).data,
  createCandidate: async (data) => (await apiClient.post('/recruitment/candidates', data)).data,
  updateCandidate: async (id, data) => (await apiClient.put(`/recruitment/candidates/${id}`, data)).data,
  deleteCandidate: async (id) => (await apiClient.delete(`/recruitment/candidates/${id}`)).data,

  // ===== DEPARTEMEN =====
  getDepartments: async () => (await apiClient.get('/departments')).data,
  getDepartmentStats: async () => (await apiClient.get('/departments/stats')).data,
  getDepartmentEmployees: async (id) => (await apiClient.get(`/departments/${id}/employees`)).data,
  createDepartment: async (data) => (await apiClient.post('/departments', data)).data,
  updateDepartment: async (id, data) => (await apiClient.put(`/departments/${id}`, data)).data,
  deleteDepartment: async (id) => (await apiClient.delete(`/departments/${id}`)).data,

  // ===== KINERJA =====
  getPerformanceList: async (params) => (await apiClient.get('/performance', { params })).data,
  getPerformanceStats: async () => (await apiClient.get('/performance/stats')).data,
  createPerformance: async (data) => (await apiClient.post('/performance', data)).data,
  updatePerformance: async (id, data) => (await apiClient.put(`/performance/${id}`, data)).data,
  deletePerformance: async (id) => (await apiClient.delete(`/performance/${id}`)).data,

  // ===== DOKUMEN =====
  getDocuments: async (params) => (await apiClient.get('/documents', { params })).data,
  getDocumentStats: async () => (await apiClient.get('/documents/stats')).data,
  createDocument: async (data) => (await apiClient.post('/documents', data)).data,
  updateDocument: async (id, data) => (await apiClient.put(`/documents/${id}`, data)).data,
  deleteDocument: async (id) => (await apiClient.delete(`/documents/${id}`)).data,
  };
export default apiClient;