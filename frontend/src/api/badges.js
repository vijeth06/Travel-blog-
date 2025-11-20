import api from './api';

export const getUserBadges = (userId) => api.get(`/badges/user/${userId}`);

export const getMyBadges = () => api.get('/badges/my');

export const checkBadges = () => api.post('/badges/check');

export const toggleBadgeVisibility = (id) => api.put(`/badges/${id}/visibility`);
