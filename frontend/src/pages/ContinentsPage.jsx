import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Fade,
  Zoom
} from '@mui/material';
import {
  Search,
  Explore,
  LocationOn,
  PhotoCamera,
  TravelExplore,
  Public,
  Landscape,
  AccountBalance
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getContinents, searchContinents, getContinentStats } from '../api/continents';

const ContinentsPage = () => {
  const navigate = useNavigate();
  const [continents, setContinents] = useState([]);
  const [filteredContinents, setFilteredContinents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchContinents();
    fetchStats();
  }, []);

  useEffect(() => {
    filterContinents();
  }, [continents, searchQuery, selectedTab]);

  const fetchContinents = async () => {
    try {
      setLoading(true);
      const response = await getContinents({ limit: 20 });
      setContinents(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching continents:', err);
      setError('Failed to load continents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getContinentStats();
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const filterContinents = () => {
    let filtered = [...continents];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(continent =>
        continent.name.toLowerCase().includes(query) ||
        continent.description.toLowerCase().includes(query) ||
        continent.countries.some(country => country.toLowerCase().includes(query)) ||
        continent.famousPlaces.some(place => 
          place.name.toLowerCase().includes(query) ||
          place.country.toLowerCase().includes(query)
        )
      );
    }

    // Apply tab filter
    switch (selectedTab) {
      case 1: // Featured
        filtered = filtered.filter(continent => continent.featured);
        break;
      case 2: // Most Popular
        filtered = filtered.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
        break;
      case 3: // Most Places
        filtered = filtered.sort((a, b) => (b.touristPlacesCount || 0) - (a.touristPlacesCount || 0));
        break;
      default: // All
        filtered = filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }

    setFilteredContinents(filtered);
  };

  const handleSearch = async (query) => {
    if (query.trim()) {
      try {
        const response = await searchContinents({ q: query });
        if (response.data.continents) {
          setFilteredContinents(response.data.continents);
        }
      } catch (err) {
        console.error('Error searching continents:', err);
      }
    } else {
      filterContinents();
    }
  };

  const handleContinentClick = (continent) => {
    // Navigate to favorite places page filtered by this continent
    navigate(`/favorite-places?continent=${encodeURIComponent(continent.name)}`);
  };

  const getContinentIcon = (continentName) => {
    const icons = {
      'Asia': <TravelExplore />,
      'Europe': <AccountBalance />,
      'North America': <Landscape />,
      'South America': <Landscape />,
      'Africa': <PhotoCamera />,
      'Oceania': <Public />,
      'Antarctica': <Landscape />
    };
    return icons[continentName] || <Explore />;
  };

  const tabLabels = ['All Continents', 'Featured', 'Most Popular', 'Most Places'];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading continents...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Fade in timeout={1000}>
          <Typography 
            variant="h2" 
            component="h1" 
            gutterBottom
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Explore Continents
          </Typography>
        </Fade>
        
        <Fade in timeout={1500}>
          <Typography 
            variant="h5" 
            color="text.secondary" 
            sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}
          >
            Discover the world's most amazing destinations across all seven continents. 
            From ancient wonders to natural marvels, find your next adventure.
          </Typography>
        </Fade>

        {/* Stats Section */}
        {stats && (
          <Fade in timeout={2000}>
            <Grid container spacing={3} sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {stats.overview?.totalContinents || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Continents
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {stats.overview?.totalFamousPlaces || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Famous Places
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {stats.overview?.featuredContinents || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Featured
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Fade>
        )}

        {/* Search Bar */}
        <Fade in timeout={2500}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search continents, countries, or famous places..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 600,
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'background.paper',
                '&:hover': {
                  boxShadow: 2
                },
                '&.Mui-focused': {
                  boxShadow: 3
                }
              }
            }}
          />
        </Fade>
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ mb: 4 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
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

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {/* Continents Grid */}
      {filteredContinents.length === 0 && !loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No continents found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms or filters
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {filteredContinents.map((continent, index) => (
            <Grid item xs={12} sm={6} md={4} key={continent._id}>
              <Zoom in timeout={300 + index * 100}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: 6
                    }
                  }}
                  onClick={() => handleContinentClick(continent)}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={continent.heroImage?.url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                    alt={continent.heroImage?.alt || continent.name}
                    sx={{
                      objectFit: 'cover',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.05)'
                      }
                    }}
                  />
                  
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ mr: 1, color: 'primary.main' }}>
                        {getContinentIcon(continent.name)}
                      </Box>
                      <Typography variant="h5" component="h2" fontWeight="bold">
                        {continent.name}
                      </Typography>
                      {continent.featured && (
                        <Chip
                          label="Featured"
                          size="small"
                          color="primary"
                          sx={{ ml: 'auto' }}
                        />
                      )}
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
                      {continent.shortDescription || continent.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        {continent.countries?.length || 0} countries
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <PhotoCamera fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                        {continent.touristPlacesCount || continent.famousPlaces?.length || 0} famous places
                      </Typography>
                    </Box>

                    {/* Popular Countries */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" gutterBottom>
                        Popular Countries:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {continent.countries?.slice(0, 3).map((country, idx) => (
                          <Chip
                            key={idx}
                            label={country}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        ))}
                        {continent.countries?.length > 3 && (
                          <Chip
                            label={`+${continent.countries.length - 3} more`}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem' }}
                          />
                        )}
                      </Box>
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 3, pt: 0 }}>
                    <Button
                      variant="contained"
                      fullWidth
                      startIcon={<Explore />}
                      onClick={() => handleContinentClick(continent)}
                      sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600
                      }}
                    >
                      Explore {continent.name}
                    </Button>
                  </CardActions>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default ContinentsPage;