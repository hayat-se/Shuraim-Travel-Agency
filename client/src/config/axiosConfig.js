import axios from 'axios';
import { API_BASE_URL } from './api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach the auth token to every request.
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 (expired/invalid token), clear the session and send the user to the
// correct login page instead of leaving the app in a broken half-authed state.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const onAuthPage = /\/(admin|agency)\/login|\/agency\/(register|forgot-password)|^\/$/.test(window.location.pathname);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!onAuthPage) {
        const loginPath = window.location.pathname.startsWith('/admin') ? '/admin/login' : '/agency/login';
        window.location.assign(loginPath);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
