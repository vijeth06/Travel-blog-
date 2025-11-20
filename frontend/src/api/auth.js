import axios from 'axios';
import { API_URL } from '../config/api';

const API_BASE_URL = API_URL;

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Register new user
export const register = async (userData) => {
  try {
    console.log('Attempting registration with:', userData);
    const response = await API.post('/auth/register', userData);
    console.log('Registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Register Error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      throw { message: 'Unable to connect to server. Please check if the server is running.' };
    }
    
    throw error.response?.data || { message: error.message || 'Registration failed' };
  }
};

// Login user
export const login = async (credentials) => {
  try {
    console.log('Attempting login with:', { email: credentials.email });
    const response = await API.post('/auth/login', credentials);
    console.log('Login successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('API Login Error:', error);
    console.error('Error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: error.config
    });
    
    if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
      throw { message: 'Unable to connect to server. Please check if the server is running.' };
    }
    
    throw error.response?.data || { message: error.message || 'Login failed' };
  }
};

// Get user profile
export const getProfile = async () => {
  try {
    const response = await API.get('/auth/profile');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    const response = await API.put('/auth/profile', profileData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Change password
export const changePassword = async (passwordData) => {
  try {
    const response = await API.put('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/login';
};

export default {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
};
