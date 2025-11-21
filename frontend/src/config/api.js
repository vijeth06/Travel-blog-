// API Configuration
// In production, use relative URLs since frontend and backend are on same domain
// In development, use localhost

const getApiUrl = () => {
  // If running on Render or production domain, use relative URL
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin + '/api';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

const getSocketUrl = () => {
  // If running on Render or production domain, use same origin
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin;
  }
  return process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
};

// Export as constants that get evaluated at runtime
export const API_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();

// Also export the functions for components that need dynamic URLs
export { getApiUrl, getSocketUrl };
