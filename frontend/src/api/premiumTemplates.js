import api from './api';

export const getPremiumTemplates = (params) => api.get('/premium-templates', { params });

export const getPremiumTemplate = (id) => api.get(`/premium-templates/${id}`);

export const purchaseTemplate = (id) => api.post(`/premium-templates/${id}/purchase`);

export const createTemplate = (data) => api.post('/premium-templates', data);

export const updateTemplate = (id, data) => api.put(`/premium-templates/${id}`, data);
