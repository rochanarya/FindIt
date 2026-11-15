import api from './api';

export const claimService = {
  async createClaim(formData) {
    const response = await api.post('/claims', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getMyClaims(params = {}) {
    const response = await api.get('/claims/my-claims', { params });
    return response.data;
  },

  async getClaimById(id) {
    const response = await api.get(`/claims/${id}`);
    return response.data;
  },

  async provideAdditionalInfo(id, data) {
    const response = await api.put(`/claims/${id}/additional-information`, data);
    return response.data;
  }
};

