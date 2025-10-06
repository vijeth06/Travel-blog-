const mongoose = require('mongoose');
const Continent = require('../models/Continent');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-blog';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for adding Oceania...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const oceaniaData = {
  name: 'Oceania',
  code: 'OC',
  description: 'Oceania encompasses Australia, New Zealand, and Pacific islands, offering unique wildlife, stunning beaches, diverse cultures, and outdoor adventures.',
  shortDescription: 'Unique wildlife, stunning beaches, diverse island cultures, and outdoor adventures.',
  area: 8600000,
  population: 45426569,
  countries: ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea'],
  famousPlaces: [
    {
      name: 'Great Barrier Reef',
      country: 'Australia',
      city: 'Queensland',
      description: 'World\'s largest coral reef system, perfect for snorkeling and diving.',
      category: 'Natural Wonder',
      images: [{ url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5', caption: 'Great Barrier Reef', alt: 'Coral reef underwater Australia' }],
      coordinates: { lat: -18.2871, lng: 147.6992 },
      bestTimeToVisit: 'June to October',
      averageStay: '2-4 days',
      difficulty: 'Moderate',
      entryFee: { amount: 0, currency: 'AUD', notes: 'Tour costs vary' },
      tags: ['Coral Reef', 'Diving', 'Marine Life', 'UNESCO'],
      featured: true,
      popularity: 89
    }
  ],
  bestTimeToVisit: 'September to November, March to May',
  averageTemperature: { summer: '20-30°C', winter: '10-20°C' },
  majorLanguages: ['English', 'French', 'Indigenous languages'],
  majorCurrencies: ['AUD', 'NZD', 'USD'],
  travelTips: ['ETA/visa required for most countries', 'Long flights from other continents', 'Sun protection essential'],
  culturalTips: ['Respect Aboriginal and Maori cultures', 'Outdoor lifestyle is common', 'Environmental consciousness'],
  safetyTips: ['Be aware of dangerous wildlife', 'Ocean safety important', 'Remote areas require preparation'],
  heroImage: { url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5', caption: 'Oceania landscape', alt: 'Oceania reef nature' },
  featured: true,
  popularity: 82
};

const addOceania = async () => {
  try {
    await connectDB();
    
    const existingOceania = await Continent.findOne({ name: 'Oceania' });
    if (existingOceania) {
      console.log('Oceania already exists!');
      process.exit(0);
    }
    
    console.log('Adding Oceania...');
    await Continent.create(oceaniaData);
    
    console.log('✅ Oceania added successfully!');
    
    const totalContinents = await Continent.countDocuments();
    const allContinents = await Continent.find({}, 'name code famousPlaces featured').sort({ name: 1 });
    
    console.log(`\n=== FINAL SUMMARY ===`);
    console.log(`Total Continents: ${totalContinents}`);
    console.log('====================\n');
    
    allContinents.forEach(continent => {
      console.log(`- ${continent.name} (${continent.code}) - ${continent.famousPlaces?.length || 0} places${continent.featured ? ' [FEATURED]' : ''}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding Oceania:', error);
    process.exit(1);
  }
};

addOceania();
