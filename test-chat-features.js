const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let token = '';
let userId = '';
let secondToken = '';
let secondUserId = '';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}━━━ ${msg} ━━━${colors.reset}\n`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

// Test user search functionality
async function testUserSearch() {
  log.section('Testing User Search Feature');
  
  try {
    // Search for users by name
    log.info('Searching for users...');
    const searchResponse = await axios.get(`${API_URL}/chat/users/search`, {
      params: { query: 'test' },
      headers: { Authorization: `Bearer ${token}` }
    });

    if (searchResponse.data.users && Array.isArray(searchResponse.data.users)) {
      log.success(`Found ${searchResponse.data.users.length} users`);
      searchResponse.data.users.forEach(user => {
        log.info(`  - ${user.name} (${user.email})`);
      });
      return true;
    } else {
      log.error('Invalid search response format');
      return false;
    }
  } catch (error) {
    log.error(`User search failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test creating conversation with searched user
async function testCreateConversationWithUser() {
  log.section('Testing Create Conversation with Searched User');
  
  try {
    // First, search for a user
    const searchResponse = await axios.get(`${API_URL}/chat/users/search`, {
      params: { query: 'test' },
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!searchResponse.data.users || searchResponse.data.users.length === 0) {
      log.warn('No users found to create conversation with');
      return true; // Not a failure, just no users available
    }

    const targetUser = searchResponse.data.users[0];
    log.info(`Creating conversation with: ${targetUser.name}`);

    // Get or create conversation
    const conversationResponse = await axios.get(`${API_URL}/chat/conversations/${targetUser._id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (conversationResponse.data.conversation) {
      log.success('Conversation created/retrieved successfully');
      log.info(`Conversation ID: ${conversationResponse.data.conversation._id}`);
      return true;
    } else {
      log.error('No conversation returned');
      return false;
    }
  } catch (error) {
    log.error(`Create conversation failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test review loading
async function testReviewLoading() {
  log.section('Testing Review Loading');
  
  try {
    // Try to get reviews for a blog (using any targetId for testing)
    log.info('Fetching reviews...');
    const targetId = '507f1f77bcf86cd799439011'; // Sample MongoDB ObjectId
    const reviewResponse = await axios.get(`${API_URL}/reviews/blog/${targetId}`);

    log.success('Reviews endpoint is responding');
    log.info(`Retrieved ${reviewResponse.data.reviews?.length || 0} reviews`);
    
    if (reviewResponse.data.pagination) {
      log.info(`Pagination info: Page ${reviewResponse.data.pagination.currentPage} of ${reviewResponse.data.pagination.totalPages}`);
    }
    
    return true;
  } catch (error) {
    if (error.response?.status === 404 || error.response?.data?.reviews) {
      log.success('Reviews endpoint is working (no reviews found is OK)');
      return true;
    }
    log.error(`Review loading failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Register and login test user
async function setupTestUser() {
  log.section('Setting Up Test User');
  
  try {
    const timestamp = Date.now();
    const testUser = {
      name: `Test User ${timestamp}`,
      email: `testuser${timestamp}@example.com`,
      password: 'Test@12345'
    };

    log.info('Registering test user...');
    const registerResponse = await axios.post(`${API_URL}/auth/register`, testUser);
    
    if (registerResponse.data.token) {
      token = registerResponse.data.token;
      userId = registerResponse.data.user._id;
      log.success(`User registered: ${testUser.name}`);
      return true;
    }
    
    log.error('Registration failed - no token received');
    return false;
  } catch (error) {
    log.error(`User setup failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Main test runner
async function runTests() {
  console.log(`\n${colors.cyan}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  Chat Features & Reviews Test Suite       ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════╝${colors.reset}\n`);

  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };

  const tests = [
    { name: 'Setup Test User', fn: setupTestUser },
    { name: 'User Search', fn: testUserSearch },
    { name: 'Create Conversation', fn: testCreateConversationWithUser },
    { name: 'Review Loading', fn: testReviewLoading }
  ];

  for (const test of tests) {
    results.total++;
    const passed = await test.fn();
    
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Print summary
  log.section('Test Summary');
  console.log(`Total Tests: ${results.total}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  console.log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%\n`);

  if (results.failed === 0) {
    console.log(`${colors.green}🎉 All tests passed!${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠ Some tests failed. Please review the errors above.${colors.reset}\n`);
  }

  process.exit(results.failed === 0 ? 0 : 1);
}

// Run tests
runTests().catch(error => {
  log.error(`Test suite crashed: ${error.message}`);
  console.error(error);
  process.exit(1);
});
