// Quick test to verify travel platform features
// Run this in the browser console when the frontend is loaded

console.log('=== Travel Platform Feature Test ===');

// Test 1: Check if main components are loaded
const testComponents = () => {
  console.log('\n1. Testing Component Availability:');
  
  // Check if React is loaded
  if (typeof React !== 'undefined') {
    console.log('✅ React is loaded');
  } else {
    console.log('❌ React not found');
  }
  
  // Check if Material-UI is available
  try {
    if (window.MaterialUI || document.querySelector('[class*="MuiBox"]')) {
      console.log('✅ Material-UI components detected');
    } else {
      console.log('❌ Material-UI not detected');
    }
  } catch (e) {
    console.log('❌ Error checking Material-UI');
  }
};

// Test 2: Check navigation routes
const testRoutes = () => {
  console.log('\n2. Testing Available Routes:');
  
  const routes = [
    '/', 
    '/search', 
    '/map', 
    '/reviews', 
    '/calendar',
    '/blogs',
    '/profile'
  ];
  
  routes.forEach(route => {
    try {
      const link = document.querySelector(`[href="${route}"]`) || 
                   document.querySelector(`[to="${route}"]`);
      if (link) {
        console.log(`✅ Route ${route} found in navigation`);
      } else {
        console.log(`❌ Route ${route} not found`);
      }
    } catch (e) {
      console.log(`❌ Error checking route ${route}`);
    }
  });
};

// Test 3: Check API connectivity
const testAPI = async () => {
  console.log('\n3. Testing API Connectivity:');
  
  const endpoints = [
    { name: 'Blogs', url: '/api/blogs' },
    { name: 'Categories', url: '/api/categories' },
    { name: 'Health Check', url: '/api/health' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:5000${endpoint.url}`);
      if (response.ok) {
        console.log(`✅ ${endpoint.name} API (${response.status})`);
      } else {
        console.log(`❌ ${endpoint.name} API (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint.name} API (Connection Error)`);
    }
  }
};

// Test 4: Check advanced features
const testAdvancedFeatures = () => {
  console.log('\n4. Testing Advanced Features:');
  
  // Search feature
  const searchElements = document.querySelectorAll('[placeholder*="search" i], [class*="search" i]');
  console.log(searchElements.length > 0 ? '✅ Search elements found' : '❌ No search elements');
  
  // Map feature
  const mapElements = document.querySelectorAll('[class*="map" i], [id*="map" i]');
  console.log(mapElements.length > 0 ? '✅ Map elements found' : '❌ No map elements');
  
  // Calendar feature
  const calendarElements = document.querySelectorAll('[class*="calendar" i], [class*="date" i]');
  console.log(calendarElements.length > 0 ? '✅ Calendar elements found' : '❌ No calendar elements');
  
  // Review feature
  const reviewElements = document.querySelectorAll('[class*="review" i], [class*="rating" i]');
  console.log(reviewElements.length > 0 ? '✅ Review elements found' : '❌ No review elements');
};

// Run all tests
const runAllTests = async () => {
  testComponents();
  testRoutes();
  await testAPI();
  testAdvancedFeatures();
  
  console.log('\n=== Test Complete ===');
  console.log('Open browser DevTools Console to see these results');
};

// Auto-run tests after 2 seconds to allow page to load
setTimeout(runAllTests, 2000);

console.log('Test script loaded. Results will appear in 2 seconds...');