import axios from 'axios';
import { getApiUrl } from '../config/api';

const API_URL = getApiUrl();

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
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

// Favorite Places API functions
export const favoritePlacesAPI = {
  // Get all favorite places with optional filters
  getFavoritePlaces: async (params = {}) => {
    try {
      const response = await api.get('/favorite-places', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get favorite places by continent
  getFavoritePlacesByContinent: async (continent, params = {}) => {
    try {
      const response = await api.get(`/favorite-places/continent/${continent}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get most popular places by continent
  getMostPopularByContinent: async (limit = 5) => {
    try {
      const response = await api.get('/favorite-places/popular-by-continent', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get single favorite place by slug
  getFavoritePlaceBySlug: async (slug) => {
    try {
      const response = await api.get(`/favorite-places/slug/${slug}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new favorite place
  createFavoritePlace: async (placeData) => {
    try {
      const response = await api.post('/favorite-places', placeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update favorite place
  updateFavoritePlace: async (id, placeData) => {
    try {
      const response = await api.put(`/favorite-places/${id}`, placeData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete favorite place
  deleteFavoritePlace: async (id) => {
    try {
      const response = await api.delete(`/favorite-places/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Toggle like on place
  toggleLikePlace: async (id) => {
    try {
      const response = await api.post(`/favorite-places/${id}/like`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Add comment to place
  addCommentToPlace: async (id, content) => {
    try {
      const response = await api.post(`/favorite-places/${id}/comments`, { content });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get user's favorite places
  getMyFavoritePlaces: async (params = {}) => {
    try {
      const response = await api.get('/favorite-places/user/my-places', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
};

// Named helper exports for compatibility with components expecting axios-like responses
export const getFavoritePlacesByContinent = async (continent, params = {}) => {
  const data = await favoritePlacesAPI.getFavoritePlacesByContinent(continent, params);
  return { data };
};

export const getMostPopularByContinent = async (limit = 5) => {
  const data = await favoritePlacesAPI.getMostPopularByContinent(limit);
  return { data };
};

export const createFavoritePlace = async (placeData) => {
  const data = await favoritePlacesAPI.createFavoritePlace(placeData);
  return { data };
};

export const toggleLikePlace = async (id) => {
  const data = await favoritePlacesAPI.toggleLikePlace(id);
  return { data };
};

export const addCommentToPlace = async (id, content) => {
  const data = await favoritePlacesAPI.addCommentToPlace(id, content);
  return { data };
};

export default favoritePlacesAPI;