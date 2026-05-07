import axios from 'axios';

// ✅ Environment‑aware base URL
// - Local (dev): '/api' → Vite proxy forwards to https://cpanel.mcl.co.tz
// - Production:  full URL → calls backend directly (requires CORS support)
const baseURL = import.meta.env.DEV
  ? '/api'
  : 'https://cpanel.mcl.co.tz/api';

const axiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: adds auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized - redirecting to login');
      localStorage.removeItem('token');
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;