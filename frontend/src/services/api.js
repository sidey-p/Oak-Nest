import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
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
      || (err.code === 'ERR_NETWORK' ? 'Cannot reach the server. Is the backend running?'
        : 'Something went wrong. Please try again.');
    return Promise.reject(new Error(message));
  },
);

export const errorMessage = (err) => err?.message || 'Unexpected error';

export default api;
