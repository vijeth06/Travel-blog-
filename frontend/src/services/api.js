import axios from 'axios';

// Create axios instance with base configuration
// In production, use relative URL since frontend and backend are on same domain
const getBaseURL = () => {
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin + '/api';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
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

// Search API functions
export const searchAPI = {
  // Advanced search with filters
  advancedSearch: async (searchParams) => {
    try {
      const response = await api.post('/search/advanced', searchParams);
      return response.data;
    } catch (error) {
      console.error('Advanced search error:', error);
      throw error;
    }
  },

  // Get search suggestions
  getSearchSuggestions: async (query) => {
    try {
      const response = await api.get(`/search/suggestions?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Search suggestions error:', error);
      return [];
    }
  },

  // Get destinations for autocomplete
  getDestinations: async (query = '') => {
    try {
      const response = await api.get(`/destinations?search=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      console.error('Get destinations error:', error);
      return [];
    }
  },

  // Get categories
  getCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Get categories error:', error);
      return [];
    }
  }
};

// Review API functions
export const reviewAPI = {
  // Get reviews for a specific item
  getReviews: async (itemType, itemId, page = 1, limit = 10) => {
    try {
      const response = await api.get(`/reviews/${itemType}/${itemId}?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get reviews error:', error);
      throw error;
    }
  },

  // Create a new review
  createReview: async (reviewData) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      console.error('Create review error:', error);
      throw error;
    }
  },

  // Update a review
  updateReview: async (reviewId, updateData) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update review error:', error);
      throw error;
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Delete review error:', error);
      throw error;
    }
  },

  // Vote on review helpfulness
  voteReviewHelpful: async (reviewId, isHelpful) => {
    try {
      const response = await api.post(`/reviews/${reviewId}/vote`, { helpful: isHelpful });
      return response.data;
    } catch (error) {
      console.error('Vote review error:', error);
      throw error;
    }
  }
};

// Calendar API functions
export const calendarAPI = {
  // Get calendar events
  getEvents: async (startDate, endDate) => {
    try {
      const response = await api.get(`/calendar/events?start=${startDate}&end=${endDate}`);
      return response.data;
    } catch (error) {
      console.error('Get calendar events error:', error);
      return [];
    }
  },

  // Create a new event
  createEvent: async (eventData) => {
    try {
      const response = await api.post('/calendar/events', eventData);
      return response.data;
    } catch (error) {
      console.error('Create event error:', error);
      throw error;
    }
  },

  // Update an event
  updateEvent: async (eventId, updateData) => {
    try {
      const response = await api.put(`/calendar/events/${eventId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Update event error:', error);
      throw error;
    }
  },

  // Delete an event
  deleteEvent: async (eventId) => {
    try {
      const response = await api.delete(`/calendar/events/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Delete event error:', error);
      throw error;
    }
  },

  // Get weather data for a location and date
  getWeatherData: async (location, date) => {
    try {
      const response = await api.get(`/calendar/weather?location=${encodeURIComponent(location)}&date=${date}`);
      return response.data;
    } catch (error) {
      console.error('Get weather data error:', error);
      return null;
    }
  },

  // Get seasonal recommendations
  getSeasonalRecommendations: async (month, location) => {
    try {
      const response = await api.get(`/calendar/seasonal?month=${month}&location=${encodeURIComponent(location)}`);
      return response.data;
    } catch (error) {
      console.error('Get seasonal recommendations error:', error);
      return [];
    }
  }
};

// Map API functions
export const mapAPI = {
  // Get map markers for destinations
  getMapMarkers: async (bounds) => {
    try {
      const response = await api.post('/map/markers', { bounds });
      return response.data;
    } catch (error) {
      console.error('Get map markers error:', error);
      return [];
    }
  },

  // Get route between destinations
  getRoute: async (origin, destination, waypoints = []) => {
    try {
      const response = await api.post('/map/route', { origin, destination, waypoints });
      return response.data;
    } catch (error) {
      console.error('Get route error:', error);
      throw error;
    }
  },

  // Get nearby places
  getNearbyPlaces: async (lat, lng, radius = 5000, type = 'tourist_attraction') => {
    try {
      const response = await api.get(`/map/nearby?lat=${lat}&lng=${lng}&radius=${radius}&type=${type}`);
      return response.data;
    } catch (error) {
      console.error('Get nearby places error:', error);
      return [];
    }
  }
};

// Blog API functions (existing)
export const blogAPI = {
  // Get all blogs
  getBlogs: async (page = 1, limit = 10) => {
    try {
      const response = await api.get(`/blogs?page=${page}&limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error('Get blogs error:', error);
      throw error;
    }
  },

  // Get blog by ID
  getBlogById: async (id) => {
    try {
      const response = await api.get(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get blog by ID error:', error);
      throw error;
    }
  },

  // Create new blog
  createBlog: async (blogData) => {
    try {
      const response = await api.post('/blogs', blogData);
      return response.data;
    } catch (error) {
      console.error('Create blog error:', error);
      throw error;
    }
  },

  // Update blog
  updateBlog: async (id, blogData) => {
    try {
      const response = await api.put(`/blogs/${id}`, blogData);
      return response.data;
    } catch (error) {
      console.error('Update blog error:', error);
      throw error;
    }
  },

  // Delete blog
  deleteBlog: async (id) => {
    try {
      const response = await api.delete(`/blogs/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete blog error:', error);
      throw error;
    }
  }
};

// User API functions (existing)
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/auth/profile', profileData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  // Login
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
  }
};

export default api;