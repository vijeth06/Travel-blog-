import api from './api';

// Traveler Analytics
export const getTravelerDashboard = async () => {
  const response = await api.get('/api/traveler-analytics/dashboard');
  return response.data;
};

export const getTravelerTimeline = async (year) => {
  const response = await api.get('/api/traveler-analytics/timeline', {
    params: { year }
  });
  return response.data;
};

export const getTravelMap = async () => {
  const response = await api.get('/api/traveler-analytics/map');
  return response.data;
};

// Creator Analytics
export const getCreatorDashboard = async () => {
  const response = await api.get('/api/creator-analytics/dashboard');
  return response.data;
};

export const getBlogAnalytics = async (blogId) => {
  const response = await api.get(`/api/creator-analytics/blogs/${blogId}/analytics`);
  return response.data;
};

export const getEngagementFunnel = async (timeRange = 30) => {
  const response = await api.get('/api/creator-analytics/funnel', {
    params: { timeRange }
  });
  return response.data;
};

export const getAudienceInsights = async () => {
  const response = await api.get('/api/creator-analytics/audience');
  return response.data;
};
