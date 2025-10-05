const axios = require('axios');

async function testGamificationDirectly() {
  console.log('🧪 Testing Gamification System Directly\n');
  
  const baseURL = 'http://localhost:5000/api';
  
  try {
    // Test server health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Server is healthy');
    
    // Test without authentication first - get public achievements
    console.log('\n2. Testing public achievements...');
    try {
      const achievementsResponse = await axios.get(`${baseURL}/gamification/achievements`);
      console.log('✅ Retrieved achievements:', achievementsResponse.data.length);
    } catch (error) {
      console.log('❌ Error getting achievements:', error.response?.data?.message || error.message);
    }
    
    // Test leaderboard (should work without auth if configured properly)
    console.log('\n3. Testing leaderboard...');
    try {
      const leaderboardResponse = await axios.get(`${baseURL}/gamification/leaderboard`);
      console.log('✅ Retrieved leaderboard:', leaderboardResponse.data.length);
    } catch (error) {
      console.log('❌ Error getting leaderboard:', error.response?.data?.message || error.message);
    }
    
  } catch (error) {
    console.log('❌ Server test failed:', error.message);
  }
}

testGamificationDirectly();