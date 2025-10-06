const mongoose = require('mongoose');
const Continent = require('../models/Continent');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-blog';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for adding missing continents...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const continentsData = [
  {
    name: 'Europe',
    code: 'EU',
    description: 'Europe is a continent rich in history, culture, and architectural marvels. From ancient ruins to modern cities, medieval castles to world-class museums, Europe offers diverse experiences across its many countries.',
    shortDescription: 'A continent of rich history, diverse cultures, and architectural wonders.',
    area: 10180000,
    population: 746419440,
    countries: ['France', 'Germany', 'Italy', 'Spain', 'United Kingdom', 'Greece', 'Netherlands', 'Switzerland'],
    famousPlaces: [
      {
        name: 'Eiffel Tower',
        country: 'France',
        city: 'Paris',
        description: 'Iconic iron lattice tower and symbol of Paris, offering stunning city views.',
        category: 'Architecture',
        images: [{ url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f', caption: 'Eiffel Tower at sunset', alt: 'Eiffel Tower Paris' }],
        coordinates: { lat: 48.8584, lng: 2.2945 },
        bestTimeToVisit: 'April to October',
        averageStay: '2-3 hours',
        difficulty: 'Easy',
        entryFee: { amount: 25, currency: 'EUR' },
        tags: ['Architecture', 'City Views', 'Romance', 'Historic'],
        featured: true,
        popularity: 95
      },
      {
        name: 'Colosseum',
        country: 'Italy',
        city: 'Rome',
        description: 'Ancient Roman amphitheater, a marvel of engineering and gladiatorial history.',
        category: 'Historical Site',
        images: [{ url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5', caption: 'Roman Colosseum', alt: 'Colosseum Rome Italy' }],
        coordinates: { lat: 41.8902, lng: 12.4922 },
        bestTimeToVisit: 'April to June, September to October',
        averageStay: '2-3 hours',
        difficulty: 'Easy',
        entryFee: { amount: 16, currency: 'EUR' },
        tags: ['Ancient Rome', 'History', 'Architecture', 'UNESCO'],
        featured: true,
        popularity: 90
      }
    ],
    bestTimeToVisit: 'April to October',
    averageTemperature: { summer: '15-25°C', winter: '0-10°C' },
    majorLanguages: ['English', 'French', 'German', 'Italian', 'Spanish'],
    majorCurrencies: ['EUR', 'GBP', 'CHF'],
    travelTips: ['Schengen visa allows travel between most EU countries', 'Book accommodations early in summer', 'Use public transport in cities'],
    culturalTips: ['Respect local customs and dress codes', 'Learn basic greetings in local languages', 'Tipping varies by country'],
    safetyTips: ['Keep valuables secure in tourist areas', 'Be aware of pickpockets', 'Emergency number: 112'],
    heroImage: { url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f', caption: 'European cityscape', alt: 'Europe landmarks' },
    featured: true,
    popularity: 92
  },
  {
    name: 'North America',
    code: 'NA',
    description: 'North America offers incredible diversity from bustling metropolises to pristine wilderness, ancient cultures to modern innovations, and stunning natural wonders.',
    shortDescription: 'Diverse landscapes from cities to wilderness, rich cultures and natural wonders.',
    area: 24709000,
    population: 579024000,
    countries: ['United States', 'Canada', 'Mexico'],
    famousPlaces: [
      {
        name: 'Grand Canyon',
        country: 'United States',
        city: 'Arizona',
        description: 'Massive canyon carved by the Colorado River, one of the world\'s natural wonders.',
        category: 'Natural Wonder',
        images: [{ url: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722', caption: 'Grand Canyon vista', alt: 'Grand Canyon Arizona' }],
        coordinates: { lat: 36.1069, lng: -112.1129 },
        bestTimeToVisit: 'March to May, September to November',
        averageStay: '1-3 days',
        difficulty: 'Moderate',
        entryFee: { amount: 35, currency: 'USD' },
        tags: ['Natural Wonder', 'Hiking', 'Photography', 'UNESCO'],
        featured: true,
        popularity: 88
      },
      {
        name: 'Niagara Falls',
        country: 'Canada/United States',
        city: 'Ontario/New York',
        description: 'Spectacular waterfalls on the border between Canada and the United States.',
        category: 'Natural Wonder',
        images: [{ url: 'https://images.unsplash.com/photo-1489447068241-b3490214e879', caption: 'Niagara Falls', alt: 'Niagara Falls waterfall' }],
        coordinates: { lat: 43.0962, lng: -79.0377 },
        bestTimeToVisit: 'May to September',
        averageStay: '1-2 days',
        difficulty: 'Easy',
        entryFee: { amount: 0, currency: 'USD', notes: 'Free to view, boat tours extra' },
        tags: ['Waterfalls', 'Natural Wonder', 'Border Crossing'],
        featured: true,
        popularity: 85
      }
    ],
    bestTimeToVisit: 'Varies by region - generally April to October',
    averageTemperature: { summer: '20-30°C', winter: '-10-10°C' },
    majorLanguages: ['English', 'Spanish', 'French'],
    majorCurrencies: ['USD', 'CAD', 'MXN'],
    travelTips: ['ESTA/visa required for many visitors to US', 'Distances are vast - plan accordingly', 'Tipping is customary'],
    culturalTips: ['Respect indigenous cultures', 'Regional differences are significant', 'Punctuality is valued'],
    safetyTips: ['Follow park safety guidelines', 'Be aware of wildlife in national parks', 'Emergency: 911'],
    heroImage: { url: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722', caption: 'North American landscape', alt: 'North America nature' },
    featured: true,
    popularity: 89
  },
  {
    name: 'Africa',
    code: 'AF',
    description: 'Africa is a continent of incredible wildlife, diverse cultures, ancient history, and breathtaking landscapes from savannas to deserts to tropical coasts.',
    shortDescription: 'Incredible wildlife, diverse cultures, and breathtaking natural landscapes.',
    area: 30370000,
    population: 1340598000,
    countries: ['Kenya', 'South Africa', 'Egypt', 'Morocco', 'Tanzania', 'Botswana'],
    famousPlaces: [
      {
        name: 'Serengeti National Park',
        country: 'Tanzania',
        city: 'Serengeti',
        description: 'Famous for the Great Migration and incredible wildlife viewing opportunities.',
        category: 'Wildlife',
        images: [{ url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801', caption: 'Serengeti wildlife', alt: 'Serengeti animals migration' }],
        coordinates: { lat: -2.3333, lng: 34.8333 },
        bestTimeToVisit: 'June to October',
        averageStay: '3-5 days',
        difficulty: 'Moderate',
        entryFee: { amount: 70, currency: 'USD' },
        tags: ['Wildlife', 'Safari', 'Migration', 'UNESCO'],
        featured: true,
        popularity: 87
      },
      {
        name: 'Pyramids of Giza',
        country: 'Egypt',
        city: 'Cairo',
        description: 'Ancient pyramids and the Great Sphinx, wonders of the ancient world.',
        category: 'Historical Site',
        images: [{ url: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e', caption: 'Pyramids of Giza', alt: 'Egyptian pyramids desert' }],
        coordinates: { lat: 29.9792, lng: 31.1342 },
        bestTimeToVisit: 'October to April',
        averageStay: 'Half day',
        difficulty: 'Easy',
        entryFee: { amount: 15, currency: 'USD' },
        tags: ['Ancient Egypt', 'Pyramids', 'History', 'UNESCO'],
        featured: true,
        popularity: 90
      }
    ],
    bestTimeToVisit: 'May to October (varies by region)',
    averageTemperature: { summer: '25-35°C', winter: '15-25°C' },
    majorLanguages: ['Arabic', 'English', 'French', 'Swahili', 'Portuguese'],
    majorCurrencies: ['USD', 'EUR', 'Local currencies'],
    travelTips: ['Yellow fever vaccination may be required', 'Malaria prophylaxis recommended', 'Respect local customs'],
    culturalTips: ['Dress modestly in conservative areas', 'Learn about local traditions', 'Bargaining is common in markets'],
    safetyTips: ['Check travel advisories', 'Use reputable tour operators', 'Stay hydrated'],
    heroImage: { url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801', caption: 'African landscape', alt: 'Africa wildlife nature' },
    featured: true,
    popularity: 84
  },
  {
    name: 'South America',
    code: 'SA',
    description: 'South America captivates with ancient civilizations, diverse ecosystems from Amazon rainforest to Patagonian glaciers, vibrant cultures, and stunning landscapes.',
    shortDescription: 'Ancient civilizations, Amazon rainforest, vibrant cultures, and diverse landscapes.',
    area: 17840000,
    population: 430759766,
    countries: ['Brazil', 'Argentina', 'Peru', 'Chile', 'Colombia', 'Ecuador'],
    famousPlaces: [
      {
        name: 'Machu Picchu',
        country: 'Peru',
        city: 'Cusco Region',
        description: 'Ancient Incan citadel set high in the Andes Mountains, a UNESCO World Heritage site.',
        category: 'Historical Site',
        images: [{ url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377', caption: 'Machu Picchu ruins', alt: 'Machu Picchu Peru Andes' }],
        coordinates: { lat: -13.1631, lng: -72.5450 },
        bestTimeToVisit: 'May to September',
        averageStay: '1-2 days',
        difficulty: 'Challenging',
        entryFee: { amount: 45, currency: 'USD' },
        tags: ['Ancient Civilization', 'Inca', 'Mountains', 'UNESCO'],
        featured: true,
        popularity: 92
      }
    ],
    bestTimeToVisit: 'September to November, March to May',
    averageTemperature: { summer: '20-30°C', winter: '10-20°C' },
    majorLanguages: ['Spanish', 'Portuguese', 'English'],
    majorCurrencies: ['USD', 'Local currencies'],
    travelTips: ['Yellow fever vaccination for some areas', 'Altitude sickness precautions', 'Learn basic Spanish/Portuguese'],
    culturalTips: ['Respect indigenous cultures', 'Embrace local festivals', 'Try local cuisines'],
    safetyTips: ['Be cautious in urban areas', 'Use registered tour guides', 'Keep copies of documents'],
    heroImage: { url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377', caption: 'South American landscape', alt: 'South America mountains' },
    featured: true,
    popularity: 86
  },
  {
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
        difficulty: 'Easy to Moderate',
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
  }
];

const addMissingContinents = async () => {
  try {
    await connectDB();
    
    console.log('Checking existing continents...');
    const existingContinents = await Continent.find({}, 'name code');
    const existingNames = existingContinents.map(c => c.name);
    
    console.log(`Found ${existingContinents.length} existing continents:`, existingNames);
    
    const continentsToAdd = continentsData.filter(continent => 
      !existingNames.includes(continent.name)
    );
    
    if (continentsToAdd.length === 0) {
      console.log('All continents already exist in the database!');
      const totalCount = await Continent.countDocuments();
      console.log(`Total continents: ${totalCount}`);
      process.exit(0);
    }
    
    console.log(`Adding ${continentsToAdd.length} missing continents...`);
    
    for (const continentData of continentsToAdd) {
      console.log(`Adding ${continentData.name}...`);
      await Continent.create(continentData);
    }
    
    console.log('✅ All missing continents added successfully!');
    
    // Display final summary
    const totalContinents = await Continent.countDocuments();
    const allContinents = await Continent.find({}, 'name code famousPlaces featured').sort({ name: 1 });
    
    console.log('\n=== FINAL CONTINENTS SUMMARY ===');
    console.log(`Total Continents: ${totalContinents}`);
    console.log('================================\n');
    
    console.log('All Continents:');
    allContinents.forEach(continent => {
      console.log(`- ${continent.name} (${continent.code}) - ${continent.famousPlaces?.length || 0} places${continent.featured ? ' [FEATURED]' : ''}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding continents:', error);
    process.exit(1);
  }
};

addMissingContinents();
