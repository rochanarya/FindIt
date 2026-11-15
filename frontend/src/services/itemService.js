import api from './api';

export const itemService = {
  async getItems(params = {}) {
    const response = await api.get('/items', { params });
    return response.data;
  },

  async getItemById(id) {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },

  async createItem(formData) {
    // formData contains text fields + images
    const response = await api.post('/items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async updateItem(id, data) {
    const response = await api.put(`/items/${id}`, data);
    return response.data;
  },

  async deleteItem(id) {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  },

  async getMyReports(params = {}) {
    const response = await api.get('/items/my-reports', { params });
    return response.data;
  },

  async getFeatured() {
    const response = await api.get('/items/featured');
    return response.data;
  },

  async search(keyword, params = {}) {
    const response = await api.get('/items/search', { params: { q: keyword, ...params } });
    return response.data;
  },

  async getMatches(id) {
    const response = await api.get(`/items/matches/${id}`);
    return response.data;
  }
};

