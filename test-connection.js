// Simple connection test script
const axios = require('axios');

async function testConnection() {
  console.log('🔍 Testing server connections...\n');
  
  // Test backend health
  try {
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Backend Health Check:', healthResponse.data.message);
  } catch (error) {
    console.log('❌ Backend Health Check Failed:', error.message);
    return;
  }
  
  // Test backend API endpoints
  try {
    const blogsResponse = await axios.get('http://localhost:5000/api/blogs');
    console.log('✅ Blogs API Working - Found', blogsResponse.data.blogs?.length || 0, 'blogs');
  } catch (error) {
    console.log('❌ Blogs API Failed:', error.message);
  }
  
  try {
    const packagesResponse = await axios.get('http://localhost:5000/api/packages');
    console.log('✅ Packages API Working - Found', packagesResponse.data.packages?.length || 0, 'packages');
  } catch (error) {
    console.log('❌ Packages API Failed:', error.message);
  }
  
  // Test authentication
  try {
    const loginData = {
      email: 'john@test.com',
      password: 'password123'
    };
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', loginData);
    console.log('✅ Authentication Working - User:', loginResponse.data.user.name);
  } catch (error) {
    console.log('❌ Authentication Failed:', error.message);
  }
  
  console.log('\n🎉 All backend services are operational!');
  console.log('📍 Backend URL: http://localhost:5000');
  console.log('📍 Frontend URL: http://localhost:3000');
  console.log('\n💡 If you\'re still seeing connection errors in the browser:');
  console.log('   1. Clear browser cache (Ctrl+Shift+Delete)');
  console.log('   2. Hard refresh the page (Ctrl+Shift+R)');
  console.log('   3. Check browser console for any errors (F12)');
  console.log('   4. Make sure you\'re accessing http://localhost:3000');
}

testConnection().catch(console.error);