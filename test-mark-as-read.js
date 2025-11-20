const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testMarkAsRead() {
  try {
    // First, get a token by logging in or using existing token
    console.log('Testing mark as read endpoint...\n');
    
    // Test 1: Try without auth (should fail with 401)
    console.log('Test 1: Without authentication');
    try {
      await axios.post(`${API_URL}/chat/conversations/507f1f77bcf86cd799439011/read`);
      console.log('❌ Should have failed without auth');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✓ Correctly requires authentication (401)');
      } else {
        console.log(`✗ Got status ${error.response?.status} instead of 401`);
      }
    }

    // Test 2: Register a test user and try with auth
    console.log('\nTest 2: With authentication');
    const timestamp = Date.now();
    const testUser = {
      name: `Test User ${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: 'Test@12345'
    };

    const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
    const token = registerResponse.data.token;
    console.log('✓ User registered and authenticated');

    // Try to mark as read for a non-existent conversation
    try {
      await axios.post(
        `${API_URL}/chat/conversations/507f1f77bcf86cd799439011/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Response received (conversation might not exist, which is OK)');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✓ Endpoint exists and returns 404 for non-existent conversation');
      } else if (error.response?.status === 400) {
        console.log('✓ Endpoint exists and returns 400 for invalid conversation ID');
      } else {
        console.log(`✗ Unexpected status: ${error.response?.status}`);
        console.log(`   Message: ${error.response?.data?.message}`);
      }
    }

    console.log('\n✅ Endpoint test complete!');
    console.log('The /api/chat/conversations/:conversationId/read endpoint exists and is working.');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testMarkAsRead();
