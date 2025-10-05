const mongoose = require('mongoose');
const Category = require('./backend/models/Category');
require('dotenv').config({ path: './backend/.env' });

const categories = [
  { name: 'Adventure', description: 'Thrilling adventures and extreme sports' },
  { name: 'Culture', description: 'Cultural experiences and local traditions' },
  { name: 'Food', description: 'Culinary experiences and local cuisine' },
  { name: 'Nature', description: 'Natural landscapes and wildlife' },
  { name: 'City', description: 'Urban exploration and city guides' },
  { name: 'Beach', description: 'Coastal destinations and beach activities' },
  { name: 'Mountain', description: 'Mountain adventures and hiking' },
  { name: 'Photography', description: 'Travel photography and visual stories' }
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing categories
    await Category.deleteMany({});
    console.log('Cleared existing categories');

    // Insert new categories
    const createdCategories = await Category.insertMany(categories);
    console.log('Categories created:');
    createdCategories.forEach(cat => {
      console.log(`  - ${cat.name} (ID: ${cat._id})`);
    });

    console.log('\n✅ Categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();