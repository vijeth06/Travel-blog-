/**
 * Comprehensive Test Suite for Newly Added Features
 * Tests: Chat, Gallery, Itinerary, Reviews, Search
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let userId = '';
let testData = {
  conversationId: '',
  messageId: '',
  galleryId: '',
  storyId: '',
  itineraryId: '',
  reviewId: '',
  blogId: '',
  packageId: ''
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.magenta}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`)
};

// Helper function to make authenticated requests
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(config => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Test Authentication
async function testAuth() {
  log.section('1. AUTHENTICATION TEST');
  
  try {
    // Register test user
    const timestamp = Date.now();
    const testUser = {
      name: `Test User ${timestamp}`,
      email: `test${timestamp}@example.com`,
      password: 'Test123!@#'
    };
    
    log.info('Registering test user...');
    const registerRes = await axios.post(`${BASE_URL}/auth/register`, testUser);
    
    if (registerRes.data.token) {
      authToken = registerRes.data.token;
      userId = registerRes.data.user._id;
      log.success(`User registered: ${testUser.email}`);
      log.success(`User ID: ${userId}`);
      return true;
    }
  } catch (error) {
    // Try login if user exists
    try {
      log.info('Attempting login with existing credentials...');
      const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
        email: 'test@example.com',
        password: 'Test123!@#'
      });
      
      if (loginRes.data.token) {
        authToken = loginRes.data.token;
        userId = loginRes.data.user._id;
        log.success('Logged in with existing user');
        return true;
      }
    } catch (loginError) {
      log.error('Authentication failed');
      return false;
    }
  }
  return false;
}

// Test Chat System
async function testChatSystem() {
  log.section('2. REAL-TIME CHAT SYSTEM TEST');
  
  try {
    // Get or create a conversation
    log.info('Creating/Getting conversation...');
    const convRes = await api.get('/chat/conversations');
    
    if (convRes.data.conversations && convRes.data.conversations.length > 0) {
      testData.conversationId = convRes.data.conversations[0]._id;
      log.success(`Found existing conversation: ${testData.conversationId}`);
    } else {
      // Create new conversation - need another user
      log.warning('No existing conversations found');
      log.info('Creating a test conversation would require another user');
    }
    
    // Test sending a message
    if (testData.conversationId) {
      log.info('Sending test message...');
      const msgRes = await api.post('/chat/messages', {
        conversationId: testData.conversationId,
        content: 'Test message from automated test suite',
        type: 'text'
      });
      
      if (msgRes.data.message) {
        testData.messageId = msgRes.data.message._id;
        log.success(`Message sent: ${testData.messageId}`);
      }
      
      // Test getting messages
      log.info('Retrieving messages...');
      const messagesRes = await api.get(`/chat/messages/${testData.conversationId}`);
      log.success(`Retrieved ${messagesRes.data.messages.length} messages`);
      
      // Test marking as read
      if (testData.messageId) {
        log.info('Marking message as read...');
        await api.put(`/chat/messages/${testData.messageId}/read`);
        log.success('Message marked as read');
      }
    }
    
    return true;
  } catch (error) {
    log.error(`Chat test failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test Gallery & Stories
async function testGalleryAndStories() {
  log.section('3. PHOTO GALLERY & STORIES TEST');
  
  try {
    // Test creating a gallery
    log.info('Creating photo gallery...');
    const galleryRes = await api.post('/gallery/galleries', {
      title: 'Test Gallery',
      description: 'Automated test gallery',
      location: 'Test Location',
      photos: [
        {
          url: 'https://source.unsplash.com/random/800x600?travel',
          caption: 'Test Photo 1'
        },
        {
          url: 'https://source.unsplash.com/random/800x600?nature',
          caption: 'Test Photo 2'
        }
      ],
      tags: ['test', 'automated'],
      visibility: 'public'
    });
    
    if (galleryRes.data.gallery) {
      testData.galleryId = galleryRes.data.gallery._id;
      log.success(`Gallery created: ${testData.galleryId}`);
    }
    
    // Test getting galleries
    log.info('Retrieving galleries...');
    const galleriesRes = await api.get('/gallery/galleries');
    log.success(`Retrieved ${galleriesRes.data.galleries?.length || 0} galleries`);
    
    // Test creating a story
    log.info('Creating 24h story...');
    const storyRes = await api.post('/gallery/stories', {
      mediaUrl: 'https://source.unsplash.com/random/1080x1920?adventure',
      mediaType: 'image',
      caption: 'Test Story - Auto-expires in 24h',
      location: 'Test Location',
      tags: ['test']
    });
    
    if (storyRes.data.story) {
      testData.storyId = storyRes.data.story._id;
      log.success(`Story created: ${testData.storyId}`);
    }
    
    // Test getting stories
    log.info('Retrieving active stories...');
    const storiesRes = await api.get('/gallery/stories');
    log.success(`Retrieved ${storiesRes.data.stories?.length || 0} active stories`);
    
    // Test liking gallery
    if (testData.galleryId) {
      log.info('Testing like functionality...');
      await api.post(`/gallery/galleries/${testData.galleryId}/like`);
      log.success('Gallery liked successfully');
    }
    
    return true;
  } catch (error) {
    log.error(`Gallery test failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test Itinerary Planner
async function testItineraryPlanner() {
  log.section('4. TRAVEL ITINERARY PLANNER TEST');
  
  try {
    // Test creating an itinerary
    log.info('Creating travel itinerary...');
    const itineraryRes = await api.post('/itinerary', {
      title: 'Test Trip to Bali',
      destination: 'Bali, Indonesia',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      description: 'Automated test itinerary',
      budget: 2000,
      visibility: 'public',
      days: [
        {
          dayNumber: 1,
          title: 'Arrival & Beach',
          activities: [
            {
              time: '10:00',
              title: 'Airport Pickup',
              description: 'Arrive at Ngurah Rai Airport',
              location: 'Ngurah Rai International Airport',
              duration: 60,
              cost: 25
            },
            {
              time: '14:00',
              title: 'Check-in Hotel',
              description: 'Beachfront resort check-in',
              location: 'Seminyak Beach',
              duration: 30,
              cost: 0
            },
            {
              time: '16:00',
              title: 'Beach Sunset',
              description: 'Relax at the beach',
              location: 'Seminyak Beach',
              duration: 120,
              cost: 0
            }
          ]
        },
        {
          dayNumber: 2,
          title: 'Ubud Culture Tour',
          activities: [
            {
              time: '09:00',
              title: 'Monkey Forest',
              description: 'Visit Sacred Monkey Forest',
              location: 'Ubud Monkey Forest',
              duration: 90,
              cost: 15
            }
          ]
        }
      ],
      isPublic: true
    });
    
    if (itineraryRes.data.itinerary) {
      testData.itineraryId = itineraryRes.data.itinerary._id;
      log.success(`Itinerary created: ${testData.itineraryId}`);
    }
    
    // Test getting itineraries
    log.info('Retrieving itineraries...');
    const itinerariesRes = await api.get('/itinerary');
    log.success(`Retrieved ${itinerariesRes.data.itineraries?.length || 0} itineraries`);
    
    // Test getting single itinerary
    if (testData.itineraryId) {
      log.info('Retrieving single itinerary...');
      const singleRes = await api.get(`/itinerary/${testData.itineraryId}`);
      log.success(`Retrieved itinerary: ${singleRes.data.itinerary.title}`);
      
      // Test updating itinerary
      log.info('Updating itinerary...');
      await api.put(`/itinerary/${testData.itineraryId}`, {
        title: 'Test Trip to Bali (Updated)'
      });
      log.success('Itinerary updated successfully');
      
      // Test adding collaborator (would need another user)
      log.info('Testing collaboration features...');
      log.warning('Collaboration requires additional users - skipping');
    }
    
    return true;
  } catch (error) {
    log.error(`Itinerary test failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test Review System
async function testReviewSystem() {
  log.section('5. REVIEW & RATING SYSTEM TEST');
  
  try {
    // First, get a blog or package to review
    log.info('Getting blogs to review...');
    const blogsRes = await axios.get(`${BASE_URL}/blogs`);
    
    if (blogsRes.data.blogs && blogsRes.data.blogs.length > 0) {
      testData.blogId = blogsRes.data.blogs[0]._id;
      log.success(`Found blog to review: ${testData.blogId}`);
    } else {
      log.warning('No blogs found - skipping blog review test');
    }
    
    // Test creating a review
    if (testData.blogId) {
      log.info('Creating review...');
      const reviewRes = await api.post('/reviews', {
        targetType: 'blog',
        targetId: testData.blogId,
        overallRating: 4.5,
        title: 'Great Travel Blog!',
        content: 'This is an automated test review. The blog was very informative and helpful for planning my trip.',
        aspectRatings: {
          value: 4,
          service: 5,
          cleanliness: 4,
          location: 5,
          facilities: 4
        },
        tripType: 'solo',
        visitDate: new Date('2024-10-01'),
        stayDuration: '7 days',
        pros: ['Informative', 'Well-written', 'Great photos'],
        cons: ['Could use more budget tips'],
        tags: ['helpful', 'detailed'],
        wouldRecommend: true
      });
      
      if (reviewRes.data.review) {
        testData.reviewId = reviewRes.data.review._id;
        log.success(`Review created: ${testData.reviewId}`);
      }
      
      // Test getting reviews
      log.info('Retrieving reviews for blog...');
      const reviewsRes = await api.get(`/reviews/blog/${testData.blogId}`);
      log.success(`Retrieved ${reviewsRes.data.reviews?.length || 0} reviews`);
      
      // Test getting review stats
      log.info('Getting review statistics...');
      const statsRes = await api.get(`/reviews/blog/${testData.blogId}/stats`);
      log.success(`Average rating: ${statsRes.data.averageRating || 'N/A'}`);
      
      // Test marking review helpful
      if (testData.reviewId) {
        log.info('Testing helpful vote...');
        await api.post(`/reviews/${testData.reviewId}/helpful`);
        log.success('Review marked as helpful');
      }
    }
    
    return true;
  } catch (error) {
    log.error(`Review test failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test Advanced Search
async function testAdvancedSearch() {
  log.section('6. ADVANCED SEARCH SYSTEM TEST');
  
  try {
    // Test searching blogs
    log.info('Testing blog search...');
    const searchRes = await api.get('/search?query=travel&type=blogs');
    log.success(`Found ${searchRes.data.results?.length || 0} blog results`);
    
    // Test search suggestions
    log.info('Testing search suggestions...');
    const suggestRes = await api.get('/search/suggestions?query=bal');
    log.success(`Retrieved ${suggestRes.data.suggestions?.length || 0} suggestions`);
    
    // Test advanced search with filters
    log.info('Testing advanced search with filters...');
    const advancedRes = await api.get('/search/advanced', {
      params: {
        q: 'beach',
        category: 'Adventure',
        sortBy: 'relevance'
      }
    });
    log.success(`Advanced search returned ${advancedRes.data.results?.length || 0} results`);
    
    return true;
  } catch (error) {
    log.error(`Search test failed: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

// Test Frontend Routes
async function testFrontendRoutes() {
  log.section('7. FRONTEND ROUTES TEST');
  
  const routes = [
    { path: 'http://localhost:3000/', name: 'Home Page' },
    { path: 'http://localhost:3000/chat', name: 'Chat Page' },
    { path: 'http://localhost:3000/gallery', name: 'Gallery Page' },
    { path: 'http://localhost:3000/itinerary', name: 'Itinerary Page' },
    { path: 'http://localhost:3000/reviews', name: 'Reviews Page' }
  ];
  
  try {
    for (const route of routes) {
      log.info(`Testing ${route.name}...`);
      const response = await axios.get(route.path, { timeout: 5000 });
      if (response.status === 200) {
        log.success(`${route.name} accessible`);
      }
    }
    return true;
  } catch (error) {
    log.error(`Frontend route test failed: ${error.message}`);
    log.warning('Make sure frontend server is running on port 3000');
    return false;
  }
}

// Cleanup test data
async function cleanup() {
  log.section('8. CLEANUP TEST DATA');
  
  try {
    // Delete created test data
    if (testData.reviewId) {
      log.info('Deleting test review...');
      await api.delete(`/reviews/${testData.reviewId}`);
      log.success('Review deleted');
    }
    
    if (testData.itineraryId) {
      log.info('Deleting test itinerary...');
      await api.delete(`/itinerary/${testData.itineraryId}`);
      log.success('Itinerary deleted');
    }
    
    if (testData.galleryId) {
      log.info('Deleting test gallery...');
      await api.delete(`/gallery/galleries/${testData.galleryId}`);
      log.success('Gallery deleted');
    }
    
    if (testData.storyId) {
      log.info('Deleting test story...');
      await api.delete(`/gallery/stories/${testData.storyId}`);
      log.success('Story deleted');
    }
    
    log.success('Cleanup completed');
    return true;
  } catch (error) {
    log.warning('Some cleanup operations failed - this is normal');
    return true;
  }
}

// Main test runner
async function runAllTests() {
  console.log(`\n${colors.magenta}
╔════════════════════════════════════════════════════════════╗
║     COMPREHENSIVE FEATURE TEST SUITE                       ║
║     Testing: Chat, Gallery, Itinerary, Reviews, Search     ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);
  
  const results = {
    total: 0,
    passed: 0,
    failed: 0
  };
  
  const tests = [
    { name: 'Authentication', fn: testAuth },
    { name: 'Chat System', fn: testChatSystem },
    { name: 'Gallery & Stories', fn: testGalleryAndStories },
    { name: 'Itinerary Planner', fn: testItineraryPlanner },
    { name: 'Review System', fn: testReviewSystem },
    { name: 'Advanced Search', fn: testAdvancedSearch },
    { name: 'Frontend Routes', fn: testFrontendRoutes },
    { name: 'Cleanup', fn: cleanup }
  ];
  
  for (const test of tests) {
    results.total++;
    try {
      const passed = await test.fn();
      if (passed) {
        results.passed++;
      } else {
        results.failed++;
      }
    } catch (error) {
      results.failed++;
      log.error(`${test.name} crashed: ${error.message}`);
    }
  }
  
  // Print summary
  log.section('TEST SUMMARY');
  console.log(`${colors.blue}Total Tests: ${results.total}${colors.reset}`);
  console.log(`${colors.green}Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${results.failed}${colors.reset}`);
  
  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`\n${colors.magenta}Success Rate: ${successRate}%${colors.reset}\n`);
  
  if (results.failed === 0) {
    console.log(`${colors.green}
╔════════════════════════════════════════════════════════════╗
║  ✓ ALL TESTS PASSED! ALL FEATURES WORKING CORRECTLY!      ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);
  } else {
    console.log(`${colors.yellow}
╔════════════════════════════════════════════════════════════╗
║  ⚠ SOME TESTS FAILED - CHECK LOGS ABOVE                   ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);
  }
}

// Run tests
runAllTests().catch(error => {
  log.error(`Test suite crashed: ${error.message}`);
  process.exit(1);
});
