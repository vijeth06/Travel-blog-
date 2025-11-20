// API Configuration
// In production, use relative URLs since frontend and backend are on same domain
// In development, use localhost

export const getApiUrl = () => {
  // If running on Render or production domain, use relative URL
  if (window.location.hostname !== 'localhost' && !process.env.REACT_APP_API_URL) {
    return '/api';
  }
  return process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
};

export const getSocketUrl = () => {
  // If running on Render or production domain, use same origin
  if (window.location.hostname !== 'localhost' && !process.env.REACT_APP_SOCKET_URL) {
    return window.location.origin;
  }
  return process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
};

export const API_URL = getApiUrl();
export const SOCKET_URL = getSocketUrl();
