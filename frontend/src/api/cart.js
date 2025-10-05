import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Cart API Error:', error.message);
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      throw new Error('❌ Cannot connect to server - Backend not running');
    }
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Get user's cart
export const getCart = async () => {
  try {
    const response = await api.get('/cart');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Add item to cart
export const addToCart = async (cartItemData) => {
  try {
    // Test backend connection first
    await api.get('/health').catch(() => {
      throw new Error('❌ Cannot connect to server - Please start backend server');
    });
    
    const response = await api.post('/cart/add', cartItemData);
    return response.data;
  } catch (error) {
    if (error.message.includes('Cannot connect')) {
      throw error;
    }
    throw error.response?.data || error.message;
  }
};

// Update cart item
export const updateCartItem = async (itemId, updateData) => {
  try {
    const response = await api.put(`/cart/items/${itemId}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Remove item from cart
export const removeFromCart = async (itemId) => {
  try {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Clear entire cart
export const clearCart = async () => {
  try {
    const response = await api.delete('/cart');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get cart item count
export const getCartItemCount = async () => {
  try {
    const response = await api.get('/cart/count');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Validate cart items
export const validateCart = async () => {
  try {
    const response = await api.post('/cart/validate');
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartItemCount,
  validateCart,
};
