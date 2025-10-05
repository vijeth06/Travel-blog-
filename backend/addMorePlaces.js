const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

const additionalPlaces = [
  {
    placeName: "Swiss Alps - Matterhorn",
    continent: "Europe",
    country: "Switzerland",
    city: "Zermatt",
    description: "The Matterhorn is simply iconic - that perfect pyramid shape is instantly recognizable. I took the cable car up to Gornergrat for the best views. The hiking trails around Zermatt offer incredible alpine scenery. Even though it's expensive, the experience is worth every penny. The mountain air is so crisp and clean!",
    rating: 5,
    visitDate: "2023-07-25",
    stayDuration: "4 days",
    personalTips: [
      "Take the early morning train to Gornergrat for clear mountain views",
      "Book accommodation in Zermatt well in advance",
      "Try the local Swiss cuisine - fondue is a must!",
      "Bring layers - weather can change quickly in the mountains"
    ],
    categories: ["Natural Wonder", "Mountain", "Adventure"],
    bestTimeToVisit: "June to September for hiking, December to March for skiing",
    budget: {
      amount: 300,
      currency: "CHF",
      notes: "Per day including accommodation, meals, and cable cars"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        caption: "The iconic Matterhorn peak",
        alt: "Matterhorn Swiss Alps",
        isMain: true
      }
    ]
  },
  {
    placeName: "Banff National Park",
    continent: "North America",
    country: "Canada",
    city: "Banff",
    description: "Banff is like stepping into a postcard! Lake Louise with its turquoise waters surrounded by snow-capped peaks is absolutely stunning. I rented a canoe and paddled around the lake - the water is incredibly clear. The town of Banff itself is charming with great restaurants and shops. Wildlife spotting was amazing - saw elk, bears, and mountain goats!",
    rating: 5,
    visitDate: "2023-08-05",
    stayDuration: "5 days",
    personalTips: [
      "Visit Lake Louise early morning for the best reflections",
      "Take the Banff Gondola for panoramic mountain views",
      "Book restaurants in advance during peak season",
      "Always carry bear spray when hiking"
    ],
    categories: ["Natural Wonder", "Mountain", "Wildlife", "Adventure"],
    bestTimeToVisit: "June to August for hiking, December to March for skiing",
    budget: {
      amount: 180,
      currency: "CAD",
      notes: "Per day including accommodation, meals, and activities"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
        caption: "Crystal clear waters of Lake Louise",
        alt: "Banff National Park Lake Louise",
        isMain: true
      }
    ]
  },
  {
    placeName: "Angkor Wat",
    continent: "Asia",
    country: "Cambodia",
    city: "Siem Reap",
    description: "Watching the sunrise over Angkor Wat was one of the most breathtaking experiences of my life. The ancient temple complex is massive and incredibly well-preserved. Each temple tells a different story through its intricate carvings. I recommend getting a 3-day pass to fully explore the area without rushing.",
    rating: 5,
    visitDate: "2023-02-20",
    stayDuration: "3 days",
    personalTips: [
      "Start with sunrise at Angkor Wat, then explore other temples",
      "Hire a local guide to understand the historical significance",
      "Bring plenty of water and sun protection",
      "Respect the dress code - cover shoulders and knees"
    ],
    categories: ["Historical Site", "Cultural Site", "Architecture"],
    bestTimeToVisit: "November to March (dry season)",
    budget: {
      amount: 120,
      currency: "USD",
      notes: "3-day temple pass plus guide and transportation"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80",
        caption: "Sunrise over Angkor Wat temple complex",
        alt: "Angkor Wat Cambodia",
        isMain: true
      }
    ]
  }
];

async function addMorePlaces() {
  try {
    console.log('🌱 Adding more favorite places...');

    for (let i = 0; i < additionalPlaces.length; i++) {
      const place = additionalPlaces[i];
      console.log(`Creating place ${i + 1}: ${place.placeName}`);
      
      try {
        const response = await axios.post(`${API_BASE}/favorite-places`, place);
        console.log(`✅ Created: ${place.placeName}`);
      } catch (error) {
        console.log(`❌ Failed to create ${place.placeName}:`, error.response?.data?.message || error.message);
      }
    }

    console.log('🎉 Finished adding more places!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addMorePlaces();