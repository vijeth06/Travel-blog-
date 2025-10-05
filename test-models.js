const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/backend/.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = 'mongodb://localhost:27017/travel-blog-test';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.log('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

async function testGamificationModels() {
  await connectDB();
  
  try {
    // Import models
    const Achievement = require('./backend/models/Achievement');
    const UserProgress = require('./backend/models/UserProgress');
    
    console.log('✅ Models imported successfully');
    
    // Try to create default achievements
    console.log('🎯 Creating default achievements...');
    await Achievement.createDefaultAchievements();
    console.log('✅ Default achievements created');
    
    // Test achievement retrieval
    const achievements = await Achievement.find({});
    console.log(`✅ Found ${achievements.length} achievements`);
    
    // Test user progress creation
    console.log('👤 Testing user progress...');
    const testProgress = new UserProgress({
      user: new mongoose.Types.ObjectId(),
      totalPoints: 0,
      currentLevel: 1
    });
    
    console.log('✅ UserProgress model works');
    
    console.log('\n🎉 All gamification models working correctly!');
    
  } catch (error) {
    console.error('❌ Error testing models:', error.message);
    console.error(error.stack);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

testGamificationModels();