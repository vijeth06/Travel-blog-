const mongoose = require('mongoose');
const Continent = require('../models/Continent');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-blog';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for adding Antarctica...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const antarcticaData = {
  name: 'Antarctica',
  code: 'AN',
  description: 'Antarctica is the southernmost continent, a pristine wilderness of ice and snow. While tourism is limited and regulated, it offers unique experiences with penguins, seals, whales, and breathtaking icy landscapes.',
  shortDescription: 'The pristine icy wilderness at the bottom of the world.',
  area: 14200000,
  population: 0,
  countries: [],
  
  famousPlaces: [
    {
      name: 'Antarctic Peninsula',
      country: 'Antarctica',
      city: 'Various Research Stations',
      description: 'The most accessible part of Antarctica, offering stunning icebergs, glaciers, and abundant wildlife including penguins, seals, and whales.',
      category: 'Natural Wonder',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
          caption: 'Penguins on ice floe with dramatic Antarctic landscape',
          alt: 'Emperor penguins on ice with icebergs and mountains'
        }
      ],
      coordinates: { lat: -63.2467, lng: -57.0000 },
      bestTimeToVisit: 'November to March (Antarctic summer)',
      averageStay: '7-14 days',
      difficulty: 'Expert',
      entryFee: { amount: 0, currency: 'USD', notes: 'Expedition cruise required' },
      tags: ['Penguins', 'Icebergs', 'Wildlife', 'Expedition', 'Pristine Wilderness'],
      featured: true,
      popularity: 75
    },
    {
      name: 'South Pole',
      country: 'Antarctica',
      city: 'Amundsen-Scott Station',
      description: 'The geographic South Pole, the southernmost point on Earth, marked by a ceremonial pole and surrounded by endless ice.',
      category: 'Adventure',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
          caption: 'South Pole marker in vast white landscape',
          alt: 'South Pole ceremonial marker with flags in snow'
        }
      ],
      coordinates: { lat: -90.0000, lng: 0.0000 },
      bestTimeToVisit: 'November to January',
      averageStay: '1 day',
      difficulty: 'Expert',
      entryFee: { amount: 0, currency: 'USD', notes: 'Special expedition required' },
      tags: ['Geographic Pole', 'Extreme Adventure', 'Research Station', 'Historic'],
      featured: true,
      popularity: 60
    }
  ],
  
  bestTimeToVisit: 'November to March (Antarctic summer)',
  averageTemperature: {
    summer: '-10 to 0°C',
    winter: '-40 to -20°C'
  },
  majorLanguages: ['English', 'Spanish', 'Russian', 'Various (Research stations)'],
  majorCurrencies: ['USD', 'Various (expedition dependent)'],
  
  travelTips: [
    'Only accessible via expedition cruises or special tours',
    'Bring extreme cold weather gear',
    'Follow strict environmental guidelines',
    'Book well in advance - limited capacity',
    'Consider motion sickness medication for Drake Passage'
  ],
  
  culturalTips: [
    'Respect the pristine environment - leave no trace',
    'Follow all Antarctic Treaty guidelines',
    'Listen to expedition guides at all times',
    'Maintain safe distances from wildlife',
    'Be prepared for changing weather conditions'
  ],
  
  safetyTips: [
    'Never travel alone - always stay with group',
    'Extreme weather can change rapidly',
    'Hypothermia and frostbite risks are real',
    'Emergency evacuation is extremely difficult',
    'Follow all safety protocols strictly'
  ],
  
  heroImage: {
    url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    caption: 'Antarctic wilderness with penguins and icebergs',
    alt: 'Pristine Antarctic landscape with wildlife'
  },
  
  featured: true,
  popularity: 70
};

const addAntarctica = async () => {
  try {
    await connectDB();
    
    // Check if Antarctica already exists
    const existingAntarctica = await Continent.findOne({ name: 'Antarctica' });
    
    if (existingAntarctica) {
      console.log('Antarctica already exists in the database!');
      console.log('Current continent count:', await Continent.countDocuments());
      process.exit(0);
    }
    
    console.log('Adding Antarctica to existing continents...');
    const antarctica = await Continent.create(antarcticaData);
    
    console.log('✅ Antarctica added successfully!');
    
    // Display summary
    const totalContinents = await Continent.countDocuments();
    const continents = await Continent.find({}, 'name code famousPlaces featured').sort({ name: 1 });
    
    console.log('\n=== UPDATED CONTINENTS ===');
    console.log(`Total Continents: ${totalContinents}`);
    console.log('========================\n');
    
    console.log('All Continents:');
    continents.forEach(continent => {
      console.log(`- ${continent.name} (${continent.code}) - ${continent.famousPlaces?.length || 0} places${continent.featured ? ' [FEATURED]' : ''}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding Antarctica:', error);
    process.exit(1);
  }
};

addAntarctica();
