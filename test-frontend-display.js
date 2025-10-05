// Test frontend blog display by simulating the API call
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';

async function testFrontendDisplay() {
  console.log('🖥️  Testing Frontend Blog Display Logic...\n');

  try {
    // Simulate what the frontend BlogList component does
    console.log('1️⃣ Simulating BlogList API call...');
    const response = await axios.get(`${API_BASE_URL}/blogs`);
    const blogs = response.data.blogs || [];
    
    console.log(`✅ API returned ${blogs.length} blogs`);
    console.log('   Response structure:', {
      hasBlogs: Array.isArray(blogs),
      firstBlogKeys: blogs.length > 0 ? Object.keys(blogs[0]) : 'No blogs'
    });

    // Test filtering logic (what the frontend does)
    console.log('\n2️⃣ Testing Frontend Filtering Logic...');
    
    const searchTerm = '';
    const selectedCategory = 'All Categories';
    
    const filteredBlogs = blogs.filter(blog => {
      const title = blog.title || '';
      const content = blog.content || '';
      const location = blog.location || '';
      const tags = blog.tags || [];
      
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const blogCategory = blog.category?.name || '';
      const matchesCategory = selectedCategory === 'All Categories' || blogCategory === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    console.log(`✅ After filtering: ${filteredBlogs.length} blogs`);
    
    // Test sorting logic
    console.log('\n3️⃣ Testing Frontend Sorting Logic...');
    const sortBy = 'latest';
    
    const sortedBlogs = [...filteredBlogs].sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'oldest':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'popular':
          const aLikes = Array.isArray(a.likes) ? a.likes.length : (a.likesCount || 0);
          const bLikes = Array.isArray(b.likes) ? b.likes.length : (b.likesCount || 0);
          return bLikes - aLikes;
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    console.log(`✅ After sorting: ${sortedBlogs.length} blogs`);
    
    // Test pagination logic
    console.log('\n4️⃣ Testing Frontend Pagination Logic...');
    const page = 1;
    const blogsPerPage = 6;
    
    const paginatedBlogs = sortedBlogs.slice(
      (page - 1) * blogsPerPage,
      page * blogsPerPage
    );
    
    const totalPages = Math.ceil(sortedBlogs.length / blogsPerPage);
    
    console.log(`✅ Page ${page} shows ${paginatedBlogs.length} blogs`);
    console.log(`   Total pages: ${totalPages}`);

    // Test blog rendering data
    console.log('\n5️⃣ Testing Blog Rendering Data...');
    if (paginatedBlogs.length > 0) {
      const sampleBlog = paginatedBlogs[0];
      console.log('✅ Sample blog for rendering:');
      console.log('   Title:', sampleBlog.title);
      console.log('   Author:', sampleBlog.author?.name || 'Unknown');
      console.log('   Category:', sampleBlog.category?.name || 'None');
      console.log('   Location:', sampleBlog.location || 'Not specified');
      console.log('   Images:', sampleBlog.images?.length || 0);
      console.log('   Tags:', sampleBlog.tags?.length || 0);
      console.log('   Created:', new Date(sampleBlog.createdAt).toLocaleDateString());
      console.log('   Likes:', sampleBlog.likesCount || (Array.isArray(sampleBlog.likes) ? sampleBlog.likes.length : 0));
      console.log('   Comments:', sampleBlog.commentsCount || (Array.isArray(sampleBlog.comments) ? sampleBlog.comments.length : 0));
      console.log('   Views:', sampleBlog.views || 0);
    }

    // Test Profile filtering
    console.log('\n6️⃣ Testing Profile Blog Filtering...');
    const userId = '6898c1e0b1c3165a37ee932b'; // John Settings Updated
    const userBlogs = blogs.filter(blog => 
      blog.author && blog.author._id === userId
    );
    
    console.log(`✅ User ${userId} has ${userBlogs.length} blogs`);
    userBlogs.forEach(blog => {
      console.log(`   - "${blog.title}"`);
    });

    console.log('\n🎉 FRONTEND DISPLAY TEST COMPLETED!');
    console.log('\n📋 Results Summary:');
    console.log(`   ✅ Total blogs in database: ${blogs.length}`);
    console.log(`   ✅ Blogs after filtering: ${filteredBlogs.length}`);
    console.log(`   ✅ Blogs after sorting: ${sortedBlogs.length}`);
    console.log(`   ✅ Blogs on first page: ${paginatedBlogs.length}`);
    console.log(`   ✅ User-specific blogs: ${userBlogs.length}`);
    
    console.log('\n💡 If blogs still not showing in frontend:');
    console.log('   1. Check browser console for JavaScript errors');
    console.log('   2. Verify React app is running on http://localhost:3000');
    console.log('   3. Check Network tab in browser dev tools for API calls');
    console.log('   4. Ensure CORS is properly configured');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testFrontendDisplay();