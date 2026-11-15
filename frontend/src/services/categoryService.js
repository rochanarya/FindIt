import api from './api';

export const categoryService = {
  async getCategories() {
    const response = await api.get('/categories');
    return response.data;
  },

  async createCategory(data) {
    const response = await api.post('/admin/categories', data);
    return response.data;
  },

  async updateCategory(id, data) {
    const response = await api.put(`/admin/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id) {
    const response = await api.delete(`/admin/categories/${id}`);
    return response.data;
  }
};

