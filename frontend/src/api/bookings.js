import axios from 'axios';
import { getApiUrl } from '../config/api';

const API_BASE_URL = getApiUrl();

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Create new booking
export const createBooking = async (bookingData) => {
  try {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get user's bookings
export const getUserBookings = async (params = {}) => {
  try {
    const response = await api.get('/bookings/my-bookings', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get single booking by ID
export const getBookingById = async (id) => {
  try {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Cancel booking
export const cancelBooking = async (id, reason) => {
  try {
    const response = await api.put(`/bookings/${id}/cancel`, { reason });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Admin functions
export const getAllBookings = async (params = {}) => {
  try {
    const response = await api.get('/bookings', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateBookingStatus = async (id, status) => {
  try {
    const response = await api.put(`/bookings/${id}/status`, { status });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const addBookingNote = async (id, text) => {
  try {
    const response = await api.post(`/bookings/${id}/notes`, { text });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  createBooking,
  getUserBookings,
  getBookingById,
  cancelBooking,
  getAllBookings,
  updateBookingStatus,
  addBookingNote,
};
