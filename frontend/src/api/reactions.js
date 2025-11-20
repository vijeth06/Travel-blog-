import api from './api';

export const addReaction = (data) => api.post('/reactions', data);

export const removeReaction = (data) => api.delete('/reactions', { data });

export const getReactions = (targetType, targetId) => api.get(`/reactions/${targetType}/${targetId}`);

export const getMyReaction = (targetType, targetId) => api.get(`/reactions/my/${targetType}/${targetId}`);
