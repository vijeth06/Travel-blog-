import axios from 'axios';
import { getApiUrl } from '../config/api';

const API_BASE_URL = getApiUrl();

const API = axios.create({
  baseURL: API_BASE_URL,
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

// Upload single image
export const uploadImage = async (file, caption = '', alt = '') => {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('caption', caption);
    formData.append('alt', alt);

    const response = await API.post('/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Upload multiple images
export const uploadImages = async (files, captions = [], alts = []) => {
  try {
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append('images', file);
    });
    
    captions.forEach((caption, index) => {
      formData.append('captions', caption);
    });
    
    alts.forEach((alt, index) => {
      formData.append('alts', alt);
    });

    const response = await API.post('/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

// Delete image
export const deleteImage = async (publicId) => {
  try {
    const response = await API.delete(`/upload/image/${publicId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};