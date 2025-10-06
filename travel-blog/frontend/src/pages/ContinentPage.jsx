import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Box,
  Chip,
  Button,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Rating,
  IconButton,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  AttachMoney,
  Star,
  Favorite,
  FavoriteBorder,
  Share,
  PhotoCamera,
  Landscape,
  AccountBalance,
  TravelExplore,
  Info,
  TipsAndUpdates,
  Security,
  Language,
  Public,
  ArrowBack
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { getContinent, getFamousPlaces, getPlaceCategories } from '../api/continents';
import MostPopularSection from '../components/MostPopularSection';

const ContinentPage = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  const [continent, setContinent] = useState(null);
  const [places, setPlaces] = useState([]);
  const [categories, setCategories] = useState([]);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [relatedPackages, setRelatedPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [favorites, setFavorites] = useState(new Set());

  useEffect(() => {
    if (identifier) {
      fetchContinentData();
    }
  }, [identifier]);

  useEffect(() => {
    if (continent) {
      fetchPlaces();
      fetchCategories();
    }
  }, [continent, selectedCategory]);

  const fetchContinentData = async () => {
    try {
      setLoading(true);
      const response = await getContinent(identifier);
      setContinent(response.data.continent);
      setRelatedBlogs(response.data.relatedBlogs || []);
      setRelatedPackages(response.data.relatedPackages || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching continent:', err);
      setError('Failed to load continent data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlaces = async () => {
    try {
      const params = selectedCategory ? { category: selectedCategory } : {};
      const response = await getFamousPlaces(identifier, params);
      setPlaces(response.data.places || []);
    } catch (err) {
      console.error('Error fetching places:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await getPlaceCategories(identifier);
      setCategories(response.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category === selectedCategory ? '' : category);
  };

  const toggleFavorite = (placeId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(placeId)) {
      newFavorites.delete(placeId);
    } else {
      newFavorites.add(placeId);
    }
    setFavorites(newFavorites);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Natural Wonder': <Landscape />,
      'Historical Site': <AccountBalance />,
      'Cultural Site': <Language />,
      'Adventure': <TravelExplore />,
      'Beach': <Public />,
      'Mountain': <Landscape />,
      'City': <LocationOn />,
      'Religious Site': <AccountBalance />,
      'Wildlife': <PhotoCamera />,
      'Architecture': <AccountBalance />
    };
    return icons[category] || <LocationOn />;
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Easy': 'success',
      'Moderate': 'warning',
      'Challenging': 'error',
      'Expert': 'error'
    };
    return colors[difficulty] || 'default';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading continent data...
        </Typography>
      </Container>
    );
  }

  if (error || !continent) {
    return (
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error || 'Continent not found'}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/continents')}
        >
          Back to Continents
        </Button>
      </Container>
    );
  }

  const tabLabels = ['Famous Places', 'Travel Info', 'Related Blogs', 'Travel Packages'];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/continents')}
        sx={{ mb: 3 }}
      >
        Back to Continents
      </Button>

      {/* Hero Section */}
      <Fade in timeout={1000}>
        <Box sx={{ mb: 6 }}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography 
                variant="h2" 
                component="h1" 
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}
              >
                {continent.name}
              </Typography>
              
              <Typography variant="h6" color="text.secondary" paragraph>
                {continent.description}
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {continent.countries?.length || 0} Countries
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PhotoCamera color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {continent.touristPlacesCount || 0} Famous Places
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Public color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body1">
                    {continent.area?.toLocaleString()} km²
                  </Typography>
                </Box>
              </Box>

              {continent.featured && (
                <Chip
                  label="Featured Destination"
                  color="primary"
                  size="large"
                  sx={{ mb: 2 }}
                />
              )}
            </Grid>
            
            <Grid item xs={12} md={4}>
              {continent.heroImage && (
                <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <CardMedia
                    component="img"
                    height="300"
                    image={continent.heroImage.url}
                    alt={continent.heroImage.alt || continent.name}
                  />
                </Card>
              )}
            </Grid>
          </Grid>
        </Box>
      </Fade>

      {/* Tabs */}
      <Box sx={{ mb: 4 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem'
            }
          }}
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      </Box>

      {/* Tab Content */}
      {selectedTab === 0 && (
        <Box>
          {/* Category Filters */}
          {categories.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                Filter by Category
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  label="All"
                  onClick={() => handleCategoryFilter('')}
                  color={selectedCategory === '' ? 'primary' : 'default'}
                  variant={selectedCategory === '' ? 'filled' : 'outlined'}
                />
                {categories.map((category) => (
                  <Chip
                    key={category.name}
                    label={`${category.name} (${category.count})`}
                    onClick={() => handleCategoryFilter(category.name)}
                    color={selectedCategory === category.name ? 'primary' : 'default'}
                    variant={selectedCategory === category.name ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Famous Places Grid */}
          <Grid container spacing={4}>
            {places.map((place, index) => (
              <Grid item xs={12} sm={6} md={4} key={place._id || index}>
                <Zoom in timeout={300 + index * 100}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={place.images?.[0]?.url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                        alt={place.images?.[0]?.alt || place.name}
                      />
                      
                      {/* Favorite Button */}
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)'
                          }
                        }}
                        onClick={() => toggleFavorite(place._id || index)}
                      >
                        {favorites.has(place._id || index) ? (
                          <Favorite color="error" />
                        ) : (
                          <FavoriteBorder />
                        )}
                      </IconButton>

                      {/* Category Chip */}
                      <Chip
                        label={place.category}
                        size="small"
                        color="primary"
                        sx={{
                          position: 'absolute',
                          bottom: 8,
                          left: 8
                        }}
                      />

                      {place.featured && (
                        <Chip
                          label="Featured"
                          size="small"
                          color="secondary"
                          sx={{
                            position: 'absolute',
                            bottom: 8,
                            right: 8
                          }}
                        />
                      )}
                    </Box>

                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Typography variant="h6" component="h3" gutterBottom fontWeight="bold">
                        {place.name}
                      </Typography>

                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <LocationOn fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                          {place.city ? `${place.city}, ${place.country}` : place.country}
                        </Typography>
                      </Box>

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
                        {place.description}
                      </Typography>

                      {/* Place Details */}
                      <Box sx={{ mb: 2 }}>
                        {place.bestTimeToVisit && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AccessTime fontSize="small" color="action" />
                            <Typography variant="caption" sx={{ ml: 0.5 }}>
                              Best time: {place.bestTimeToVisit}
                            </Typography>
                          </Box>
                        )}

                        {place.averageStay && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Star fontSize="small" color="action" />
                            <Typography variant="caption" sx={{ ml: 0.5 }}>
                              Stay: {place.averageStay}
                            </Typography>
                          </Box>
                        )}

                        {place.difficulty && (
                          <Chip
                            label={place.difficulty}
                            size="small"
                            color={getDifficultyColor(place.difficulty)}
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                        )}

                        {place.entryFee && place.entryFee.amount > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                            <AttachMoney fontSize="small" color="action" />
                            <Typography variant="caption" sx={{ ml: 0.5 }}>
                              Entry: {place.entryFee.amount} {place.entryFee.currency}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Tags */}
                      {place.tags && place.tags.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {place.tags.slice(0, 3).map((tag, idx) => (
                            <Chip
                              key={idx}
                              label={tag}
                              size="small"
                              variant="outlined"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Zoom>
              </Grid>
            ))}
          </Grid>

          {places.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No places found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try adjusting your category filter
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {selectedTab === 1 && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                <Info color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                General Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemText
                    primary="Best Time to Visit"
                    secondary={continent.bestTimeToVisit || 'Varies by region'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Major Languages"
                    secondary={continent.majorLanguages?.join(', ') || 'Various'}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Major Currencies"
                    secondary={continent.majorCurrencies?.join(', ') || 'Various'}
                  />
                </ListItem>
                {continent.averageTemperature && (
                  <>
                    <ListItem>
                      <ListItemText
                        primary="Summer Temperature"
                        secondary={continent.averageTemperature.summer}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Winter Temperature"
                        secondary={continent.averageTemperature.winter}
                      />
                    </ListItem>
                  </>
                )}
              </List>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            {continent.travelTips && continent.travelTips.length > 0 && (
              <Card sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  <TipsAndUpdates color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Travel Tips
                </Typography>
                <List>
                  {continent.travelTips.map((tip, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <TravelExplore fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={tip} />
                    </ListItem>
                  ))}
                </List>
              </Card>
            )}

            {continent.safetyTips && continent.safetyTips.length > 0 && (
              <Card sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  <Security color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Safety Tips
                </Typography>
                <List>
                  {continent.safetyTips.map((tip, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <Security fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={tip} />
                    </ListItem>
                  ))}
                </List>
              </Card>
            )}
          </Grid>
        </Grid>
      )}

      {selectedTab === 2 && (
        <Grid container spacing={3}>
          {relatedBlogs.map((blog) => (
            <Grid item xs={12} sm={6} md={4} key={blog._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={blog.thumbnail || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                  alt={blog.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {blog.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    By {blog.author?.name || 'Anonymous'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {relatedBlogs.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                No related blogs found for this continent.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}

      {selectedTab === 3 && (
        <Grid container spacing={3}>
          {relatedPackages.map((pkg) => (
            <Grid item xs={12} sm={6} md={4} key={pkg._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={pkg.images?.[0] || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                  alt={pkg.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {pkg.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {pkg.location?.country}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {pkg.price} {pkg.currency}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
          {relatedPackages.length === 0 && (
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary" textAlign="center">
                No travel packages found for this continent.
              </Typography>
            </Grid>
          )}
        </Grid>
      )}
      
      {/* Most Popular Section */}
      <Box sx={{ mt: 8, mb: 6 }}>
        <MostPopularSection />
      </Box>
    </Container>
  );
};

export default ContinentPage;