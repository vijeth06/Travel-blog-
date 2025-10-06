import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Comment API functions
export const createComment = (data) => api.post('/comments', data);

export const getCommentsByBlog = (blogId, params = {}) => 
  api.get(`/comments/blog/${blogId}`, { params });

export const deleteComment = (commentId) => 
  api.delete(`/comments/${commentId}`);

export const flagComment = (commentId) => 
  api.post(`/comments/${commentId}/flag`);

export const moderateComment = (commentId, data) => 
  api.put(`/comments/${commentId}/moderate`, data);

export const getPendingComments = (params = {}) => 
  api.get('/comments/pending', { params });

export const likeComment = (commentId) => 
  api.post(`/comments/${commentId}/like`);

export const unlikeComment = (commentId) => 
  api.delete(`/comments/${commentId}/like`);
