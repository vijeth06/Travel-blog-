import api from './api';

// Initialize mobile optimization
export const initializeMobileOptimization = async (deviceInfo) => {
  const response = await api.post('/api/real-mobile-optimization/optimize/init', deviceInfo);
  return response.data;
};

// Get mobile settings
export const getMobileSettings = async () => {
  const response = await api.get('/api/real-mobile-optimization/settings');
  return response.data;
};

// Update mobile settings
export const updateMobileSettings = async (settings) => {
  const response = await api.put('/api/real-mobile-optimization/settings', settings);
  return response.data;
};

// Get offline content
export const getOfflineContent = async () => {
  const response = await api.get('/api/real-mobile-optimization/offline/content');
  return response.data;
};

// Download content for offline
export const downloadOfflineContent = async (contentId) => {
  const response = await api.post('/api/real-mobile-optimization/offline/download', { contentId });
  return response.data;
};

// Get mobile performance metrics
export const getMobileMetrics = async () => {
  const response = await api.get('/api/real-mobile-optimization/metrics');
  return response.data;
};

// Clear mobile cache
export const clearMobileCache = async () => {
  const response = await api.delete('/api/real-mobile-optimization/cache');
  return response.data;
};
