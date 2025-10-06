import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Button,
  Chip,
  Paper,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Public,
  TrendingUp,
  Star,
  LocationOn,
  Explore
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CountryCard from '../components/CountryCard';
import CountrySearch from '../components/CountrySearch';
import { getFeaturedCountries, getCountriesByContinent, getIndianRegions } from '../api/countries';

const CountriesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [featuredCountries, setFeaturedCountries] = useState([]);
  const [asianCountries, setAsianCountries] = useState([]);
  const [europeanCountries, setEuropeanCountries] = useState([]);
  const [indianRegions, setIndianRegions] = useState([]);
  const [loading, setLoading] = useState(true);

  const continents = [
    { name: 'Asia', icon: '🌏', description: 'Diverse cultures and ancient traditions' },
    { name: 'Europe', icon: '🏰', description: 'Rich history and stunning architecture' },
    { name: 'North America', icon: '🗽', description: 'Modern cities and natural wonders' },
    { name: 'South America', icon: '🏔️', description: 'Vibrant cultures and landscapes' },
    { name: 'Africa', icon: '🦁', description: 'Wildlife and ancient civilizations' },
    { name: 'Oceania', icon: '🏝️', description: 'Island paradises and unique wildlife' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [featured, asian, european, indian] = await Promise.all([
        getFeaturedCountries(8),
        getCountriesByContinent('Asia', 6),
        getCountriesByContinent('Europe', 6),
        getIndianRegions(8)
      ]);

      setFeaturedCountries(featured);
      setAsianCountries(asian);
      setEuropeanCountries(european);
      setIndianRegions(indian);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          <Public sx={{ fontSize: 48, mr: 2, verticalAlign: 'middle', color: 'primary.main' }} />
          Explore the World
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
          Discover amazing destinations, from the vibrant states of India to exotic international locations. 
          Find travel inspiration, currency information, and local insights.
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => setActiveTab(3)}
            startIcon={<Explore />}
          >
            Search Countries
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            onClick={() => navigate('/search')}
          >
            Browse Travel Stories
          </Button>
        </Box>
      </Box>

      {/* Navigation Tabs */}
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label="Featured Destinations" 
            icon={<Star />} 
            iconPosition="start"
          />
          <Tab 
            label="Explore India" 
            icon={<span style={{ fontSize: '1.2em' }}>🇮🇳</span>} 
            iconPosition="start"
          />
          <Tab 
            label="Continents" 
            icon={<Public />} 
            iconPosition="start"
          />
          <Tab 
            label="Search & Filter" 
            icon={<Explore />} 
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Featured Destinations Tab */}
      <TabPanel value={activeTab} index={0}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Star sx={{ mr: 2, color: 'primary.main' }} />
          Featured Destinations
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Our most popular and recommended travel destinations
        </Typography>
        
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>Loading...</Box>
        ) : (
          <Grid container spacing={3}>
            {featuredCountries.map((country) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={country._id}>
                <CountryCard country={country} />
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* India Tab */}
      <TabPanel value={activeTab} index={1}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontSize: '2rem', marginRight: '16px' }}>🇮🇳</span>
          Incredible India
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Explore the diverse states and regions of India, each with unique culture, cuisine, and attractions
        </Typography>
        
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>Loading...</Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {indianRegions.map((region) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={region._id}>
                  <CountryCard country={region} />
                </Grid>
              ))}
            </Grid>
            
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button 
                variant="outlined" 
                size="large"
                onClick={() => navigate('/search?isIndia=true')}
              >
                View All Indian Destinations
              </Button>
            </Box>
          </>
        )}
      </TabPanel>

      {/* Continents Tab */}
      <TabPanel value={activeTab} index={2}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Public sx={{ mr: 2, color: 'primary.main' }} />
          Explore by Continent
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Discover destinations organized by continent
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {continents.map((continent) => (
            <Grid item xs={12} sm={6} md={4} key={continent.name}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => navigate(`/search?continent=${continent.name}`)}
              >
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Typography variant="h2" sx={{ mb: 2 }}>
                    {continent.icon}
                  </Typography>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {continent.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {continent.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Sample countries from Asia and Europe */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Popular Asian Destinations
            </Typography>
            <Grid container spacing={2}>
              {asianCountries.slice(0, 4).map((country) => (
                <Grid item xs={12} sm={6} key={country._id}>
                  <CountryCard country={country} showStats={false} />
                </Grid>
              ))}
            </Grid>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              Popular European Destinations
            </Typography>
            <Grid container spacing={2}>
              {europeanCountries.slice(0, 4).map((country) => (
                <Grid item xs={12} sm={6} key={country._id}>
                  <CountryCard country={country} showStats={false} />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Search Tab */}
      <TabPanel value={activeTab} index={3}>
        <CountrySearch />
      </TabPanel>

      {/* Quick Stats Section */}
      {activeTab === 0 && (
        <Box sx={{ mt: 6 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Travel the World with Confidence
            </Typography>
            <Grid container spacing={4} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                    50+
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Countries & Regions
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                    25+
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Currencies Supported
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box>
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                    1000+
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Travel Stories & Guides
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      )}
    </Container>
  );
};

export default CountriesPage;