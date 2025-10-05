// Test authentication from frontend perspective
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testFrontendAuth() {
  console.log('🧪 Testing Frontend Authentication Flow...\n');

  try {
    // Test 1: Registration
    console.log('1️⃣ Testing Registration...');
    const testUser = {
      name: 'Frontend Test User',
      email: `frontend-test-${Date.now()}@example.com`,
      password: 'password123'
    };

    const registerResponse = await axios.post(`${API_BASE_URL}/auth/register`, testUser, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('✅ Registration successful!');
    console.log('   User:', registerResponse.data.user.name);
    console.log('   Email:', registerResponse.data.user.email);
    console.log('   Token received:', !!registerResponse.data.token);

    // Test 2: Login with the same user
    console.log('\n2️⃣ Testing Login...');
    const loginData = {
      email: testUser.email,
      password: testUser.password
    };

    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, loginData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    console.log('✅ Login successful!');
    console.log('   User:', loginResponse.data.user.name);
    console.log('   Token received:', !!loginResponse.data.token);

    // Test 3: Profile access with token
    console.log('\n3️⃣ Testing Profile Access...');
    const profileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('✅ Profile access successful!');
    console.log('   Profile name:', profileResponse.data.name);
    console.log('   Profile email:', profileResponse.data.email);

    // Test 4: Profile update
    console.log('\n4️⃣ Testing Profile Update...');
    const updateData = {
      name: 'Updated Frontend Test User',
      bio: 'This is a test bio from frontend test',
      city: 'Test City'
    };

    const updateResponse = await axios.put(`${API_BASE_URL}/auth/profile`, updateData, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('✅ Profile update successful!');
    console.log('   Updated name:', updateResponse.data.name);
    console.log('   Updated bio:', updateResponse.data.bio);
    console.log('   Updated city:', updateResponse.data.city);

    // Test 5: Blog creation
    console.log('\n5️⃣ Testing Blog Creation...');
    const blogData = {
      title: 'Frontend Test Blog Post',
      content: '<h2>Test Content</h2><p>This is a test blog post created from frontend test.</p>',
      excerpt: 'A test blog post',
      tags: ['test', 'frontend', 'automation']
    };

    const blogResponse = await axios.post(`${API_BASE_URL}/blogs`, blogData, {
      headers: {
        'Authorization': `Bearer ${loginResponse.data.token}`,
        'Content-Type': 'application/json',
      }
    });

    console.log('✅ Blog creation successful!');
    console.log('   Blog title:', blogResponse.data.title);
    console.log('   Blog ID:', blogResponse.data._id);
    console.log('   Author:', blogResponse.data.author.name);

    console.log('\n🎉 ALL TESTS PASSED! Frontend authentication is working perfectly!');
    console.log('\n📋 Summary:');
    console.log('   ✅ User registration: Working');
    console.log('   ✅ User login: Working');
    console.log('   ✅ Profile access: Working');
    console.log('   ✅ Profile update: Working');
    console.log('   ✅ Blog creation: Working');
    
    console.log('\n💡 If you\'re still seeing issues in the browser:');
    console.log('   1. Clear browser cache completely');
    console.log('   2. Open browser developer tools (F12)');
    console.log('   3. Go to Network tab and check for failed requests');
    console.log('   4. Go to Console tab and check for JavaScript errors');
    console.log('   5. Try accessing: http://localhost:3000/connection-test');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testFrontendAuth();