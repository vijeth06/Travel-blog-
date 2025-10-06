import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

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

// Get all users (admin only)
export const getAllUsers = async (params = {}) => {
  try {
    const response = await API.get('/users', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const getUsers = async (params = {}) => {
  return getAllUsers(params);
};

// Get user by ID
export const getUserById = async (id) => {
  try {
    const response = await API.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Update user role (admin only)
export const updateUserRole = async (userId, role) => {
  try {
    const response = await API.put('/users/role', { userId, role });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Follow/Unfollow user
export const followUser = async (userId) => {
  try {
    const response = await API.post(`/users/${userId}/follow`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

export const unfollowUser = async (userId) => {
  try {
    const response = await API.delete(`/users/${userId}/follow`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Update user (admin only)
export const updateUser = async (userId, userData) => {
  try {
    const response = await API.put(`/users/${userId}`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Delete user (admin only)
export const deleteUser = async (userId) => {
  try {
    const response = await API.delete(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};