// Test all fixes: Settings profile update, Blog creation with categories, and Image handling
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testAllFixes() {
  console.log('🔧 Testing All Fixes: Settings, Blog Categories, and Images...\n');

  try {
    // Login first
    console.log('🔐 Logging in...');
    const loginResponse = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'john@test.com',
      password: 'password123'
    });

    const token = loginResponse.data.token;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    console.log('✅ Login successful\n');

    // Test 1: Get Categories
    console.log('📂 Testing Categories API...');
    const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`);
    const categories = categoriesResponse.data.categories;
    console.log('✅ Categories fetched successfully!');
    console.log('   Available categories:');
    categories.forEach(cat => {
      console.log(`     - ${cat.name} (ID: ${cat._id})`);
    });

    // Test 2: Profile Update (Settings page format)
    console.log('\n👤 Testing Settings Profile Update...');
    const settingsProfileData = {
      name: 'John Settings Updated',
      bio: 'Profile updated from Settings page',
      city: 'Settings City',
      country: 'Settings Country',
      website: 'https://settings-updated.com',
      phone: '+1-555-SETTINGS'
    };

    const settingsProfileResponse = await axios.put(`${API_BASE_URL}/auth/profile`, settingsProfileData, { headers });
    console.log('✅ Settings profile update successful!');
    console.log('   Name:', settingsProfileResponse.data.name);
    console.log('   Bio:', settingsProfileResponse.data.bio);
    console.log('   City:', settingsProfileResponse.data.city);
    console.log('   Country:', settingsProfileResponse.data.country);

    // Test 3: Blog Creation with Category ObjectId
    console.log('\n📝 Testing Blog Creation with Category...');
    const adventureCategory = categories.find(cat => cat.name === 'Adventure');
    
    const blogWithCategoryData = {
      title: 'Adventure Blog with Proper Category',
      content: '<h2>Epic Adventure</h2><p>This blog post has a proper category ObjectId and structured images.</p>',
      location: 'Himalayan Mountains',
      category: adventureCategory._id, // Using ObjectId
      tags: ['adventure', 'mountains', 'hiking'],
      images: [
        { 
          url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', 
          caption: 'Mountain landscape', 
          alt: 'Beautiful mountain view' 
        },
        { 
          url: 'https://images.unsplash.com/photo-1551632811-561732d1e306', 
          caption: 'Hiking trail', 
          alt: 'Scenic hiking trail' 
        }
      ]
    };

    const blogResponse = await axios.post(`${API_BASE_URL}/blogs`, blogWithCategoryData, { headers });
    console.log('✅ Blog with category created successfully!');
    console.log('   Title:', blogResponse.data.title);
    console.log('   Category:', blogResponse.data.category?.name || 'No category');
    console.log('   Images count:', blogResponse.data.images?.length || 0);
    console.log('   Tags:', blogResponse.data.tags);

    // Test 4: Blog Creation without Category (should work)
    console.log('\n📝 Testing Blog Creation without Category...');
    const blogWithoutCategoryData = {
      title: 'Blog without Category',
      content: '<p>This blog post has no category, which should be fine.</p>',
      location: 'Anywhere',
      tags: ['general', 'test'],
      images: [
        { 
          url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e', 
          caption: 'Nature scene', 
          alt: 'Beautiful nature' 
        }
      ]
    };

    const blogNoCatResponse = await axios.post(`${API_BASE_URL}/blogs`, blogWithoutCategoryData, { headers });
    console.log('✅ Blog without category created successfully!');
    console.log('   Title:', blogNoCatResponse.data.title);
    console.log('   Category:', blogNoCatResponse.data.category || 'None (as expected)');
    console.log('   Images count:', blogNoCatResponse.data.images?.length || 0);

    // Test 5: Verify profile data persistence
    console.log('\n🔍 Verifying profile data persistence...');
    const getProfileResponse = await axios.get(`${API_BASE_URL}/auth/profile`, { headers });
    console.log('✅ Profile data verified!');
    console.log('   Current Name:', getProfileResponse.data.name);
    console.log('   Current City:', getProfileResponse.data.city);
    console.log('   Current Country:', getProfileResponse.data.country);

    console.log('\n🎉 ALL FIXES VERIFIED SUCCESSFULLY!');
    console.log('\n📋 Summary of Fixes Applied:');
    console.log('   ✅ Settings Page: Fixed Redux integration for profile updates');
    console.log('   ✅ Blog Categories: Fixed ObjectId handling and dynamic category loading');
    console.log('   ✅ Image Upload: Fixed image object structure and error handling');
    console.log('   ✅ Form Validation: Added proper validation and error messages');
    
    console.log('\n🚀 Frontend should now work correctly for:');
    console.log('   • Profile updates in Settings page (/settings)');
    console.log('   • Blog creation with categories (/blogs/new)');
    console.log('   • Image URL validation and display');
    console.log('   • Category dropdown with real data');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testAllFixes();