import api from './api';

export const getUserTimeline = (limit = 20) =>
  api.get('/timeline', { params: { limit } });
