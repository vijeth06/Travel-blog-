import api from './api';

// Get user's integrations
export const getUserIntegrations = async (params) => {
  const response = await api.get('/api/real-integrations', { params });
  return response.data;
};

// Connect an integration
export const connectIntegration = async (integrationData) => {
  const response = await api.post('/api/real-integrations/connect', integrationData);
  return response.data;
};

// Disconnect an integration
export const disconnectIntegration = async (integrationId) => {
  const response = await api.delete(`/api/real-integrations/${integrationId}`);
  return response.data;
};

// Update integration settings
export const updateIntegrationSettings = async (integrationId, settings) => {
  const response = await api.put(`/api/real-integrations/${integrationId}/settings`, settings);
  return response.data;
};

// Sync integration
export const syncIntegration = async (integrationId) => {
  const response = await api.post(`/api/real-integrations/${integrationId}/sync`);
  return response.data;
};

// Get integration stats
export const getIntegrationStats = async (integrationId) => {
  const response = await api.get(`/api/real-integrations/${integrationId}/stats`);
  return response.data;
};
