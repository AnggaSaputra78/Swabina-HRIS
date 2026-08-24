import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // 👈 UBAH INI menjadi '/api' saja
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menyisipkan Token JWT secara otomatis
api.interceptors.request.use((config) => {
  const userInfoString = localStorage.getItem('userInfo');
  if (userInfoString) {
    try {
      const userInfo = JSON.parse(userInfoString);
      // Pastikan di dalam userInfo ada property 'token'
      if (userInfo.token) {
        config.headers.Authorization = `Bearer ${userInfo.token}`;
      }
    } catch (error) {
      console.error('Gagal parse userInfo dari localStorage', error);
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;