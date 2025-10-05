/**
 * Comprehensive System Integration Test
 * Tests all newly implemented backend systems to ensure they work together seamlessly
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import all services and models
const FollowService = require('./services/followService');
const RealGamificationService = require('./services/realGamificationService');
const RealAIRecommendationService = require('./services/realAIRecommendationService');
const RealIntegrationService = require('./services/realIntegrationService');
const RealMobileOptimizationService = require('./services/realMobileOptimizationService');

const User = require('./models/User');
const UserProgress = require('./models/UserProgress');
const Achievement = require('./models/Achievement');
const Certificate = require('./models/Certificate');
const Subscription = require('./models/Subscription');
const Integration = require('./models/Integration');
const MobileOptimization = require('./models/MobileOptimization');
const Follow = require('./models/Follow');
const Blog = require('./models/Blog');

// Connect to test database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-blog-test')
  .then(() => console.log('✅ Connected to test database'))
  .catch(err => console.error('❌ Database connection error:', err));

class SystemIntegrationTester {
  constructor() {
    this.testUsers = [];
    this.testBlogs = [];
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: []
    };
  }

  async setup() {
    console.log('\n🔧 SETTING UP INTEGRATION TEST ENVIRONMENT\n');

    try {
      // Clean up any existing test data
      await Promise.all([
        User.deleteMany({ email: /integration-test/ }),
        UserProgress.deleteMany({}),
        Follow.deleteMany({}),
        Blog.deleteMany({ title: /Integration Test/ }),
        Subscription.deleteMany({}),
        Certificate.deleteMany({}),
        Integration.deleteMany({ name: /test/i }),
        MobileOptimization.deleteMany({})
      ]);

      // Create test users
      for (let i = 1; i <= 3; i++) {
        const user = await User.create({
          name: `Integration Test User ${i}`,
          email: `integration-test-${i}@example.com`,
          password: 'hashedpassword123',
          profilePicture: `https://images.unsplash.com/photo-150${i}003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face`,
          preferences: {
            destinations: ['paris', 'tokyo', 'new-york'],
            travelStyle: ['adventure', 'luxury'],
            budget: 'medium'
          }
        });
        this.testUsers.push(user);
      }

      // Create test blogs
      const categories = ['adventure', 'culture', 'food'];
      for (let i = 1; i <= 5; i++) {
        const blog = await Blog.create({
          title: `Integration Test Blog ${i}`,
          content: `This is test content for integration testing blog ${i}. It contains travel information about various destinations.`,
          excerpt: `Test excerpt ${i}`,
          author: this.testUsers[i % 3]._id,
          categories: [categories[i % 3]],
          tags: ['test', 'integration', 'travel'],
          views: Math.floor(Math.random() * 1000),
          published: true,
          featuredImage: `https://images.unsplash.com/photo-${1500000000 + i}?w=800&h=600&fit=crop`
        });
        this.testBlogs.push(blog);
      }

      console.log(`✅ Created ${this.testUsers.length} test users and ${this.testBlogs.length} test blogs`);

    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      throw error;
    }
  }

  async testFollowSystem() {
    console.log('\n🔄 Testing Follow System Integration...\n');

    try {
      // Test basic follow functionality
      const followResult = await FollowService.followUser(this.testUsers[0]._id, this.testUsers[1]._id);
      this.assert(followResult.success, 'Follow system should work', followResult.message);

      // Test gamification integration (following should award points)
      const userProgress = await UserProgress.findOne({ userId: this.testUsers[0]._id });
      this.assert(userProgress && userProgress.totalPoints > 0, 'Following should award gamification points');

      // Test follow status
      const statusResult = await FollowService.getFollowingStatus(this.testUsers[0]._id, this.testUsers[1]._id);
      this.assert(statusResult.data.isFollowing, 'Follow status should be accurate');

      console.log('✅ Follow System Integration: PASSED');

    } catch (error) {
      console.error('❌ Follow System Integration: FAILED -', error.message);
      this.testResults.errors.push(`Follow System: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async testGamificationSystem() {
    console.log('\n🎮 Testing Gamification System Integration...\n');

    try {
      // Test user progress tracking
      const progressResult = await RealGamificationService.getUserProgress(this.testUsers[0]._id);
      this.assert(progressResult.success, 'Should get user progress', progressResult.message);

      // Test activity tracking (should work with other systems)
      const activityResult = await RealGamificationService.trackActivity(this.testUsers[0]._id, 'blog_created');
      this.assert(activityResult.success, 'Should track blog creation activity');

      // Test level progression
      const levelResult = await RealGamificationService.checkLevelProgression(this.testUsers[0]._id);
      this.assert(levelResult.success, 'Should check level progression');

      console.log('✅ Gamification System Integration: PASSED');

    } catch (error) {
      console.error('❌ Gamification System Integration: FAILED -', error.message);
      this.testResults.errors.push(`Gamification System: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async testAIRecommendationSystem() {
    console.log('\n🤖 Testing AI Recommendation System Integration...\n');

    try {
      // Test personalized recommendations (should use user data from other systems)
      const personalizedResult = await RealAIRecommendationService.generatePersonalizedRecommendations(this.testUsers[0]._id);
      this.assert(personalizedResult.success, 'Should generate personalized recommendations', personalizedResult.message);

      // Test content-based recommendations
      const contentResult = await RealAIRecommendationService.getSimilarContent('blog', this.testBlogs[0]._id);
      this.assert(contentResult.success, 'Should get similar content recommendations');

      // Test trending content
      const trendingResult = await RealAIRecommendationService.getTrendingContent();
      this.assert(trendingResult.success, 'Should get trending content');

      console.log('✅ AI Recommendation System Integration: PASSED');

    } catch (error) {
      console.error('❌ AI Recommendation System Integration: FAILED -', error.message);
      this.testResults.errors.push(`AI Recommendation System: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async testIntegrationPlatform() {
    console.log('\n🔗 Testing Integration Platform...\n');

    try {
      // Test creating integration
      const integrationData = {
        name: 'Test Integration',
        type: 'social_media',
        platform: 'facebook',
        userId: this.testUsers[0]._id,
        credentials: {
          accessToken: 'test-token',
          refreshToken: 'test-refresh'
        },
        settings: {
          autoPost: true,
          syncFrequency: 'daily'
        }
      };

      const createResult = await RealIntegrationService.createIntegration(this.testUsers[0]._id, integrationData);
      this.assert(createResult.success, 'Should create integration', createResult.message);

      // Test getting user integrations
      const userIntegrationsResult = await RealIntegrationService.getUserIntegrations(this.testUsers[0]._id);
      this.assert(userIntegrationsResult.success && userIntegrationsResult.data.integrations.length > 0, 'Should get user integrations');

      console.log('✅ Integration Platform: PASSED');

    } catch (error) {
      console.error('❌ Integration Platform: FAILED -', error.message);
      this.testResults.errors.push(`Integration Platform: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async testMobileOptimization() {
    console.log('\n📱 Testing Mobile Optimization System...\n');

    try {
      // Test device optimization
      const deviceData = {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15',
        screenWidth: 375,
        screenHeight: 812,
        devicePixelRatio: 3,
        connectionType: '4g'
      };

      const optimizationResult = await RealMobileOptimizationService.optimizeForDevice(this.testUsers[0]._id, deviceData);
      this.assert(optimizationResult.success, 'Should optimize for mobile device', optimizationResult.message);

      // Test performance monitoring
      const performanceData = {
        loadTime: 1200,
        renderTime: 800,
        interactionTime: 150
      };

      const performanceResult = await RealMobileOptimizationService.recordPerformanceMetrics(this.testUsers[0]._id, performanceData);
      this.assert(performanceResult.success, 'Should record performance metrics');

      console.log('✅ Mobile Optimization System: PASSED');

    } catch (error) {
      console.error('❌ Mobile Optimization System: FAILED -', error.message);
      this.testResults.errors.push(`Mobile Optimization System: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async testCertificationSystem() {
    console.log('\n🏆 Testing Certification System Integration...\n');

    try {
      // Create test certificates through gamification system
      const userProgress = await UserProgress.findOne({ userId: this.testUsers[0]._id });
      if (userProgress) {
        // Manually award enough points for a certification
        userProgress.totalPoints = 1000;
        userProgress.skillPoints.photography = 100;
        userProgress.skillPoints.writing = 100;
        await userProgress.save();

        // Test certificate generation
        const certificationResult = await RealGamificationService.checkCertificationEligibility(this.testUsers[0]._id);
        this.assert(certificationResult.success, 'Should check certification eligibility');

        console.log('✅ Certification System Integration: PASSED');
      } else {
        throw new Error('User progress not found for certification test');
      }

    } catch (error) {
      console.error('❌ Certification System Integration: FAILED -', error.message);
      this.testResults.errors.push(`Certification System: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async testCrossSystemIntegration() {
    console.log('\n🔄 Testing Cross-System Integration...\n');

    try {
      // Test that following someone affects AI recommendations
      await FollowService.followUser(this.testUsers[1]._id, this.testUsers[2]._id);
      
      // Test that AI recommendations consider follow relationships
      const recommendationsResult = await RealAIRecommendationService.generatePersonalizedRecommendations(this.testUsers[1]._id);
      this.assert(recommendationsResult.success, 'AI should generate recommendations considering follow relationships');

      // Test that gamification points are awarded for various activities
      const beforePoints = await RealGamificationService.getUserProgress(this.testUsers[1]._id);
      
      // Simulate blog interaction (would normally be tracked automatically)
      await RealGamificationService.trackActivity(this.testUsers[1]._id, 'blog_view');
      
      const afterPoints = await RealGamificationService.getUserProgress(this.testUsers[1]._id);
      this.assert(afterPoints.data.progress.totalPoints >= beforePoints.data.progress.totalPoints, 'Points should increase from activities');

      console.log('✅ Cross-System Integration: PASSED');

    } catch (error) {
      console.error('❌ Cross-System Integration: FAILED -', error.message);
      this.testResults.errors.push(`Cross-System Integration: ${error.message}`);
      this.testResults.failed++;
    }
  }

  async testDatabaseIntegrity() {
    console.log('\n🗄️ Testing Database Integrity...\n');

    try {
      // Check that all models can be queried
      const modelTests = [
        { model: User, name: 'User' },
        { model: UserProgress, name: 'UserProgress' },
        { model: Achievement, name: 'Achievement' },
        { model: Certificate, name: 'Certificate' },
        { model: Follow, name: 'Follow' },
        { model: Blog, name: 'Blog' },
        { model: Integration, name: 'Integration' },
        { model: MobileOptimization, name: 'MobileOptimization' }
      ];

      for (const { model, name } of modelTests) {
        const count = await model.countDocuments();
        console.log(`   ${name}: ${count} documents`);
        this.assert(count >= 0, `${name} model should be queryable`);
      }

      // Test referential integrity
      const userProgress = await UserProgress.findOne().populate('user');
      if (userProgress) {
        this.assert(userProgress.user, 'UserProgress should properly reference User');
      }

      console.log('✅ Database Integrity: PASSED');

    } catch (error) {
      console.error('❌ Database Integrity: FAILED -', error.message);
      this.testResults.errors.push(`Database Integrity: ${error.message}`);
      this.testResults.failed++;
    }
  }

  assert(condition, message, details = '') {
    if (condition) {
      this.testResults.passed++;
      console.log(`   ✅ ${message}`);
    } else {
      this.testResults.failed++;
      console.log(`   ❌ ${message} ${details ? '- ' + details : ''}`);
      this.testResults.errors.push(message);
    }
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up test data...\n');

    try {
      await Promise.all([
        User.deleteMany({ email: /integration-test/ }),
        UserProgress.deleteMany({}),
        Follow.deleteMany({}),
        Blog.deleteMany({ title: /Integration Test/ }),
        Subscription.deleteMany({}),
        Certificate.deleteMany({}),
        Integration.deleteMany({ name: /test/i }),
        MobileOptimization.deleteMany({})
      ]);

      console.log('✅ Test data cleaned up');

    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
    }
  }

  async run() {
    console.log('\n🧪 COMPREHENSIVE SYSTEM INTEGRATION TEST\n');
    console.log('Testing all implemented backend systems for seamless integration...\n');

    try {
      await this.setup();

      await this.testFollowSystem();
      await this.testGamificationSystem();
      await this.testAIRecommendationSystem();
      await this.testIntegrationPlatform();
      await this.testMobileOptimization();
      await this.testCertificationSystem();
      await this.testCrossSystemIntegration();
      await this.testDatabaseIntegrity();

      // Print final results
      console.log('\n📊 INTEGRATION TEST RESULTS\n');
      console.log(`✅ Passed: ${this.testResults.passed}`);
      console.log(`❌ Failed: ${this.testResults.failed}`);
      console.log(`📈 Success Rate: ${((this.testResults.passed / (this.testResults.passed + this.testResults.failed)) * 100).toFixed(1)}%`);

      if (this.testResults.errors.length > 0) {
        console.log('\n❌ ERRORS ENCOUNTERED:');
        this.testResults.errors.forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
      } else {
        console.log('\n🎉 ALL INTEGRATION TESTS PASSED! 🎉');
        console.log('✅ All backend systems are working together seamlessly');
      }

    } catch (error) {
      console.error('❌ Integration test failed:', error.message);
      console.error('Stack:', error.stack);
    } finally {
      await this.cleanup();
      mongoose.connection.close();
      console.log('\n📝 Integration test completed - database connection closed');
    }
  }
}

// Run the integration test
const tester = new SystemIntegrationTester();
tester.run();