import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Avatar,
  IconButton,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LocationOn,
  AttachMoney,
  Language,
  Schedule,
  TipsAndUpdates,
  Article,
  LocalOffer,
  Public,
  Home,
  NavigateNext,
  Share,
  Favorite,
  FavoriteBorder,
  Map
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import BlogCard from '../components/BlogCard';
import PackageCard from '../components/PackageCard';
import CurrencyDisplay from '../components/CurrencyDisplay';
import { getCountry, getPopularDestinations } from '../api/countries';

const CountryPage = () => {
  const { identifier } = useParams();
  const navigate = useNavigate();
  
  const [country, setCountry] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [relatedPackages, setRelatedPackages] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchCountryData();
    fetchDestinations();
  }, [identifier]);

  const fetchCountryData = async () => {
    try {
      setLoading(true);
      const data = await getCountry(identifier);
      setCountry(data.country);
      setRelatedBlogs(data.relatedBlogs || []);
      setRelatedPackages(data.relatedPackages || []);
    } catch (error) {
      console.error('Error fetching country:', error);
      setError('Failed to load country information');
    } finally {
      setLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      const data = await getPopularDestinations(identifier);
      setDestinations(data.destinations || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    // TODO: Implement favorite functionality with backend
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${country.name} - Travel Guide`,
          text: country.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show success message
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error || !country) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error || 'Country not found'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/countries')}>
          Browse Countries
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNext fontSize="small" />} 
        sx={{ mb: 3 }}
      >
        <Link 
          color="inherit" 
          href="/" 
          onClick={(e) => { e.preventDefault(); navigate('/'); }}
          sx={{ display: 'flex', alignItems: 'center' }}
        >
          <Home sx={{ mr: 0.5, fontSize: 20 }} />
          Home
        </Link>
        <Link 
          color="inherit" 
          href="/countries"
          onClick={(e) => { e.preventDefault(); navigate('/countries'); }}
        >
          Countries
        </Link>
        <Typography color="text.primary">{country.name}</Typography>
      </Breadcrumbs>

      {/* Hero Section */}
      <Paper sx={{ mb: 4, overflow: 'hidden' }}>
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="300"
            image={
              country.images?.[0]?.url || 
              `https://flagcdn.com/w640/${country.code?.toLowerCase()}.png` ||
              '/api/placeholder/640/300'
            }
            alt={country.name}
            sx={{ objectFit: 'cover' }}
          />
          
          {/* Overlay */}
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
              color: 'white',
              p: 3
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <Box>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {country.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ mr: 0.5 }} />
                    <Typography variant="h6">
                      {country.continent}
                      {country.region && ` • ${country.region}`}
                    </Typography>
                  </Box>
                  {country.capital && (
                    <Typography variant="body1">
                      Capital: {country.capital}
                    </Typography>
                  )}
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton 
                  onClick={handleFavoriteToggle}
                  sx={{ color: isFavorite ? 'error.main' : 'white' }}
                >
                  {isFavorite ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
                <IconButton onClick={handleShare} sx={{ color: 'white' }}>
                  <Share />
                </IconButton>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* Main Content */}
        <Grid item xs={12} md={8}>
          {/* Description */}
          {country.description && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  About {country.name}
                </Typography>
                <Typography variant="body1" paragraph>
                  {country.description}
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Popular Destinations */}
          {country.popularDestinations && country.popularDestinations.length > 0 && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  <Map sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Popular Destinations
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {country.popularDestinations.map((destination, index) => (
                    <Chip 
                      key={index}
                      label={destination}
                      variant="outlined"
                      clickable
                      onClick={() => navigate(`/search?location=${destination}&country=${country.name}`)}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Travel Tips */}
          {country.travelTips && country.travelTips.length > 0 && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  <TipsAndUpdates sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Travel Tips
                </Typography>
                <List>
                  {country.travelTips.map((tip, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <TipsAndUpdates color="primary" />
                      </ListItemIcon>
                      <ListItemText primary={tip} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}

          {/* Related Blogs */}
          {relatedBlogs.length > 0 && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5">
                    <Article sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Travel Stories from {country.name}
                  </Typography>
                  <Button 
                    variant="outlined"
                    onClick={() => navigate(`/search?country=${country.name}&type=blogs`)}
                  >
                    View All
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {relatedBlogs.map((blog) => (
                    <Grid item xs={12} sm={6} key={blog._id}>
                      <BlogCard blog={blog} />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}

          {/* Related Packages */}
          {relatedPackages.length > 0 && (
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5">
                    <LocalOffer sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Travel Packages to {country.name}
                  </Typography>
                  <Button 
                    variant="outlined"
                    onClick={() => navigate(`/search?country=${country.name}&type=packages`)}
                  >
                    View All
                  </Button>
                </Box>
                <Grid container spacing={2}>
                  {relatedPackages.map((pkg) => (
                    <Grid item xs={12} sm={6} key={pkg._id}>
                      <PackageCard package={pkg} />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Country Info */}
          <Card sx={{ mb: 3, position: 'sticky', top: 100 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Country Information
              </Typography>
              
              {/* Flag */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={`https://flagcdn.com/w80/${country.code?.toLowerCase()}.png`}
                  alt={`${country.name} flag`}
                  sx={{ width: 40, height: 30, mr: 2, borderRadius: 1 }}
                />
                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                  {country.code}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Currency */}
              {country.currency && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Currency
                  </Typography>
                  <CurrencyDisplay 
                    currency={country.currency}
                    variant="minimal"
                    showConverter={true}
                  />
                </Box>
              )}

              {/* Languages */}
              {country.languages && country.languages.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    <Language sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    Languages
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {country.languages.map((language, index) => (
                      <Chip key={index} label={language} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Best Time to Visit */}
              {country.bestTimeToVisit && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    <Schedule sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'middle' }} />
                    Best Time to Visit
                  </Typography>
                  <Typography variant="body2">
                    {country.bestTimeToVisit}
                  </Typography>
                </Box>
              )}

              {/* Stats */}
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                {country.blogsCount > 0 && (
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">
                        {country.blogsCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Blog Posts
                      </Typography>
                    </Box>
                  </Grid>
                )}
                {country.packagesCount > 0 && (
                  <Grid item xs={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" color="primary">
                        {country.packagesCount}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Packages
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

              {/* Tags */}
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {country.featured && (
                  <Chip label="Featured" size="small" color="primary" />
                )}
                {country.isIndia && (
                  <Chip label="India" size="small" color="secondary" />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CountryPage;