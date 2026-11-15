import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('findit_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh and unauthorized errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('findit_refresh_token');

      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
          if (res.data?.success && res.data?.data?.accessToken) {
            const newAccessToken = res.data.data.accessToken;
            localStorage.setItem('findit_access_token', newAccessToken);
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('findit_access_token');
          localStorage.removeItem('findit_refresh_token');
          localStorage.removeItem('findit_user');
          window.location.href = '/login';
          return Promise.reject(refreshErr);
        }
      } else {
        localStorage.removeItem('findit_access_token');
        localStorage.removeItem('findit_refresh_token');
        localStorage.removeItem('findit_user');
      }
    }

    return Promise.reject(error);
  }
);

export default api;

