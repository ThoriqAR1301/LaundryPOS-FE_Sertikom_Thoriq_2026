import axios from 'axios';
import { getItem, multiRemove } from './storage';

export const BASE_URL = 'http://192.168.18.103:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await multiRemove(['token', 'user']);
    }
    return Promise.reject(error);
  },
);

export const login = async (email, password) => {
  const paths = ['/login', '/auth/login', '/v1/login'];
  if (!BASE_URL.endsWith('/api')) {
    paths.push('/api/login');
  }

  let lastError = null;
  for (const path of paths) {
    try {
      return await api.post(path, { email, password });
    } catch (error) {
      if (error.response?.status === 404) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }

  throw lastError || new Error('Login Gagal. Endpoint Tidak Ditemukan');
};

export const logout = () => api.post('/logout');

export const getProfile = () => api.get('/profile');

export const updateProfile = (data) => api.put('/profile', data);

export const getStatusLaundry = () => api.get('/status-laundry');

export default api;
