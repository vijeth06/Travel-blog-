// Test API connection
export const testAPIConnection = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/blogs');
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
    const response = await fetch('http://localhost:5000/api/health');
    const data = await response.json();
    console.log('Backend Health:', response.status, data);
    return { success: true, data };
  } catch (error) {
    console.error('Backend Health Check Failed:', error);
    return { success: false, error: error.message };
  }
};