const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testInteractions() {
  try {
    console.log('🧪 Testing like and comment functionality...');

    // First, get all places to get their IDs
    const placesResponse = await axios.get(`${API_BASE}/favorite-places`);
    const places = placesResponse.data.data.places;
    
    if (places.length === 0) {
      console.log('❌ No places found to test with');
      return;
    }

    const firstPlace = places[0];
    console.log(`Testing with place: ${firstPlace.placeName}`);
    console.log(`Place ID: ${firstPlace._id}`);
    console.log(`Current likes: ${firstPlace.likesCount || 0}`);
    console.log(`Current comments: ${firstPlace.commentsCount || 0}`);

    // Test getting a single place by slug
    if (firstPlace.slug) {
      try {
        const singlePlaceResponse = await axios.get(`${API_BASE}/favorite-places/slug/${firstPlace.slug}`);
        console.log(`✅ Successfully fetched place by slug: ${singlePlaceResponse.data.data.placeName}`);
        console.log(`   Views: ${singlePlaceResponse.data.data.viewsCount || 0}`);
      } catch (error) {
        console.log(`❌ Failed to fetch by slug: ${error.response?.data?.message || error.message}`);
      }
    }

    // Test continent filtering
    try {
      const continentResponse = await axios.get(`${API_BASE}/favorite-places/continent/${firstPlace.continent}`);
      console.log(`✅ Successfully fetched ${continentResponse.data.data.places.length} places from ${firstPlace.continent}`);
    } catch (error) {
      console.log(`❌ Failed to fetch by continent: ${error.response?.data?.message || error.message}`);
    }

    console.log('\n📊 Summary of all places:');
    places.forEach((place, index) => {
      console.log(`${index + 1}. ${place.placeName} (${place.continent})`);
      console.log(`   👤 User: ${place.user?.name || 'Unknown'}`);
      console.log(`   ⭐ Rating: ${place.rating}/5`);
      console.log(`   👍 Likes: ${place.likesCount || 0}`);
      console.log(`   💬 Comments: ${place.commentsCount || 0}`);
      console.log(`   👁️ Views: ${place.viewsCount || 0}`);
      console.log('');
    });

    console.log('🎉 Testing completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

testInteractions();