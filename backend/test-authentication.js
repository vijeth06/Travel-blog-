const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
let authToken = '';
let testUserId = '';

// Test user data
const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'testpassword123'
};

async function testAuthentication() {
    console.log('🔐 Testing Authentication Endpoints...\n');
    
    try {
        // Test user registration
        console.log('1. Testing user registration...');
        const registerResponse = await axios.post(`${API_BASE}/auth/register`, testUser);
        
        if (registerResponse.status === 201) {
            console.log('✅ User registration successful');
            authToken = registerResponse.data.token;
            testUserId = registerResponse.data.user.id;
            console.log(`   Token: ${authToken.substring(0, 20)}...`);
        }
        
    } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
            console.log('⚠️  User already exists, testing login instead...');
            
            // Test user login
            console.log('2. Testing user login...');
            const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
                email: testUser.email,
                password: testUser.password
            });
            
            if (loginResponse.status === 200) {
                console.log('✅ User login successful');
                authToken = loginResponse.data.token;
                testUserId = loginResponse.data.user.id;
                console.log(`   Token: ${authToken.substring(0, 20)}...`);
            }
        } else {
            console.error('❌ Registration failed:', error.response?.data?.message || error.message);
            return false;
        }
    }
    
    // Test protected route
    console.log('3. Testing protected route access...');
    try {
        const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (profileResponse.status === 200) {
            console.log('✅ Protected route access successful');
            console.log(`   User: ${profileResponse.data.name} (${profileResponse.data.email})`);
            return true;
        }
    } catch (error) {
        console.error('❌ Protected route access failed:', error.response?.data?.message || error.message);
        return false;
    }
}

async function testBasicEndpoints() {
    console.log('\n📊 Testing Basic API Endpoints...\n');
    
    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await axios.get(`${API_BASE}/health`);
        if (healthResponse.status === 200) {
            console.log('✅ Health endpoint working');
        }
        
        // Test categories endpoint
        console.log('2. Testing categories endpoint...');
        const categoriesResponse = await axios.get(`${API_BASE}/categories`);
        if (categoriesResponse.status === 200) {
            console.log(`✅ Categories endpoint working (${categoriesResponse.data.length} categories)`);
        }
        
        // Test blogs endpoint
        console.log('3. Testing blogs endpoint...');
        const blogsResponse = await axios.get(`${API_BASE}/blogs`);
        if (blogsResponse.status === 200) {
            console.log(`✅ Blogs endpoint working (${blogsResponse.data.blogs?.length || 0} blogs)`);
        }
        
        return true;
    } catch (error) {
        console.error('❌ Basic endpoint test failed:', error.response?.data?.message || error.message);
        return false;
    }
}

async function runTests() {
    console.log('🚀 Starting API Endpoint Testing...\n');
    console.log('Server: http://localhost:5000');
    console.log('Time:', new Date().toISOString());
    console.log('=' .repeat(50));
    
    const authPassed = await testAuthentication();
    const basicPassed = await testBasicEndpoints();
    
    console.log('\n' + '='.repeat(50));
    console.log('📈 Test Results Summary:');
    console.log(`Authentication Tests: ${authPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Basic Endpoint Tests: ${basicPassed ? '✅ PASSED' : '❌ FAILED'}`);
    console.log(`Overall: ${authPassed && basicPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
    
    return { authPassed, basicPassed, authToken, testUserId };
}

// Export for use in other test files
module.exports = { runTests, testUser };

// Run if called directly
if (require.main === module) {
    runTests().then((results) => {
        process.exit(results.authPassed && results.basicPassed ? 0 : 1);
    }).catch((error) => {
        console.error('❌ Test runner failed:', error);
        process.exit(1);
    });
}