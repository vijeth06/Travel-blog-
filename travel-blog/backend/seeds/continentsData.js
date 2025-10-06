const mongoose = require('mongoose');
const Continent = require('../models/Continent');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-blog';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for seeding continents...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const continentsData = [
  {
    name: 'Asia',
    code: 'AS',
    description: 'Asia is the largest and most populous continent, home to diverse cultures, ancient civilizations, stunning landscapes, and modern metropolises. From the Himalayas to tropical beaches, bustling cities to serene temples, Asia offers unparalleled travel experiences.',
    shortDescription: 'The largest continent with diverse cultures, ancient temples, and modern cities.',
    area: 44579000,
    population: 4641054775,
    countries: ['China', 'India', 'Japan', 'Thailand', 'Singapore', 'Malaysia', 'Indonesia', 'Nepal', 'Sri Lanka', 'Maldives', 'Bhutan', 'South Korea', 'Philippines', 'Vietnam', 'Cambodia'],
    
    famousPlaces: [
      {
        name: 'Taj Mahal',
        country: 'India',
        city: 'Agra',
        description: 'An ivory-white marble mausoleum and UNESCO World Heritage Site, considered one of the most beautiful buildings in the world and a symbol of eternal love.',
        category: 'Historical Site',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
            caption: 'The magnificent Taj Mahal at sunrise',
            alt: 'Taj Mahal with reflection in water'
          }
        ],
        coordinates: { lat: 27.1751, lng: 78.0421 },
        bestTimeToVisit: 'October to March',
        averageStay: '1-2 days',
        difficulty: 'Easy',
        entryFee: { amount: 1100, currency: 'INR', notes: 'Higher fee for foreigners' },
        tags: ['UNESCO World Heritage', 'Architecture', 'Mughal', 'Romance', 'Photography'],
        featured: true,
        popularity: 95
      },
      {
        name: 'Great Wall of China',
        country: 'China',
        city: 'Beijing',
        description: 'An ancient series of walls and fortifications stretching over 13,000 miles, representing one of the most impressive architectural feats in human history.',
        category: 'Historical Site',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            caption: 'The Great Wall winding through mountains',
            alt: 'Great Wall of China stretching across mountains'
          }
        ],
        coordinates: { lat: 40.4319, lng: 116.5704 },
        bestTimeToVisit: 'April to June, September to November',
        averageStay: '1 day',
        difficulty: 'Moderate',
        entryFee: { amount: 45, currency: 'CNY', notes: 'Varies by section' },
        tags: ['UNESCO World Heritage', 'Ancient Architecture', 'Hiking', 'History'],
        featured: true,
        popularity: 90
      },
      {
        name: 'Angkor Wat',
        country: 'Cambodia',
        city: 'Siem Reap',
        description: 'The largest religious monument in the world, this 12th-century temple complex showcases the pinnacle of Khmer architecture and Hindu-Buddhist art.',
        category: 'Religious Site',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
            caption: 'Angkor Wat temple complex at sunrise',
            alt: 'Ancient Angkor Wat temple with reflection'
          }
        ],
        coordinates: { lat: 13.4125, lng: 103.8670 },
        bestTimeToVisit: 'November to March',
        averageStay: '2-3 days',
        difficulty: 'Easy',
        entryFee: { amount: 37, currency: 'USD', notes: '1-day pass' },
        tags: ['UNESCO World Heritage', 'Ancient Temple', 'Khmer Architecture', 'Sunrise'],
        featured: true,
        popularity: 88
      },
      {
        name: 'Mount Fuji',
        country: 'Japan',
        city: 'Honshu',
        description: 'Japan\'s highest mountain and sacred symbol, this perfectly shaped volcano offers spectacular views and spiritual significance to millions of visitors.',
        category: 'Mountain',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            caption: 'Mount Fuji with cherry blossoms',
            alt: 'Mount Fuji snow-capped peak with pink cherry blossoms'
          }
        ],
        coordinates: { lat: 35.3606, lng: 138.7274 },
        bestTimeToVisit: 'July to September (climbing season)',
        averageStay: '2-3 days',
        difficulty: 'Challenging',
        entryFee: { amount: 1000, currency: 'JPY', notes: 'Climbing fee' },
        tags: ['Sacred Mountain', 'Hiking', 'Cherry Blossoms', 'UNESCO World Heritage'],
        featured: true,
        popularity: 85
      },
      {
        name: 'Bagan',
        country: 'Myanmar',
        city: 'Mandalay Region',
        description: 'An ancient city with over 2,000 Buddhist temples and pagodas scattered across a vast plain, offering breathtaking sunrise balloon rides.',
        category: 'Historical Site',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            caption: 'Hot air balloons over Bagan temples',
            alt: 'Ancient temples of Bagan with hot air balloons at sunrise'
          }
        ],
        coordinates: { lat: 21.1702, lng: 94.8618 },
        bestTimeToVisit: 'October to March',
        averageStay: '2-3 days',
        difficulty: 'Easy',
        entryFee: { amount: 25, currency: 'USD', notes: 'Archaeological zone fee' },
        tags: ['Ancient Temples', 'Hot Air Balloon', 'Buddhism', 'Sunrise'],
        featured: true,
        popularity: 82
      },
      {
        name: 'Maldives',
        country: 'Maldives',
        city: 'Various Atolls',
        description: 'A tropical paradise of 1,192 coral islands with crystal-clear waters, luxury resorts, and some of the world\'s best diving and snorkeling.',
        category: 'Beach',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            caption: 'Overwater bungalows in crystal clear lagoon',
            alt: 'Luxury overwater villas in Maldives with turquoise water'
          }
        ],
        coordinates: { lat: 3.2028, lng: 73.2207 },
        bestTimeToVisit: 'November to April',
        averageStay: '5-7 days',
        difficulty: 'Easy',
        entryFee: { amount: 0, currency: 'USD', notes: 'No entry fee' },
        tags: ['Tropical Paradise', 'Luxury Resort', 'Diving', 'Honeymoon', 'Beach'],
        featured: true,
        popularity: 90
      }
    ],
    
    bestTimeToVisit: 'October to March (varies by region)',
    averageTemperature: {
      summer: '25-35°C',
      winter: '10-25°C'
    },
    majorLanguages: ['Mandarin', 'Hindi', 'English', 'Japanese', 'Thai', 'Malay', 'Indonesian'],
    majorCurrencies: ['CNY', 'INR', 'JPY', 'THB', 'SGD', 'MYR', 'IDR'],
    
    travelTips: [
      'Respect local customs and dress codes, especially at religious sites',
      'Learn basic greetings in the local language',
      'Try street food but choose busy stalls for freshness',
      'Bargain respectfully at local markets',
      'Carry cash as many places don\'t accept cards'
    ],
    
    culturalTips: [
      'Remove shoes before entering temples and homes',
      'Use both hands when giving or receiving items',
      'Avoid pointing with your finger, use an open hand',
      'Dress modestly, especially in religious areas',
      'Be patient and flexible with time schedules'
    ],
    
    safetyTips: [
      'Stay hydrated and use sunscreen',
      'Be cautious with street food if you have a sensitive stomach',
      'Keep copies of important documents',
      'Use reputable tour operators for activities',
      'Be aware of monsoon seasons and weather patterns'
    ],
    
    heroImage: {
      url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      caption: 'Diverse landscapes of Asia from temples to beaches',
      alt: 'Collage of Asian landmarks and landscapes'
    },
    
    featured: true,
    popularity: 95
  },
  
  {
    name: 'Europe',
    code: 'EU',
    description: 'Europe is a continent rich in history, art, architecture, and culture. From ancient Roman ruins to medieval castles, Renaissance art to modern cities, Europe offers an incredible journey through human civilization.',
    shortDescription: 'A continent of rich history, stunning architecture, and diverse cultures.',
    area: 10180000,
    population: 746419440,
    countries: ['France', 'Italy', 'Spain', 'Germany', 'United Kingdom', 'Greece', 'Netherlands', 'Switzerland', 'Austria', 'Portugal', 'Norway', 'Sweden', 'Denmark'],
    
    famousPlaces: [
      {
        name: 'Eiffel Tower',
        country: 'France',
        city: 'Paris',
        description: 'The iconic iron lattice tower and symbol of Paris, offering breathtaking views of the City of Light from its three observation levels.',
        category: 'Architecture',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1887&q=80',
            caption: 'Eiffel Tower illuminated at night',
            alt: 'Eiffel Tower lit up against Paris skyline'
          }
        ],
        coordinates: { lat: 48.8584, lng: 2.2945 },
        bestTimeToVisit: 'April to June, September to November',
        averageStay: '2-3 hours',
        difficulty: 'Easy',
        entryFee: { amount: 29, currency: 'EUR', notes: 'Top floor access' },
        tags: ['Iconic Landmark', 'City Views', 'Architecture', 'Romance', 'Photography'],
        featured: true,
        popularity: 95
      },
      {
        name: 'Colosseum',
        country: 'Italy',
        city: 'Rome',
        description: 'The largest amphitheater ever built, this ancient Roman marvel once hosted gladiatorial contests and public spectacles for up to 80,000 spectators.',
        category: 'Historical Site',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1896&q=80',
            caption: 'The ancient Colosseum in Rome',
            alt: 'Roman Colosseum amphitheater exterior view'
          }
        ],
        coordinates: { lat: 41.8902, lng: 12.4922 },
        bestTimeToVisit: 'April to June, September to October',
        averageStay: '2-3 hours',
        difficulty: 'Easy',
        entryFee: { amount: 16, currency: 'EUR', notes: 'Combined ticket with Roman Forum' },
        tags: ['Ancient Rome', 'UNESCO World Heritage', 'Gladiators', 'History', 'Architecture'],
        featured: true,
        popularity: 92
      },
      {
        name: 'Santorini',
        country: 'Greece',
        city: 'Cyclades',
        description: 'A stunning volcanic island famous for its white-washed buildings, blue-domed churches, dramatic cliffs, and spectacular sunsets over the Aegean Sea.',
        category: 'Natural Wonder',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80',
            caption: 'White buildings and blue domes of Santorini',
            alt: 'Traditional Greek architecture in Santorini with sea view'
          }
        ],
        coordinates: { lat: 36.3932, lng: 25.4615 },
        bestTimeToVisit: 'April to June, September to October',
        averageStay: '3-4 days',
        difficulty: 'Easy',
        entryFee: { amount: 0, currency: 'EUR', notes: 'No entry fee for the island' },
        tags: ['Greek Islands', 'Sunset', 'Volcanic Island', 'Romance', 'Photography'],
        featured: true,
        popularity: 88
      },
      {
        name: 'Neuschwanstein Castle',
        country: 'Germany',
        city: 'Bavaria',
        description: 'A fairy-tale castle perched on a hilltop, inspiring Disney\'s Sleeping Beauty Castle and representing the pinnacle of Romantic architecture.',
        category: 'Architecture',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            caption: 'Neuschwanstein Castle in the Bavarian Alps',
            alt: 'Fairy-tale castle on a mountain with forest surroundings'
          }
        ],
        coordinates: { lat: 47.5576, lng: 10.7498 },
        bestTimeToVisit: 'May to September',
        averageStay: '1 day',
        difficulty: 'Moderate',
        entryFee: { amount: 15, currency: 'EUR', notes: 'Castle tour' },
        tags: ['Fairy Tale Castle', 'Disney Inspiration', 'Bavarian Alps', 'Architecture', 'Hiking'],
        featured: true,
        popularity: 85
      },
      {
        name: 'Northern Lights',
        country: 'Norway',
        city: 'Tromsø',
        description: 'The Aurora Borealis, a natural light display in polar regions, creating dancing curtains of green, pink, and purple light across the night sky.',
        category: 'Natural Wonder',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            caption: 'Northern Lights dancing over Norwegian landscape',
            alt: 'Aurora Borealis green lights over snowy mountains'
          }
        ],
        coordinates: { lat: 69.6492, lng: 18.9553 },
        bestTimeToVisit: 'September to March',
        averageStay: '3-5 days',
        difficulty: 'Moderate',
        entryFee: { amount: 0, currency: 'NOK', notes: 'Natural phenomenon, tour costs vary' },
        tags: ['Aurora Borealis', 'Natural Phenomenon', 'Arctic', 'Photography', 'Winter'],
        featured: true,
        popularity: 90
      }
    ],
    
    bestTimeToVisit: 'April to September',
    averageTemperature: {
      summer: '15-25°C',
      winter: '0-10°C'
    },
    majorLanguages: ['English', 'French', 'German', 'Spanish', 'Italian', 'Dutch', 'Portuguese'],
    majorCurrencies: ['EUR', 'GBP', 'CHF', 'NOK', 'SEK', 'DKK'],
    
    travelTips: [
      'Book accommodations early, especially in summer',
      'Use public transportation - it\'s efficient and eco-friendly',
      'Try local cuisines and regional specialties',
      'Learn basic phrases in the local language',
      'Pack layers for changing weather conditions'
    ],
    
    culturalTips: [
      'Punctuality is highly valued in most European countries',
      'Tipping is appreciated but not always mandatory',
      'Dress appropriately for churches and formal venues',
      'Respect local customs and traditions',
      'Be mindful of quiet hours in residential areas'
    ],
    
    safetyTips: [
      'Keep valuables secure in tourist areas',
      'Be aware of pickpockets in crowded places',
      'Have travel insurance for medical emergencies',
      'Know emergency numbers for each country',
      'Stay informed about local weather conditions'
    ],
    
    heroImage: {
      url: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
      caption: 'European castles, cities, and landscapes',
      alt: 'Collage of European landmarks and architecture'
    },
    
    featured: true,
    popularity: 92
  },
  
  {
    name: 'North America',
    code: 'NA',
    description: 'North America offers incredible diversity from the Arctic tundra to tropical beaches, bustling metropolises to pristine wilderness, and rich indigenous cultures to modern innovations.',
    shortDescription: 'Diverse landscapes from Arctic wilderness to tropical beaches and modern cities.',
    area: 24709000,
    population: 579024000,
    countries: ['United States', 'Canada', 'Mexico', 'Guatemala', 'Costa Rica', 'Panama', 'Cuba', 'Jamaica'],
    
    famousPlaces: [
      {
        name: 'Grand Canyon',
        country: 'United States',
        city: 'Arizona',
        description: 'One of the world\'s most spectacular natural wonders, carved by the Colorado River over millions of years, revealing layers of geological history.',
        category: 'Natural Wonder',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            caption: 'Grand Canyon at sunset with dramatic colors',
            alt: 'Grand Canyon layered rock formations at golden hour'
          }
        ],
        coordinates: { lat: 36.1069, lng: -112.1129 },
        bestTimeToVisit: 'March to May, September to November',
        averageStay: '2-3 days',
        difficulty: 'Moderate',
        entryFee: { amount: 35, currency: 'USD', notes: '7-day vehicle pass' },
        tags: ['National Park', 'Hiking', 'Geology', 'Sunrise', 'Photography'],
        featured: true,
        popularity: 95
      },
      {
        name: 'Niagara Falls',
        country: 'Canada/United States',
        city: 'Ontario/New York',
        description: 'Three magnificent waterfalls straddling the border, creating a thunderous spectacle of cascading water and mist that attracts millions of visitors.',
        category: 'Natural Wonder',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1489447068241-b3490214e879?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            caption: 'Niagara Falls with rainbow in the mist',
            alt: 'Powerful waterfall with rainbow and mist'
          }
        ],
        coordinates: { lat: 43.0962, lng: -79.0377 },
        bestTimeToVisit: 'May to September',
        averageStay: '1-2 days',
        difficulty: 'Easy',
        entryFee: { amount: 0, currency: 'USD', notes: 'Free to view, boat tours extra' },
        tags: ['Waterfall', 'Natural Wonder', 'Boat Tours', 'Rainbow', 'Border'],
        featured: true,
        popularity: 88
      },
      {
        name: 'Statue of Liberty',
        country: 'United States',
        city: 'New York',
        description: 'A symbol of freedom and democracy, this colossal neoclassical sculpture welcomes visitors to New York Harbor and represents hope for millions.',
        category: 'Cultural Site',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            caption: 'Statue of Liberty against blue sky',
            alt: 'Statue of Liberty on Liberty Island with torch raised'
          }
        ],
        coordinates: { lat: 40.6892, lng: -74.0445 },
        bestTimeToVisit: 'April to June, September to November',
        averageStay: '3-4 hours',
        difficulty: 'Easy',
        entryFee: { amount: 23, currency: 'USD', notes: 'Ferry and pedestal access' },
        tags: ['Symbol of Freedom', 'National Monument', 'Ferry Ride', 'History', 'Immigration'],
        featured: true,
        popularity: 85
      },
      {
        name: 'Chichen Itza',
        country: 'Mexico',
        city: 'Yucatan',
        description: 'A magnificent Maya archaeological site featuring the iconic El Castillo pyramid, showcasing the advanced astronomical and architectural knowledge of ancient civilizations.',
        category: 'Historical Site',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2067&q=80',
            caption: 'El Castillo pyramid at Chichen Itza',
            alt: 'Ancient Maya pyramid with stepped architecture'
          }
        ],
        coordinates: { lat: 20.6843, lng: -88.5678 },
        bestTimeToVisit: 'November to April',
        averageStay: '1 day',
        difficulty: 'Easy',
        entryFee: { amount: 481, currency: 'MXN', notes: 'Archaeological site entrance' },
        tags: ['Maya Civilization', 'UNESCO World Heritage', 'Ancient Pyramid', 'Archaeology', 'Wonder of the World'],
        featured: true,
        popularity: 82
      }
    ],
    
    bestTimeToVisit: 'April to October (varies by region)',
    averageTemperature: {
      summer: '20-30°C',
      winter: '-10-15°C'
    },
    majorLanguages: ['English', 'Spanish', 'French'],
    majorCurrencies: ['USD', 'CAD', 'MXN'],
    
    travelTips: [
      'Distances are vast - plan travel time accordingly',
      'Tipping is customary in restaurants and services',
      'National parks require advance reservations',
      'Weather can vary dramatically by region',
      'Consider travel insurance for medical coverage'
    ],
    
    featured: true,
    popularity: 88
  },
  
  {
    name: 'Africa',
    code: 'AF',
    description: 'Africa is a continent of incredible wildlife, diverse cultures, ancient civilizations, and breathtaking landscapes from the Sahara Desert to tropical rainforests.',
    shortDescription: 'A continent of wildlife, ancient cultures, and diverse landscapes.',
    area: 30370000,
    population: 1340598000,
    countries: ['Egypt', 'South Africa', 'Kenya', 'Tanzania', 'Morocco', 'Ethiopia', 'Ghana', 'Nigeria', 'Zimbabwe', 'Botswana'],
    
    famousPlaces: [
      {
        name: 'Pyramids of Giza',
        country: 'Egypt',
        city: 'Cairo',
        description: 'The last surviving wonder of the ancient world, these magnificent pyramids have stood for over 4,500 years as monuments to pharaonic power.',
        category: 'Historical Site',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80',
            caption: 'The Great Pyramid of Giza at sunset',
            alt: 'Ancient Egyptian pyramids in desert landscape'
          }
        ],
        coordinates: { lat: 29.9792, lng: 31.1342 },
        bestTimeToVisit: 'October to April',
        averageStay: '1 day',
        difficulty: 'Easy',
        entryFee: { amount: 200, currency: 'EGP', notes: 'Pyramid complex entrance' },
        tags: ['Ancient Egypt', 'Wonder of the World', 'Pharaohs', 'Desert', 'Archaeology'],
        featured: true,
        popularity: 92
      },
      {
        name: 'Serengeti National Park',
        country: 'Tanzania',
        city: 'Mara Region',
        description: 'Home to the Great Migration, this vast ecosystem hosts millions of wildebeest, zebras, and gazelles in one of nature\'s most spectacular events.',
        category: 'Wildlife',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2068&q=80',
            caption: 'Wildebeest migration in Serengeti',
            alt: 'Large herd of wildebeest crossing savanna plains'
          }
        ],
        coordinates: { lat: -2.3333, lng: 34.8333 },
        bestTimeToVisit: 'June to October',
        averageStay: '3-5 days',
        difficulty: 'Easy',
        entryFee: { amount: 70, currency: 'USD', notes: 'Daily park fee' },
        tags: ['Safari', 'Great Migration', 'Wildlife', 'Big Five', 'UNESCO World Heritage'],
        featured: true,
        popularity: 90
      }
    ],
    
    featured: true,
    popularity: 85
  },
  
  {
    name: 'South America',
    code: 'SA',
    description: 'South America captivates with its Amazon rainforest, Andes mountains, ancient Inca ruins, vibrant cultures, and passionate people.',
    shortDescription: 'Home to Amazon rainforest, Andes mountains, and ancient civilizations.',
    area: 17840000,
    population: 434254119,
    countries: ['Brazil', 'Argentina', 'Peru', 'Chile', 'Colombia', 'Venezuela', 'Ecuador', 'Bolivia', 'Uruguay', 'Paraguay'],
    
    famousPlaces: [
      {
        name: 'Machu Picchu',
        country: 'Peru',
        city: 'Cusco Region',
        description: 'The Lost City of the Incas, this ancient citadel perched high in the Andes represents the pinnacle of Inca architecture and engineering.',
        category: 'Historical Site',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            caption: 'Machu Picchu ancient ruins in morning mist',
            alt: 'Inca ruins on mountain ridge with dramatic peaks'
          }
        ],
        coordinates: { lat: -13.1631, lng: -72.5450 },
        bestTimeToVisit: 'May to September',
        averageStay: '2-3 days',
        difficulty: 'Moderate',
        entryFee: { amount: 152, currency: 'PEN', notes: 'Entrance ticket' },
        tags: ['Inca Civilization', 'UNESCO World Heritage', 'Ancient Ruins', 'Hiking', 'Wonder of the World'],
        featured: true,
        popularity: 95
      }
    ],
    
    featured: true,
    popularity: 82
  },
  
  {
    name: 'Oceania',
    code: 'OC',
    description: 'Oceania encompasses Australia, New Zealand, and Pacific islands, offering unique wildlife, stunning beaches, and indigenous cultures.',
    shortDescription: 'Unique wildlife, pristine beaches, and diverse Pacific island cultures.',
    area: 8600000,
    population: 45426569,
    countries: ['Australia', 'New Zealand', 'Fiji', 'Papua New Guinea', 'Samoa', 'Tonga', 'Vanuatu'],
    
    famousPlaces: [
      {
        name: 'Great Barrier Reef',
        country: 'Australia',
        city: 'Queensland',
        description: 'The world\'s largest coral reef system, home to incredible marine biodiversity and offering world-class diving and snorkeling experiences.',
        category: 'Natural Wonder',
        images: [
          {
            url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
            caption: 'Colorful coral reef with tropical fish',
            alt: 'Underwater coral reef scene with diverse marine life'
          }
        ],
        coordinates: { lat: -18.2871, lng: 147.6992 },
        bestTimeToVisit: 'June to October',
        averageStay: '3-5 days',
        difficulty: 'Easy',
        entryFee: { amount: 0, currency: 'AUD', notes: 'Tour costs vary' },
        tags: ['Coral Reef', 'Diving', 'Marine Life', 'UNESCO World Heritage', 'Snorkeling'],
        featured: true,
        popularity: 88
      }
    ],
    
    featured: true,
    popularity: 80
  },
  
  {
    name: 'Antarctica',
    code: 'AN',
    description: 'Antarctica is the southernmost continent, a pristine wilderness of ice and snow. While tourism is limited and regulated, it offers unique experiences with penguins, seals, whales, and breathtaking icy landscapes.',
    shortDescription: 'The pristine icy wilderness at the bottom of the world.',
    area: 14200000,
    population: 0, // No permanent residents
    countries: [], // No countries, governed by Antarctic Treaty
    
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
  }
];

const seedContinents = async () => {
  try {
    await connectDB();
    
    console.log('Clearing existing continents...');
    await Continent.deleteMany({});
    
    console.log('Seeding continents data...');
    const continents = await Continent.insertMany(continentsData);
    
    console.log(`Successfully seeded ${continents.length} continents!`);
    
    // Display summary
    const totalPlaces = continents.reduce((sum, continent) => sum + continent.famousPlaces.length, 0);
    const featuredContinents = continents.filter(c => c.featured).length;
    
    console.log('\n=== SEEDING SUMMARY ===');
    console.log(`Total Continents: ${continents.length}`);
    console.log(`Total Famous Places: ${totalPlaces}`);
    console.log(`Featured Continents: ${featuredContinents}`);
    console.log('========================\n');
    
    // List all continents with place counts
    console.log('Seeded Continents:');
    continents.forEach(continent => {
      console.log(`- ${continent.name} (${continent.code}) - ${continent.famousPlaces.length} places${continent.featured ? ' [FEATURED]' : ''}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding continents:', error);
    process.exit(1);
  }
};

seedContinents();