import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Advanced search
export const advancedSearch = async (filters = {}) => {
  const response = await axios.get(`${API_URL}/search/advanced`, {
    params: filters
  });
  return response.data;
};

// Get search suggestions (autocomplete)
export const getSearchSuggestions = async (query, type = 'all') => {
  const response = await axios.get(`${API_URL}/search/suggestions`, {
    params: { query, type }
  });
  return response.data;
};

// Get popular destinations
export const getPopularDestinations = async (limit = 10) => {
  const response = await axios.get(`${API_URL}/search/popular-destinations`, {
    params: { limit }
  });
  return response.data;
};

// Save search preferences
export const saveSearchPreferences = async (preferences) => {
  const response = await axios.post(
    `${API_URL}/search/save-preferences`,
    { preferences },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    }
  );
  return response.data;
};
