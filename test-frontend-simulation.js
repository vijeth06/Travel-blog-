// Simulate exactly what the frontend BlogList component does
const axios = require('axios');

// Simulate the frontend API configuration
const API_BASE_URL = 'http://localhost:5000/api';

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Simulate the getBlogs function from frontend
const getBlogs = async (params = {}) => {
  try {
    const response = await API.get('/blogs', { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: error.message };
  }
};

async function simulateFrontendBlogList() {
  console.log('🎭 Simulating Frontend BlogList Component Logic...\n');

  try {
    // Simulate the useEffect in BlogList component
    console.log('📡 Calling getBlogs() (same as frontend)...');
    const response = await getBlogs();
    console.log('✅ API call successful');
    console.log('   Raw response keys:', Object.keys(response));
    
    // Extract blogs the same way frontend does
    const blogs = response.data?.blogs || response.blogs || [];
    console.log(`✅ Extracted ${blogs.length} blogs`);
    
    if (blogs.length === 0) {
      console.log('❌ NO BLOGS FOUND - This is the issue!');
      console.log('   Response structure:', JSON.stringify(response, null, 2));
      return;
    }

    // Simulate the filtering logic from BlogList
    console.log('\n🔍 Simulating filtering logic...');
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

    // Simulate sorting
    console.log('\n📊 Simulating sorting logic...');
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

    // Simulate pagination
    console.log('\n📄 Simulating pagination logic...');
    const page = 1;
    const blogsPerPage = 6;
    
    const paginatedBlogs = sortedBlogs.slice(
      (page - 1) * blogsPerPage,
      page * blogsPerPage
    );
    
    console.log(`✅ Page ${page} should show: ${paginatedBlogs.length} blogs`);

    // Show what would be rendered
    console.log('\n🎨 Blogs that should be rendered:');
    paginatedBlogs.forEach((blog, index) => {
      console.log(`   ${index + 1}. "${blog.title}"`);
      console.log(`      Author: ${blog.author?.name || 'Unknown'}`);
      console.log(`      Category: ${blog.category?.name || 'None'}`);
      console.log(`      Images: ${blog.images?.length || 0}`);
      console.log(`      Created: ${new Date(blog.createdAt).toLocaleDateString()}`);
      console.log('');
    });

    // Test specific blog data that might cause rendering issues
    console.log('🔍 Checking for potential rendering issues...');
    let hasIssues = false;
    
    paginatedBlogs.forEach((blog, index) => {
      const issues = [];
      
      if (!blog._id) issues.push('Missing _id');
      if (!blog.title) issues.push('Missing title');
      if (!blog.author) issues.push('Missing author');
      if (!blog.author?.name) issues.push('Missing author name');
      if (!blog.createdAt) issues.push('Missing createdAt');
      
      if (issues.length > 0) {
        console.log(`   ❌ Blog ${index + 1} has issues: ${issues.join(', ')}`);
        hasIssues = true;
      }
    });
    
    if (!hasIssues) {
      console.log('   ✅ All blogs have required data for rendering');
    }

    console.log('\n🎯 SIMULATION COMPLETE!');
    console.log('\n📋 Results:');
    console.log(`   • API Response: ✅ Working (${blogs.length} blogs)`);
    console.log(`   • Filtering: ✅ Working (${filteredBlogs.length} blogs)`);
    console.log(`   • Sorting: ✅ Working (${sortedBlogs.length} blogs)`);
    console.log(`   • Pagination: ✅ Working (${paginatedBlogs.length} blogs on page 1)`);
    console.log(`   • Data Quality: ${hasIssues ? '❌ Has Issues' : '✅ Good'}`);
    
    if (paginatedBlogs.length > 0) {
      console.log('\n✅ BLOGS SHOULD BE VISIBLE IN FRONTEND!');
      console.log('\n🔧 If still not visible, check:');
      console.log('   1. Browser console for JavaScript errors');
      console.log('   2. Network tab for failed API calls');
      console.log('   3. React component state in React DevTools');
      console.log('   4. Visit http://localhost:3000/blog-test for debugging');
    } else {
      console.log('\n❌ NO BLOGS WOULD BE DISPLAYED');
      console.log('   This explains why stories are not showing!');
    }

  } catch (error) {
    console.error('❌ Simulation failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    console.log('\n💡 This API error would prevent blogs from showing in frontend!');
  }
}

simulateFrontendBlogList();