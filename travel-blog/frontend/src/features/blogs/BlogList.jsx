import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Button,
  Chip,
  Avatar,
  Rating,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Pagination,
  Skeleton,
  CardMedia,
  Drawer,
  IconButton,
  Divider,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Autocomplete,
  Paper,
  Collapse
} from '@mui/material';
import { 
  Search, 
  LocationOn, 
  AccessTime, 
  Person, 
  Favorite, 
  Comment, 
  Visibility,
  FilterList,
  Sort,
  FlightTakeoff,
  Close,
  Clear,
  ExpandMore,
  ExpandLess,
  CalendarToday,
  Star,
  TrendingUp
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getBlogs } from '../../api/blogs';

// Sample blog data for demonstration
const sampleBlogs = [
  {
    _id: '1',
    title: 'Exploring the Hidden Gems of Bali: A Complete Travel Guide',
    content: 'Bali, the Island of the Gods, offers more than just beautiful beaches. From the spiritual temples of Ubud to the hidden waterfalls of Munduk, this Indonesian paradise is a traveler\'s dream. I spent three weeks exploring every corner of this magical island, and here\'s everything you need to know...',
    author: { name: 'Sarah Johnson', _id: 'user1' },
    location: 'Bali, Indonesia',
    category: 'Adventure',
    images: ['https://source.unsplash.com/random/800x600/?bali,temple'],
    likes: Array(127).fill('user'),
    comments: Array(23).fill('comment'),
    createdAt: '2024-01-15T10:30:00Z',
    rating: 4.8,
    tags: ['bali', 'indonesia', 'temple', 'culture', 'adventure']
  },
  {
    _id: '2',
    title: 'A Food Lover\'s Journey Through Tokyo\'s Best Ramen Shops',
    content: 'Tokyo is a culinary paradise, and nothing represents Japanese comfort food better than a steaming bowl of ramen. I visited 15 different ramen shops across the city, from tiny hole-in-the-wall joints to famous chains. Here\'s my ultimate guide to the best ramen in Tokyo...',
    author: { name: 'Mike Chen', _id: 'user2' },
    location: 'Tokyo, Japan',
    category: 'Food',
    images: ['https://source.unsplash.com/random/800x600/?ramen,japan'],
    likes: Array(89).fill('user'),
    comments: Array(15).fill('comment'),
    createdAt: '2024-01-12T14:20:00Z',
    rating: 4.6,
    tags: ['tokyo', 'japan', 'ramen', 'food', 'culinary']
  },
  {
    _id: '3',
    title: 'Hiking the Inca Trail: My Journey to Machu Picchu',
    content: 'The Inca Trail to Machu Picchu is one of the world\'s most iconic treks. Four days of challenging hiking through the Andes Mountains, passing ancient ruins and breathtaking landscapes, all leading to the magnificent Lost City of the Incas. Here\'s my complete experience...',
    author: { name: 'Elena Rodriguez', _id: 'user3' },
    location: 'Machu Picchu, Peru',
    category: 'Adventure',
    images: ['https://source.unsplash.com/random/800x600/?machu-picchu,peru'],
    likes: Array(203).fill('user'),
    comments: Array(45).fill('comment'),
    createdAt: '2024-01-10T09:15:00Z',
    rating: 4.9,
    tags: ['machu-picchu', 'peru', 'hiking', 'adventure', 'inca-trail']
  },
  {
    _id: '4',
    title: 'The Ultimate Guide to Backpacking Through Europe on a Budget',
    content: 'Europe doesn\'t have to be expensive! I spent three months backpacking through 12 countries, staying in hostels, eating local food, and using budget transportation. Here\'s how I managed to explore Europe for less than $50 per day...',
    author: { name: 'David Thompson', _id: 'user4' },
    location: 'Europe',
    category: 'Budget Travel',
    images: ['https://source.unsplash.com/random/800x600/?europe,backpacking'],
    likes: Array(156).fill('user'),
    comments: Array(32).fill('comment'),
    createdAt: '2024-01-08T16:45:00Z',
    rating: 4.7,
    tags: ['europe', 'backpacking', 'budget', 'travel-tips', 'hostels']
  },
  {
    _id: '5',
    title: 'Discovering the Magic of Morocco: From Marrakech to the Sahara',
    content: 'Morocco is a country of contrasts - bustling medinas, vast deserts, and stunning mountain ranges. I spent two weeks exploring from the vibrant streets of Marrakech to the golden dunes of the Sahara Desert. Here\'s my complete Morocco travel guide...',
    author: { name: 'Aisha Patel', _id: 'user5' },
    location: 'Morocco',
    category: 'Culture',
    images: ['https://source.unsplash.com/random/800x600/?morocco,desert'],
    likes: Array(134).fill('user'),
    comments: Array(28).fill('comment'),
    createdAt: '2024-01-05T11:30:00Z',
    rating: 4.5,
    tags: ['morocco', 'marrakech', 'sahara', 'culture', 'desert']
  },
  {
    _id: '6',
    title: 'Swimming with Whale Sharks in the Philippines: An Unforgettable Experience',
    content: 'Swimming alongside the gentle giants of the sea was one of the most incredible experiences of my life. I traveled to Oslob in the Philippines to swim with whale sharks in their natural habitat. Here\'s everything you need to know about this amazing adventure...',
    author: { name: 'James Wilson', _id: 'user6' },
    location: 'Oslob, Philippines',
    category: 'Adventure',
    images: ['https://source.unsplash.com/random/800x600/?whale-shark,philippines'],
    likes: Array(178).fill('user'),
    comments: Array(41).fill('comment'),
    createdAt: '2024-01-03T13:20:00Z',
    rating: 4.8,
    tags: ['philippines', 'whale-shark', 'swimming', 'adventure', 'marine-life']
  }
];

const categories = [
  'All Categories',
  'Adventure',
  'Culture',
  'Food',
  'Budget Travel',
  'Luxury',
  'Beach',
  'City',
  'Nature'
];

export default function BlogList() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [dateRange, setDateRange] = useState([0, 365]); // days ago
  const [minRating, setMinRating] = useState(0);
  const [showFeatured, setShowFeatured] = useState(false);
  const [authorFilter, setAuthorFilter] = useState('');
  const blogsPerPage = 6;

  useEffect(() => {
    // Fetch real blogs from API
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await getBlogs();
        console.log('Fetched blogs:', response);
        setBlogs(response.data?.blogs || response.blogs || []);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        // Fallback to sample data if API fails
        setBlogs(sampleBlogs);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Get all unique tags and locations for filter options
  const allTags = [...new Set(blogs.flatMap(blog => blog.tags || []))];
  const allLocations = [...new Set(blogs.map(blog => blog.location).filter(Boolean))];
  const allAuthors = [...new Set(blogs.map(blog => blog.author?.name).filter(Boolean))];

  const filteredBlogs = blogs.filter(blog => {
    const title = blog.title || '';
    const content = blog.content || '';
    const location = blog.location || '';
    const tags = blog.tags || [];
    const authorName = blog.author?.name || '';
    
    // Basic search
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         authorName.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category filter
    const blogCategory = blog.category?.name || blog.category || '';
    const matchesCategory = selectedCategory === 'All Categories' || blogCategory === selectedCategory;
    
    // Tag filter
    const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => tags.includes(tag));
    
    // Location filter
    const matchesLocation = !selectedLocation || location.toLowerCase().includes(selectedLocation.toLowerCase());
    
    // Author filter
    const matchesAuthor = !authorFilter || authorName.toLowerCase().includes(authorFilter.toLowerCase());
    
    // Date range filter
    const blogDate = new Date(blog.createdAt);
    const now = new Date();
    const daysAgo = Math.floor((now - blogDate) / (1000 * 60 * 60 * 24));
    const matchesDateRange = daysAgo >= dateRange[0] && daysAgo <= dateRange[1];
    
    // Rating filter
    const blogRating = blog.rating || 0;
    const matchesRating = blogRating >= minRating;
    
    // Featured filter
    const matchesFeatured = !showFeatured || blog.featured;
    
    return matchesSearch && matchesCategory && matchesTags && matchesLocation && 
           matchesAuthor && matchesDateRange && matchesRating && matchesFeatured;
  });

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
      case 'views':
        return (b.views || 0) - (a.views || 0);
      case 'comments':
        const aComments = Array.isArray(a.comments) ? a.comments.length : (a.commentsCount || 0);
        const bComments = Array.isArray(b.comments) ? b.comments.length : (b.commentsCount || 0);
        return bComments - aComments;
      default:
        return 0;
    }
  });

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All Categories');
    setSelectedTags([]);
    setSelectedLocation('');
    setDateRange([0, 365]);
    setMinRating(0);
    setShowFeatured(false);
    setAuthorFilter('');
    setSortBy('latest');
  };

  const hasActiveFilters = searchTerm || selectedCategory !== 'All Categories' || 
                          selectedTags.length > 0 || selectedLocation || 
                          dateRange[0] !== 0 || dateRange[1] !== 365 || 
                          minRating > 0 || showFeatured || authorFilter;

  const paginatedBlogs = sortedBlogs.slice(
    (page - 1) * blogsPerPage,
    page * blogsPerPage
  );

  const totalPages = Math.ceil(sortedBlogs.length / blogsPerPage);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" gutterBottom>
          Explore Travel Stories
        </Typography>
        <Grid container spacing={4}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
          Explore Travel Stories
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Discover amazing destinations and inspiring adventures from around the world
        </Typography>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search destinations, stories, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                startAdornment={<Sort sx={{ mr: 1, fontSize: 16 }} />}
              >
                <MenuItem value="latest">Latest</MenuItem>
                <MenuItem value="oldest">Oldest</MenuItem>
                <MenuItem value="popular">Most Popular</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="views">Most Viewed</MenuItem>
                <MenuItem value="comments">Most Commented</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={1}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<FilterList />}
              onClick={() => setFilterDrawerOpen(true)}
              sx={{ height: '56px' }}
            >
              Filters
            </Button>
          </Grid>
        </Grid>

        {/* Advanced Filters Toggle */}
        <Box sx={{ mt: 2 }}>
          <Button
            variant="text"
            onClick={() => setAdvancedFiltersOpen(!advancedFiltersOpen)}
            startIcon={advancedFiltersOpen ? <ExpandLess /> : <ExpandMore />}
            size="small"
          >
            Advanced Filters
          </Button>
          {hasActiveFilters && (
            <Button
              variant="text"
              onClick={clearAllFilters}
              startIcon={<Clear />}
              size="small"
              sx={{ ml: 2, color: 'error.main' }}
            >
              Clear All Filters
            </Button>
          )}
        </Box>

        {/* Advanced Filters Collapse */}
        <Collapse in={advancedFiltersOpen}>
          <Paper sx={{ p: 3, mt: 2, backgroundColor: 'grey.50' }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  multiple
                  options={allTags}
                  value={selectedTags}
                  onChange={(event, newValue) => setSelectedTags(newValue)}
                  renderInput={(params) => (
                    <TextField {...params} label="Tags" placeholder="Select tags..." />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                />
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={allLocations}
                  value={selectedLocation}
                  onChange={(event, newValue) => setSelectedLocation(newValue || '')}
                  renderInput={(params) => (
                    <TextField {...params} label="Location" placeholder="Filter by location..." />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={allAuthors}
                  value={authorFilter}
                  onChange={(event, newValue) => setAuthorFilter(newValue || '')}
                  renderInput={(params) => (
                    <TextField {...params} label="Author" placeholder="Filter by author..." />
                  )}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography gutterBottom>Minimum Rating</Typography>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={minRating}
                    onChange={(event, newValue) => setMinRating(newValue)}
                    min={0}
                    max={5}
                    step={0.5}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 2.5, label: '2.5' },
                      { value: 5, label: '5' }
                    ]}
                    valueLabelDisplay="auto"
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography gutterBottom>Date Range (days ago)</Typography>
                <Box sx={{ px: 2 }}>
                  <Slider
                    value={dateRange}
                    onChange={(event, newValue) => setDateRange(newValue)}
                    min={0}
                    max={365}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: 0, label: 'Today' },
                      { value: 30, label: '1M' },
                      { value: 90, label: '3M' },
                      { value: 365, label: '1Y' }
                    ]}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={showFeatured}
                        onChange={(e) => setShowFeatured(e.target.checked)}
                      />
                    }
                    label="Featured Posts Only"
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </Paper>
        </Collapse>
      </Box>

      {/* Results Count */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {filteredBlogs.length} stories found
        </Typography>
        <Button
          component={Link}
          to="/blogs/new"
          variant="contained"
          startIcon={<FlightTakeoff />}
          sx={{ 
            background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
            boxShadow: '0 3px 15px 2px rgba(255, 107, 53, 0.3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #F7931E 30%, #FF6B35 90%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 6px 20px 4px rgba(255, 107, 53, 0.4)',
            }
          }}
        >
          Write Your Story
        </Button>
      </Box>

      {/* Blog Grid */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {paginatedBlogs.map((blog) => (
          <Grid item xs={12} md={6} lg={4} key={blog._id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 4
              }
            }}>
              {blog.images && blog.images.length > 0 && (
                <CardMedia
                  component="img"
                  height="200"
                  image={typeof blog.images[0] === 'string' ? blog.images[0] : blog.images[0]?.url}
                  alt={blog.title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              )}
              <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  {blog.category && (
                    <Chip 
                      label={blog.category.name || blog.category} 
                      size="small" 
                      sx={{ 
                        background: 'linear-gradient(45deg, #1E88E5 30%, #42A5F5 90%)',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: 600
                      }} 
                    />
                  )}
                  <Rating value={blog.rating || 0} precision={0.1} size="small" sx={{ ml: 'auto' }} />
                </Box>
                
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {blog.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                  {(blog.content || '').substring(0, 120)}{blog.content && blog.content.length > 120 ? '...' : ''}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.8rem' }}>
                    {blog.author?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    {blog.author?.name || 'Unknown Author'}
                  </Typography>
                </Box>
                
                {blog.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <LocationOn sx={{ mr: 1, fontSize: 16, color: '#1E88E5' }} />
                    <Typography variant="body2" color="text.secondary">
                      {blog.location}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <AccessTime sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Favorite sx={{ mr: 1, fontSize: 16, color: '#f44336' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                    {blog.likesCount || (Array.isArray(blog.likes) ? blog.likes.length : 0)}
                  </Typography>
                  <Comment sx={{ mr: 1, fontSize: 16, color: '#2196f3' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                    {blog.commentsCount || (Array.isArray(blog.comments) ? blog.comments.length : 0)}
                  </Typography>
                  <Visibility sx={{ mr: 1, fontSize: 16, color: '#ff9800' }} />
                  <Typography variant="body2" color="text.secondary">
                    {blog.views || 0}
                  </Typography>
                </Box>

                <Button 
                  component={Link} 
                  to={`/blogs/${blog._id}`}
                  variant="outlined"
                  fullWidth
                  sx={{ 
                    borderColor: '#1E88E5', 
                    color: '#1E88E5',
                    borderWidth: '2px',
                    '&:hover': {
                      borderColor: '#1E88E5',
                      backgroundColor: 'rgba(30, 136, 229, 0.05)',
                      transform: 'translateY(-1px)',
                    }
                  }}
                >
                  Read Full Story
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={(e, value) => setPage(value)}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* No Results */}
      {filteredBlogs.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <FlightTakeoff sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No stories found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search terms or filters
          </Typography>
          <Button 
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All Categories');
            }}
            variant="contained"
            sx={{ 
              background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
              boxShadow: '0 3px 15px 2px rgba(255, 107, 53, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #F7931E 30%, #FF6B35 90%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px 4px rgba(255, 107, 53, 0.4)',
              }
            }}
          >
            Clear Filters
          </Button>
        </Box>
      )}
    </Container>
  );
}
