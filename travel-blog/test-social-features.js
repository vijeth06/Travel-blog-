const axios = require('axios');
const io = require('socket.io-client');

class SocialFeaturesTester {
  constructor() {
    this.baseURL = 'http://localhost:5000/api';
    this.frontendURL = 'http://localhost:3000';
    this.socket = null;
    this.authToken = null;
    this.testUsers = [];
    this.testBlogs = [];
  }

  async setup() {
    console.log('🚀 Setting up Social Features Test...\n');
    
    // Connect socket
    this.socket = io('http://localhost:5000');
    
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
    });

    // Wait for connection
    await new Promise(resolve => {
      if (this.socket.connected) {
        resolve();
      } else {
        this.socket.on('connect', resolve);
      }
    });
  }

  async testAuthentication() {
    console.log('🔐 Testing Authentication...');
    
    try {
      // Register test user
      const registerResponse = await axios.post(`${this.baseURL}/auth/register`, {
        name: 'Test User ' + Date.now(),
        email: 'test_' + Date.now() + '@test.com',
        password: 'password123'
      });

      if (registerResponse.data.token) {
        this.authToken = registerResponse.data.token;
        console.log('✅ User registration successful');
        return true;
      }
    } catch (error) {
      console.log('❌ Authentication error:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async testFollowFeature() {
    console.log('\n👥 Testing Follow Feature...');
    
    try {
      // Create another test user to follow
      const secondUserResponse = await axios.post(`${this.baseURL}/auth/register`, {
        name: 'Follow User ' + Date.now(),
        email: 'follow_' + Date.now() + '@test.com',
        password: 'password123'
      });

      const userToFollowId = secondUserResponse.data.user.id;

      // Test following
      const followResponse = await axios.post(
        `${this.baseURL}/social/follow`,
        { userId: userToFollowId },
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );

      if (followResponse.data.success) {
        console.log('✅ Follow feature working');
        
        // Test follow status
        const statusResponse = await axios.get(
          `${this.baseURL}/social/following-status/${userToFollowId}`,
          { headers: { Authorization: `Bearer ${this.authToken}` } }
        );

        if (statusResponse.data.isFollowing) {
          console.log('✅ Follow status check working');
          
          // Test unfollow
          const unfollowResponse = await axios.post(
            `${this.baseURL}/social/unfollow`,
            { userId: userToFollowId },
            { headers: { Authorization: `Bearer ${this.authToken}` } }
          );

          if (unfollowResponse.data.success) {
            console.log('✅ Unfollow feature working');
            return true;
          }
        }
      }
    } catch (error) {
      console.log('❌ Follow feature error:', error.response?.data?.message || error.message);
      if (error.response?.data) {
        console.log('Full error response:', error.response.data);
      }
      return false;
    }
  }

  async testLikeFeature() {
    console.log('\n❤️ Testing Like Feature...');
    
    try {
      // Create a test blog first
      const blogResponse = await axios.post(
        `${this.baseURL}/blogs`,
        {
          title: 'Test Blog for Likes',
          content: 'This is a test blog post for testing the like feature.',
          category: '6898c1e0b1c3165a37ee9331' // Adventure category
        },
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );

      const blogId = blogResponse.data._id;

      // Test liking
      const likeResponse = await axios.post(
        `${this.baseURL}/likes`,
        {
          targetId: blogId,
          targetType: 'Blog'
        },
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );

      if (likeResponse.data.success) {
        console.log('✅ Like feature working');
        
        // Test unlike
        const unlikeResponse = await axios.delete(
          `${this.baseURL}/likes`,
          {
            data: {
              targetId: blogId,
              targetType: 'Blog'
            },
            headers: { Authorization: `Bearer ${this.authToken}` }
          }
        );

        if (unlikeResponse.data.success) {
          console.log('✅ Unlike feature working');
          return true;
        }
      }
    } catch (error) {
      console.log('❌ Like feature error:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async testSocialFeed() {
    console.log('\n📰 Testing Social Feed...');
    
    try {
      const feedResponse = await axios.get(
        `${this.baseURL}/social/feed`,
        { headers: { Authorization: `Bearer ${this.authToken}` } }
      );

      if (feedResponse.data && Array.isArray(feedResponse.data)) {
        console.log('✅ Social feed loading successfully');
        console.log(`📊 Feed contains ${feedResponse.data.length} items`);
        return true;
      }
    } catch (error) {
      console.log('❌ Social feed error:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async testRealTimeFeatures() {
    console.log('\n⚡ Testing Real-time Features...');
    
    return new Promise((resolve) => {
      let testsCompleted = 0;
      const expectedTests = 3;

      // Test follow event
      this.socket.on('follow-updated', (data) => {
        console.log('✅ Real-time follow event received:', data);
        testsCompleted++;
        if (testsCompleted >= expectedTests) resolve(true);
      });

      // Test like event
      this.socket.on('like-updated', (data) => {
        console.log('✅ Real-time like event received:', data);
        testsCompleted++;
        if (testsCompleted >= expectedTests) resolve(true);
      });

      // Test notification event
      this.socket.on('new-notification', (data) => {
        console.log('✅ Real-time notification received:', data);
        testsCompleted++;
        if (testsCompleted >= expectedTests) resolve(true);
      });

      // Emit test events
      this.socket.emit('follow-action', {
        followerId: 'test123',
        followedUserId: 'test456',
        followerName: 'Test User',
        following: true
      });

      this.socket.emit('new-like', {
        userId: 'test123',
        userName: 'Test User',
        targetId: 'blog123',
        targetType: 'Blog',
        authorId: 'author123'
      });

      // Timeout after 3 seconds
      setTimeout(() => {
        if (testsCompleted === 0) {
          console.log('❌ No real-time events received');
          resolve(false);
        } else {
          console.log(`✅ ${testsCompleted}/${expectedTests} real-time tests passed`);
          resolve(true);
        }
      }, 3000);
    });
  }

  async testShareFeature() {
    console.log('\n🔗 Testing Share Feature...');
    
    try {
      const shareResponse = await axios.post(`${this.baseURL}/social/share`, {
        targetId: 'test-blog-id',
        targetType: 'Blog',
        platform: 'twitter',
        metadata: {
          title: 'Test Blog Share',
          description: 'Testing social sharing functionality'
        }
      });

      if (shareResponse.data.success) {
        console.log('✅ Share feature working');
        return true;
      }
    } catch (error) {
      console.log('❌ Share feature error:', error.response?.data?.message || error.message);
      return false;
    }
  }

  async runAllTests() {
    console.log('🎯 Starting Comprehensive Social Features Test\n');
    console.log('=' .repeat(50));
    
    await this.setup();
    
    const results = {
      authentication: await this.testAuthentication(),
      follow: await this.testFollowFeature(),
      like: await this.testLikeFeature(),
      socialFeed: await this.testSocialFeed(),
      share: await this.testShareFeature(),
      realTime: await this.testRealTimeFeatures()
    };

    console.log('\n' + '=' .repeat(50));
    console.log('📊 TEST RESULTS SUMMARY:');
    console.log('=' .repeat(50));
    
    Object.entries(results).forEach(([feature, passed]) => {
      const status = passed ? '✅ PASSED' : '❌ FAILED';
      console.log(`${feature.toUpperCase().padEnd(15)} ${status}`);
    });

    const totalTests = Object.keys(results).length;
    const passedTests = Object.values(results).filter(Boolean).length;
    
    console.log('\n' + '=' .repeat(50));
    console.log(`🎯 OVERALL SCORE: ${passedTests}/${totalTests} tests passed`);
    
    if (passedTests === totalTests) {
      console.log('🎉 ALL SOCIAL FEATURES ARE WORKING PERFECTLY!');
      console.log('🚀 Your travel blog now has Instagram/Facebook-like functionality!');
    } else {
      console.log('⚠️  Some features need attention');
    }
    
    console.log('=' .repeat(50));

    // Cleanup
    if (this.socket) {
      this.socket.disconnect();
    }
    
    return results;
  }
}

// Run the test
if (require.main === module) {
  const tester = new SocialFeaturesTester();
  tester.runAllTests().catch(console.error);
}

module.exports = SocialFeaturesTester;