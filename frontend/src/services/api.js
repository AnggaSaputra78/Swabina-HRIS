import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Helper universal untuk ambil token
function getToken() {
  const keys = ['userInfo', 'user', 'token', 'auth', 'hris_user'];
  
  for (const key of keys) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    
    try {
      const parsed = JSON.parse(raw);
      const token = parsed.token || parsed.accessToken || parsed.jwt || parsed.access_token;
      if (token) {
        console.log(`🔑 Token ditemukan di key: ${key}`);
        return token;
      }
    } catch {
      // Jika bukan JSON, cek apakah ini token JWT
      if (raw && raw.startsWith('eyJ') && raw.split('.').length === 3) {
        console.log(`🔑 Token ditemukan langsung di key: ${key}`);
        return raw;
      }
    }
  }
  
  console.warn('⚠️ Tidak ada token ditemukan di localStorage');
  return null;
}

// Interceptor Request
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`✅ [${config.method.toUpperCase()}] ${config.url} - Token terkirim`);
    } else {
      console.warn(`⚠️ [${config.method.toUpperCase()}] ${config.url} - Tanpa token`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor Response
api.interceptors.response.use(
  (response) => {
    console.log(`✅ [${response.status}] ${response.config.url} - Success`);
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data, config } = error.response;
      console.error(`❌ [${status}] ${config?.url} -`, data?.message || error.message);
      
      if (status === 401) {
        console.log('🔒 401 Unauthorized - Menghapus token dan redirect ke login');
        ['userInfo', 'user', 'token', 'auth', 'hris_user'].forEach(k => localStorage.removeItem(k));
        
        if (!window.location.pathname.includes('/login')) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      }
    } else {
      console.error('❌ Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;