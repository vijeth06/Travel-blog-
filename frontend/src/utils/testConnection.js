import { API_URL } from '../config/api';

// Test API connection
export const testAPIConnection = async () => {
  try {
    const response = await fetch(`${API_URL}/blogs`);
    const data = await response.json();
    console.log('API Connection Test:', response.status, data);
    return { success: true, data };
  } catch (error) {
    console.error('API Connection Failed:', error);
    return { success: false, error: error.message };
  }
};

// Test backend health
export const testBackendHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`);
    const data = await response.json();
    console.log('Backend Health:', response.status, data);
    return { success: true, data };
  } catch (error) {
    console.error('Backend Health Check Failed:', error);
    return { success: false, error: error.message };
  }
};