import api from './api';

// Get all continents
export const getContinents = async (params = {}) => {
  try {
    const response = await api.get('/continents', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching continents:', error);
    throw error;
  }
};

// Get single continent by identifier (slug, ID, or code)
export const getContinent = async (identifier) => {
  try {
    const response = await api.get(`/continents/${identifier}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching continent:', error);
    throw error;
  }
};

// Get famous places by continent
export const getFamousPlaces = async (identifier, params = {}) => {
  try {
    const response = await api.get(`/continents/${identifier}/places`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching famous places:', error);
    throw error;
  }
};

// Get place categories by continent
export const getPlaceCategories = async (identifier) => {
  try {
    const response = await api.get(`/continents/${identifier}/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching place categories:', error);
    throw error;
  }
};

// Search continents and places
export const searchContinents = async (params = {}) => {
  try {
    const response = await api.get('/continents/search', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching continents:', error);
    throw error;
  }
};

// Get continent statistics
export const getContinentStats = async () => {
  try {
    const response = await api.get('/continents/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching continent stats:', error);
    throw error;
  }
};

// Get featured continents
export const getFeaturedContinents = async () => {
  try {
    const response = await api.get('/continents', { 
      params: { featured: true, limit: 10 } 
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching featured continents:', error);
    throw error;
  }
};

export default {
  getContinents,
  getContinent,
  getFamousPlaces,
  getPlaceCategories,
  searchContinents,
  getContinentStats,
  getFeaturedContinents
};