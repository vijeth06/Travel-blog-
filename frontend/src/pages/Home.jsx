import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  Paper,
  Chip,
  Avatar,
  Stack,
  Divider,
  CardActions,
  IconButton
} from '@mui/material';
import {
  FlightTakeoff,
  Create,
  Explore,
  Share,
  LocationOn,
  AccessTime,
  Person,
  ArrowForward,
  Favorite,
  Comment,
  Visibility,
  TrendingUp,
  Star,
  ChatBubble,
  PhotoLibrary,
  EventNote,
  RateReview
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getBlogs } from '../api/blogs';

export default function Home() {
  const [featuredBlogs, setFeaturedBlogs] = useState([]);
  const [popularBlogs, setPopularBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const heroImages = [
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
  ];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await getBlogs();
        const blogs = response.blogs || [];
        setFeaturedBlogs(blogs.slice(0, 3));
        setPopularBlogs(blogs.slice(0, 8));
      } catch (error) {
        console.error('Failed to fetch blogs:', error);
        setFeaturedBlogs([]);
        setPopularBlogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const categories = [
    { name: 'Adventure', icon: '🏔️', count: 45, color: '#FF6B35' },
    { name: 'Culture', icon: '🏛️', count: 32, color: '#1E88E5' },
    { name: 'Food', icon: '🍜', count: 28, color: '#FF9800' },
    { name: 'Beach', icon: '🏖️', count: 38, color: '#4CAF50' },
    { name: 'City', icon: '🏙️', count: 41, color: '#9C27B0' },
    { name: 'Nature', icon: '🌲', count: 35, color: '#795548' }
  ];

  const stats = [
    { label: 'Travel Stories', value: '2,847', icon: <FlightTakeoff />, color: '#1E88E5' },
    { label: 'Active Writers', value: '1,234', icon: <Person />, color: '#FF6B35' },
    { label: 'Countries Covered', value: '156', icon: <Explore />, color: '#4CAF50' },
    { label: 'Monthly Readers', value: '45K+', icon: <Visibility />, color: '#9C27B0' }
  ];

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Typography variant="h5">Loading amazing travel stories...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {/* Hero Carousel Section */}
      <Box sx={{ position: 'relative', height: '70vh', overflow: 'hidden' }}>
        {heroImages.map((image, index) => (
          <Box
            key={index}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundImage: `url(${image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: currentSlide === index ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(30,136,229,0.8) 0%, rgba(25,118,210,0.6) 50%, rgba(255,107,53,0.8) 100%)',
                zIndex: 1
              }
            }}
          />
        ))}
        
        <Container 
          maxWidth="lg" 
          sx={{ 
            position: 'relative', 
            zIndex: 2, 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center',
            color: 'white'
          }}
        >
          <Box sx={{ textAlign: 'center', width: '100%' }}>
            <FlightTakeoff sx={{ fontSize: { xs: 60, md: 80 }, mb: 3 }} />
            <Typography 
              variant="h1" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 800,
                fontSize: { xs: '2.5rem', md: '4rem' },
                mb: 3,
                lineHeight: 1.2
              }}
            >
              Discover Amazing Places
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 6, 
                opacity: 0.9,
                maxWidth: 800,
                mx: 'auto',
                fontSize: { xs: '1.1rem', md: '1.3rem' },
                lineHeight: 1.6
              }}
            >
              Join a community of passionate travelers sharing authentic stories, 
              stunning photos, and insider tips from around the world
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={3} 
              justifyContent="center" 
              alignItems="center"
            >
              {isAuthenticated ? (
                <>
                  <Button 
                    variant="contained" 
                    size="large"
                    startIcon={<Create />}
                    onClick={() => navigate('/blogs/new')}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': { bgcolor: 'grey.100' }
                    }}
                  >
                    Share Your Story
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large"
                    startIcon={<Explore />}
                    onClick={() => navigate('/blogs')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    Explore Stories
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="contained" 
                    size="large"
                    onClick={() => navigate('/register')}
                    sx={{
                      bgcolor: 'white',
                      color: 'primary.main',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': { bgcolor: 'grey.100' }
                    }}
                  >
                    Join Community
                  </Button>
                  <Button 
                    variant="outlined" 
                    size="large"
                    onClick={() => navigate('/blogs')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                  >
                    Explore Stories
                  </Button>
                </>
              )}
            </Stack>
          </Box>
        </Container>

        {/* Carousel Indicators */}
        <Box sx={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
          <Stack direction="row" spacing={1}>
            {heroImages.map((_, index) => (
              <Box
                key={index}
                onClick={() => setCurrentSlide(index)}
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </Stack>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ py: 8 }}>
        {/* Stats Section */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card 
                sx={{ 
                  textAlign: 'center', 
                  p: 3,
                  background: `linear-gradient(135deg, ${stat.color}15 0%, ${stat.color}25 100%)`,
                  border: `2px solid ${stat.color}30`,
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
              >
                <Box sx={{ color: stat.color, mb: 2 }}>
                  {React.cloneElement(stat.icon, { sx: { fontSize: 40 } })}
                </Box>
                <Typography variant="h4" fontWeight={700} color={stat.color} gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* New Features Showcase Section */}
        {isAuthenticated && (
          <Box sx={{ mb: 8, mt: 10 }}>
            <Typography variant="h4" component="h2" textAlign="center" gutterBottom fontWeight={600}>
              Explore Platform Features
            </Typography>
            <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
              Discover powerful tools to enhance your travel experience
            </Typography>
            
            <Grid container spacing={4}>
              {/* Real-Time Chat */}
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    '&:hover': { 
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
                    }
                  }}
                  onClick={() => navigate('/chat')}
                >
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <ChatBubble sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      Real-Time Chat
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
                      Connect with fellow travelers, share tips, and plan adventures together
                    </Typography>
                    <Button 
                      variant="outlined" 
                      sx={{ 
                        color: 'white', 
                        borderColor: 'white',
                        '&:hover': { 
                          borderColor: 'white', 
                          bgcolor: 'rgba(255,255,255,0.1)' 
                        }
                      }}
                      endIcon={<ArrowForward />}
                    >
                      Start Chatting
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Photo Gallery & Stories */}
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    color: 'white',
                    '&:hover': { 
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(240, 147, 251, 0.4)'
                    }
                  }}
                  onClick={() => navigate('/gallery')}
                >
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <PhotoLibrary sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      Gallery & Stories
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
                      Share your travel moments through beautiful photo galleries and 24h stories
                    </Typography>
                    <Button 
                      variant="outlined" 
                      sx={{ 
                        color: 'white', 
                        borderColor: 'white',
                        '&:hover': { 
                          borderColor: 'white', 
                          bgcolor: 'rgba(255,255,255,0.1)' 
                        }
                      }}
                      endIcon={<ArrowForward />}
                    >
                      View Gallery
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Travel Itinerary */}
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    color: 'white',
                    '&:hover': { 
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(79, 172, 254, 0.4)'
                    }
                  }}
                  onClick={() => navigate('/itinerary')}
                >
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <EventNote sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      Trip Planner
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
                      Create detailed itineraries, collaborate with friends, and organize your trips
                    </Typography>
                    <Button 
                      variant="outlined" 
                      sx={{ 
                        color: 'white', 
                        borderColor: 'white',
                        '&:hover': { 
                          borderColor: 'white', 
                          bgcolor: 'rgba(255,255,255,0.1)' 
                        }
                      }}
                      endIcon={<ArrowForward />}
                    >
                      Plan Trip
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              {/* Reviews System */}
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                    color: 'white',
                    '&:hover': { 
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 40px rgba(250, 112, 154, 0.4)'
                    }
                  }}
                  onClick={() => navigate('/reviews')}
                >
                  <CardContent sx={{ textAlign: 'center', p: 4 }}>
                    <RateReview sx={{ fontSize: 60, mb: 2 }} />
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      Reviews & Ratings
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 3 }}>
                      Share your experiences and help others make informed travel decisions
                    </Typography>
                    <Button 
                      variant="outlined" 
                      sx={{ 
                        color: 'white', 
                        borderColor: 'white',
                        '&:hover': { 
                          borderColor: 'white', 
                          bgcolor: 'rgba(255,255,255,0.1)' 
                        }
                      }}
                      endIcon={<ArrowForward />}
                    >
                      Write Review
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Categories Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom fontWeight={600}>
            Explore by Category
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Discover stories from your favorite travel categories
          </Typography>
          
          <Grid container spacing={3}>
            {categories.map((category, index) => (
              <Grid item xs={6} sm={4} md={2} key={index}>
                <Card 
                  sx={{ 
                    textAlign: 'center', 
                    p: 3,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      transform: 'translateY(-8px)',
                      boxShadow: `0 8px 25px ${category.color}40`
                    }
                  }}
                  onClick={() => navigate(`/blogs?category=${category.name.toLowerCase()}`)}
                >
                  <Typography sx={{ fontSize: '2.5rem', mb: 1 }}>
                    {category.icon}
                  </Typography>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {category.name}
                  </Typography>
                  <Chip 
                    label={`${category.count} stories`}
                    size="small"
                    sx={{ 
                      bgcolor: category.color,
                      color: 'white',
                      fontWeight: 600
                    }}
                  />
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Featured Stories Section */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h4" component="h2" textAlign="center" gutterBottom fontWeight={600}>
            Featured Stories
          </Typography>
          <Typography variant="body1" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Hand-picked amazing travel experiences from our community
          </Typography>

          {loading ? (
            <Grid container spacing={4}>
              {[1, 2, 3].map((item) => (
                <Grid item xs={12} md={4} key={item}>
                  <Card sx={{ height: 400 }}>
                    <Box sx={{ height: 250, bgcolor: 'grey.200' }} />
                    <CardContent>
                      <Box sx={{ height: 20, bgcolor: 'grey.200', mb: 1 }} />
                      <Box sx={{ height: 16, bgcolor: 'grey.100', mb: 2 }} />
                      <Box sx={{ height: 16, bgcolor: 'grey.100', width: '60%' }} />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Grid container spacing={4}>
              {featuredBlogs.map((blog, index) => (
                <Grid item xs={12} md={4} key={blog._id}>
                  <Card 
                    sx={{ 
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        transform: 'translateY(-8px)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="250"
                      image={blog.image || `https://source.unsplash.com/600x400/?travel,${blog.title}`}
                      alt={blog.title}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                        {blog.title}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {blog.content?.substring(0, 150)}...
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                          {blog.author?.name?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {blog.author?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton size="small" color="primary">
                          <Favorite />
                        </IconButton>
                        <Typography variant="caption" sx={{ mr: 2 }}>
                          {blog.likes || 0}
                        </Typography>
                        <IconButton size="small" color="primary">
                          <Comment />
                        </IconButton>
                        <Typography variant="caption">
                          {blog.comments?.length || 0}
                        </Typography>
                      </Box>
                      <Button
                        component={Link}
                        to={`/blogs/${blog._id}`}
                        size="small"
                        endIcon={<ArrowForward />}
                      >
                        Read More
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Popular Stories Grid */}
        <Box sx={{ mb: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h2" fontWeight={600}>
              Popular Stories
            </Typography>
            <Button
              component={Link}
              to="/blogs"
              endIcon={<ArrowForward />}
              variant="outlined"
              sx={{ textTransform: 'none' }}
            >
              View All Stories
            </Button>
          </Box>

          <Grid container spacing={3}>
            {popularBlogs.map((blog, index) => (
              <Grid item xs={12} sm={6} md={3} key={blog._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="180"
                    image={blog.image || `https://source.unsplash.com/400x300/?travel,${blog.title}`}
                    alt={blog.title}
                  />
                  <CardContent>
                    <Typography variant="h6" component="h3" gutterBottom noWrap fontWeight={600}>
                      {blog.title}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {blog.content?.substring(0, 80)}...
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          {blog.location || 'Unknown'}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Star sx={{ fontSize: 16, mr: 0.5, color: '#FFD700' }} />
                        <Typography variant="caption">
                          {blog.averageRating?.toFixed(1) || blog.rating?.toFixed(1) || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      component={Link}
                      to={`/blogs/${blog._id}`}
                      size="small"
                      fullWidth
                      variant="outlined"
                    >
                      Read Story
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* New Features Showcase */}
        <Box sx={{ mb: 8 }}>
          <Typography variant="h3" textAlign="center" gutterBottom fontWeight={700}>
            ✨ New Features
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 6 }}>
            Discover powerful new tools to enhance your travel blogging experience
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  },
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)',
                  color: 'white',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h2" sx={{ mb: 2 }}>🎮</Typography>
                    <Typography variant="h5" gutterBottom fontWeight={600} sx={{ minHeight: '32px' }}>
                      Gamification
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, minHeight: '72px' }}>
                      Earn achievements, level up, and compete with other travelers as you document your journeys.
                    </Typography>
                  </Box>
                  <Button
                    component={Link}
                    to="/gamification"
                    variant="contained"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                  >
                    View Achievements
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  },
                  background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
                  color: 'white',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h2" sx={{ mb: 2 }}>🤖</Typography>
                    <Typography variant="h5" gutterBottom fontWeight={600} sx={{ minHeight: '32px' }}>
                      AI Recommendations
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, minHeight: '72px' }}>
                      Get personalized travel suggestions powered by AI based on your preferences and history.
                    </Typography>
                  </Box>
                  <Button
                    component={Link}
                    to="/ai-recommendations"
                    variant="contained"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                  >
                    Get Recommendations
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  },
                  background: 'linear-gradient(135deg, #4CAF50 0%, #388E3C 100%)',
                  color: 'white',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h2" sx={{ mb: 2 }}>🏆</Typography>
                    <Typography variant="h5" gutterBottom fontWeight={600} sx={{ minHeight: '32px' }}>
                      Certificates
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, minHeight: '72px' }}>
                      Earn travel certificates and showcase your expertise in different destinations and activities.
                    </Typography>
                  </Box>
                  <Button
                    component={Link}
                    to="/certificates"
                    variant="contained"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                  >
                    View Certificates
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  },
                  background: 'linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)',
                  color: 'white',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h2" sx={{ mb: 2 }}>💎</Typography>
                    <Typography variant="h5" gutterBottom fontWeight={600} sx={{ minHeight: '32px' }}>
                      Premium Features
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, minHeight: '72px' }}>
                      Unlock advanced features, unlimited storage, and monetization tools for your travel blog.
                    </Typography>
                  </Box>
                  <Button
                    component={Link}
                    to="/premium"
                    variant="contained"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                  >
                    Go Premium
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  },
                  background: 'linear-gradient(135deg, #FF5722 0%, #D84315 100%)',
                  color: 'white',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h2" sx={{ mb: 2 }}>🔌</Typography>
                    <Typography variant="h5" gutterBottom fontWeight={600} sx={{ minHeight: '32px' }}>
                      Integrations
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, minHeight: '72px' }}>
                      Connect with social media, weather services, maps, and more to enhance your content.
                    </Typography>
                  </Box>
                  <Button
                    component={Link}
                    to="/integrations"
                    variant="contained"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                  >
                    Manage Integrations
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                  },
                  background: 'linear-gradient(135deg, #607D8B 0%, #455A64 100%)',
                  color: 'white',
                }}
              >
                <CardContent sx={{ textAlign: 'center', p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h2" sx={{ mb: 2 }}>📱</Typography>
                    <Typography variant="h5" gutterBottom fontWeight={600} sx={{ minHeight: '32px' }}>
                      Mobile Optimized
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3, minHeight: '72px' }}>
                      Experience seamless mobile blogging with offline support and optimized performance.
                    </Typography>
                  </Box>
                  <Button
                    component={Link}
                    to="/mobile"
                    variant="contained"
                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
                  >
                    Mobile Features
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Call to Action */}
        <Paper
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
            color: 'white',
            p: 8,
            textAlign: 'center',
            borderRadius: 4
          }}
        >
          <Typography variant="h3" gutterBottom fontWeight={700}>
            Ready to Share Your Adventure?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of travelers sharing their incredible journeys
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
            {!isAuthenticated ? (
              <>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                >
                  Start Your Journey
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/blogs')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  Explore Stories
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                size="large"
                startIcon={<Create />}
                onClick={() => navigate('/blogs/new')}
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                Write Your Story
              </Button>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}