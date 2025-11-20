import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider
} from '@mui/material';
import {
  Map as MapIcon,
  Search,
  LocationOn,
  FilterList,
  ViewList,
  Explore,
  TravelExplore
} from '@mui/icons-material';
import { getBlogs } from '../api/blogs';
import MapView from '../components/MapView';
import { useNavigate } from 'react-router-dom';

const MapPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [currentTab, setCurrentTab] = useState(0);
  const navigate = useNavigate();

  const categories = ['All', 'Adventure', 'Culture', 'Food', 'Beach', 'City', 'Nature'];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await getBlogs();
        const blogData = response.data?.blogs || response.blogs || [];
        
        // Use real geotag data from blogs
        const blogsWithGeodata = blogData.map(blog => ({
          ...blog,
          geotag: blog.geotag || blog.location?.coordinates || null
        })).filter(blog => blog.geotag); // Only show blogs with geotag data
        
        setBlogs(blogsWithGeodata);
        setFilteredBlogs(blogsWithGeodata);
      } catch (error) {
        console.error('Error fetching blogs:', error);
        setError('Failed to load travel destinations');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    let filtered = blogs;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(blog =>
        blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(blog => 
        blog.category?.name === selectedCategory || blog.category === selectedCategory
      );
    }

    // Only show blogs with locations for map view
    if (currentTab === 0) {
      filtered = filtered.filter(blog => blog.location);
    }

    setFilteredBlogs(filtered);
  }, [blogs, searchTerm, selectedCategory, currentTab]);

  const handleBlogSelect = (blog) => {
    setSelectedBlog(blog);
  };

  const handleViewBlog = (blog) => {
    navigate(`/blogs/${blog._id}`);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <TravelExplore sx={{ fontSize: '3rem', color: 'primary.main' }} />
          Explore Travel Destinations
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Discover amazing destinations around the world through interactive maps and inspiring travel stories
        </Typography>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search destinations, stories, or locations..."
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
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip 
                  icon={<LocationOn />} 
                  label={`${filteredBlogs.length} Destinations`} 
                  color="primary" 
                  variant="outlined"
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* View Toggle */}
      <Card sx={{ mb: 4 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
            <Tab icon={<MapIcon />} label="Map View" />
            <Tab icon={<ViewList />} label="List View" />
          </Tabs>
        </Box>
      </Card>

      {/* Content */}
      {currentTab === 0 ? (
        // Map View
        <Grid container spacing={3}>
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent sx={{ p: 0 }}>
                <MapView
                  blogs={filteredBlogs}
                  selectedBlog={selectedBlog}
                  onBlogSelect={handleBlogSelect}
                  height="600px"
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Card sx={{ height: '600px', overflow: 'auto' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Explore />
                  Featured Destinations
                </Typography>
                <List>
                  {filteredBlogs.slice(0, 10).map((blog, index) => (
                    <React.Fragment key={blog._id}>
                      <ListItem
                        button
                        onClick={() => handleBlogSelect(blog)}
                        sx={{
                          borderRadius: 2,
                          mb: 1,
                          backgroundColor: selectedBlog?._id === blog._id ? 'primary.50' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'grey.50'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={blog.images?.[0]}
                            sx={{ width: 50, height: 50 }}
                          >
                            {blog.title?.charAt(0)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {blog.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                <LocationOn sx={{ fontSize: 14 }} />
                                <Typography variant="caption">
                                  {blog.location}
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary">
                                by {blog.author?.name}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < filteredBlogs.slice(0, 10).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
                
                {selectedBlog && (
                  <Box sx={{ mt: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
                      Selected Destination
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {selectedBlog.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                      {selectedBlog.content?.substring(0, 100)}...
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleViewBlog(selectedBlog)}
                      sx={{
                        background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #F7931E 30%, #FF6B35 90%)',
                        }
                      }}
                    >
                      Read Story
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        // List View
        <Grid container spacing={3}>
          {filteredBlogs.map((blog) => (
            <Grid item xs={12} sm={6} md={4} key={blog._id}>
              <Card
                sx={{
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => handleViewBlog(blog)}
              >
                {blog.images?.[0] && (
                  <Box
                    sx={{
                      height: 200,
                      backgroundImage: `url(${blog.images[0]})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative'
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: 1,
                        px: 1,
                        py: 0.5
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                        {blog.category?.name || blog.category || 'Travel'}
                      </Typography>
                    </Box>
                  </Box>
                )}
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {blog.title}
                  </Typography>
                  
                  {blog.location && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <LocationOn sx={{ fontSize: 16, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        {blog.location}
                      </Typography>
                    </Box>
                  )}
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {blog.content?.substring(0, 120)}...
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar
                        src={blog.author?.avatar}
                        sx={{ width: 24, height: 24 }}
                      >
                        {blog.author?.name?.charAt(0)}
                      </Avatar>
                      <Typography variant="caption">
                        {blog.author?.name}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {filteredBlogs.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No destinations found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or explore different categories
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default MapPage;
