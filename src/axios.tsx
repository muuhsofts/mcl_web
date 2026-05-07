// src/api/axios.ts
import axios from 'axios';

/**
 * Axios instance configured for the application.
 *
 * In development, Vite proxies '/api' requests to the real backend,
 * so baseURL is set to '/api' (relative to the dev server).
 *
 * In production (when building for deployment), you can switch to the full URL
 * or keep the same pattern if your production server also proxies.
 */
const axiosInstance = axios.create({
  // ✅ Use the proxy path for development – CORS friendly
  baseURL: '/api',

  // ❌ Old direct URL – causes CORS errors in the browser
  // baseURL: 'https://cpanel.mcl.co.tz/',

  // Alternative local backend (if you need it later)
  // baseURL: 'http://127.0.0.1:8000/',

  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor – adds auth token if present
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor – handles 401 Unauthorized globally
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Unauthorized access - redirecting to login');
      localStorage.removeItem('token');
      // Use window.location for a full page redirect to sign-in
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;