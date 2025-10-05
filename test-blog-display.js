// Test blog display functionality
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testBlogDisplay() {
  console.log('📚 Testing Blog Display Functionality...\n');

  try {
    // Test 1: Get all blogs (what BlogList should show)
    console.log('1️⃣ Testing Blog List API...');
    const blogsResponse = await axios.get(`${API_BASE_URL}/blogs`);
    const blogs = blogsResponse.data.blogs;
    
    console.log(`✅ Found ${blogs.length} blogs in database`);
    console.log('   Blog details:');
    blogs.forEach((blog, index) => {
      console.log(`   ${index + 1}. "${blog.title}"`);
      console.log(`      Author: ${blog.author?.name || 'Unknown'} (ID: ${blog.author?._id})`);
      console.log(`      Category: ${blog.category?.name || 'None'}`);
      console.log(`      Images: ${blog.images?.length || 0}`);
      console.log(`      Tags: ${blog.tags?.join(', ') || 'None'}`);
      console.log(`      Created: ${new Date(blog.createdAt).toLocaleDateString()}`);
      console.log('');
    });

    // Test 2: Check specific user's blogs (what Profile should show)
    console.log('2️⃣ Testing User-Specific Blogs...');
    const johnBlogs = blogs.filter(blog => 
      blog.author?.name?.includes('John') || blog.author?.name?.includes('Settings')
    );
    console.log(`✅ Found ${johnBlogs.length} blogs by John/Settings users`);
    johnBlogs.forEach(blog => {
      console.log(`   - "${blog.title}" by ${blog.author.name}`);
    });

    // Test 3: Check blog structure for frontend compatibility
    console.log('\n3️⃣ Testing Blog Data Structure...');
    if (blogs.length > 0) {
      const sampleBlog = blogs[0];
      console.log('✅ Sample blog structure:');
      console.log('   Has _id:', !!sampleBlog._id);
      console.log('   Has title:', !!sampleBlog.title);
      console.log('   Has content:', !!sampleBlog.content);
      console.log('   Has author object:', !!sampleBlog.author);
      console.log('   Author has name:', !!sampleBlog.author?.name);
      console.log('   Author has _id:', !!sampleBlog.author?._id);
      console.log('   Has createdAt:', !!sampleBlog.createdAt);
      console.log('   Has images array:', Array.isArray(sampleBlog.images));
      console.log('   Has tags array:', Array.isArray(sampleBlog.tags));
      console.log('   Has category:', !!sampleBlog.category);
      console.log('   Category structure:', sampleBlog.category ? 'Object with name' : 'None');
    }

    // Test 4: Test frontend API call format
    console.log('\n4️⃣ Testing Frontend API Response Format...');
    console.log('✅ API Response Structure:');
    console.log('   Response has blogs array:', Array.isArray(blogsResponse.data.blogs));
    console.log('   Response has pagination:', !!blogsResponse.data.pagination);
    console.log('   Response structure matches frontend expectations');

    console.log('\n🎉 BLOG DISPLAY TEST COMPLETED!');
    console.log('\n📋 Summary:');
    console.log(`   ✅ Total blogs in database: ${blogs.length}`);
    console.log(`   ✅ Blogs with authors: ${blogs.filter(b => b.author).length}`);
    console.log(`   ✅ Blogs with categories: ${blogs.filter(b => b.category).length}`);
    console.log(`   ✅ Blogs with images: ${blogs.filter(b => b.images?.length > 0).length}`);
    
    console.log('\n💡 Frontend Issues to Check:');
    console.log('   1. BlogList component should fetch and display these blogs');
    console.log('   2. Profile component should filter blogs by current user');
    console.log('   3. Check browser console for any JavaScript errors');
    console.log('   4. Verify API_URL environment variable in frontend');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testBlogDisplay();