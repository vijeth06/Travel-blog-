// Test data for development - Run this to populate your database with sample data
const mongoose = require('mongoose');
const User = require('../models/User');
const Blog = require('../models/Blog');
const Package = require('../models/Package');
const Category = require('../models/Category');
const Comment = require('../models/Comment');

const seedTestData = async () => {
  try {
    console.log('🌱 Seeding test data...');

    // Clear existing data
    await User.deleteMany({});
    await Blog.deleteMany({});
    await Package.deleteMany({});
    await Category.deleteMany({});
    await Comment.deleteMany({});

    // Create test users
    const testUsers = [
      {
        name: 'John Traveler',
        email: 'john@test.com',
        password: 'password123',
        role: 'admin',
        bio: 'Travel enthusiast and blogger',
        country: 'USA',
        city: 'New York',
        isVerified: true
      },
      {
        name: 'Sarah Explorer',
        email: 'sarah@test.com',
        password: 'password123',
        role: 'author',
        bio: 'Adventure seeker and photographer',
        country: 'Canada',
        city: 'Toronto',
        isVerified: true
      },
      {
        name: 'Mike Wanderer',
        email: 'mike@test.com',
        password: 'password123',
        role: 'visitor',
        country: 'UK',
        city: 'London',
        isVerified: true
      }
    ];

    const users = await User.create(testUsers);
    console.log('✅ Created test users');

    // Create test categories
    const testCategories = [
      { name: 'Adventure', description: 'Thrilling adventures and outdoor activities' },
      { name: 'Beach', description: 'Beautiful beaches and coastal destinations' },
      { name: 'Culture', description: 'Cultural experiences and historical sites' },
      { name: 'Food', description: 'Culinary experiences and food tours' },
      { name: 'Nature', description: 'Natural wonders and wildlife' }
    ];

    const categories = await Category.create(testCategories);
    console.log('✅ Created test categories');

    // Create test blog posts
    const testBlogs = [
      {
        title: 'Amazing Adventure in the Swiss Alps',
        slug: 'amazing-adventure-swiss-alps',
        excerpt: 'Discover the breathtaking beauty of the Swiss Alps through hiking and mountaineering.',
        content: `
          <h2>An Unforgettable Journey</h2>
          <p>The Swiss Alps offer some of the most spectacular mountain scenery in the world. During my recent trip, I had the opportunity to explore several peaks and valleys that left me speechless.</p>
          
          <h3>Day 1: Arrival in Zermatt</h3>
          <p>We started our journey in the charming village of Zermatt, famous for the iconic Matterhorn. The village itself is car-free, which adds to its authentic Alpine charm.</p>
          
          <h3>Day 2-3: Hiking Adventures</h3>
          <p>The hiking trails around Zermatt are well-marked and offer stunning views at every turn. We tackled the Gornergrat trail, which provides panoramic views of over 20 peaks above 4,000 meters.</p>
          
          <h3>Tips for Future Travelers</h3>
          <ul>
            <li>Pack layers - weather can change quickly in the mountains</li>
            <li>Start early to avoid crowds and afternoon storms</li>
            <li>Bring plenty of water and snacks</li>
            <li>Don't forget your camera!</li>
          </ul>
        `,
        author: users[0]._id,
        category: categories[0]._id,
        tags: ['switzerland', 'alps', 'hiking', 'mountains', 'adventure'],
        location: 'Zermatt, Switzerland',
        geotag: { lat: 46.0207, lng: 7.7491, country: 'Switzerland', city: 'Zermatt' },
        status: 'published',
        publishedAt: new Date(),
        featured: true,
        views: 1250,
        readingTime: 5,
        metaTitle: 'Swiss Alps Adventure - Complete Travel Guide',
        metaDescription: 'Discover the best hiking trails and experiences in the Swiss Alps. Complete guide with tips and recommendations.',
        featuredImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
      },
      {
        title: 'Tropical Paradise: Maldives Island Hopping',
        slug: 'tropical-paradise-maldives-island-hopping',
        excerpt: 'Experience the ultimate tropical getaway with crystal clear waters and pristine beaches.',
        content: `
          <h2>Welcome to Paradise</h2>
          <p>The Maldives is truly a slice of heaven on earth. With over 1,000 coral islands scattered across the Indian Ocean, it offers the perfect escape from the hustle and bustle of everyday life.</p>
          
          <h3>Island Hopping Experience</h3>
          <p>We spent 7 days exploring different atolls, each with its own unique character and charm. From luxury resorts to local island experiences, the diversity is incredible.</p>
          
          <h3>Best Activities</h3>
          <ul>
            <li>Snorkeling with manta rays</li>
            <li>Sunset dolphin cruises</li>
            <li>Traditional fishing experiences</li>
            <li>Spa treatments over the water</li>
          </ul>
        `,
        author: users[1]._id,
        category: categories[1]._id,
        tags: ['maldives', 'beach', 'tropical', 'islands', 'luxury'],
        location: 'Maldives',
        geotag: { lat: 3.2028, lng: 73.2207, country: 'Maldives', city: 'Male' },
        status: 'published',
        publishedAt: new Date(Date.now() - 86400000), // 1 day ago
        views: 890,
        readingTime: 4,
        featuredImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800'
      },
      {
        title: 'Cultural Immersion in Kyoto, Japan',
        slug: 'cultural-immersion-kyoto-japan',
        excerpt: 'Explore ancient temples, traditional gardens, and authentic Japanese culture in historic Kyoto.',
        content: `
          <h2>Ancient Meets Modern</h2>
          <p>Kyoto perfectly balances ancient traditions with modern life. Walking through its streets feels like traveling through time.</p>
          
          <h3>Must-Visit Temples</h3>
          <p>The city is home to over 2,000 temples and shrines. Kinkaku-ji (Golden Pavilion) and Fushimi Inari Shrine are absolute must-sees.</p>
          
          <h3>Traditional Experiences</h3>
          <ul>
            <li>Tea ceremony in a traditional tea house</li>
            <li>Geisha spotting in Gion district</li>
            <li>Bamboo forest walk in Arashiyama</li>
            <li>Traditional kaiseki dining</li>
          </ul>
        `,
        author: users[0]._id,
        category: categories[2]._id,
        tags: ['japan', 'kyoto', 'culture', 'temples', 'tradition'],
        location: 'Kyoto, Japan',
        geotag: { lat: 35.0116, lng: 135.7681, country: 'Japan', city: 'Kyoto' },
        status: 'published',
        publishedAt: new Date(Date.now() - 172800000), // 2 days ago
        views: 654,
        readingTime: 6
      }
    ];

    const blogs = await Blog.create(testBlogs);
    console.log('✅ Created test blog posts');

    // Create test travel packages
    const testPackages = [
      {
        title: 'Swiss Alps Adventure Package',
        description: 'Experience the breathtaking beauty of the Swiss Alps with guided hiking tours, mountain railways, and luxury accommodation.',
        location: 'Zermatt, Switzerland',
        duration: '7 days',
        price: 2499,
        type: 'Family',
        createdBy: users[0]._id,
        category: categories[0]._id,
        images: [
          'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
          'https://images.unsplash.com/photo-1551524164-6cf2ac531400?w=800'
        ],
        features: ['Professional guide', 'All meals included', '4-star hotel', 'Transportation', 'Equipment provided'],
        inclusions: ['Accommodation', 'All meals', 'Professional guide', 'Transportation', 'Equipment'],
        exclusions: ['International flights', 'Travel insurance', 'Personal expenses'],
        maxCapacity: 12,
        currentBookings: 3,
        availability: true,
        featured: true,
        itinerary: [
          {
            day: 1,
            title: 'Arrival in Zermatt',
            description: 'Check-in and orientation',
            activities: ['Hotel check-in', 'Welcome dinner', 'Equipment fitting']
          },
          {
            day: 2,
            title: 'Gornergrat Railway',
            description: 'Scenic train ride and hiking',
            activities: ['Train to Gornergrat', 'Panoramic hiking', 'Photography session']
          }
        ]
      },
      {
        title: 'Maldives Paradise Getaway',
        description: 'Luxury island resort experience with overwater villas, spa treatments, and water activities.',
        location: 'Maldives',
        duration: '5 days',
        price: 3999,
        type: 'Couple',
        createdBy: users[1]._id,
        category: categories[1]._id,
        images: [
          'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800',
          'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800'
        ],
        features: ['Overwater villa', 'All-inclusive', 'Spa access', 'Water sports', 'Private beach'],
        inclusions: ['Luxury accommodation', 'All meals and drinks', 'Spa treatments', 'Water activities', 'Airport transfers'],
        exclusions: ['International flights', 'Excursions', 'Alcoholic beverages'],
        maxCapacity: 8,
        currentBookings: 2,
        availability: true,
        featured: true,
        discount: {
          percentage: 15,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          conditions: 'Book before end of month'
        }
      },
      {
        title: 'Kyoto Cultural Experience',
        description: 'Immerse yourself in traditional Japanese culture with temple visits, tea ceremonies, and authentic experiences.',
        location: 'Kyoto, Japan',
        duration: '4 days',
        price: 1899,
        type: 'Single',
        createdBy: users[0]._id,
        category: categories[2]._id,
        images: [
          'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800',
          'https://images.unsplash.com/photo-1528164344705-47542687000d?w=800'
        ],
        features: ['Cultural guide', 'Traditional accommodation', 'Tea ceremony', 'Temple visits', 'Local cuisine'],
        inclusions: ['Traditional ryokan stay', 'Cultural guide', 'Tea ceremony', 'Temple entrance fees', 'Some meals'],
        exclusions: ['International flights', 'All meals', 'Personal shopping', 'Tips'],
        maxCapacity: 15,
        currentBookings: 7,
        availability: true
      }
    ];

    const packages = await Package.create(testPackages);
    console.log('✅ Created test travel packages');

    // Create test comments
    const testComments = [
      {
        blog: blogs[0]._id,
        user: users[1]._id,
        content: 'Amazing post! I\'ve been to the Swiss Alps and your description brings back wonderful memories.',
        status: 'approved',
        likesCount: 5
      },
      {
        blog: blogs[0]._id,
        user: users[2]._id,
        content: 'Thanks for the detailed tips! Planning my trip there next summer.',
        status: 'approved',
        likesCount: 2
      },
      {
        blog: blogs[1]._id,
        user: users[0]._id,
        content: 'The Maldives looks absolutely stunning! Adding it to my bucket list.',
        status: 'approved',
        likesCount: 8
      }
    ];

    await Comment.create(testComments);
    console.log('✅ Created test comments');

    console.log('🎉 Test data seeding completed successfully!');
    console.log('\n📋 Test Accounts Created:');
    console.log('Admin: john@test.com / password123');
    console.log('Author: sarah@test.com / password123');
    console.log('Visitor: mike@test.com / password123');

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
  }
};

module.exports = seedTestData;

// Run this file directly to seed data
if (require.main === module) {
  require('dotenv').config();
  const connectDB = require('../config/db');
  connectDB().then(() => {
    seedTestData().then(() => {
      process.exit(0);
    });
  });
}
