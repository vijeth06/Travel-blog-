const mongoose = require('mongoose');
const FavoritePlace = require('../models/FavoritePlace');
const User = require('../models/User');

const favoritePlacesData = [
  // Asia
  {
    placeName: "Kyoto Bamboo Grove",
    continent: "Asia",
    country: "Japan",
    city: "Kyoto",
    description: "Walking through the towering bamboo stalks in Arashiyama was like entering another world. The way the sunlight filters through the green canopy creates the most magical atmosphere. I spent hours here just listening to the gentle rustling of bamboo in the wind. It's incredibly peaceful and spiritual - definitely a must-visit when in Kyoto!",
    rating: 5,
    visitDate: new Date('2023-04-15'),
    stayDuration: "Half day",
    personalTips: [
      "Visit early morning (7-8 AM) to avoid crowds and get the best lighting",
      "Bring a good camera - the lighting is perfect for photography",
      "Combine with nearby Tenryu-ji Temple for a full cultural experience"
    ],
    categories: ["Natural Wonder", "Cultural Site"],
    bestTimeToVisit: "Spring (March-May) or Fall (September-November)",
    budget: {
      amount: 50,
      currency: "USD",
      notes: "Including temple entrance and transportation"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        caption: "Sunlight filtering through the bamboo grove",
        alt: "Kyoto Bamboo Grove",
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
    visitDate: new Date('2023-02-20'),
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
  },

  // Europe
  {
    placeName: "Santorini Sunset in Oia",
    continent: "Europe",
    country: "Greece",
    city: "Oia",
    description: "The sunset in Oia is absolutely legendary and lives up to every expectation. The white-washed buildings against the deep blue sea create the perfect backdrop. I stayed for a week and watched the sunset every single evening - each one was unique and spectacular. The whole village comes alive during sunset time.",
    rating: 5,
    visitDate: new Date('2023-06-10'),
    stayDuration: "1 week",
    personalTips: [
      "Arrive at least 1 hour before sunset to get a good spot",
      "Book dinner at a restaurant with sunset views in advance",
      "Explore the village during the day when it's less crowded",
      "Don't miss the blue-domed churches for photos"
    ],
    categories: ["Natural Wonder", "Cultural Site", "Architecture"],
    bestTimeToVisit: "April to June or September to October",
    budget: {
      amount: 200,
      currency: "EUR",
      notes: "Per day including accommodation and meals"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2069&q=80",
        caption: "Iconic sunset view from Oia village",
        alt: "Santorini Oia Sunset",
        isMain: true
      }
    ]
  },
  {
    placeName: "Swiss Alps - Matterhorn",
    continent: "Europe",
    country: "Switzerland",
    city: "Zermatt",
    description: "The Matterhorn is simply iconic - that perfect pyramid shape is instantly recognizable. I took the cable car up to Gornergrat for the best views. The hiking trails around Zermatt offer incredible alpine scenery. Even though it's expensive, the experience is worth every penny. The mountain air is so crisp and clean!",
    rating: 5,
    visitDate: new Date('2023-07-25'),
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

  // North America
  {
    placeName: "Grand Canyon South Rim",
    continent: "North America",
    country: "United States",
    city: "Grand Canyon Village",
    description: "No photo can truly capture the immense scale and beauty of the Grand Canyon. Standing at the South Rim, I was completely overwhelmed by the vastness and the incredible colors of the rock layers. I hiked partway down the Bright Angel Trail and the perspective just keeps changing. It's a humbling experience that reminds you how small we are in nature.",
    rating: 5,
    visitDate: new Date('2023-03-12'),
    stayDuration: "3 days",
    personalTips: [
      "Visit both sunrise and sunset viewpoints - completely different experiences",
      "Start hiking early to avoid heat and crowds",
      "Bring plenty of water and snacks for hiking",
      "Book accommodation inside the park for convenience"
    ],
    categories: ["Natural Wonder", "Adventure", "Hiking"],
    bestTimeToVisit: "March to May or September to November",
    budget: {
      amount: 150,
      currency: "USD",
      notes: "Per day including park fees, accommodation, and meals"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        caption: "Breathtaking view from the South Rim",
        alt: "Grand Canyon South Rim",
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
    visitDate: new Date('2023-08-05'),
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

  // South America
  {
    placeName: "Machu Picchu",
    continent: "South America",
    country: "Peru",
    city: "Aguas Calientes",
    description: "Reaching Machu Picchu after the 4-day Inca Trail trek was incredibly emotional. The ancient citadel perched high in the Andes is even more impressive in person. The engineering and architecture of the Incas is mind-blowing. Watching the sunrise over the ruins with the mist rolling through the mountains was a spiritual experience I'll never forget.",
    rating: 5,
    visitDate: new Date('2023-05-18'),
    stayDuration: "2 days",
    personalTips: [
      "Book Inca Trail permits months in advance",
      "Acclimatize in Cusco for at least 2 days before trekking",
      "Bring altitude sickness medication",
      "Hire a knowledgeable guide to learn about Inca history"
    ],
    categories: ["Historical Site", "Cultural Site", "Adventure", "Mountain"],
    bestTimeToVisit: "May to September (dry season)",
    budget: {
      amount: 400,
      currency: "USD",
      notes: "Including 4-day Inca Trail trek with guide and porter"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2076&q=80",
        caption: "Ancient Inca citadel in the clouds",
        alt: "Machu Picchu Peru",
        isMain: true
      }
    ]
  },

  // Africa
  {
    placeName: "Serengeti National Park",
    continent: "Africa",
    country: "Tanzania",
    city: "Serengeti",
    description: "Witnessing the Great Migration in the Serengeti was absolutely incredible! Millions of wildebeest and zebras moving across the endless plains is a sight that will stay with me forever. Our safari guide was amazing at spotting the Big Five. The sunsets over the savanna are spectacular, and sleeping in a tented camp under the stars was magical.",
    rating: 5,
    visitDate: new Date('2023-01-28'),
    stayDuration: "6 days",
    personalTips: [
      "Visit during migration season (December to July)",
      "Book a reputable safari company with experienced guides",
      "Bring a good camera with telephoto lens",
      "Pack neutral-colored clothing for game drives"
    ],
    categories: ["Wildlife", "Natural Wonder", "Adventure"],
    bestTimeToVisit: "December to July for migration, June to October for general wildlife",
    budget: {
      amount: 500,
      currency: "USD",
      notes: "Per day including accommodation, meals, and game drives"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2068&q=80",
        caption: "Wildebeest migration across the Serengeti plains",
        alt: "Serengeti National Park Tanzania",
        isMain: true
      }
    ]
  },

  // Oceania
  {
    placeName: "Great Barrier Reef",
    continent: "Oceania",
    country: "Australia",
    city: "Cairns",
    description: "Snorkeling in the Great Barrier Reef was like entering an underwater paradise! The diversity of marine life is incredible - colorful coral formations, tropical fish, sea turtles, and reef sharks. I took a day trip from Cairns to the outer reef, and the water clarity was amazing. It's heartbreaking to think this natural wonder is under threat from climate change.",
    rating: 5,
    visitDate: new Date('2023-09-14'),
    stayDuration: "3 days",
    personalTips: [
      "Choose outer reef tours for better coral and visibility",
      "Bring underwater camera or rent one on the boat",
      "Use reef-safe sunscreen to protect the coral",
      "Book tours in advance during peak season"
    ],
    categories: ["Natural Wonder", "Wildlife", "Adventure"],
    bestTimeToVisit: "May to October (dry season)",
    budget: {
      amount: 250,
      currency: "AUD",
      notes: "Per day including boat tours, equipment, and meals"
    },
    images: [
      {
        url: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80",
        caption: "Vibrant coral formations and tropical fish",
        alt: "Great Barrier Reef Australia",
        isMain: true
      }
    ]
  }
];

const seedFavoritePlaces = async () => {
  try {
    console.log('🌱 Starting to seed favorite places...');

    // Clear existing favorite places
    await FavoritePlace.deleteMany({});
    console.log('🗑️  Cleared existing favorite places');

    // Get some users to assign as authors
    const users = await User.find().limit(5);
    if (users.length === 0) {
      console.log('❌ No users found. Please seed users first.');
      return;
    }

    // Assign random users to places and add some social interactions
    const placesToSeed = favoritePlacesData.map((place, index) => {
      const randomUser = users[index % users.length];
      const otherUsers = users.filter(u => u._id.toString() !== randomUser._id.toString());
      
      return {
        ...place,
        user: randomUser._id,
        // Add some likes from other users
        likes: otherUsers.slice(0, Math.floor(Math.random() * 3) + 1).map(user => ({
          user: user._id,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
        })),
        // Add some comments
        comments: otherUsers.slice(0, Math.floor(Math.random() * 2) + 1).map(user => ({
          user: user._id,
          content: [
            "This place looks absolutely amazing! Adding it to my bucket list.",
            "Great tips! Thanks for sharing your experience.",
            "I've been here too and can confirm it's spectacular!",
            "Your photos are stunning! What camera did you use?",
            "Thanks for the detailed review, very helpful for planning my trip."
          ][Math.floor(Math.random() * 5)],
          createdAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000)
        })),
        viewsCount: Math.floor(Math.random() * 500) + 50,
        featured: Math.random() > 0.7, // 30% chance of being featured
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000) // Random date within last 60 days
      };
    });

    // Insert the places
    const createdPlaces = await FavoritePlace.insertMany(placesToSeed);
    console.log(`✅ Successfully seeded ${createdPlaces.length} favorite places`);

    // Log summary by continent
    const continentCounts = {};
    createdPlaces.forEach(place => {
      continentCounts[place.continent] = (continentCounts[place.continent] || 0) + 1;
    });

    console.log('\n📊 Places by continent:');
    Object.entries(continentCounts).forEach(([continent, count]) => {
      console.log(`   ${continent}: ${count} places`);
    });

    console.log('\n🎉 Favorite places seeding completed successfully!');
    
  } catch (error) {
    console.error('❌ Error seeding favorite places:', error);
    throw error;
  }
};

module.exports = { seedFavoritePlaces };

// Run seeder if called directly
if (require.main === module) {
  const connectDB = require('../config/db');
  
  const runSeeder = async () => {
    try {
      await connectDB();
      await seedFavoritePlaces();
      process.exit(0);
    } catch (error) {
      console.error('Seeding failed:', error);
      process.exit(1);
    }
  };

  runSeeder();
}