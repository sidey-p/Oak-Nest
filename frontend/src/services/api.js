import axios from 'axios';

// Same-origin '/api' works locally (Vite proxy) and on Vercel
// (serverless functions under /api). Override with VITE_API_URL
// to point the frontend at a separately hosted backend.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && !err.config.url.includes('/auth/')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    const message = err.response?.data?.message
      || (err.code === 'ERR_NETWORK'
        ? "We're having trouble connecting. Check your connection and try again."
        : "Something didn't go as planned. Please try again.");
    return Promise.reject(new Error(message));
  },
);

export const errorMessage = (err) => err?.message || 'Unexpected error';

export default api;
