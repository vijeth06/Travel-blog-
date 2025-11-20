import api from './api';

export const getCollections = () => api.get('/collections');

export const getPublicCollections = () => api.get('/collections/public');

export const createCollection = (data) => api.post('/collections', data);

export const getCollectionById = (id) => api.get(`/collections/${id}`);

export const updateCollection = (id, data) => api.put(`/collections/${id}`, data);

export const deleteCollection = (id) => api.delete(`/collections/${id}`);

export const addCollectionItem = (id, item) => api.post(`/collections/${id}/items`, item);

export const removeCollectionItem = (id, itemId) => api.delete(`/collections/${id}/items/${itemId}`);

export const followCollection = (id) => api.post(`/collections/${id}/follow`);
