/**
 * Frontend Route Testing
 * Tests all newly added feature routes
 */

const axios = require('axios');

const FRONTEND_URL = 'http://localhost:3000';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.magenta}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`)
};

async function testRoute(path, name) {
  try {
    const response = await axios.get(`${FRONTEND_URL}${path}`, {
      timeout: 10000,
      validateStatus: (status) => status < 500 // Accept any status < 500
    });
    
    if (response.status === 200) {
      log.success(`${name} (${path}) - Accessible`);
      return true;
    } else {
      log.error(`${name} (${path}) - Status: ${response.status}`);
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      log.error(`${name} (${path}) - Server not running`);
    } else if (error.code === 'ETIMEDOUT') {
      log.error(`${name} (${path}) - Timeout`);
    } else {
      log.error(`${name} (${path}) - ${error.message}`);
    }
    return false;
  }
}

async function testFrontendRoutes() {
  log.section('FRONTEND ROUTES TEST');
  
  const routes = [
    { path: '/', name: 'Home Page' },
    { path: '/login', name: 'Login Page' },
    { path: '/register', name: 'Register Page' },
    { path: '/blogs', name: 'Blogs Page' },
    { path: '/chat', name: 'Chat Page (NEW)' },
    { path: '/gallery', name: 'Gallery Page (NEW)' },
    { path: '/itinerary', name: 'Itinerary Page (NEW)' },
    { path: '/reviews', name: 'Reviews Page (NEW)' },
    { path: '/packages', name: 'Packages Page' },
    { path: '/countries', name: 'Countries Page' }
  ];
  
  let passed = 0;
  let failed = 0;
  
  log.info('Testing frontend routes...\n');
  
  for (const route of routes) {
    const result = await testRoute(route.path, route.name);
    if (result) {
      passed++;
    } else {
      failed++;
    }
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  log.section('RESULTS');
  console.log(`${colors.blue}Total Routes: ${routes.length}${colors.reset}`);
  console.log(`${colors.green}Accessible: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  
  const successRate = ((passed / routes.length) * 100).toFixed(1);
  console.log(`\n${colors.magenta}Success Rate: ${successRate}%${colors.reset}\n`);
  
  if (failed === 0) {
    console.log(`${colors.green}
╔════════════════════════════════════════════════════════════╗
║  ✓ ALL FRONTEND ROUTES ACCESSIBLE!                        ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);
  } else {
    console.log(`${colors.red}
╔════════════════════════════════════════════════════════════╗
║  Some routes failed - check if server is fully started     ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);
  }
}

// Wait a bit for server to be ready
setTimeout(() => {
  testFrontendRoutes().catch(error => {
    log.error(`Test suite crashed: ${error.message}`);
    process.exit(1);
  });
}, 3000); // Wait 3 seconds for server to start

console.log(`${colors.blue}Waiting for frontend server to be ready...${colors.reset}`);
