import api from './api';

export const authService = {
  async register(data) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  async refresh(refreshToken) {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('findit_access_token');
      localStorage.removeItem('findit_refresh_token');
      localStorage.removeItem('findit_user');
    }
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async updateProfile(data) {
    const response = await api.put('/users/profile', data);
    return response.data;
  }
};

