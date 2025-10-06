const axios = require('axios');

const BASE_URL = 'http://127.0.0.1:5000/api';

async function testAuthEndpoints() {
    console.log('🔐 Testing Authentication Endpoints...\n');
    
    try {
        // Test registration
        console.log('1. Testing User Registration...');
        const timestamp = Date.now();
        const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
            username: `testuser${timestamp}`,
            name: `Test User ${timestamp}`,
            email: `test${timestamp}@example.com`,
            password: 'password123'
        });
        
        console.log('✅ Registration successful:', registerResponse.data.message);
        
        // Test login
        console.log('\n2. Testing User Login...');
        const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: `test${timestamp}@example.com`,
            password: 'password123'
        });
        
        console.log('✅ Login successful:', loginResponse.data.message);
        const token = loginResponse.data.token;
        
        // Test protected route
        console.log('\n3. Testing Protected Route Access...');
        const profileResponse = await axios.get(`${BASE_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Profile response data:', JSON.stringify(profileResponse.data, null, 2));
        const user = profileResponse.data.user || profileResponse.data;
        console.log('✅ Protected route access successful:', user.username || user.name || 'User data received');
        
        return { token, userId: user._id || user.id };
        
    } catch (error) {
        console.error('❌ Authentication test failed:');
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Message:', error.message);
        console.error('Full error:', error);
        return null;
    }
}

async function testBlogEndpoints(token) {
    console.log('\n📝 Testing Blog Management Endpoints...\n');
    
    try {
        // Test blog creation
        console.log('1. Testing Blog Creation...');
        const createBlogResponse = await axios.post(`${BASE_URL}/blogs`, {
            title: 'Test Travel Blog',
            content: 'This is a test blog about my amazing travel experience.',
            excerpt: 'A test blog excerpt',
            location: 'Paris, France',
            geotag: {
                city: 'Paris',
                country: 'France',
                lat: 48.8566,
                lng: 2.3522,
                address: 'Paris, France',
                continent: 'Europe'
            },
            tags: ['travel', 'test', 'paris'],
            status: 'published'
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Blog creation successful:', createBlogResponse.data.blog.title);
        const blogId = createBlogResponse.data.blog._id;
        
        // Test getting blogs
        console.log('\n2. Testing Get Blogs...');
        const getBlogsResponse = await axios.get(`${BASE_URL}/blogs`);
        
        console.log('✅ Get blogs successful, found:', getBlogsResponse.data.blogs.length, 'blogs');
        
        // Test getting single blog
        console.log('\n3. Testing Get Single Blog...');
        const getSingleBlogResponse = await axios.get(`${BASE_URL}/blogs/${blogId}`);
        
        console.log('✅ Get single blog successful:', getSingleBlogResponse.data.blog.title);
        
        return blogId;
        
    } catch (error) {
        console.error('❌ Blog test failed:', error.response?.data || error.message);
        return null;
    }
}

async function testHighImpactFeatures(token) {
    console.log('\n🚀 Testing High-Impact Features...\n');
    
    try {
        // Test gamification profile
        console.log('1. Testing Gamification Profile...');
        const gamificationResponse = await axios.get(`${BASE_URL}/high-impact/gamification/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Gamification profile:', gamificationResponse.data.data);
        
        // Test AI recommendations
        console.log('\n2. Testing AI Recommendations...');
        const aiResponse = await axios.post(`${BASE_URL}/high-impact/ai/recommendations/generate`, {
            preferences: {
                budget: 'medium',
                travelStyle: 'adventure',
                interests: ['culture', 'nature']
            }
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ AI recommendations generated:', aiResponse.data.data.length, 'recommendations');
        
        // Test certificates
        console.log('\n3. Testing Certificates...');
        const certificatesResponse = await axios.get(`${BASE_URL}/high-impact/certificates`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Certificates retrieved:', certificatesResponse.data.data.length, 'certificates');
        
    } catch (error) {
        console.error('❌ High-impact features test failed:', error.response?.data || error.message);
    }
}

async function testMobileAndAnalytics(token) {
    console.log('\n📱 Testing Mobile and Analytics Features...\n');
    
    try {
        // Test mobile config
        console.log('1. Testing Mobile Configuration...');
        const mobileConfigResponse = await axios.get(`${BASE_URL}/mobile/config`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Mobile config retrieved');
        
        // Test analytics dashboard
        console.log('\n2. Testing Analytics Dashboard...');
        const analyticsResponse = await axios.get(`${BASE_URL}/analytics/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ Analytics dashboard retrieved');
        
        // Test UX theme
        console.log('\n3. Testing UX Theme...');
        const themeResponse = await axios.get(`${BASE_URL}/ux/theme`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('✅ UX theme retrieved');
        
    } catch (error) {
        console.error('❌ Mobile and analytics test failed:', error.response?.data || error.message);
    }
}

async function runAllTests() {
    console.log('🧪 Starting Comprehensive API Testing...\n');
    
    // Test authentication
    const authResult = await testAuthEndpoints();
    if (!authResult) {
        console.log('❌ Authentication tests failed, stopping...');
        return;
    }
    
    const { token } = authResult;
    
    // Test blog endpoints
    await testBlogEndpoints(token);
    
    // Test high-impact features
    await testHighImpactFeatures(token);
    
    // Test mobile and analytics
    await testMobileAndAnalytics(token);
    
    console.log('\n🎉 All API tests completed!');
}

// Run tests
runAllTests().catch(console.error);