const mongoose = require('mongoose');
const Blog = require('../models/Blog');
const User = require('../models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/travel-blog';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected for seeding tourist place blogs...');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const touristPlaceBlogsData = [
  // ASIA
  {
    title: "The Magnificent Taj Mahal: A Symbol of Eternal Love",
    content: `
# The Taj Mahal: An Architectural Marvel

The Taj Mahal, located in Agra, India, stands as one of the most beautiful buildings in the world and a testament to eternal love. Built by Mughal Emperor Shah Jahan in memory of his beloved wife Mumtaz Mahal, this ivory-white marble mausoleum is a UNESCO World Heritage Site.

## History and Architecture

Construction of the Taj Mahal began in 1632 and was completed in 1653. The main architect was Ustad Ahmad Lahauri, and the project employed over 20,000 artisans from across the empire. The structure combines elements of Islamic, Persian, Ottoman Turkish, and Indian architectural styles.

## What Makes It Special

- **Perfect Symmetry**: The Taj Mahal is perfectly symmetrical, with the main dome flanked by four smaller domes
- **Intricate Inlay Work**: The walls feature beautiful pietra dura (inlay work) with precious and semi-precious stones
- **Changing Colors**: The marble appears to change color throughout the day, from pinkish hue at dawn to golden at sunset
- **Reflecting Pool**: The long reflecting pool creates a mirror image of the monument

## Best Time to Visit

The best time to visit the Taj Mahal is during the cooler months from October to March. Early morning visits offer the most spectacular views with fewer crowds and beautiful lighting.

## Photography Tips

- Visit during sunrise for the best lighting
- The reflection shots from the main gateway are iconic
- Don't miss the detailed close-up shots of the inlay work
- The view from Mehtab Bagh across the river offers a different perspective

## Travel Information

- **Entry Fee**: ₹1,100 for foreign tourists
- **Timings**: Sunrise to sunset (closed on Fridays)
- **Location**: Agra, Uttar Pradesh, India
- **Nearest Airport**: Agra Airport (12 km)

The Taj Mahal is not just a monument; it's a poem in marble, a dream in stone, and a symbol of India's rich cultural heritage.
    `,
    excerpt: "Discover the breathtaking beauty of the Taj Mahal, an architectural masterpiece and symbol of eternal love in Agra, India.",
    tags: ["Taj Mahal", "India", "Architecture", "UNESCO World Heritage", "Agra", "Mughal", "Travel"],

    geotag: {
      continent: "Asia",
      country: "India",
      city: "Agra",
      coordinates: { lat: 27.1751, lng: 78.0421 }
    },
    thumbnail: "https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [
      {
        url: "https://images.unsplash.com/photo-1564507592333-c60657eea523?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        caption: "The magnificent Taj Mahal at sunrise",
        alt: "Taj Mahal with reflection in water"
      },
      {
        url: "https://images.unsplash.com/photo-1548013146-72479768bada?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        caption: "Detailed view of Taj Mahal architecture",
        alt: "Close-up of Taj Mahal marble work"
      }
    ],
    authorEmail: "john@test.com"
  },

  {
    title: "The Great Wall of China: Walking Through History",
    content: `
# The Great Wall of China: An Ancient Wonder

Stretching over 13,000 miles across northern China, the Great Wall is one of the most impressive architectural feats in human history. This ancient fortification system was built to protect Chinese states and empires from invasions.

## Historical Significance

The wall was built over many centuries, with the most famous sections constructed during the Ming Dynasty (1368-1644). Contrary to popular belief, it's not visible from space with the naked eye, but it remains one of the most visited tourist attractions in the world.

## Popular Sections to Visit

### Badaling Section
- Most popular and well-preserved
- Easily accessible from Beijing
- Can get very crowded

### Mutianyu Section
- Less crowded than Badaling
- Beautiful mountain scenery
- Cable car available

### Jinshanling Section
- Perfect for hiking enthusiasts
- Stunning photography opportunities
- More challenging terrain

## What to Expect

- **Physical Challenge**: Be prepared for steep climbs and uneven steps
- **Weather**: Can be very hot in summer and cold in winter
- **Crowds**: Popular sections can be extremely busy
- **Facilities**: Basic facilities available at main sections

## Photography Tips

- Early morning visits offer the best lighting and fewer crowds
- Capture the wall snaking through the mountains
- Don't forget to take photos of the watchtowers
- Sunset shots can be spectacular

## Practical Information

- **Best Time**: April to June, September to November
- **Entry Fee**: Varies by section (45-65 CNY)
- **Getting There**: Various tour options from Beijing
- **Duration**: Allow a full day for the experience

Walking on the Great Wall is like stepping back in time and experiencing one of humanity's greatest achievements firsthand.
    `,
    excerpt: "Experience the magnificent Great Wall of China, an ancient wonder stretching over 13,000 miles through breathtaking landscapes.",
    tags: ["Great Wall", "China", "History", "UNESCO World Heritage", "Beijing", "Ancient Architecture"],

    geotag: {
      continent: "Asia",
      country: "China",
      city: "Beijing",
      coordinates: { lat: 40.4319, lng: 116.5704 }
    },
    thumbnail: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [
      {
        url: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        caption: "The Great Wall winding through mountains",
        alt: "Great Wall of China stretching across mountains"
      }
    ],
    authorEmail: "sarah@test.com"
  },

  // EUROPE
  {
    title: "Paris and the Iconic Eiffel Tower: City of Light",
    content: `
# The Eiffel Tower: Symbol of Paris

Standing tall at 324 meters, the Eiffel Tower is not just an iron lattice tower; it's the heart and soul of Paris. Built for the 1889 World's Fair, this architectural marvel has become the most recognizable landmark in the world.

## Engineering Marvel

Designed by Gustave Eiffel, the tower was initially criticized by many Parisians but has since become beloved. The structure weighs approximately 10,100 tons and sways up to 6-7 centimeters in the wind.

## Visiting the Tower

### Three Levels to Explore

**First Floor (57m)**
- Glass floor for a thrilling view down
- Restaurants and shops
- Educational exhibits about the tower

**Second Floor (115m)**
- Best views of Paris landmarks
- Fine dining at Jules Verne restaurant
- Gift shops

**Top Floor (276m)**
- Panoramic views of the entire city
- Champagne bar
- Gustave Eiffel's office replica

## Best Times to Visit

- **Sunrise**: Fewer crowds, beautiful lighting
- **Golden Hour**: Perfect for photography
- **Night**: The tower sparkles every hour on the hour

## Photography Tips

- Trocadéro Gardens offer the classic frontal view
- Bir-Hakeim Bridge provides unique angles
- Seine River cruise for water-level shots
- Montparnasse Tower for aerial views including the Eiffel Tower

## Surrounding Attractions

- **Champ de Mars**: Beautiful gardens at the tower's base
- **Trocadéro**: Best viewing platform
- **Seine River Cruise**: See Paris from the water
- **Arc de Triomphe**: Another iconic Parisian landmark

## Practical Information

- **Entry Fee**: €29 for top floor access
- **Timings**: 9:30 AM to 11:45 PM
- **Metro**: Bir-Hakeim, Trocadéro, or École Militaire
- **Booking**: Advance booking recommended

The Eiffel Tower is more than a monument; it's a symbol of human achievement and the romantic spirit of Paris.
    `,
    excerpt: "Explore the iconic Eiffel Tower and discover why it remains the most beloved symbol of Paris and romance.",
    tags: ["Eiffel Tower", "Paris", "France", "Architecture", "Romance", "City Views"],

    geotag: {
      continent: "Europe",
      country: "France",
      city: "Paris",
      coordinates: { lat: 48.8584, lng: 2.2945 }
    },
    thumbnail: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [
      {
        url: "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        caption: "Eiffel Tower illuminated at night",
        alt: "Eiffel Tower lit up against Paris skyline"
      }
    ],
    authorEmail: "mike@test.com"
  },

  {
    title: "Rome's Colosseum: Where Gladiators Once Fought",
    content: `
# The Colosseum: Ancient Rome's Greatest Arena

The Colosseum, also known as the Flavian Amphitheatre, is the largest amphitheatre ever built. This ancient marvel could hold up to 80,000 spectators who came to watch gladiatorial contests and public spectacles.

## Historical Background

Construction began under Emperor Vespasian in 72 AD and was completed under Emperor Titus in 80 AD. The Colosseum was used for gladiatorial contests and public spectacles for approximately 400 years.

## Architectural Features

- **Four Stories**: The building has four stories, with the first three featuring different architectural orders
- **Underground**: The hypogeum (underground area) housed gladiators, animals, and stage machinery
- **Seating System**: Sophisticated seating arrangement based on social class
- **Retractable Roof**: The velarium could be deployed to protect spectators from sun and rain

## What Happened Here

### Gladiatorial Games
- Fights between trained gladiators
- Battles between gladiators and wild animals
- Mock naval battles (naumachiae)
- Public executions

### Types of Gladiators
- **Murmillo**: Heavily armed with sword and shield
- **Retiarius**: Fought with net and trident
- **Thraex**: Thracian-style fighter
- **Secutor**: Pursued the retiarius

## Visiting Today

### What You'll See
- The arena floor (partially reconstructed)
- Underground chambers and tunnels
- Seating areas and corridors
- Museum exhibits

### Combined Tickets
- Colosseum, Roman Forum, and Palatine Hill
- Valid for 2 consecutive days
- Skip-the-line options available

## Photography Tips

- Early morning for best lighting
- Capture the underground structures
- Wide shots showing the scale
- Detail shots of the ancient stonework

## Practical Information

- **Entry Fee**: €16 (combined ticket)
- **Best Time**: Early morning or late afternoon
- **Duration**: 2-3 hours
- **Metro**: Colosseo station (Line B)

Standing in the Colosseum, you can almost hear the roar of the crowd and feel the excitement of ancient Rome.
    `,
    excerpt: "Step into ancient Rome at the Colosseum, where gladiators once fought and 80,000 spectators cheered.",
    tags: ["Colosseum", "Rome", "Italy", "Ancient Rome", "Gladiators", "History", "UNESCO World Heritage"],

    geotag: {
      continent: "Europe",
      country: "Italy",
      city: "Rome",
      coordinates: { lat: 41.8902, lng: 12.4922 }
    },
    thumbnail: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [
      {
        url: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        caption: "The ancient Colosseum in Rome",
        alt: "Roman Colosseum amphitheater exterior view"
      }
    ],
    authorEmail: "vijethvijeth957@gmail.com"
  },

  // NORTH AMERICA
  {
    title: "Grand Canyon: Nature's Masterpiece in Arizona",
    content: `
# Grand Canyon: One of the World's Natural Wonders

The Grand Canyon is a steep-sided canyon carved by the Colorado River in Arizona. This geological marvel reveals nearly 2 billion years of Earth's geological history and attracts over 5 million visitors annually.

## Geological Wonder

The canyon is 277 river miles long, up to 18 miles wide, and reaches depths of over a mile. The exposed rock layers tell the story of the last 2 billion years of geological history.

## South Rim vs North Rim

### South Rim (Open Year-Round)
- More accessible and developed
- Better facilities and services
- Classic viewpoints like Mather Point and Yavapai Observation Station
- Desert View Watchtower

### North Rim (Seasonal: May-October)
- Higher elevation (8,000+ feet)
- Cooler temperatures
- Fewer crowds
- More forested environment

## Best Viewpoints

### South Rim
- **Mather Point**: Perfect for sunrise
- **Hopi Point**: Best sunset views
- **Desert View**: 70-foot watchtower with panoramic views
- **Hermit's Rest**: End of the scenic drive

### North Rim
- **Bright Angel Point**: Easy walk from visitor center
- **Cape Royal**: Spectacular views of the canyon
- **Point Imperial**: Highest viewpoint on North Rim

## Activities

### Hiking
- **Rim Trail**: Easy paved trail along the rim
- **Bright Angel Trail**: Steep descent into canyon
- **South Kaibab Trail**: Spectacular views but no water
- **North Kaibab Trail**: Only maintained trail to river from North Rim

### Other Activities
- Helicopter tours
- River rafting
- Mule rides
- Star gazing programs

## Photography Tips

- Golden hour provides the best lighting
- Use a polarizing filter to reduce haze
- Capture the layered rock formations
- Include people for scale
- Try long exposure for smooth water effects

## Practical Information

- **Entry Fee**: $35 per vehicle (7 days)
- **Best Time**: Spring and fall for mild weather
- **Accommodation**: Book well in advance
- **What to Bring**: Water, sun protection, layers

The Grand Canyon is more than a destination; it's a humbling experience that puts our place in the universe into perspective.
    `,
    excerpt: "Experience the breathtaking Grand Canyon, where millions of years of geological history are revealed in stunning layers of rock.",
    tags: ["Grand Canyon", "Arizona", "USA", "National Park", "Natural Wonder", "Hiking", "Photography"],

    geotag: {
      continent: "North America",
      country: "United States",
      city: "Arizona",
      coordinates: { lat: 36.1069, lng: -112.1129 }
    },
    thumbnail: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [
      {
        url: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        caption: "Grand Canyon at sunset with dramatic colors",
        alt: "Grand Canyon layered rock formations at golden hour"
      }
    ],
    authorEmail: "subash@gmail.com"
  },

  // AFRICA
  {
    title: "Pyramids of Giza: Last Wonder of the Ancient World",
    content: `
# The Pyramids of Giza: Eternal Monuments

Standing on the Giza plateau for over 4,500 years, the Pyramids of Giza are the last surviving wonder of the ancient world. These magnificent structures continue to baffle archaeologists and inspire visitors from around the globe.

## The Three Great Pyramids

### Great Pyramid of Khufu (Cheops)
- Originally 146.5 meters tall
- Built around 2580-2560 BC
- Contains approximately 2.3 million stone blocks
- Each block weighs 2.5 to 15 tons

### Pyramid of Khafre
- Appears taller due to its elevated position
- Originally 143.5 meters tall
- Built around 2558-2532 BC
- Better preserved than Khufu's pyramid

### Pyramid of Menkaure
- Smallest of the three main pyramids
- Originally 65 meters tall
- Built around 2510-2490 BC
- Partially cased in granite

## The Great Sphinx

- Carved from a single piece of limestone
- 73 meters long and 20 meters high
- Face believed to represent Pharaoh Khafre
- Missing nose adds to its mysterious appeal

## Construction Mysteries

### How Were They Built?
- Ramp theories for moving massive stones
- Precise astronomical alignments
- Advanced mathematical knowledge
- Sophisticated engineering techniques

### Amazing Facts
- Aligned with cardinal directions
- Internal temperature constant at 20°C
- Built with incredible precision
- No mortar used between stones

## Visiting the Pyramids

### What You Can Do
- Enter the Great Pyramid (limited tickets)
- Explore the Solar Boat Museum
- Camel rides around the complex
- Sound and Light Show in the evening

### Best Photography Spots
- Classic view from the southeast
- Sunrise shots with silhouettes
- Camel caravan compositions
- Detail shots of the stone blocks

## Practical Information

- **Entry Fee**: 200 EGP for the complex
- **Great Pyramid Entry**: Additional 400 EGP
- **Best Time**: Early morning or late afternoon
- **Duration**: Half day minimum
- **Location**: Giza, 20km from Cairo

## Cultural Significance

The pyramids represent the pinnacle of ancient Egyptian civilization and their beliefs about the afterlife. They served as tombs for pharaohs and were designed to help them in their journey to the afterlife.

Standing before these ancient monuments, you can't help but feel connected to one of humanity's greatest civilizations.
    `,
    excerpt: "Discover the mysteries of the Pyramids of Giza, the last surviving wonder of the ancient world and testament to human achievement.",
    tags: ["Pyramids", "Giza", "Egypt", "Ancient Egypt", "Pharaohs", "Wonder of the World", "Archaeology"],

    geotag: {
      continent: "Africa",
      country: "Egypt",
      city: "Cairo",
      coordinates: { lat: 29.9792, lng: 31.1342 }
    },
    thumbnail: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [
      {
        url: "https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        caption: "The Great Pyramid of Giza at sunset",
        alt: "Ancient Egyptian pyramids in desert landscape"
      }
    ],
    authorEmail: "vijethb.23it@kongu.edu"
  },

  // SOUTH AMERICA
  {
    title: "Machu Picchu: The Lost City of the Incas",
    content: `
# Machu Picchu: Ancient Wonder in the Clouds

Perched high in the Andes Mountains at 2,430 meters above sea level, Machu Picchu is one of the most spectacular archaeological sites in the world. This ancient Inca citadel, built in the 15th century, remained hidden from the outside world until 1911.

## Historical Background

Built around 1450 AD during the reign of Inca emperor Pachacuti, Machu Picchu was abandoned during the Spanish conquest in the 16th century. American historian Hiram Bingham brought it to international attention in 1911.

## Architectural Marvel

### Construction Techniques
- Precisely cut stone blocks without mortar
- Earthquake-resistant construction
- Advanced water management systems
- Terraced agriculture on steep slopes

### Key Structures
- **Intihuatana Stone**: Ritual astronomical clock
- **Temple of the Sun**: Sacred ceremonial center
- **Room of the Three Windows**: Symbolic of Inca cosmology
- **Sacred Plaza**: Central ceremonial area

## Getting There

### Classic Inca Trail (4 days)
- Most famous trekking route
- Requires permits (book months in advance)
- Passes through stunning Andean landscapes
- Culminates with sunrise at Machu Picchu

### Alternative Routes
- **Salkantay Trek**: 5-day challenging hike
- **Lares Trek**: Cultural immersion with local communities
- **Train from Cusco**: Comfortable option via Ollantaytambo

### Day Trip Option
- Train from Cusco to Aguas Calientes
- Bus up to Machu Picchu
- Full day exploration
- Return same day

## Best Time to Visit

### Dry Season (May-September)
- Clear skies and sunny weather
- Best for photography
- Peak tourist season
- Higher prices

### Wet Season (October-April)
- Fewer crowds
- Lush green landscapes
- Afternoon rain showers
- Some trails may be closed

## What to Expect

### The Experience
- Breathtaking mountain views
- Ancient Inca architecture
- Llamas roaming the ruins
- Spiritual and mystical atmosphere

### Photography Tips
- Arrive early for sunrise shots
- Classic postcard view from the Guardian's House
- Capture the terraces and mountain backdrop
- Include llamas for scale and interest

## Practical Information

- **Entry Fee**: 152 PEN (about $40 USD)
- **Daily Limit**: 2,500 visitors
- **Duration**: Full day recommended
- **Altitude**: Be prepared for thin air
- **What to Bring**: Water, sun protection, comfortable shoes

## Cultural Significance

Machu Picchu represents the pinnacle of Inca civilization and their harmony with nature. The site demonstrates advanced knowledge of astronomy, agriculture, and architecture.

### UNESCO World Heritage

Designated as both a cultural and natural World Heritage Site, Machu Picchu is protected for its archaeological significance and biodiversity.

Standing among these ancient ruins, surrounded by towering peaks and swirling clouds, you'll understand why Machu Picchu is considered one of the most magical places on Earth.
    `,
    excerpt: "Journey to Machu Picchu, the mystical Lost City of the Incas, perched high in the Andes Mountains of Peru.",
    tags: ["Machu Picchu", "Peru", "Incas", "Andes", "UNESCO World Heritage", "Archaeology", "Trekking"],

    geotag: {
      continent: "South America",
      country: "Peru",
      city: "Cusco Region",
      coordinates: { lat: -13.1631, lng: -72.5450 }
    },
    thumbnail: "https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    images: [
      {
        url: "https://images.unsplash.com/photo-1526392060635-9d6019884377?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
        caption: "Machu Picchu ancient ruins in morning mist",
        alt: "Inca ruins on mountain ridge with dramatic peaks"
      }
    ],
    authorEmail: "admin@kongu.edu"
  }
];

const seedTouristPlaceBlogs = async () => {
  try {
    await connectDB();
    
    console.log('Clearing existing tourist place blogs...');
    // Only clear blogs with specific tags to avoid deleting other blogs
    await Blog.deleteMany({
      tags: { $in: ["Taj Mahal", "Great Wall", "Eiffel Tower", "Colosseum", "Grand Canyon", "Pyramids", "Machu Picchu"] }
    });
    
    console.log('Creating tourist place blogs...');
    
    const createdBlogs = [];
    
    for (const blogData of touristPlaceBlogsData) {
      // Find the author by email
      const author = await User.findOne({ email: blogData.authorEmail });
      
      if (!author) {
        console.log(`Author not found for email: ${blogData.authorEmail}`);
        continue;
      }
      
      const blog = new Blog({
        ...blogData,
        author: author._id,
        isPublished: true,
        publishedAt: new Date(),
        views: Math.floor(Math.random() * 1000) + 100, // Random views between 100-1100
        likes: Math.floor(Math.random() * 50) + 10, // Random likes between 10-60
        readTime: Math.ceil(blogData.content.length / 1000) // Approximate read time
      });
      
      const savedBlog = await blog.save();
      createdBlogs.push(savedBlog);
      
      console.log(`✅ Created blog: "${blog.title}" by ${author.name}`);
    }
    
    console.log(`\n🎉 Successfully created ${createdBlogs.length} tourist place blogs!`);
    
    // Display summary
    console.log('\n=== BLOG CREATION SUMMARY ===');
    console.log(`Total Blogs Created: ${createdBlogs.length}`);
    console.log('Blogs by Continent:');
    
    const continentCounts = {};
    createdBlogs.forEach(blog => {
      const continent = blog.geotag.continent;
      continentCounts[continent] = (continentCounts[continent] || 0) + 1;
    });
    
    Object.entries(continentCounts).forEach(([continent, count]) => {
      console.log(`- ${continent}: ${count} blog(s)`);
    });
    
    console.log('\nCreated Blogs:');
    createdBlogs.forEach(blog => {
      console.log(`- "${blog.title}" (${blog.geotag.continent})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding tourist place blogs:', error);
    process.exit(1);
  }
};

seedTouristPlaceBlogs();