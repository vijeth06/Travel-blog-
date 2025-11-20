const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const testLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // Count all users
    const userCount = await User.countDocuments();
    console.log(`\n📊 Total users in database: ${userCount}`);
    
    if (userCount > 0) {
      const allUsers = await User.find({}).select('name email role');
      console.log('\n👥 All users:');
      allUsers.forEach(u => console.log(`   - ${u.name} (${u.email}) - ${u.role}`));
    }

    // Find the demo user
    const user = await User.findOne({ email: 'demo@travelapp.com' });
    
    if (!user) {
      console.log('\n❌ User not found with email: demo@travelapp.com');
      return;
    }

    console.log('\n📧 User found:');
    console.log('   Name:', user.name);
    console.log('   Email:', user.email);
    console.log('   Role:', user.role);
    console.log('   isActive:', user.isActive);
    console.log('   isVerified:', user.isVerified);
    console.log('   Password hash:', user.password ? user.password.substring(0, 20) + '...' : 'No password');

    // Test password matching
    const testPassword = 'Demo@123';
    console.log('\n🔐 Testing password:', testPassword);
    
    const isMatch = await user.matchPassword(testPassword);
    console.log('   Password match result:', isMatch);

    if (!isMatch) {
      console.log('\n❌ Password does not match!');
      console.log('   This suggests the password was not hashed correctly during seeding.');
    } else {
      console.log('\n✅ Password matches! Login should work.');
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    mongoose.connection.close();
  }
};

testLogin();
