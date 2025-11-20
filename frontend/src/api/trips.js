import api from './api';

export const getTrips = () => api.get('/trips');

export const createTrip = (data) => api.post('/trips', data);

export const getTripById = (id) => api.get(`/trips/${id}`);

export const updateTrip = (id, data) => api.put(`/trips/${id}`, data);

export const addTripItem = (id, item) => api.post(`/trips/${id}/items`, item);

export const removeTripItem = (id, itemId) => api.delete(`/trips/${id}/items/${itemId}`);

export const deleteTrip = (id) => api.delete(`/trips/${id}`);

export const autoBuildTrip = (payload) => api.post('/trips/auto-build', payload);

export const shareTrip = (id) => api.post(`/trips/${id}/share`);

export const getSharedTrip = (token) => api.get(`/trips/shared/${token}`);

export const getTripSuggestions = (id) => api.get(`/trips/${id}/suggestions`);

export const getTripCost = (id) => api.get(`/trips/${id}/cost`);
