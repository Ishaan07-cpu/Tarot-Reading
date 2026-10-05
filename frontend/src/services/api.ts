import axios from 'axios';

// In production (Vercel), VITE_API_URL points to the Render backend.
// In local development, Vite proxies /api → localhost:5000 (via vite.config.ts),
// so the relative '/api' base URL works without any env variable.
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Authorization Bearer token from localStorage if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('tarot_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle responses and session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't auto-redirect if checking /api/auth/me during initial boot
      const isAuthCheck = error.config?.url?.includes('/auth/me');
      if (!isAuthCheck) {
        localStorage.removeItem('tarot_token');
        localStorage.removeItem('tarot_user');
      }
    }
    return Promise.reject(error);
  }
);
