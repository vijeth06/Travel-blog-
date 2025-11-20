import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  Menu,
  MenuItem,
  TextField,
  Switch,
  FormControlLabel,
  Slider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Tooltip
} from '@mui/material';
import {
  Map as MapIcon,
  MyLocation as MyLocationIcon,
  Layers as LayersIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Route as RouteIcon,
  Place as PlaceIcon,
  Hotel as HotelIcon,
  Restaurant as RestaurantIcon,
  LocalActivity as ActivityIcon,
  Flight as FlightIcon,
  Train as TrainIcon,
  DirectionsCar as CarIcon,
  Bookmark as BookmarkIcon,
  Share as ShareIcon,
  Info as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import api from '../services/api';

// Improved map component with better structure
const InteractiveMap = () => {
  const mapRef = useRef(null);
  const [mapData, setMapData] = useState({
    destinations: [],
    hotels: [],
    restaurants: [],
    activities: [],
    routes: []
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 }); // NYC default
  const [zoom, setZoom] = useState(10);
  const [activeLayer, setActiveLayer] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRadius, setFilterRadius] = useState(50);
  const [showFilters, setShowFilters] = useState(false);
  const [routeMode, setRouteMode] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState([]);
  const [mapStyle, setMapStyle] = useState('standard');
  const [userLocation, setUserLocation] = useState(null);
  const [savedPlaces, setSavedPlaces] = useState([]);
  const [layerMenuAnchor, setLayerMenuAnchor] = useState(null);

  const mapStyles = [
    { value: 'standard', label: 'Standard' },
    { value: 'satellite', label: 'Satellite' },
    { value: 'terrain', label: 'Terrain' },
    { value: 'dark', label: 'Dark Mode' }
  ];

  const layers = [
    { value: 'all', label: 'All Places', icon: PlaceIcon },
    { value: 'destinations', label: 'Destinations', icon: MapIcon },
    { value: 'hotels', label: 'Hotels', icon: HotelIcon },
    { value: 'restaurants', label: 'Restaurants', icon: RestaurantIcon },
    { value: 'activities', label: 'Activities', icon: ActivityIcon }
  ];

  useEffect(() => {
    fetchMapData();
    getUserLocation();
    loadSavedPlaces();
  }, []);

  const fetchMapData = async () => {
    try {
      // Fetch real data from various endpoints
      const [countriesRes, bookingsRes, blogsRes] = await Promise.all([
        api.get('/countries').catch(() => ({ data: [] })),
        api.get('/bookings').catch(() => ({ data: { bookings: [] } })),
        api.get('/blogs').catch(() => ({ data: { blogs: [] } }))
      ]);

      const countries = countriesRes.data?.countries || countriesRes.data || [];
      const bookings = bookingsRes.data?.bookings || [];
      const blogs = blogsRes.data?.blogs || [];
      
      // Convert countries to destinations
      const destinations = countries.map(country => ({
        _id: country._id,
        name: country.name,
        type: 'destination',
        coordinates: { 
          lat: country.coordinates?.lat || 0, 
          lng: country.coordinates?.lng || 0 
        },
        description: country.description || '',
        image: country.image || '/api/placeholder/300/200',
        visited: false,
        rating: country.averageRating || 0
      }));
      
      // Extract hotels from bookings
      const hotels = bookings
        .filter(b => b.package?.type === 'hotel' || b.package?.accommodation)
        .map(b => ({
          _id: b._id,
          name: b.package?.title || 'Hotel',
          type: 'hotel',
          coordinates: b.package?.coordinates || { lat: 0, lng: 0 },
          description: b.package?.description || '',
          price: b.totalPrice || b.package?.price || 0,
          rating: b.package?.rating || 0,
          amenities: b.package?.amenities || []
        }));
      
      // Extract restaurants and activities from blogs/packages
      const restaurants = [];
      const activities = [];

      setMapData({
        destinations,
        hotels,
        restaurants,
        activities,
        routes: []
      });
    } catch (error) {
      console.error('Error fetching map data:', error);
      // Set empty data instead of mock data
      setMapData({
        destinations: [],
        hotels: [],
        restaurants: [],
        activities: [],
        routes: []
      });
    }
  };

  const generateMockDestinations = () => [
    {
      _id: '1',
      name: 'Times Square',
      type: 'destination',
      coordinates: { lat: 40.7580, lng: -73.9855 },
      description: 'The bustling heart of NYC',
      image: '/api/placeholder/300/200',
      rating: 4.2,
      category: 'Urban',
      priceRange: '$$$'
    },
    {
      _id: '2', 
      name: 'Central Park',
      type: 'destination',
      coordinates: { lat: 40.7829, lng: -73.9654 },
      description: 'Iconic urban park',
      image: '/api/placeholder/300/200',
      rating: 4.7,
      category: 'Nature',
      priceRange: 'Free'
    },
    {
      _id: '3',
      name: 'Brooklyn Bridge',
      type: 'destination', 
      coordinates: { lat: 40.7061, lng: -73.9969 },
      description: 'Historic suspension bridge',
      image: '/api/placeholder/300/200',
      rating: 4.5,
      category: 'Historical',
      priceRange: 'Free'
    }
  ];

  const generateMockHotels = () => [
    {
      _id: 'h1',
      name: 'Plaza Hotel',
      type: 'hotel',
      coordinates: { lat: 40.7648, lng: -73.9754 },
      description: 'Luxury hotel in Manhattan',
      image: '/api/placeholder/300/200',
      rating: 4.8,
      priceRange: '$$$$',
      amenities: ['Pool', 'Spa', 'Restaurant', 'Gym']
    },
    {
      _id: 'h2',
      name: 'Pod Hotels',
      type: 'hotel',
      coordinates: { lat: 40.7505, lng: -73.9934 },
      description: 'Modern budget-friendly hotel',
      image: '/api/placeholder/300/200',
      rating: 4.3,
      priceRange: '$$',
      amenities: ['WiFi', 'Gym', 'Restaurant']
    }
  ];

  const generateMockRestaurants = () => [
    {
      _id: 'r1',
      name: 'Katz\'s Delicatessen',
      type: 'restaurant',
      coordinates: { lat: 40.7223, lng: -73.9871 },
      description: 'Famous NYC deli',
      image: '/api/placeholder/300/200',
      rating: 4.6,
      cuisine: 'Deli',
      priceRange: '$$'
    },
    {
      _id: 'r2',
      name: 'Le Bernardin',
      type: 'restaurant',
      coordinates: { lat: 40.7614, lng: -73.9776 },
      description: 'Michelin-starred French restaurant',
      image: '/api/placeholder/300/200',
      rating: 4.9,
      cuisine: 'French',
      priceRange: '$$$$'
    }
  ];

  const generateMockActivities = () => [
    {
      _id: 'a1',
      name: 'Broadway Show',
      type: 'activity',
      coordinates: { lat: 40.7590, lng: -73.9845 },
      description: 'World-class theater performances',
      image: '/api/placeholder/300/200',
      rating: 4.8,
      category: 'Entertainment',
      duration: '2-3 hours',
      priceRange: '$$$'
    },
    {
      _id: 'a2',
      name: 'Statue of Liberty Tour',
      type: 'activity',
      coordinates: { lat: 40.6892, lng: -74.0445 },
      description: 'Iconic statue and Ellis Island tour',
      image: '/api/placeholder/300/200',
      rating: 4.5,
      category: 'Sightseeing',
      duration: '4-5 hours',
      priceRange: '$$'
    }
  ];

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  };

  const loadSavedPlaces = async () => {
    try {
      const response = await api.get('/favorite-places');
      setSavedPlaces(response.data);
    } catch (error) {
      console.error('Error loading saved places:', error);
    }
  };

  const handleMarkerClick = (item) => {
    setSelectedItem(item);
    setMapCenter(item.coordinates);
  };

  const handleSavePlace = async (item) => {
    try {
      await api.post('/favorite-places', {
        placeId: item._id,
        name: item.name,
        type: item.type,
        coordinates: item.coordinates
      });
      setSavedPlaces([...savedPlaces, item]);
    } catch (error) {
      console.error('Error saving place:', error);
    }
  };

  const handleSearch = async (query) => {
    if (!query) return;
    
    try {
      const response = await api.get(`/search/places?q=${query}`);
      if (response.data.length > 0) {
        const firstResult = response.data[0];
        setMapCenter(firstResult.coordinates);
        setSelectedItem(firstResult);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const addToRoute = (item) => {
    if (!selectedRoute.find(place => place._id === item._id)) {
      setSelectedRoute([...selectedRoute, item]);
    }
  };

  const clearRoute = () => {
    setSelectedRoute([]);
  };

  const getAllItems = () => {
    let items = [];
    if (activeLayer === 'all' || activeLayer === 'destinations') {
      items = [...items, ...mapData.destinations];
    }
    if (activeLayer === 'all' || activeLayer === 'hotels') {
      items = [...items, ...mapData.hotels];
    }
    if (activeLayer === 'all' || activeLayer === 'restaurants') {
      items = [...items, ...mapData.restaurants];
    }
    if (activeLayer === 'all' || activeLayer === 'activities') {
      items = [...items, ...mapData.activities];
    }
    return items;
  };

  const getMarkerIcon = (type) => {
    switch (type) {
      case 'hotel': return <HotelIcon sx={{ color: 'blue' }} />;
      case 'restaurant': return <RestaurantIcon sx={{ color: 'orange' }} />;
      case 'activity': return <ActivityIcon sx={{ color: 'green' }} />;
      default: return <PlaceIcon sx={{ color: 'red' }} />;
    }
  };

  // Improved marker positioning function
  const positionMarker = (index, totalItems, containerWidth, containerHeight) => {
    if (totalItems === 0) return { left: '50%', top: '50%' };
    
    // Calculate grid positions
    const rows = Math.ceil(Math.sqrt(totalItems));
    const cols = Math.ceil(totalItems / rows);
    
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    // Calculate percentages with padding
    const leftPercent = 10 + (col / Math.max(cols - 1, 1)) * 80;
    const topPercent = 10 + (row / Math.max(rows - 1, 1)) * 80;
    
    return {
      left: `${leftPercent}%`,
      top: `${topPercent}%`
    };
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Interactive Travel Map
      </Typography>

      {/* Search and Controls */}
      <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Search destinations, hotels, restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1 }} />,
                endAdornment: (
                  <IconButton onClick={() => handleSearch(searchQuery)}>
                    <SearchIcon />
                  </IconButton>
                )
              }}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                variant={showFilters ? 'contained' : 'outlined'}
                startIcon={<FilterIcon />}
                onClick={() => setShowFilters(!showFilters)}
                size="small"
              >
                Filters
              </Button>
              
              <Button
                variant={routeMode ? 'contained' : 'outlined'}
                startIcon={<RouteIcon />}
                onClick={() => setRouteMode(!routeMode)}
                size="small"
              >
                Route Planner
              </Button>

              <Button
                variant="outlined"
                startIcon={<LayersIcon />}
                onClick={(e) => setLayerMenuAnchor(e.currentTarget)}
                size="small"
              >
                Layers
              </Button>

              <IconButton onClick={getUserLocation} title="My Location">
                <MyLocationIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {/* Filters Panel */}
        {showFilters && (
          <Box mt={2} p={2} bgcolor="grey.50" borderRadius={2}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography gutterBottom>Search Radius (km)</Typography>
                <Slider
                  value={filterRadius}
                  onChange={(e, value) => setFilterRadius(value)}
                  min={5}
                  max={100}
                  valueLabelDisplay="auto"
                  marks={[
                    { value: 5, label: '5km' },
                    { value: 25, label: '25km' },
                    { value: 50, label: '50km' },
                    { value: 100, label: '100km' }
                  ]}
                />
              </Grid>
              
              <Grid item xs={12} md={8}>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {layers.map((layer) => (
                    <Chip
                      key={layer.value}
                      label={layer.label}
                      variant={activeLayer === layer.value ? 'filled' : 'outlined'}
                      onClick={() => setActiveLayer(layer.value)}
                      icon={<layer.icon />}
                    />
                  ))}
                </Box>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Route Planner */}
        {routeMode && (
          <Box mt={2} p={2} bgcolor="blue.50" borderRadius={2}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Route Planner</Typography>
              <Button variant="outlined" onClick={clearRoute} size="small">
                Clear Route
              </Button>
            </Box>
            
            {selectedRoute.length > 0 ? (
              <List dense>
                {selectedRoute.map((place, index) => (
                  <ListItem key={place._id}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {index + 1}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={place.name}
                      secondary={place.description}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                Click on map markers to add them to your route
              </Typography>
            )}
          </Box>
        )}
      </Paper>

      <Grid container spacing={3}>
        {/* Map Display */}
        <Grid item xs={12} md={8}>
          <Card sx={{ height: 600, position: 'relative' }}>
            <CardContent sx={{ height: '100%', p: 0 }}>
              {/* Improved Map Display */}
              <Box
                ref={mapRef}
                sx={{
                  width: '100%',
                  height: '100%',
                  bgcolor: mapStyle === 'dark' ? 'grey.900' : 'grey.100',
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 1
                }}
              >
                {/* Map Background Pattern */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: mapStyle === 'satellite' 
                      ? 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%234CAF50" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
                      : mapStyle === 'terrain'
                      ? 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23795548" fill-opacity="0.1"%3E%3Cpath d="M20 20l10-10-10-10-10 10z"/%3E%3C/g%3E%3C/svg%3E")'
                      : 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%232196F3" fill-opacity="0.05"%3E%3Crect width="10" height="10"/%3E%3C/g%3E%3C/svg%3E")',
                    opacity: 0.5
                  }}
                />

                {/* Improved Markers */}
                {getAllItems().map((item, index) => {
                  const items = getAllItems();
                  const position = positionMarker(index, items.length, 400, 300);
                  return (
                    <Tooltip key={item._id} title={item.name}>
                      <Fab
                        size="small"
                        onClick={() => handleMarkerClick(item)}
                        sx={{
                          position: 'absolute',
                          left: position.left,
                          top: position.top,
                          transform: 'translate(-50%, -50%)',
                          bgcolor: selectedItem?._id === item._id ? 'secondary.main' : 'primary.main',
                          '&:hover': { transform: 'translate(-50%, -50%) scale(1.1)' },
                          transition: 'transform 0.2s, background-color 0.2s',
                          zIndex: selectedItem?._id === item._id ? 10 : 1
                        }}
                      >
                        {getMarkerIcon(item.type)}
                      </Fab>
                    </Tooltip>
                  );
                })}

                {/* User Location Marker */}
                {userLocation && (
                  <Fab
                    size="small"
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      bgcolor: 'error.main',
                      zIndex: 20
                    }}
                  >
                    <MyLocationIcon />
                  </Fab>
                )}

                {/* Route Lines (Mock) */}
                {selectedRoute.length > 1 && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '20%',
                        left: '10%',
                        right: '10%',
                        bottom: '20%',
                        border: '3px dashed',
                        borderColor: 'primary.main',
                        borderRadius: '50% 20% 80% 40%'
                      }
                    }}
                  />
                )}

                {/* Map Controls */}
                <Box sx={{ position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Fab size="small" onClick={() => setZoom(zoom + 1)}>
                    <Typography variant="h6">+</Typography>
                  </Fab>
                  <Fab size="small" onClick={() => setZoom(Math.max(1, zoom - 1))}>
                    <Typography variant="h6">−</Typography>
                  </Fab>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            {/* Selected Item Details */}
            {selectedItem && (
              <Card sx={{ mb: 3 }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={selectedItem.image}
                  alt={selectedItem.name}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {selectedItem.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {selectedItem.description}
                  </Typography>
                  
                  <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                    <Chip label={selectedItem.type} size="small" />
                    {selectedItem.rating && (
                      <Chip label={`⭐ ${selectedItem.rating}`} size="small" />
                    )}
                    {selectedItem.priceRange && (
                      <Chip label={selectedItem.priceRange} size="small" />
                    )}
                  </Box>

                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<BookmarkIcon />}
                      onClick={() => handleSavePlace(selectedItem)}
                    >
                      Save
                    </Button>
                    
                    {routeMode && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<RouteIcon />}
                        onClick={() => addToRoute(selectedItem)}
                      >
                        Add to Route
                      </Button>
                    )}
                    
                    <IconButton size="small">
                      <ShareIcon />
                    </IconButton>
                    <IconButton size="small">
                      <InfoIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            )}

            {/* Nearby Places */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Nearby Places
                </Typography>
                <List dense>
                  {getAllItems().slice(0, 5).map((item) => (
                    <ListItem
                      key={item._id}
                      button
                      onClick={() => handleMarkerClick(item)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {getMarkerIcon(item.type)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={item.name}
                        secondary={`${item.type} • ${item.rating ? `⭐ ${item.rating}` : 'No rating'}`}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Layer Menu */}
      <Menu
        anchorEl={layerMenuAnchor}
        open={Boolean(layerMenuAnchor)}
        onClose={() => setLayerMenuAnchor(null)}
      >
        {mapStyles.map((style) => (
          <MenuItem
            key={style.value}
            onClick={() => {
              setMapStyle(style.value);
              setLayerMenuAnchor(null);
            }}
            selected={mapStyle === style.value}
          >
            {style.label}
          </MenuItem>
        ))}
      </Menu>
    </Container>
  );
};

export default InteractiveMap;