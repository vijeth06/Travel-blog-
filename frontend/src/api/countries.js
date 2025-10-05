import api from './api';

// Get all countries with optional filters
export const getCountries = async (params = {}) => {
  try {
    const response = await api.get('/countries', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching countries:', error);
    throw error;
  }
};

// Get single country by slug or ID
export const getCountry = async (identifier) => {
  try {
    const response = await api.get(`/countries/${identifier}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching country:', error);
    throw error;
  }
};

// Search countries
export const searchCountries = async (params = {}) => {
  try {
    const response = await api.get('/countries/search', { params });
    return response.data;
  } catch (error) {
    console.error('Error searching countries:', error);
    throw error;
  }
};

// Get featured countries
export const getFeaturedCountries = async (limit = 8) => {
  try {
    const response = await api.get('/countries/featured', { params: { limit } });
    return response.data;
  } catch (error) {
    console.error('Error fetching featured countries:', error);
    throw error;
  }
};

// Get countries by continent
export const getCountriesByContinent = async (continent, limit = 20) => {
  try {
    const response = await api.get(`/countries/continent/${continent}`, { params: { limit } });
    return response.data;
  } catch (error) {
    console.error('Error fetching countries by continent:', error);
    throw error;
  }
};

// Get Indian regions
export const getIndianRegions = async (limit = 50) => {
  try {
    const response = await api.get('/countries/india/regions', { params: { limit } });
    return response.data;
  } catch (error) {
    console.error('Error fetching Indian regions:', error);
    throw error;
  }
};

// Get currency information for a country
export const getCountryCurrency = async (countryCode) => {
  try {
    const response = await api.get(`/countries/currency/${countryCode}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching country currency:', error);
    throw error;
  }
};

// Get popular destinations for a country
export const getPopularDestinations = async (identifier) => {
  try {
    const response = await api.get(`/countries/${identifier}/destinations`);
    return response.data;
  } catch (error) {
    console.error('Error fetching popular destinations:', error);
    throw error;
  }
};