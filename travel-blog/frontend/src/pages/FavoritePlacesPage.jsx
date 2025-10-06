import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Rating,
  Stack
} from '@mui/material';
import {
  Add,
  Public,
  LocationOn,
  Star
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFavoritePlacesByContinent, createFavoritePlace, favoritePlacesAPI } from '../api/favoritePlaces';
import { uploadImages } from '../api/upload';
import FavoritePlaceCard from '../components/FavoritePlaceCard';
import FavoritePlaceDetail from '../components/FavoritePlaceDetail';
import ImageUpload from '../components/ImageUpload';

const continents = [
  'Asia',
  'Europe', 
  'North America',
  'South America',
  'Africa',
  'Oceania',
  'Antarctica'
];

const categories = [
  'Natural Wonder',
  'Historical Site', 
  'Cultural Site',
  'Adventure',
  'Beach',
  'Mountain',
  'City',
  'Religious Site',
  'Wildlife',
  'Architecture',
  'Food',
  'Nightlife',
  'Shopping',
  'Family Friendly'
];

const FavoritePlacesPage = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [places, setPlaces] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [newPlace, setNewPlace] = useState({
    placeName: '',
    continent: '',
    country: '',
    city: '',
    description: '',
    rating: 5,
    visitDate: '',
    stayDuration: '',
    personalTips: [''],
    categories: [],
    bestTimeToVisit: '',
    budget: {
      amount: '',
      currency: 'USD',
      notes: ''
    },
    images: []
  });
  const [submitting, setSubmitting] = useState(false);

  // Handle URL parameters for continent filtering
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const continentParam = searchParams.get('continent');
    
    if (continentParam) {
      const continentIndex = continents.findIndex(c => c === continentParam);
      if (continentIndex !== -1) {
        setCurrentTab(continentIndex);
      }
    }
  }, [location.search]);

  useEffect(() => {
    fetchPlacesByContinent(continents[currentTab]);
  }, [currentTab]);

  const fetchPlacesByContinent = async (continent) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await getFavoritePlacesByContinent(continent, { featured: false });
      setPlaces(prev => ({
        ...prev,
        [continent]: response.data.places
      }));
    } catch (error) {
      console.error('Error fetching places:', error);
      setError('Failed to load favorite places');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleAddPlace = () => {
    if (!user) {
      setError('Please login to add your favorite places');
      return;
    }
    setShowAddDialog(true);
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setNewPlace(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setNewPlace(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleTipChange = (index, value) => {
    const newTips = [...newPlace.personalTips];
    newTips[index] = value;
    setNewPlace(prev => ({
      ...prev,
      personalTips: newTips
    }));
  };

  const addTip = () => {
    setNewPlace(prev => ({
      ...prev,
      personalTips: [...prev.personalTips, '']
    }));
  };

  const removeTip = (index) => {
    const newTips = newPlace.personalTips.filter((_, i) => i !== index);
    setNewPlace(prev => ({
      ...prev,
      personalTips: newTips
    }));
  };

  const handleSubmit = async () => {
    if (!newPlace.placeName || !newPlace.continent || !newPlace.country || !newPlace.description) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Upload images if any
      let uploadedImages = [];
      if (newPlace.images.length > 0) {
        const formData = new FormData();
        newPlace.images.forEach(image => {
          formData.append('images', image.file);
        });

        const uploadResponse = await uploadImages(formData);
        uploadedImages = uploadResponse.data.images.map((img, index) => ({
          url: img.url,
          caption: newPlace.images[index].caption || '',
          alt: newPlace.images[index].alt || newPlace.placeName,
          isMain: index === 0
        }));
      }

      // Clean up the data
      const placeData = {
        ...newPlace,
        personalTips: newPlace.personalTips.filter(tip => tip.trim()),
        budget: newPlace.budget.amount ? newPlace.budget : undefined,
        images: uploadedImages
      };

      const response = await createFavoritePlace(placeData);
      
      // Update the places list
      const continent = newPlace.continent;
      setPlaces(prev => ({
        ...prev,
        [continent]: [response.data, ...(prev[continent] || [])]
      }));

      // Reset form and close dialog
      setNewPlace({
        placeName: '',
        continent: '',
        country: '',
        city: '',
        description: '',
        rating: 5,
        visitDate: '',
        stayDuration: '',
        personalTips: [''],
        categories: [],
        bestTimeToVisit: '',
        budget: {
          amount: '',
          currency: 'USD',
          notes: ''
        },
        images: []
      });
      setShowAddDialog(false);
      
      // Switch to the continent tab if different
      const continentIndex = continents.indexOf(continent);
      if (continentIndex !== -1 && continentIndex !== currentTab) {
        setCurrentTab(continentIndex);
      }

    } catch (error) {
      console.error('Error creating place:', error);
      setError('Failed to create favorite place');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlaceUpdate = (updatedPlace) => {
    const continent = continents[currentTab];
    setPlaces(prev => ({
      ...prev,
      [continent]: prev[continent]?.map(place => 
        place._id === updatedPlace._id ? updatedPlace : place
      ) || []
    }));
  };

  const handlePlaceClick = (place) => {
    setSelectedPlace(place);
    setShowDetailDialog(true);
  };

  const handleLikeToggle = (placeId, likeData) => {
    // Update the place in the current places list
    const continent = continents[currentTab];
    setPlaces(prev => ({
      ...prev,
      [continent]: prev[continent]?.map(place => {
        if (place._id === placeId) {
          // Create a new likes array based on the like status
          const updatedLikes = likeData.isLiked
            ? [...(place.likes || []), { user: user?._id }]
            : (place.likes || []).filter(like => like.user !== user?._id);
            
          return {
            ...place,
            likes: updatedLikes,
            likesCount: likeData.likesCount,
            isLiked: likeData.isLiked
          };
        }
        return place;
      }) || []
    }));

    // Also update the selected place if it's the same
    if (selectedPlace && selectedPlace._id === placeId) {
      const updatedLikes = likeData.isLiked
        ? [...(selectedPlace.likes || []), { user: user?._id }]
        : (selectedPlace.likes || []).filter(like => like.user !== user?._id);
        
      setSelectedPlace(prev => ({
        ...prev,
        likes: updatedLikes,
        likesCount: likeData.likesCount,
        isLiked: likeData.isLiked
      }));
    }
  };

  const handleCommentAdd = (placeId, newComment) => {
  // Update the place in the current places list
  const continent = continents[currentTab];
  setPlaces(prev => ({
    ...prev,
    [continent]: prev[continent]?.map(place => 
      place._id === placeId 
        ? { 
            ...place, 
            commentsCount: (place.commentsCount || 0) + 1,
            comments: [...(place.comments || []), newComment]
          }
        : place
    ) || []
  }));

  // Also update the selected place if it's the same
  if (selectedPlace && selectedPlace._id === placeId) {
    setSelectedPlace(prev => ({
      ...prev,
      commentsCount: (prev.commentsCount || 0) + 1,
      comments: [...(prev.comments || []), newComment]
    }));
  }
};

  const currentContinent = continents[currentTab];
  const currentPlaces = places[currentContinent] || [];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom>
            Favorite Places Around the World
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Discover amazing places shared by travelers from their personal experiences
          </Typography>
        </Box>
        
        {user && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddPlace}
            size="large"
          >
            Add Your Favorite Place
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          {continents.map((continent) => (
            <Tab 
              key={continent}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Public />
                  {continent}
                  {places[continent] && (
                    <Chip 
                      label={places[continent].length} 
                      size="small" 
                      color="primary"
                    />
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : currentPlaces.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Public sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No favorite places yet in {currentContinent}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Be the first to share your favorite place in {currentContinent}!
          </Typography>
          {user && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddPlace}
            >
              Add Your Favorite Place
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {currentPlaces.map((place) => (
            <Grid item xs={12} sm={6} md={4} key={place._id}>
              <FavoritePlaceCard 
                place={place} 
                onUpdate={handlePlaceUpdate}
                onClick={() => handlePlaceClick(place)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Place Dialog */}
      <Dialog 
        open={showAddDialog} 
        onClose={() => setShowAddDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Your Favorite Place</DialogTitle>
        
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Place Name *"
              value={newPlace.placeName}
              onChange={(e) => handleInputChange('placeName', e.target.value)}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Continent *</InputLabel>
                <Select
                  value={newPlace.continent}
                  onChange={(e) => handleInputChange('continent', e.target.value)}
                  label="Continent *"
                >
                  {continents.map(continent => (
                    <MenuItem key={continent} value={continent}>
                      {continent}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Country *"
                value={newPlace.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
              />
            </Box>

            <TextField
              fullWidth
              label="City"
              value={newPlace.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
            />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Your Experience & Description *"
              value={newPlace.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              helperText="Share your personal experience and what makes this place special"
            />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Your Rating *
              </Typography>
              <Rating
                value={newPlace.rating}
                onChange={(e, value) => handleInputChange('rating', value)}
                size="large"
              />
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                type="date"
                label="Visit Date"
                value={newPlace.visitDate}
                onChange={(e) => handleInputChange('visitDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="Stay Duration"
                value={newPlace.stayDuration}
                onChange={(e) => handleInputChange('stayDuration', e.target.value)}
                placeholder="e.g., 3 days, 1 week"
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Categories</InputLabel>
              <Select
                multiple
                value={newPlace.categories}
                onChange={(e) => handleInputChange('categories', e.target.value)}
                label="Categories"
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {categories.map(category => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Best Time to Visit"
              value={newPlace.bestTimeToVisit}
              onChange={(e) => handleInputChange('bestTimeToVisit', e.target.value)}
              placeholder="e.g., March to May, Summer months"
            />

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Personal Tips
              </Typography>
              {newPlace.personalTips.map((tip, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Share a helpful tip..."
                    value={tip}
                    onChange={(e) => handleTipChange(index, e.target.value)}
                  />
                  {newPlace.personalTips.length > 1 && (
                    <Button 
                      onClick={() => removeTip(index)}
                      color="error"
                      size="small"
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              ))}
              <Button onClick={addTip} size="small">
                Add Another Tip
              </Button>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Budget Information
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Amount"
                  type="number"
                  value={newPlace.budget.amount}
                  onChange={(e) => handleInputChange('budget.amount', e.target.value)}
                />
                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Currency</InputLabel>
                  <Select
                    value={newPlace.budget.currency}
                    onChange={(e) => handleInputChange('budget.currency', e.target.value)}
                    label="Currency"
                  >
                    <MenuItem value="USD">USD</MenuItem>
                    <MenuItem value="EUR">EUR</MenuItem>
                    <MenuItem value="GBP">GBP</MenuItem>
                    <MenuItem value="INR">INR</MenuItem>
                    <MenuItem value="JPY">JPY</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  label="Budget Notes"
                  value={newPlace.budget.notes}
                  onChange={(e) => handleInputChange('budget.notes', e.target.value)}
                  placeholder="Per person, per day, etc."
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Images
              </Typography>
              <ImageUpload
                images={newPlace.images}
                onImagesChange={(images) => handleInputChange('images', images)}
                maxImages={5}
              />
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowAddDialog(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Adding...' : 'Add Place'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Place Detail Dialog */}
      <FavoritePlaceDetail
        open={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        place={selectedPlace}
        onLikeToggle={handleLikeToggle}
        onCommentAdd={handleCommentAdd}
      />

      {/* Floating Action Button for mobile */}
      {user && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            display: { xs: 'flex', md: 'none' }
          }}
          onClick={handleAddPlace}
        >
          <Add />
        </Fab>
      )}
    </Container>
  );
};

export default FavoritePlacesPage;