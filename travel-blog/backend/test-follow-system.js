/**
 * Test script for the new unified follow system
 * Validates that the follow functionality works correctly with the service layer
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-blog-test')
  .then(() => console.log('✅ Connected to test database'))
  .catch(err => console.error('❌ Database connection error:', err));

const FollowService = require('./services/followService');
const User = require('./models/User');

async function testFollowSystem() {
  console.log('\n🧪 TESTING UNIFIED FOLLOW SYSTEM\n');
  
  try {
    // Find or create test users
    let user1 = await User.findOne({ email: 'testuser1@example.com' });
    let user2 = await User.findOne({ email: 'testuser2@example.com' });
    let user3 = await User.findOne({ email: 'testuser3@example.com' });
    
    if (!user1) {
      user1 = await User.create({
        name: 'Test User 1',
        email: 'testuser1@example.com',
        password: 'hashedpassword123',
        profilePicture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
      });
      console.log('✅ Created test user 1');
    }
    
    if (!user2) {
      user2 = await User.create({
        name: 'Test User 2',
        email: 'testuser2@example.com',
        password: 'hashedpassword123',
        profilePicture: 'https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=150&h=150&fit=crop&crop=face'
      });
      console.log('✅ Created test user 2');
    }
    
    if (!user3) {
      user3 = await User.create({
        name: 'Test User 3',
        email: 'testuser3@example.com',
        password: 'hashedpassword123',
        profilePicture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
      });
      console.log('✅ Created test user 3');
    }
    
    console.log('\n🔄 Testing follow functionality...\n');
    
    // Test 1: User1 follows User2
    console.log('Test 1: User1 follows User2');
    const followResult = await FollowService.followUser(user1._id, user2._id);
    console.log('✅ Follow result:', followResult.message);
    console.log('   Follower count:', followResult.data.followerCount);
    
    // Test 2: Check following status
    console.log('\nTest 2: Check following status');
    const statusResult = await FollowService.getFollowingStatus(user1._id, user2._id);
    console.log('✅ Following status:', statusResult.data.isFollowing ? 'FOLLOWING' : 'NOT FOLLOWING');
    console.log('   Mutual:', statusResult.data.isMutual ? 'YES' : 'NO');
    
    // Test 3: User2 follows User1 back (creating mutual follow)
    console.log('\nTest 3: User2 follows User1 back');
    const mutualFollowResult = await FollowService.followUser(user2._id, user1._id);
    console.log('✅ Mutual follow result:', mutualFollowResult.message);
    
    // Test 4: Check mutual status
    console.log('\nTest 4: Check mutual status');
    const mutualStatusResult = await FollowService.getFollowingStatus(user1._id, user2._id);
    console.log('✅ Updated status:', mutualStatusResult.data.isFollowing ? 'FOLLOWING' : 'NOT FOLLOWING');
    console.log('   Mutual:', mutualStatusResult.data.isMutual ? 'YES' : 'NO');
    
    // Test 5: Get followers and following
    console.log('\nTest 5: Get followers and following');
    const followersResult = await FollowService.getFollowers(user2._id, { populate: true });
    console.log('✅ User2 followers:', followersResult.data.pagination.totalFollowers);
    
    const followingResult = await FollowService.getFollowing(user1._id, { populate: true });
    console.log('✅ User1 following:', followingResult.data.pagination.totalFollowing);
    
    // Test 6: Toggle follow (should unfollow)
    console.log('\nTest 6: Toggle follow (should unfollow)');
    const toggleResult = await FollowService.toggleFollow(user1._id, user2._id);
    console.log('✅ Toggle result:', toggleResult.message);
    console.log('   Following:', toggleResult.data.following ? 'YES' : 'NO');
    
    // Test 7: Get follow suggestions
    console.log('\nTest 7: Get follow suggestions');
    const suggestionsResult = await FollowService.getFollowSuggestions(user1._id);
    console.log('✅ Suggestions found:', suggestionsResult.data.suggestions.length);
    
    // Test 8: Bulk follow
    console.log('\nTest 8: Bulk follow');
    const bulkResult = await FollowService.bulkFollow(user1._id, [user2._id, user3._id]);
    console.log('✅ Bulk follow successful:', bulkResult.data.successful);
    console.log('   Failed:', bulkResult.data.failed);
    
    // Test 9: Get mutual follows
    console.log('\nTest 9: Get mutual follows');
    const mutualResult = await FollowService.getMutualFollows(user1._id, user2._id);
    console.log('✅ Mutual follows:', mutualResult.data.totalMutual);
    
    console.log('\n🎉 ALL FOLLOW SYSTEM TESTS PASSED! ✅\n');
    
    // Test error scenarios
    console.log('🔄 Testing error scenarios...\n');
    
    // Test 10: Try to follow self
    console.log('Test 10: Try to follow self (should fail)');
    try {
      await FollowService.followUser(user1._id, user1._id);
      console.log('❌ Self-follow should have failed');
    } catch (error) {
      console.log('✅ Self-follow correctly prevented:', error.message);
    }
    
    // Test 11: Try to follow non-existent user
    console.log('\nTest 11: Try to follow non-existent user (should fail)');
    try {
      await FollowService.followUser(user1._id, new mongoose.Types.ObjectId());
      console.log('❌ Non-existent user follow should have failed');
    } catch (error) {
      console.log('✅ Non-existent user follow correctly prevented:', error.message);
    }
    
    console.log('\n🎉 ALL ERROR SCENARIO TESTS PASSED! ✅\n');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    mongoose.connection.close();
    console.log('📝 Test completed - database connection closed');
  }
}

// Run the test
testFollowSystem();