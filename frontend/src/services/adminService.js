import api from './api';

export const adminService = {
  async getDashboard() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  async getAnalytics() {
    const response = await api.get('/admin/analytics');
    return response.data;
  },

  async getItems(params = {}) {
    const response = await api.get('/admin/items', { params });
    return response.data;
  },

  async getClaims(params = {}) {
    const response = await api.get('/admin/claims', { params });
    return response.data;
  },

  async getClaimById(id) {
    const response = await api.get(`/admin/claims/${id}`);
    return response.data;
  },

  async approveClaim(id, data = {}) {
    const response = await api.patch(`/admin/claims/${id}/approve`, data);
    return response.data;
  },

  async rejectClaim(id, data = {}) {
    const response = await api.patch(`/admin/claims/${id}/reject`, data);
    return response.data;
  },

  async requestInformation(id, data = {}) {
    const response = await api.patch(`/admin/claims/${id}/request-information`, data);
    return response.data;
  },

  async resolveItem(id) {
    const response = await api.patch(`/admin/items/${id}/resolve`);
    return response.data;
  },

  async removeItem(id) {
    const response = await api.patch(`/admin/items/${id}/remove`);
    return response.data;
  },

  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  async suspendUser(id) {
    const response = await api.patch(`/admin/users/${id}/suspend`);
    return response.data;
  },

  async activateUser(id) {
    const response = await api.patch(`/admin/users/${id}/activate`);
    return response.data;
  },

  async getAuditLogs(params = {}) {
    const response = await api.get('/admin/audit-logs', { params });
    return response.data;
  }
};

