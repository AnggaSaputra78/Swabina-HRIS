const API_URL = 'http://localhost:5000/api';

async function request(url, options = {}) {
  const res = await fetch(`${API_URL}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error((await res.json()).message || 'Terjadi kesalahan');
  return res.json();
}

export const api = {
  getEmployees: (params = {}) => request(`/employees?${new URLSearchParams(params).toString()}`),
  getEmployee: (id) => request(`/employees/${id}`),
  createEmployee: (data) => request('/employees', { method: 'POST', body: JSON.stringify(data) }),
  deleteEmployee: (id) => request(`/employees/${id}`, { method: 'DELETE' }),
  getStats: () => request('/dashboard/stats'),
  getActivities: () => request('/dashboard/activities'),
  getAnnouncements: () => request('/dashboard/announcements'),
  getLeaves: () => request('/dashboard/leaves'),
  approveLeave: (id) => request(`/dashboard/leaves/${id}/approve`, { method: 'PUT' }),
  search: (q) => request(`/dashboard/search?q=${encodeURIComponent(q)}`),
  getAttendance: (params = {}) => request(`/attendance?${new URLSearchParams(params).toString()}`),
  getAttendanceStats: (params = {}) => request(`/attendance/stats?${new URLSearchParams(params).toString()}`),
  createAttendance: (data) => request('/attendance', { method: 'POST', body: JSON.stringify(data) }),
  updateAttendance: (id, data) => request(`/attendance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAttendance: (id) => request(`/attendance/${id}`, { method: 'DELETE' }),
  getLeaveList: (params = {}) => request(`/leaves?${new URLSearchParams(params).toString()}`),
  getLeaveStats: () => request('/leaves/stats'),
  createLeave: (data) => request('/leaves', { method: 'POST', body: JSON.stringify(data) }),
  updateLeave: (id, data) => request(`/leaves/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  approveLeaveRequest: (id) => request(`/leaves/${id}/approve`, { method: 'PUT' }),
  rejectLeaveRequest: (id) => request(`/leaves/${id}/reject`, { method: 'PUT' }),
  deleteLeave: (id) => request(`/leaves/${id}`, { method: 'DELETE' }),
};