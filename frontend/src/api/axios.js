import axios from 'axios';
import useAuthStore from '../store/authStore.js';

// In dev: Vite proxies '/api' to localhost:5000.
// In prod: set VITE_API_URL to your backend URL (e.g. https://your-backend.vercel.app/api).
const baseURL = import.meta.env.VITE_API_URL || '/api';
const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(err);
  }
);

export default api;
