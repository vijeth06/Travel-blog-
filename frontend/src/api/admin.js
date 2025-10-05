import api from './api';

// Analytics endpoints
export const getAnalytics = () => api.get('/admin/analytics');
export const getSystemHealth = () => api.get('/admin/system-health');
export const getUserActivity = (params = {}) => api.get('/admin/user-activity', { params });

// Blog management endpoints
export const getAllBlogsAdmin = (params = {}) => api.get('/admin/blogs', { params });
export const updateBlogAdmin = (id, data) => api.put(`/admin/blogs/${id}`, data);
export const deleteBlogAdmin = (id) => api.delete(`/admin/blogs/${id}`);
export const toggleBlogFeatured = (id) => api.patch(`/admin/blogs/${id}/featured`);

// Comment moderation endpoints
export const getAllCommentsAdmin = (params = {}) => api.get('/admin/comments', { params });
export const bulkModerateComments = (data) => api.post('/admin/comments/bulk-moderate', data);
