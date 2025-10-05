const mongoose = require('mongoose');

// Simple test without database operations
console.log('🧪 Testing Model Definitions');

try {
  console.log('1. Testing Achievement model...');
  const Achievement = require('./backend/models/Achievement');
  console.log('✅ Achievement model loaded');
  
  console.log('2. Testing UserProgress model...');
  const UserProgress = require('./backend/models/UserProgress');
  console.log('✅ UserProgress model loaded');
  
  console.log('3. Testing model creation without saving...');
  const testAchievement = new Achievement({
    title: 'Test Achievement',
    description: 'Test description',
    category: 'general',
    requirements: {
      type: 'points',
      value: 100
    },
    reward: {
      points: 50,
      badge: 'test-badge'
    }
  });
  console.log('✅ Achievement instance created');
  
  const testProgress = new UserProgress({
    user: new mongoose.Types.ObjectId(),
    totalPoints: 0,
    currentLevel: 1
  });
  console.log('✅ UserProgress instance created');
  
  console.log('\n🎉 All models are properly defined and working!');
  console.log('The issue might be with database connectivity, not the models themselves.');
  
} catch (error) {
  console.error('❌ Error with models:', error.message);
  console.error(error.stack);
}

// Test service import
try {
  console.log('\n4. Testing service import...');
  const gamificationService = require('./backend/services/realGamificationService');
  console.log('✅ Gamification service loaded');
} catch (error) {
  console.error('❌ Error loading service:', error.message);
}

// Test controller import
try {
  console.log('\n5. Testing controller import...');
  const controller = require('./backend/controllers/realGamificationController');
  console.log('✅ Gamification controller loaded');
} catch (error) {
  console.error('❌ Error loading controller:', error.message);
}

console.log('\n✨ Model definition test complete!');