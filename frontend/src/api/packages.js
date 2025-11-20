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
    console.error('Packages API Error:', error.message);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Cannot connect to server - Backend not running');
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Get all packages with filters and pagination
export const getPackages = async (params = {}) => {
  try {
    // Test backend connection first
    await api.get('/health').catch(() => {
      throw new Error('❌ Cannot connect to server - Please start backend server');
    });
    
    const response = await api.get('/packages', { params });
    return response.data;
  } catch (error) {
    if (error.message.includes('Cannot connect')) {
      throw error;
    }
    throw error.response?.data || error.message;
  }
};

// Get single package by ID
export const getPackageById = async (id) => {
  try {
    const response = await api.get(`/packages/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Search packages
export const searchPackages = async (params = {}) => {
  try {
    const response = await api.get('/packages/search', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get featured packages
export const getFeaturedPackages = async (limit = 6) => {
  try {
    const response = await api.get('/packages/featured', { params: { limit } });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Add review to package
export const addPackageReview = async (packageId, reviewData) => {
  try {
    const response = await api.post(`/packages/${packageId}/reviews`, reviewData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Admin functions
export const createPackage = async (packageData) => {
  try {
    const response = await api.post('/packages', packageData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updatePackage = async (id, packageData) => {
  try {
    const response = await api.put(`/packages/${id}`, packageData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deletePackage = async (id) => {
  try {
    const response = await api.delete(`/packages/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  getPackages,
  getPackageById,
  searchPackages,
  getFeaturedPackages,
  addPackageReview,
  createPackage,
  updatePackage,
  deletePackage,
};
