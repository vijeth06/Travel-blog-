const mongoose = require('mongoose');
const User = require('../models/User');
const Blog = require('../models/Blog');
const Category = require('../models/Category');
const Comment = require('../models/Comment');
const Review = require('../models/Review');
const Booking = require('../models/Booking');
const Package = require('../models/Package');
const Itinerary = require('../models/Itinerary');
const Follow = require('../models/Follow');
const Like = require('../models/Like');
const Notification = require('../models/Notification');
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const Achievement = require('../models/Achievement');
const Badge = require('../models/Badge');
const UserProgress = require('../models/UserProgress');
const TravelChallenge = require('../models/TravelChallenge');
const PhotoGallery = require('../models/PhotoGallery');
const Bookmark = require('../models/Bookmark');
const Trip = require('../models/Trip');
const Collection = require('../models/Collection');
const dotenv = require('dotenv');

dotenv.config();

const DEMO_PASSWORD = 'Demo@123'; // Same password for all demo accounts

// Realistic user data
const demoUsers = [
  {
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@example.com',
    role: 'author',
    country: 'United States',
    city: 'San Francisco',
    phone: '+1-415-555-0123',
    gender: 'Female',
    dateOfBirth: new Date('1990-03-15'),
    bio: 'Adventure seeker and travel photographer exploring hidden gems around the world. Passionate about sustainable tourism and cultural immersion.',
    website: 'https://sarahtravels.com',
    authorVerified: true,
    nationality: 'American',
    travelPreferences: {
      budgetRange: 'Mid-range',
      preferredDestinations: ['Japan', 'Iceland', 'New Zealand', 'Peru'],
      travelStyle: 'Adventure',
      groupSize: 'Solo'
    },
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    name: 'James Rodriguez',
    email: 'james.rodriguez@example.com',
    role: 'author',
    country: 'Spain',
    city: 'Barcelona',
    phone: '+34-93-555-0234',
    gender: 'Male',
    dateOfBirth: new Date('1985-07-22'),
    bio: 'Food and culture enthusiast. Documenting authentic culinary experiences from street food to Michelin stars.',
    website: 'https://jamesculinaryjourney.com',
    authorVerified: true,
    nationality: 'Spanish',
    travelPreferences: {
      budgetRange: 'Luxury',
      preferredDestinations: ['Italy', 'France', 'Thailand', 'Mexico'],
      travelStyle: 'Cultural',
      groupSize: 'Couple'
    },
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    role: 'author',
    country: 'India',
    city: 'Mumbai',
    phone: '+91-22-555-0345',
    gender: 'Female',
    dateOfBirth: new Date('1992-11-08'),
    bio: 'Yoga instructor and wellness traveler. Exploring spiritual destinations and retreat centers worldwide.',
    website: 'https://priyawellnesstravel.com',
    authorVerified: true,
    nationality: 'Indian',
    travelPreferences: {
      budgetRange: 'Mid-range',
      preferredDestinations: ['Bali', 'India', 'Costa Rica', 'Greece'],
      travelStyle: 'Relaxation',
      groupSize: 'Solo'
    },
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    name: 'Marcus Chen',
    email: 'marcus.chen@example.com',
    role: 'author',
    country: 'Singapore',
    city: 'Singapore',
    phone: '+65-6555-0456',
    gender: 'Male',
    dateOfBirth: new Date('1988-05-30'),
    bio: 'Tech entrepreneur and digital nomad. Reviewing co-working spaces and remote work destinations.',
    website: 'https://marcusremote.com',
    authorVerified: true,
    nationality: 'Singaporean',
    travelPreferences: {
      budgetRange: 'Luxury',
      preferredDestinations: ['Portugal', 'Estonia', 'Bali', 'Mexico'],
      travelStyle: 'Business',
      groupSize: 'Solo'
    },
    avatar: 'https://randomuser.me/api/portraits/men/46.jpg'
  },
  {
    name: 'Emma Thompson',
    email: 'emma.thompson@example.com',
    role: 'visitor',
    country: 'United Kingdom',
    city: 'London',
    phone: '+44-20-555-0567',
    gender: 'Female',
    dateOfBirth: new Date('1995-09-12'),
    bio: 'Architecture student with a passion for historical sites and UNESCO World Heritage locations.',
    nationality: 'British',
    travelPreferences: {
      budgetRange: 'Budget',
      preferredDestinations: ['Italy', 'Egypt', 'Cambodia', 'Jordan'],
      travelStyle: 'Cultural',
      groupSize: 'Group'
    },
    avatar: 'https://randomuser.me/api/portraits/women/28.jpg'
  },
  {
    name: 'Ahmed Al-Rashid',
    email: 'ahmed.alrashid@example.com',
    role: 'visitor',
    country: 'United Arab Emirates',
    city: 'Dubai',
    phone: '+971-4-555-0678',
    gender: 'Male',
    dateOfBirth: new Date('1987-02-18'),
    bio: 'Family travel enthusiast planning memorable vacations with kids.',
    nationality: 'Emirati',
    travelPreferences: {
      budgetRange: 'Luxury',
      preferredDestinations: ['Maldives', 'Switzerland', 'Japan', 'Australia'],
      travelStyle: 'Relaxation',
      groupSize: 'Family'
    },
    avatar: 'https://randomuser.me/api/portraits/men/78.jpg'
  },
  {
    name: 'Lucia Fernandez',
    email: 'lucia.fernandez@example.com',
    role: 'visitor',
    country: 'Argentina',
    city: 'Buenos Aires',
    phone: '+54-11-555-0789',
    gender: 'Female',
    dateOfBirth: new Date('1993-06-25'),
    bio: 'Wildlife photographer capturing nature\'s beauty in remote corners of the world.',
    nationality: 'Argentine',
    travelPreferences: {
      budgetRange: 'Mid-range',
      preferredDestinations: ['Patagonia', 'Kenya', 'Alaska', 'Madagascar'],
      travelStyle: 'Adventure',
      groupSize: 'Solo'
    },
    avatar: 'https://randomuser.me/api/portraits/women/55.jpg'
  },
  {
    name: 'David Kim',
    email: 'david.kim@example.com',
    role: 'visitor',
    country: 'South Korea',
    city: 'Seoul',
    phone: '+82-2-555-0890',
    gender: 'Male',
    dateOfBirth: new Date('1991-12-03'),
    bio: 'K-pop fan and cultural explorer discovering music scenes around the globe.',
    nationality: 'Korean',
    travelPreferences: {
      budgetRange: 'Budget',
      preferredDestinations: ['Japan', 'USA', 'UK', 'Thailand'],
      travelStyle: 'Cultural',
      groupSize: 'Group'
    },
    avatar: 'https://randomuser.me/api/portraits/men/61.jpg'
  },
  {
    name: 'Olivia Williams',
    email: 'olivia.williams@example.com',
    role: 'visitor',
    country: 'Australia',
    city: 'Sydney',
    phone: '+61-2-555-0901',
    gender: 'Female',
    dateOfBirth: new Date('1989-04-17'),
    bio: 'Beach lover and surf instructor chasing the perfect wave across continents.',
    nationality: 'Australian',
    travelPreferences: {
      budgetRange: 'Mid-range',
      preferredDestinations: ['Hawaii', 'Bali', 'Portugal', 'Costa Rica'],
      travelStyle: 'Adventure',
      groupSize: 'Couple'
    },
    avatar: 'https://randomuser.me/api/portraits/women/72.jpg'
  },
  {
    name: 'Mohamed Hassan',
    email: 'mohamed.hassan@example.com',
    role: 'visitor',
    country: 'Egypt',
    city: 'Cairo',
    phone: '+20-2-555-1012',
    gender: 'Male',
    dateOfBirth: new Date('1986-08-29'),
    bio: 'History teacher passionate about ancient civilizations and archaeological sites.',
    nationality: 'Egyptian',
    travelPreferences: {
      budgetRange: 'Budget',
      preferredDestinations: ['Greece', 'Italy', 'Peru', 'Jordan'],
      travelStyle: 'Cultural',
      groupSize: 'Family'
    },
    avatar: 'https://randomuser.me/api/portraits/men/85.jpg'
  }
];

// Demo Showcase Account
const showcaseAccount = {
  name: 'Alexandra Sterling',
  email: 'demo@travelapp.com',
  password: DEMO_PASSWORD,
  role: 'admin',
  country: 'Switzerland',
  city: 'Zurich',
  phone: '+41-44-555-0000',
  gender: 'Female',
  dateOfBirth: new Date('1985-01-15'),
  bio: 'Global travel expert and luxury travel consultant. Visited 127 countries across all 7 continents. Specializing in bespoke travel experiences and authentic cultural encounters. Official demo account showcasing all platform features.',
  website: 'https://alexandrasterling.com',
  authorVerified: true,
  nationality: 'Swiss',
  passport: 'CH1234567',
  address: 'Bahnhofstrasse 45, 8001 Zurich, Switzerland',
  emergencyContact: {
    name: 'Robert Sterling',
    phone: '+41-44-555-0001',
    relation: 'Spouse'
  },
  travelPreferences: {
    budgetRange: 'Luxury',
    preferredDestinations: ['Maldives', 'French Polynesia', 'Antarctica', 'Bhutan', 'Iceland'],
    travelStyle: 'Cultural',
    groupSize: 'Couple'
  },
  social: {
    instagram: '@alexandrasterling',
    twitter: '@alexsterling',
    linkedin: 'alexandra-sterling'
  },
  isVerified: true,
  isActive: true,
  onboarding: {
    isCompleted: true,
    completedAt: new Date('2024-01-15'),
    steps: [
      { key: 'complete_profile', completedAt: new Date('2024-01-15') },
      { key: 'follow_first_author', completedAt: new Date('2024-01-16') },
      { key: 'create_first_post', completedAt: new Date('2024-01-17') },
      { key: 'join_community', completedAt: new Date('2024-01-18') }
    ]
  },
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date()
};

// Demo Package Provider Account
const packageProviderAccount = {
  name: 'Michael Chen',
  email: 'provider@travelapp.com',
  password: DEMO_PASSWORD,
  role: 'package_provider',
  country: 'Singapore',
  city: 'Singapore',
  phone: '+65-6123-4567',
  gender: 'Male',
  dateOfBirth: new Date('1980-05-20'),
  bio: 'Professional tour operator with 15 years of experience. Specialized in Asian adventure tours and cultural experiences.',
  providerInfo: {
    companyName: 'Adventure Asia Tours',
    businessLicense: 'AAT-SG-2020-001234',
    verified: true,
    rating: 4.8,
    totalPackages: 0,
    description: 'Leading provider of authentic Asian travel experiences. We offer carefully curated tours across Southeast Asia, combining adventure, culture, and comfort.',
    address: '123 Orchard Road, #10-01, Singapore 238858',
    contactNumber: '+65-6123-4567',
    website: 'https://adventureasiatours.com'
  },
  isVerified: true,
  isActive: true,
  createdAt: new Date('2024-03-01'),
  updatedAt: new Date()
};

// Blog posts for showcase account
const showcaseBlogPosts = [
  {
    title: 'The Ultimate Guide to Sustainable Travel in 2025',
    slug: 'ultimate-guide-sustainable-travel-2025',
    excerpt: 'Discover how to explore the world responsibly while minimizing your environmental impact and supporting local communities.',
    content: `# Introduction\n\nSustainable travel has become more than just a trend—it's a responsibility. As travelers, we have the power to make positive impacts on the destinations we visit.\n\n## Key Principles\n\n1. **Reduce Carbon Footprint**: Choose direct flights, use public transportation, and offset emissions.\n2. **Support Local Communities**: Stay in locally-owned accommodations, eat at family restaurants, and buy from local artisans.\n3. **Respect Wildlife**: Observe animals in their natural habitat without disturbing them.\n4. **Minimize Waste**: Carry reusable items and say no to single-use plastics.\n\n## Practical Tips\n\n- Pack light to reduce fuel consumption\n- Choose eco-certified accommodations\n- Participate in conservation activities\n- Learn about local customs and traditions\n\nTogether, we can ensure that future generations can enjoy the same beautiful destinations we love today.`,
    location: 'Global',
    geotag: { country: 'Various', continent: 'Global' },
    tags: ['sustainable travel', 'eco-tourism', 'responsible travel', 'green travel'],
    status: 'published',
    featured: true,
    trending: true,
    views: 15420,
    likes: 892,
    readingTime: 8,
    publishedAt: new Date('2025-01-15'),
    featuredImage: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29'
  },
  {
    title: 'Hidden Gems of Kyoto: Beyond the Tourist Trail',
    slug: 'hidden-gems-kyoto-beyond-tourist-trail',
    excerpt: 'Explore the secret temples, traditional teahouses, and peaceful gardens that most visitors never discover.',
    content: `# Discovering Authentic Kyoto\n\nWhile Fushimi Inari and Kinkaku-ji are stunning, Kyoto's true magic lies in its lesser-known treasures.\n\n## Secret Spots\n\n### 1. Otagi Nenbutsu-ji Temple\nHome to 1,200 unique stone statues, each with distinct expressions.\n\n### 2. Philosopher's Path\nEspecially beautiful during cherry blossom season, but magical year-round.\n\n### 3. Kifune Shrine\nNestled in the mountains, offering a serene escape from city crowds.\n\n## Local Experiences\n\n- Traditional kaiseki dinner in Gion\n- Morning meditation at a zen temple\n- Sake tasting in Fushimi district\n- Kimono rental and photoshoot\n\nVisit during shoulder season (April-May or October-November) for the best experience.`,
    location: 'Kyoto, Japan',
    geotag: {
      lat: 35.0116,
      lng: 135.7681,
      address: 'Kyoto, Japan',
      country: 'Japan',
      countryCode: 'JP',
      city: 'Kyoto',
      continent: 'Asia'
    },
    tags: ['Japan', 'Kyoto', 'temples', 'culture', 'hidden gems'],
    status: 'published',
    featured: true,
    views: 12340,
    likes: 756,
    readingTime: 6,
    publishedAt: new Date('2025-02-20')
  },
  {
    title: 'Luxury Safari Experience in Tanzania: Worth Every Penny',
    slug: 'luxury-safari-tanzania-worth-every-penny',
    excerpt: 'My unforgettable week at a luxury tented camp in the Serengeti, witnessing the Great Migration.',
    content: `# A Safari Like No Other\n\nTanzania exceeded all expectations. From witnessing the Great Migration to sundowners in the bush, every moment was extraordinary.\n\n## The Experience\n\n**Accommodation**: Stayed at Singita Sasakwa Lodge—stunning views, impeccable service, and incredible wildlife viewing from the room.\n\n**Wildlife Encounters**:\n- Lions hunting at dawn\n- Leopard with cubs in a tree\n- Massive elephant herds\n- Thousands of wildebeest during migration\n\n## Best Time to Visit\n\n- **January-February**: Calving season in southern Serengeti\n- **June-July**: River crossings during migration\n- **September-October**: Dry season, best wildlife viewing\n\n## Budget\n\nExpect $800-1500 per person per night for luxury lodges, but the experience is priceless. Consider combining with Zanzibar for beach relaxation.`,
    location: 'Serengeti, Tanzania',
    geotag: {
      lat: -2.3333,
      lng: 34.8333,
      address: 'Serengeti National Park, Tanzania',
      country: 'Tanzania',
      countryCode: 'TZ',
      city: 'Serengeti',
      continent: 'Africa'
    },
    tags: ['Tanzania', 'safari', 'luxury travel', 'wildlife', 'Serengeti'],
    status: 'published',
    views: 9870,
    likes: 623,
    readingTime: 7,
    publishedAt: new Date('2025-03-10')
  },
  {
    title: 'Digital Nomad Guide: Working from Lisbon',
    slug: 'digital-nomad-guide-working-lisbon',
    excerpt: 'Everything you need to know about living and working remotely in Portugal\'s vibrant capital.',
    content: `# Why Lisbon?\n\nLisbon has become a digital nomad hotspot for good reason: affordable living, excellent infrastructure, and amazing food.\n\n## Practical Information\n\n### Best Neighborhoods\n- **Príncipe Real**: Trendy cafes and co-working spaces\n- **Alfama**: Historic charm, quieter atmosphere\n- **Santos**: Up-and-coming, great value\n\n### Co-working Spaces\n1. Second Home Lisboa\n2. Heden\n3. SITIO\n\n### Cost of Living (Monthly)\n- Apartment: €800-1200\n- Co-working: €150-250\n- Food & Dining: €400-600\n- Total: ~€1500-2200\n\n## Visa Information\n\nPortugal offers a D7 visa for remote workers. Requirements:\n- Proof of income (€705+ monthly)\n- Health insurance\n- Rental agreement\n\nThe weather, culture, and community make Lisbon perfect for long-term stays.`,
    location: 'Lisbon, Portugal',
    geotag: {
      lat: 38.7223,
      lng: -9.1393,
      address: 'Lisbon, Portugal',
      country: 'Portugal',
      countryCode: 'PT',
      city: 'Lisbon',
      continent: 'Europe'
    },
    tags: ['digital nomad', 'Portugal', 'Lisbon', 'remote work', 'expat life'],
    status: 'published',
    trending: true,
    views: 18920,
    likes: 1045,
    readingTime: 9,
    publishedAt: new Date('2025-04-05')
  },
  {
    title: 'Antarctica Expedition: Journey to the White Continent',
    slug: 'antarctica-expedition-journey-white-continent',
    excerpt: 'A once-in-a-lifetime voyage to the world\'s last true wilderness. Penguins, icebergs, and profound silence.',
    content: `# The Ultimate Adventure\n\nAntarctica has been on my bucket list for years. The reality surpassed all expectations.\n\n## The Journey\n\n**Route**: Ushuaia, Argentina → Drake Passage → Antarctic Peninsula\n\n**Duration**: 11 days\n\n**Ship**: Le Commandant Charcot (luxury expedition vessel)\n\n## Highlights\n\n### Wildlife\n- Emperor and Gentoo penguins\n- Humpback and Minke whales\n- Leopard and Weddell seals\n- Albatross and petrels\n\n### Activities\n- Zodiac cruising among icebergs\n- Kayaking in pristine bays\n- Camping on the ice\n- Polar plunge (yes, I did it!)\n\n## Essential Tips\n\n1. **Best Time**: November-March (Antarctic summer)\n2. **What to Pack**: Layers, waterproof gear, camera with telephoto lens\n3. **Budget**: $8,000-20,000+ depending on cabin and ship\n4. **Booking**: Reserve 12-18 months in advance\n\n## Environmental Impact\n\nChoose operators committed to environmental protection. All visitors must follow strict IAATO guidelines to preserve this fragile ecosystem.`,
    location: 'Antarctic Peninsula',
    geotag: {
      lat: -63.0,
      lng: -57.0,
      address: 'Antarctic Peninsula',
      country: 'Antarctica',
      continent: 'Antarctica'
    },
    tags: ['Antarctica', 'expedition', 'wildlife', 'adventure', 'bucket list'],
    status: 'published',
    featured: true,
    views: 21450,
    likes: 1523,
    readingTime: 10,
    publishedAt: new Date('2025-05-12')
  }
];

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/travel-blog');
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

// Helper function to create user
const createUser = async (userData) => {
  const user = new User({
    ...userData,
    password: DEMO_PASSWORD,
    isVerified: true,
    isActive: true,
    createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000), // Random date within last 6 months
    updatedAt: new Date()
  });
  await user.save();
  return user;
};

// Generate random date within range
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Main seeder function
const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Clear existing data
    console.log('🗑️  Clearing existing demo data...');
    const demoEmails = [...demoUsers.map(u => u.email), showcaseAccount.email, packageProviderAccount.email];
    
    // Find existing demo users
    const existingDemoUsers = await User.find({ email: { $in: demoEmails } });
    const demoUserIds = existingDemoUsers.map(u => u._id);
    
    // Also delete demo blog posts by slug patterns
    const showcaseSlugs = [
      'ultimate-guide-sustainable-travel-2025',
      'hidden-gems-kyoto-beyond-tourist-trail',
      'luxury-safari-tanzania-worth-every-penny',
      'digital-nomad-guide-working-lisbon',
      'antarctica-expedition-journey-white-continent'
    ];
    
    // Delete blogs (by author IDs and slug patterns)
    await Blog.deleteMany({ 
      $or: [
        { author: { $in: demoUserIds } }, 
        { slug: { $in: showcaseSlugs } },
        { slug: { $regex: /^travel-guide-.*-(sarah|james|priya|marcus)-\d+$/ } }
      ] 
    });
    
    if (demoUserIds.length > 0) {
      // Delete all other related data for these users
      await Promise.all([
        Comment.deleteMany({ user: { $in: demoUserIds } }),
        Like.deleteMany({ user: { $in: demoUserIds } }),
        Follow.deleteMany({ $or: [{ follower: { $in: demoUserIds } }, { following: { $in: demoUserIds } }] }),
        Bookmark.deleteMany({ user: { $in: demoUserIds } }),
        Notification.deleteMany({ $or: [{ recipient: { $in: demoUserIds } }, { sender: { $in: demoUserIds } }] }),
        PhotoGallery.deleteMany({ user: { $in: demoUserIds } }),
        Itinerary.deleteMany({ user: { $in: demoUserIds } }),
        Trip.deleteMany({ user: { $in: demoUserIds } }),
        Collection.deleteMany({ user: { $in: demoUserIds } }),
        Review.deleteMany({ author: { $in: demoUserIds } }),
        Conversation.deleteMany({ participants: { $in: demoUserIds } }),
        Message.deleteMany({ sender: { $in: demoUserIds } })
      ]);
    }
    
    // Delete the users themselves
    await User.deleteMany({ email: { $in: demoEmails } });
    console.log(`   ✓ Cleaned up previous demo data`);
    
    // Create showcase account first
    console.log('\n👑 Creating Demo Showcase Account...');
    const showcase = await createUser(showcaseAccount);
    console.log(`   ✓ Created: ${showcase.name} (${showcase.email})`);
    console.log(`   📧 Login with: ${showcase.email} / ${DEMO_PASSWORD}`);

    // Create package provider account
    console.log('\n📦 Creating Package Provider Account...');
    const provider = await createUser(packageProviderAccount);
    console.log(`   ✓ Created: ${provider.name} (${provider.email})`);
    console.log(`   📧 Login with: ${provider.email} / ${DEMO_PASSWORD}`);
    console.log(`   🏢 Company: ${provider.providerInfo.companyName}`);
    console.log(`   ✅ Verified: ${provider.providerInfo.verified ? 'Yes' : 'No'}`);

    // Create regular users
    console.log('\n👥 Creating Demo Users...');
    const users = [];
    for (const userData of demoUsers) {
      const user = await createUser(userData);
      users.push(user);
      console.log(`   ✓ ${user.name} - ${user.role} from ${user.city}, ${user.country}`);
    }

    // Get or create categories
    console.log('\n📁 Setting up Categories...');
    const categoryNames = ['Adventure Travel', 'Cultural Experiences', 'Luxury Travel', 'Budget Travel', 
                          'Food & Culinary', 'Wildlife & Nature', 'City Guides', 'Beach & Islands'];
    let categories = await Category.find({ name: { $in: categoryNames } });
    
    if (categories.length === 0) {
      // No categories exist, create them
      categories = await Category.insertMany([
        { name: 'Adventure Travel', slug: 'adventure-travel', description: 'Thrilling adventures and outdoor activities' },
        { name: 'Cultural Experiences', slug: 'cultural-experiences', description: 'Immersive cultural journeys' },
        { name: 'Luxury Travel', slug: 'luxury-travel', description: 'Premium travel experiences' },
        { name: 'Budget Travel', slug: 'budget-travel', description: 'Affordable travel tips and guides' },
        { name: 'Food & Culinary', slug: 'food-culinary', description: 'Food tours and culinary adventures' },
        { name: 'Wildlife & Nature', slug: 'wildlife-nature', description: 'Natural wonders and wildlife encounters' },
        { name: 'City Guides', slug: 'city-guides', description: 'Comprehensive city travel guides' },
        { name: 'Beach & Islands', slug: 'beach-islands', description: 'Tropical paradises and beach destinations' }
      ], { ordered: false }).catch(() => Category.find({ name: { $in: categoryNames } }));
    }
    
    if (!Array.isArray(categories)) {
      categories = await Category.find({ name: { $in: categoryNames } });
    }
    
    console.log(`   ✓ Using ${categories.length} categories`);

    // Create showcase blog posts
    console.log('\n📝 Creating Showcase Blog Posts...');
    const blogs = [];
    for (const postData of showcaseBlogPosts) {
      const blog = await Blog.create({
        ...postData,
        author: showcase._id,
        category: categories[Math.floor(Math.random() * categories.length)]._id,
        createdAt: postData.publishedAt || randomDate(new Date('2024-01-01'), new Date()),
        updatedAt: new Date()
      });
      blogs.push(blog);
      console.log(`   ✓ "${blog.title}" - ${blog.views} views, ${blog.likes} likes`);
    }

    // Create blog posts for other authors
    console.log('\n📝 Creating Additional Blog Posts...');
    const authorUsers = users.filter(u => u.role === 'author');
    for (const author of authorUsers) {
      const numPosts = Math.floor(Math.random() * 3) + 1; // 1-3 posts per author
      for (let i = 0; i < numPosts; i++) {
        const blog = await Blog.create({
          title: `Travel Guide: ${author.city} by ${author.name.split(' ')[0]}`,
          slug: `travel-guide-${author.city.toLowerCase()}-${author.name.split(' ')[0].toLowerCase()}-${i}`,
          excerpt: `Discover the best of ${author.city} through the eyes of a local.`,
          content: `# Welcome to ${author.city}\n\nAs a local, I'm excited to share my favorite spots and hidden gems in this amazing city.\n\n## Must-Visit Places\n\n1. Local markets\n2. Historic landmarks\n3. Best restaurants\n4. Hidden cafes\n\nJoin me as we explore!`,
          author: author._id,
          category: categories[Math.floor(Math.random() * categories.length)]._id,
          location: `${author.city}, ${author.country}`,
          geotag: { city: author.city, country: author.country },
          tags: [author.city.toLowerCase(), 'travel guide', 'local tips'],
          status: 'published',
          views: Math.floor(Math.random() * 5000),
          likes: Math.floor(Math.random() * 300),
          readingTime: Math.floor(Math.random() * 5) + 3,
          publishedAt: randomDate(new Date('2024-06-01'), new Date()),
          createdAt: randomDate(new Date('2024-06-01'), new Date()),
          updatedAt: new Date()
        });
        blogs.push(blog);
      }
    }
    console.log(`   ✓ Created ${blogs.length - showcaseBlogPosts.length} additional blog posts`);

    // Create follow relationships
    console.log('\n🤝 Creating Follow Relationships...');
    let followCount = 0;
    // Showcase follows all authors
    for (const author of authorUsers) {
      await Follow.create({
        follower: showcase._id,
        following: author._id,
        createdAt: randomDate(new Date('2024-01-01'), new Date())
      });
      followCount++;
    }
    // Random follows between users
    for (let i = 0; i < 20; i++) {
      const follower = users[Math.floor(Math.random() * users.length)];
      const following = users[Math.floor(Math.random() * users.length)];
      if (follower._id.toString() !== following._id.toString()) {
        try {
          await Follow.create({
            follower: follower._id,
            following: following._id,
            createdAt: randomDate(new Date('2024-01-01'), new Date())
          });
          followCount++;
        } catch (err) {
          // Skip duplicates
        }
      }
    }
    console.log(`   ✓ Created ${followCount} follow relationships`);

    // Create comments
    console.log('\n💬 Creating Comments...');
    let commentCount = 0;
    for (const blog of blogs) {
      const numComments = Math.floor(Math.random() * 5) + 1;
      for (let i = 0; i < numComments; i++) {
        const commenter = [showcase, ...users][Math.floor(Math.random() * (users.length + 1))];
        await Comment.create({
          content: [
            'Great article! Very informative.',
            'Thanks for sharing this. Definitely adding to my bucket list!',
            'Beautiful photos! Which camera do you use?',
            'I visited here last year and loved it. Your guide is spot on!',
            'Any budget tips for this destination?'
          ][i % 5],
          blog: blog._id,
          user: commenter._id,
          createdAt: randomDate(blog.publishedAt || blog.createdAt, new Date()),
          updatedAt: new Date()
        });
        commentCount++;
      }
    }
    console.log(`   ✓ Created ${commentCount} comments`);

    // Create likes
    console.log('\n❤️  Creating Likes...');
    let likeCount = 0;
    for (const blog of blogs) {
      const targetLikes = blog.likes || 10;
      const numLikes = Math.min(Math.floor(targetLikes / 10), users.length); // Scale down to reasonable number
      for (let i = 0; i < numLikes; i++) {
        const liker = [showcase, ...users][i % (users.length + 1)];
        try {
          await Like.create({
            user: liker._id,
            blog: blog._id,
            createdAt: randomDate(blog.publishedAt || blog.createdAt, new Date())
          });
          likeCount++;
        } catch (err) {
          // Skip duplicates
        }
      }
    }
    console.log(`   ✓ Created ${likeCount} likes`);

    // Create bookmarks for showcase account
    console.log('\n🔖 Creating Bookmarks...');
    const bookmarkedBlogs = new Set();
    let bookmarkCount = 0;
    for (let i = 0; i < 8; i++) {
      const randomBlog = blogs[Math.floor(Math.random() * blogs.length)];
      if (!bookmarkedBlogs.has(randomBlog._id.toString())) {
        try {
          await Bookmark.create({
            user: showcase._id,
            blog: randomBlog._id,
            createdAt: randomDate(new Date('2024-01-01'), new Date())
          });
          bookmarkedBlogs.add(randomBlog._id.toString());
          bookmarkCount++;
        } catch (err) {
          // Skip duplicates
        }
      }
    }
    console.log(`   ✓ Created ${bookmarkCount} bookmarks for showcase account`);

    // Create notifications for showcase account
    console.log('\n🔔 Creating Notifications...');
    const notifications = [
      { 
        type: 'like', 
        title: 'New Like',
        message: 'Sarah Mitchell liked your post "Ultimate Guide to Sustainable Travel"',
        sender: users[0]._id  // Sarah
      },
      { 
        type: 'comment', 
        title: 'New Comment',
        message: 'James Rodriguez commented on your post "Hidden Gems of Kyoto"',
        sender: users[1]._id  // James
      },
      { 
        type: 'follow', 
        title: 'New Follower',
        message: 'Priya Sharma started following you',
        sender: users[2]._id  // Priya
      },
      { 
        type: 'mention', 
        title: 'You were mentioned',
        message: 'Marcus Chen mentioned you in a comment',
        sender: users[3]._id  // Marcus
      },
      { 
        type: 'achievement', 
        title: 'Achievement Unlocked!',
        message: 'You earned the "Explorer" badge!'
        // No sender for system notifications
      }
    ];
    for (const notif of notifications) {
      await Notification.create({
        recipient: showcase._id,
        ...notif,
        read: Math.random() > 0.5,
        createdAt: randomDate(new Date('2024-10-01'), new Date())
      });
    }
    console.log(`   ✓ Created ${notifications.length} notifications`);

    // Skip Photo Galleries for now due to geospatial index issues
    console.log('\n📸 Skipping Photo Galleries (geospatial index issue)...');
    const galleries = [];
    // const galleryData = [...]; // Commented out for now
    console.log(`   ✓ Skipped photo galleries`);

    // Skip Itineraries due to geospatial index issues
    console.log('\n🗺️  Skipping Itineraries (geospatial index issue)...');
    const itineraries = [];
    console.log(`   ✓ Skipped itineraries`);

    // Create Trips for Alexandra
    console.log('\n✈️  Creating Trips...');
    const trips = [];
    const tripData = [
      {
        title: 'Antarctica Expedition 2025',
        description: 'Once-in-a-lifetime journey to the white continent',
        startDate: new Date('2025-12-15'),
        endDate: new Date('2025-12-28'),
        isPublic: true,
        items: [
          { type: 'blog', refId: blogs[4]._id, note: 'Reference for planning' },
          { type: 'blog', refId: blogs[0]._id, note: 'Sustainable travel tips' }
        ]
      },
      {
        title: 'Southeast Asia Backpacking',
        description: 'Budget-friendly adventure through Thailand, Vietnam, and Cambodia',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-03-21'),
        isPublic: true,
        items: blogs.slice(0, 3).map(blog => ({ type: 'blog', refId: blog._id }))
      }
    ];

    for (const data of tripData) {
      const trip = await Trip.create({
        user: showcase._id,
        ...data,
        createdAt: randomDate(new Date('2024-09-01'), new Date())
      });
      trips.push(trip);
    }
    console.log(`   ✓ Created ${trips.length} trips`);

    // Create Collections for Alexandra
    console.log('\n📚 Creating Collections...');
    const collections = [];
    const collectionData = [
      {
        title: 'Best Luxury Destinations',
        description: 'Top-tier travel experiences worth the splurge',
        isPublic: true,
        tags: ['luxury', 'premium', 'exclusive'],
        items: [
          { type: 'blog', refId: blogs[2]._id },
          { type: 'blog', refId: blogs[4]._id }
        ],
        followers: [users[0]._id, users[1]._id, users[2]._id],
        views: 234
      },
      {
        title: 'Digital Nomad Resources',
        description: 'Everything you need for remote work while traveling',
        isPublic: true,
        tags: ['digital-nomad', 'remote-work', 'work-travel'],
        items: [
          { type: 'blog', refId: blogs[3]._id }
        ],
        followers: [users[3]._id, users[0]._id],
        views: 189
      },
      {
        title: 'Cultural Deep Dives',
        description: 'Immersive cultural experiences around the world',
        isPublic: true,
        tags: ['culture', 'traditions', 'authentic'],
        items: [
          { type: 'blog', refId: blogs[1]._id }
        ],
        followers: [users[2]._id],
        views: 156
      }
    ];

    for (const data of collectionData) {
      const collection = await Collection.create({
        user: showcase._id,
        ...data,
        createdAt: randomDate(new Date('2024-07-01'), new Date())
      });
      collections.push(collection);
    }
    console.log(`   ✓ Created ${collections.length} collections`);

    // Create Reviews for Alexandra
    console.log('\n⭐ Creating Reviews...');
    const reviews = [];
    const reviewData = [
      {
        targetType: 'destination',
        title: 'Kyoto - A Perfect Blend of Old and New',
        content: 'Kyoto exceeded all my expectations. The temples are breathtaking, the food is incredible, and the people are so welcoming. I spent a week here and could have stayed a month. Don\'t miss the early morning at Fushimi Inari before the crowds arrive. The Philosopher\'s Path during cherry blossom season is magical. Public transportation is excellent and English signage is everywhere.',
        overallRating: 5,
        aspectRatings: {
          value: 4,
          location: 5,
          facilities: 5,
          food: 5
        },
        visitDate: new Date('2024-11-08'),
        wouldRecommend: true,
        verified: true,
        helpful: [users[0]._id, users[1]._id, users[2]._id, users[3]._id]
      },
      {
        targetType: 'destination',
        title: 'Serengeti Safari - Bucket List Experience',
        content: 'The wildlife viewing in the Serengeti is unparalleled. We saw the Big Five in just three days. Our guide was knowledgeable and passionate about conservation. The luxury tented camp we stayed at was surprisingly comfortable with excellent food. Expensive, but worth every penny. Best time to visit is during the Great Migration (June-October).',
        overallRating: 5,
        aspectRatings: {
          value: 4,
          service: 5,
          facilities: 5,
          location: 5
        },
        visitDate: new Date('2024-09-05'),
        wouldRecommend: true,
        verified: true,
        helpful: [users[0]._id, users[1]._id]
      },
      {
        targetType: 'destination',
        title: 'Lisbon - Perfect for Digital Nomads',
        content: 'I spent three months working remotely from Lisbon and loved every minute. Fast internet, great coworking spaces, affordable living costs, and amazing food. The locals are friendly and many speak English. The weather is perfect year-round. Príncipe Real and Santos neighborhoods are ideal for remote workers. Easy access to beaches and other Portuguese cities.',
        overallRating: 5,
        aspectRatings: {
          value: 5,
          location: 5,
          facilities: 4
        },
        visitDate: new Date('2024-08-15'),
        wouldRecommend: true,
        verified: true,
        helpful: [users[3]._id, users[0]._id]
      }
    ];

    for (const data of reviewData) {
      const review = await Review.create({
        author: showcase._id,
        ...data,
        targetId: new mongoose.Types.ObjectId(), // Mock destination ID
        status: 'published',
        createdAt: randomDate(new Date('2024-09-01'), new Date())
      });
      reviews.push(review);
    }
    console.log(`   ✓ Created ${reviews.length} reviews`);

    // Create Conversations and Messages
    console.log('\n💬 Creating Conversations and Messages...');
    const conversations = [];
    const conversationData = [
      {
        participants: [showcase._id, users[0]._id],
        messages: [
          { sender: users[0]._id, content: 'Hi Alexandra! I loved your Kyoto blog post. Do you have any specific restaurant recommendations?', createdAt: new Date('2024-11-15T10:30:00') },
          { sender: showcase._id, content: 'Thank you! Yes, definitely try Kikunoi for kaiseki dining and Ippudo for the best ramen. The Nishiki Market is great for street food!', createdAt: new Date('2024-11-15T11:15:00') },
          { sender: users[0]._id, content: 'That\'s perfect! I\'m planning to visit in April. Is it too crowded during cherry blossom season?', createdAt: new Date('2024-11-15T14:20:00') },
          { sender: showcase._id, content: 'April is peak season, so yes it\'s crowded. I recommend booking accommodations early and visiting popular spots early morning or late evening.', createdAt: new Date('2024-11-15T15:45:00') }
        ]
      },
      {
        participants: [showcase._id, users[3]._id],
        messages: [
          { sender: users[3]._id, content: 'Hey! I\'m considering Lisbon for my next remote work destination. How was the wifi reliability?', createdAt: new Date('2024-11-10T09:00:00') },
          { sender: showcase._id, content: 'WiFi is excellent! I worked from Second Home Lisboa coworking space. Most cafes also have good internet. Never had connectivity issues.', createdAt: new Date('2024-11-10T09:30:00') },
          { sender: users[3]._id, content: 'Great! What about the cost of living compared to other European cities?', createdAt: new Date('2024-11-10T10:00:00') },
          { sender: showcase._id, content: 'Much more affordable than Paris or London. You can live comfortably on €1500-2000/month including rent. Check out my Lisbon guide for detailed breakdown!', createdAt: new Date('2024-11-10T10:20:00') }
        ]
      }
    ];

    let totalMessages = 0;
    for (const data of conversationData) {
      // First create the conversation without lastMessage
      const conversation = await Conversation.create({
        participants: data.participants
      });
      conversations.push(conversation);

      let lastMessageId = null;
      for (const msgData of data.messages) {
        const message = await Message.create({
          conversation: conversation._id,
          sender: msgData.sender,
          content: msgData.content,
          readBy: [{ user: showcase._id, readAt: new Date() }],
          createdAt: msgData.createdAt
        });
        lastMessageId = message._id;
        totalMessages++;
      }

      // Update conversation with last message
      conversation.lastMessage = lastMessageId;
      conversation.lastMessageAt = data.messages[data.messages.length - 1].createdAt;
      await conversation.save();
    }
    console.log(`   ✓ Created ${conversations.length} conversations with ${totalMessages} messages`);

    // Update user stats
    console.log('\n📊 Updating User Statistics...');
    for (const user of [showcase, ...users]) {
      const userBlogs = await Blog.find({ author: user._id });
      const userLikes = await Like.countDocuments({ user: user._id });
      const followers = await Follow.countDocuments({ following: user._id });
      const following = await Follow.countDocuments({ follower: user._id });
      
      user.totalPosts = userBlogs.length;
      user.totalLikes = userLikes;
      user.totalViews = userBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
      user.followers = await Follow.find({ following: user._id }).distinct('follower');
      user.following = await Follow.find({ follower: user._id }).distinct('following');
      await user.save();
    }
    console.log(`   ✓ Updated statistics for all users`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ DATABASE SEEDING COMPLETED SUCCESSFULLY! ✨');
    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   👤 Users: ${users.length + 2} (${authorUsers.length} authors, ${users.length - authorUsers.length} visitors, 1 admin, 1 provider)`);
    console.log(`   📝 Blog Posts: ${blogs.length}`);
    console.log(`   📁 Categories: ${categories.length}`);
    console.log(`   💬 Comments: ${commentCount}`);
    console.log(`   ❤️  Likes: ${likeCount}`);
    console.log(`   🤝 Follows: ${followCount}`);
    console.log(`   🔖 Bookmarks: ${bookmarkCount}`);
    console.log(`   🔔 Notifications: ${notifications.length}`);
    console.log(`   📸 Photo Galleries: ${galleries.length}`);
    console.log(`   🗺️  Itineraries: ${itineraries.length}`);
    console.log(`   ✈️  Trips: ${trips.length}`);
    console.log(`   📚 Collections: ${collections.length}`);
    console.log(`   ⭐ Reviews: ${reviews.length}`);
    console.log(`   💬 Conversations: ${conversations.length} (${totalMessages} messages)`);

    console.log(`\n🎯 Demo Admin Account:`);
    console.log(`   Name: ${showcase.name}`);
    console.log(`   Email: ${showcase.email}`);
    console.log(`   Password: ${DEMO_PASSWORD}`);
    console.log(`   Role: ${showcase.role}`);

    console.log(`\n📦 Demo Package Provider Account:`);
    console.log(`   Name: ${provider.name}`);
    console.log(`   Email: ${provider.email}`);
    console.log(`   Password: ${DEMO_PASSWORD}`);
    console.log(`   Company: ${provider.providerInfo.companyName}`);
    console.log(`   Verified: ✅ Yes`);
    console.log(`   Role: ${provider.role}`);

    console.log(`\n📧 All demo accounts use password: ${DEMO_PASSWORD}`);
    console.log(`\n💡 You can now login and explore all features!`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    throw error;
  }
};

// Run seeder
const runSeeder = async () => {
  await connectDB();
  await seedDatabase();
  await mongoose.connection.close();
  console.log('👋 Database connection closed.\n');
  process.exit(0);
};

runSeeder();
