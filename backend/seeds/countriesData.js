const mongoose = require('mongoose');
const Country = require('../models/Country');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-blog';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for seeding countries...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const countriesData = [
  // India and Indian States/Regions
  {
    name: 'India',
    code: 'IN',
    continent: 'Asia',
    region: 'South Asia',
    capital: 'New Delhi',
    currency: {
      code: 'INR',
      symbol: '₹',
      name: 'Indian Rupee'
    },
    languages: ['Hindi', 'English', 'Bengali', 'Telugu', 'Marathi', 'Tamil'],
    description: 'India is a diverse country with rich cultural heritage, ancient traditions, and stunning landscapes ranging from the Himalayas to tropical beaches.',
    popularDestinations: ['Delhi', 'Mumbai', 'Goa', 'Kerala', 'Rajasthan', 'Kashmir', 'Agra', 'Varanasi', 'Rishikesh', 'Manali'],
    bestTimeToVisit: 'October to March',
    travelTips: [
      'Respect local customs and dress modestly at religious sites',
      'Try local street food but choose busy stalls for freshness',
      'Bargain at local markets but be respectful',
      'Carry cash as many places don\'t accept cards',
      'Learn basic Hindi phrases for better interaction'
    ],
    featured: true,
    isIndia: true,
    flagUrl: 'https://flagcdn.com/w320/in.png'
  },
  {
    name: 'Rajasthan',
    code: 'IN-RJ',
    continent: 'Asia',
    region: 'North India',
    capital: 'Jaipur',
    currency: {
      code: 'INR',
      symbol: '₹',
      name: 'Indian Rupee'
    },
    languages: ['Hindi', 'Rajasthani', 'English'],
    description: 'The Land of Kings, famous for its majestic palaces, desert landscapes, and vibrant culture.',
    popularDestinations: ['Jaipur', 'Udaipur', 'Jodhpur', 'Jaisalmer', 'Pushkar', 'Mount Abu'],
    bestTimeToVisit: 'October to March',
    featured: true,
    isIndia: true,
    state: 'Rajasthan'
  },
  {
    name: 'Kerala',
    code: 'IN-KL',
    continent: 'Asia',
    region: 'South India',
    capital: 'Thiruvananthapuram',
    currency: {
      code: 'INR',
      symbol: '₹',
      name: 'Indian Rupee'
    },
    languages: ['Malayalam', 'English', 'Hindi'],
    description: 'God\'s Own Country, known for backwaters, spice plantations, and Ayurvedic treatments.',
    popularDestinations: ['Kochi', 'Munnar', 'Alleppey', 'Thekkady', 'Wayanad', 'Kovalam'],
    bestTimeToVisit: 'September to March',
    featured: true,
    isIndia: true,
    state: 'Kerala'
  },
  {
    name: 'Goa',
    code: 'IN-GA',
    continent: 'Asia',
    region: 'West India',
    capital: 'Panaji',
    currency: {
      code: 'INR',
      symbol: '₹',
      name: 'Indian Rupee'
    },
    languages: ['Konkani', 'English', 'Hindi', 'Portuguese'],
    description: 'Famous for beautiful beaches, Portuguese architecture, and vibrant nightlife.',
    popularDestinations: ['Baga Beach', 'Calangute', 'Anjuna', 'Old Goa', 'Dudhsagar Falls'],
    bestTimeToVisit: 'November to February',
    featured: true,
    isIndia: true,
    state: 'Goa'
  },
  {
    name: 'Himachal Pradesh',
    code: 'IN-HP',
    continent: 'Asia',
    region: 'North India',
    capital: 'Shimla',
    currency: {
      code: 'INR',
      symbol: '₹',
      name: 'Indian Rupee'
    },
    languages: ['Hindi', 'English', 'Pahari'],
    description: 'Land of snow-capped mountains, hill stations, and adventure sports.',
    popularDestinations: ['Manali', 'Shimla', 'Dharamshala', 'Kasol', 'Spiti Valley', 'Dalhousie'],
    bestTimeToVisit: 'March to June, September to November',
    featured: true,
    isIndia: true,
    state: 'Himachal Pradesh'
  },
  {
    name: 'Uttarakhand',
    code: 'IN-UT',
    continent: 'Asia',
    region: 'North India',
    capital: 'Dehradun',
    currency: {
      code: 'INR',
      symbol: '₹',
      name: 'Indian Rupee'
    },
    languages: ['Hindi', 'English', 'Garhwali', 'Kumaoni'],
    description: 'Devbhoomi (Land of Gods), famous for spiritual sites and Himalayan beauty.',
    popularDestinations: ['Rishikesh', 'Haridwar', 'Nainital', 'Mussoorie', 'Jim Corbett', 'Kedarnath'],
    bestTimeToVisit: 'March to June, September to November',
    isIndia: true,
    state: 'Uttarakhand'
  },

  // International Countries
  {
    name: 'Thailand',
    code: 'TH',
    continent: 'Asia',
    region: 'Southeast Asia',
    capital: 'Bangkok',
    currency: {
      code: 'THB',
      symbol: '฿',
      name: 'Thai Baht'
    },
    languages: ['Thai', 'English'],
    description: 'Land of Smiles, known for beautiful beaches, temples, delicious cuisine, and warm hospitality.',
    popularDestinations: ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Krabi', 'Koh Samui'],
    bestTimeToVisit: 'November to April',
    travelTips: [
      'Remove shoes before entering temples',
      'Dress modestly at religious sites',
      'Try street food - it\'s delicious and safe',
      'Learn basic Thai greetings',
      'Bargain at markets but be respectful'
    ],
    featured: true,
    flagUrl: 'https://flagcdn.com/w320/th.png'
  },
  {
    name: 'Singapore',
    code: 'SG',
    continent: 'Asia',
    region: 'Southeast Asia',
    capital: 'Singapore',
    currency: {
      code: 'SGD',
      symbol: 'S$',
      name: 'Singapore Dollar'
    },
    languages: ['English', 'Mandarin', 'Malay', 'Tamil'],
    description: 'Modern city-state known for its cleanliness, diverse culture, and excellent food scene.',
    popularDestinations: ['Marina Bay', 'Sentosa Island', 'Gardens by the Bay', 'Chinatown', 'Little India'],
    bestTimeToVisit: 'February to April',
    featured: true,
    flagUrl: 'https://flagcdn.com/w320/sg.png'
  },
  {
    name: 'Malaysia',
    code: 'MY',
    continent: 'Asia',
    region: 'Southeast Asia',
    capital: 'Kuala Lumpur',
    currency: {
      code: 'MYR',
      symbol: 'RM',
      name: 'Malaysian Ringgit'
    },
    languages: ['Malay', 'English', 'Mandarin', 'Tamil'],
    description: 'Truly Asia - a melting pot of cultures with modern cities and pristine nature.',
    popularDestinations: ['Kuala Lumpur', 'Penang', 'Langkawi', 'Malacca', 'Cameron Highlands'],
    bestTimeToVisit: 'December to February',
    featured: true,
    flagUrl: 'https://flagcdn.com/w320/my.png'
  },
  {
    name: 'Indonesia',
    code: 'ID',
    continent: 'Asia',
    region: 'Southeast Asia',
    capital: 'Jakarta',
    currency: {
      code: 'IDR',
      symbol: 'Rp',
      name: 'Indonesian Rupiah'
    },
    languages: ['Indonesian', 'English', 'Javanese'],
    description: 'Archipelago nation with thousands of islands, rich culture, and stunning natural beauty.',
    popularDestinations: ['Bali', 'Jakarta', 'Yogyakarta', 'Lombok', 'Komodo Island', 'Borobudur'],
    bestTimeToVisit: 'April to October',
    featured: true,
    flagUrl: 'https://flagcdn.com/w320/id.png'
  },
  {
    name: 'Nepal',
    code: 'NP',
    continent: 'Asia',
    region: 'South Asia',
    capital: 'Kathmandu',
    currency: {
      code: 'NPR',
      symbol: '₨',
      name: 'Nepalese Rupee'
    },
    languages: ['Nepali', 'English'],
    description: 'Home to Mount Everest and rich Buddhist culture, perfect for trekking and spiritual journeys.',
    popularDestinations: ['Kathmandu', 'Pokhara', 'Everest Base Camp', 'Annapurna', 'Lumbini'],
    bestTimeToVisit: 'October to December, March to May',
    featured: true,
    flagUrl: 'https://flagcdn.com/w320/np.png'
  },
  {
    name: 'Sri Lanka',
    code: 'LK',
    continent: 'Asia',
    region: 'South Asia',
    capital: 'Colombo',
    currency: {
      code: 'LKR',
      symbol: '₨',
      name: 'Sri Lankan Rupee'
    },
    languages: ['Sinhala', 'Tamil', 'English'],
    description: 'Pearl of the Indian Ocean, known for tea plantations, ancient ruins, and beautiful beaches.',
    popularDestinations: ['Colombo', 'Kandy', 'Galle', 'Sigiriya', 'Ella', 'Nuwara Eliya'],
    bestTimeToVisit: 'December to March, July to September',
    featured: true,
    flagUrl: 'https://flagcdn.com/w320/lk.png'
  },
  {
    name: 'Maldives',
    code: 'MV',
    continent: 'Asia',
    region: 'South Asia',
    capital: 'Malé',
    currency: {
      code: 'MVR',
      symbol: '.ރ',
      name: 'Maldivian Rufiyaa'
    },
    languages: ['Dhivehi', 'English'],
    description: 'Tropical paradise with crystal-clear waters, luxury resorts, and pristine coral reefs.',
    popularDestinations: ['Malé', 'Hulhumalé', 'Maafushi', 'Veligandu', 'Biyadhoo'],
    bestTimeToVisit: 'November to April',
    featured: true,
    flagUrl: 'https://flagcdn.com/w320/mv.png'
  },
  {
    name: 'Bhutan',
    code: 'BT',
    continent: 'Asia',
    region: 'South Asia',
    capital: 'Thimphu',
    currency: {
      code: 'BTN',
      symbol: 'Nu.',
      name: 'Bhutanese Ngultrum'
    },
    languages: ['Dzongkha', 'English'],
    description: 'Last Shangri-La, known for Gross National Happiness and pristine Buddhist culture.',
    popularDestinations: ['Thimphu', 'Paro', 'Punakha', 'Wangdue', 'Bumthang'],
    bestTimeToVisit: 'March to May, September to November',
    featured: true,
    flagUrl: 'https://flagcdn.com/w320/bt.png'
  },

  // European Countries
  {
    name: 'France',
    code: 'FR',
    continent: 'Europe',
    region: 'Western Europe',
    capital: 'Paris',
    currency: {
      code: 'EUR',
      symbol: '€',
      name: 'Euro'
    },
    languages: ['French', 'English'],
    description: 'Country of art, fashion, cuisine, and romance with iconic landmarks and rich history.',
    popularDestinations: ['Paris', 'Nice', 'Lyon', 'Marseille', 'Bordeaux', 'Strasbourg'],
    bestTimeToVisit: 'April to June, September to November',
    featured: true,
    flagUrl: 'https://flagcdn.com/w320/fr.png'
  },
  {
    name: 'Italy',
    code: 'IT',
    continent: 'Europe',
    region: 'Southern Europe',
    capital: 'Rome',
    currency: {
      code: 'EUR',
      symbol: '€',
      name: 'Euro'
    },
    languages: ['Italian', 'English'],
    description: 'Boot-shaped peninsula famous for art, architecture, cuisine, and historical sites.',
    popularDestinations: ['Rome', 'Venice', 'Florence', 'Milan', 'Naples', 'Tuscany'],
    bestTimeToVisit: 'April to June, September to October',
    featured: true,
    flagUrl: 'https://flagcdn.com/w320/it.png'
  },
  {
    name: 'Spain',
    code: 'ES',
    continent: 'Europe',
    region: 'Southern Europe',
    capital: 'Madrid',
    currency: {
      code: 'EUR',
      symbol: '€',
      name: 'Euro'
    },
    languages: ['Spanish', 'English', 'Catalan'],
    description: 'Vibrant country known for flamenco, festivals, beautiful beaches, and rich cultural heritage.',
    popularDestinations: ['Madrid', 'Barcelona', 'Seville', 'Valencia', 'Granada', 'Bilbao'],
    bestTimeToVisit: 'March to May, September to November',
    featured: true,
    flagUrl: 'https://flagcdn.com/w320/es.png'
  },
  {
    name: 'United Kingdom',
    code: 'GB',
    continent: 'Europe',
    region: 'Northern Europe',
    capital: 'London',
    currency: {
      code: 'GBP',
      symbol: '£',
      name: 'British Pound'
    },
    languages: ['English'],
    description: 'Island nation with rich history, royal heritage, and diverse landscapes from Scotland to Cornwall.',
    popularDestinations: ['London', 'Edinburgh', 'Bath', 'York', 'Cambridge', 'Oxford'],
    bestTimeToVisit: 'May to September',
    featured: true,
    flagUrl: 'https://flagcdn.com/w320/gb.png'
  },
  {
    name: 'Germany',
    code: 'DE',
    continent: 'Europe',
    region: 'Central Europe',
    capital: 'Berlin',
    currency: {
      code: 'EUR',
      symbol: '€',
      name: 'Euro'
    },
    languages: ['German', 'English'],
    description: 'Central European country known for its history, castles, beer culture, and Christmas markets.',
    popularDestinations: ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt', 'Dresden'],
    bestTimeToVisit: 'May to September',
    featured: true,
    flagUrl: 'https://flagcdn.com/w320/de.png'
  },

  // Other Popular Destinations
  {
    name: 'United States',
    code: 'US',
    continent: 'North America',
    region: 'North America',
    capital: 'Washington D.C.',
    currency: {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar'
    },
    languages: ['English', 'Spanish'],
    description: 'Diverse country with iconic cities, national parks, and varied landscapes from coast to coast.',
    popularDestinations: ['New York', 'Los Angeles', 'Las Vegas', 'San Francisco', 'Miami', 'Chicago'],
    bestTimeToVisit: 'April to June, September to November',
    featured: true,
    flagUrl: 'https://flagcdn.com/w320/us.png'
  },
  {
    name: 'Australia',
    code: 'AU',
    continent: 'Oceania',
    region: 'Australia and New Zealand',
    capital: 'Canberra',
    currency: {
      code: 'AUD',
      symbol: 'A$',
      name: 'Australian Dollar'
    },
    languages: ['English'],
    description: 'Land Down Under with unique wildlife, stunning beaches, and vibrant cities.',
    popularDestinations: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Darwin'],
    bestTimeToVisit: 'September to November, March to May',
    featured: true,
    flagUrl: 'https://flagcdn.com/w320/au.png'
  },
  {
    name: 'Japan',
    code: 'JP',
    continent: 'Asia',
    region: 'East Asia',
    capital: 'Tokyo',
    currency: {
      code: 'JPY',
      symbol: '¥',
      name: 'Japanese Yen'
    },
    languages: ['Japanese', 'English'],
    description: 'Land of the Rising Sun, blending ancient traditions with cutting-edge technology.',
    popularDestinations: ['Tokyo', 'Kyoto', 'Osaka', 'Hiroshima', 'Nara', 'Mount Fuji'],
    bestTimeToVisit: 'March to May, September to November',
    featured: true,
    flagUrl: 'https://flagcdn.com/w320/jp.png'
  },
  {
    name: 'South Korea',
    code: 'KR',
    continent: 'Asia',
    region: 'East Asia',
    capital: 'Seoul',
    currency: {
      code: 'KRW',
      symbol: '₩',
      name: 'South Korean Won'
    },
    languages: ['Korean', 'English'],
    description: 'Dynamic country known for K-pop, technology, delicious cuisine, and rich cultural heritage.',
    popularDestinations: ['Seoul', 'Busan', 'Jeju Island', 'Gyeongju', 'Incheon', 'Daegu'],
    bestTimeToVisit: 'April to June, September to November',
    featured: true,
    flagUrl: 'https://flagcdn.com/w320/kr.png'
  },
  {
    name: 'China',
    code: 'CN',
    continent: 'Asia',
    region: 'East Asia',
    capital: 'Beijing',
    currency: {
      code: 'CNY',
      symbol: '¥',
      name: 'Chinese Yuan'
    },
    languages: ['Mandarin', 'English'],
    description: 'Ancient civilization with modern cities, Great Wall, and diverse landscapes.',
    popularDestinations: ['Beijing', 'Shanghai', 'Xi\'an', 'Guilin', 'Chengdu', 'Hangzhou'],
    bestTimeToVisit: 'April to May, September to October',
    featured: true,
    flagUrl: 'https://flagcdn.com/w320/cn.png'
  }
];

const seedCountries = async () => {
  try {
    await connectDB();
    
    console.log('Clearing existing countries...');
    await Country.deleteMany({});
    
    console.log('Seeding countries data...');
    const countries = await Country.insertMany(countriesData);
    
    console.log(`Successfully seeded ${countries.length} countries!`);
    
    // Display summary
    const indiaCount = countries.filter(c => c.isIndia).length;
    const internationalCount = countries.filter(c => !c.isIndia).length;
    const featuredCount = countries.filter(c => c.featured).length;
    
    console.log('\n=== SEEDING SUMMARY ===');
    console.log(`Total Countries: ${countries.length}`);
    console.log(`Indian Regions: ${indiaCount}`);
    console.log(`International: ${internationalCount}`);
    console.log(`Featured: ${featuredCount}`);
    console.log('========================\n');
    
    // List all countries
    console.log('Seeded Countries:');
    countries.forEach(country => {
      console.log(`- ${country.name} (${country.code}) - ${country.continent}${country.isIndia ? ' [INDIA]' : ''}${country.featured ? ' [FEATURED]' : ''}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding countries:', error);
    process.exit(1);
  }
};

seedCountries();