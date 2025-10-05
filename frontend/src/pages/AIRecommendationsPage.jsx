import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Button,
  Chip,
  Avatar,
  Rating,
  Skeleton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
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
} from '@mui/material';
import {
  SmartToy,
  Favorite,
  Share,
  LocationOn,
  Flight,
  Hotel,
  Restaurant,
  LocalActivity,
  Refresh,
  TuneSharp,
  Close,
  Star,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import axios from 'axios';

const AIRecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [personalizedSuggestions, setPersonalizedSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    budget: 'medium',
    travelStyle: 'adventure',
    duration: '1-week',
    interests: [],
  });
  const { user, token } = useSelector((state) => state.auth);

  const travelInterests = [
    'Culture', 'Adventure', 'Food', 'Nature', 'History', 
    'Photography', 'Wildlife', 'Architecture', 'Art', 'Music',
    'Beach', 'Mountains', 'Cities', 'Rural', 'Nightlife'
  ];

  useEffect(() => {
    if (token) {
      fetchRecommendations();
      fetchPersonalizedSuggestions();
    }
  }, [token]);

  const fetchRecommendations = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/recommendations/ai-suggestions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      // Fallback data for demo
      setRecommendations([
        {
          id: 1,
          title: 'Bali Adventure Package',
          description: 'Experience the perfect blend of culture, adventure, and relaxation in Bali.',
          location: 'Bali, Indonesia',
          rating: 4.8,
          price: '$1,200',
          duration: '7 days',
          image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400',
          tags: ['Adventure', 'Culture', 'Beach'],
          confidence: 92,
        },
        {
          id: 2,
          title: 'Swiss Alps Hiking',
          description: 'Breathtaking mountain trails and alpine villages await you.',
          location: 'Swiss Alps, Switzerland',
          rating: 4.9,
          price: '$2,100',
          duration: '10 days',
          image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
          tags: ['Nature', 'Adventure', 'Mountains'],
          confidence: 88,
        },
        {
          id: 3,
          title: 'Tokyo Cultural Immersion',
          description: 'Dive deep into Japanese culture, food, and traditions.',
          location: 'Tokyo, Japan',
          rating: 4.7,
          price: '$1,800',
          duration: '5 days',
          image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400',
          tags: ['Culture', 'Food', 'Cities'],
          confidence: 95,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPersonalizedSuggestions = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/recommendations/personalized`, {
        headers: { Authorization: `Bearer ${token}` },
        params: preferences,
      });
      setPersonalizedSuggestions(response.data.suggestions || []);
    } catch (error) {
      console.error('Error fetching personalized suggestions:', error);
    }
  };

  const handleRefreshRecommendations = async () => {
    setRefreshing(true);
    await fetchRecommendations();
    await fetchPersonalizedSuggestions();
    setRefreshing(false);
  };

  const handleSaveRecommendation = async (recommendationId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/recommendations/${recommendationId}/save`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Show success message
    } catch (error) {
      console.error('Error saving recommendation:', error);
    }
  };

  const handleUpdatePreferences = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/recommendations/preferences`,
        preferences,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPreferencesOpen(false);
      handleRefreshRecommendations();
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const RecommendationCard = ({ recommendation }) => (
    <Card
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 8,
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={recommendation.image}
        alt={recommendation.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="h3">
            {recommendation.title}
          </Typography>
          <Chip
            label={`${recommendation.confidence}% match`}
            color="primary"
            size="small"
            icon={<SmartToy />}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOn fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            {recommendation.location}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Rating value={recommendation.rating} precision={0.1} readOnly size="small" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({recommendation.rating})
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {recommendation.description}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {recommendation.tags?.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6" color="primary">
              {recommendation.price}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {recommendation.duration}
            </Typography>
          </Box>
          <Box>
            <IconButton
              onClick={() => handleSaveRecommendation(recommendation.id)}
              color="primary"
            >
              <Favorite />
            </IconButton>
            <IconButton color="primary">
              <Share />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={60} />
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1">
          🤖 AI Travel Recommendations
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<TuneSharp />}
            onClick={() => setPreferencesOpen(true)}
            sx={{ mr: 2 }}
          >
            Preferences
          </Button>
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={handleRefreshRecommendations}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
      </Box>

      {/* AI Insights */}
      <Card elevation={3} sx={{ mb: 4, background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'white' }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', mr: 2 }}>
              <SmartToy />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ color: 'white' }}>
                AI Insights for {user?.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                Based on your travel history and preferences, we've curated these personalized recommendations.
                Your adventure score: 8.5/10 | Cultural interest: 9/10
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Main Recommendations */}
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        ✨ Recommended for You
      </Typography>
      <Grid container spacing={3} sx={{ mb: 6 }}>
        {recommendations.map((recommendation) => (
          <Grid item xs={12} sm={6} md={4} key={recommendation.id}>
            <RecommendationCard recommendation={recommendation} />
          </Grid>
        ))}
      </Grid>

      {/* Personalized Suggestions */}
      {personalizedSuggestions.length > 0 && (
        <>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            🎯 Just for You
          </Typography>
          <Grid container spacing={3}>
            {personalizedSuggestions.map((suggestion) => (
              <Grid item xs={12} sm={6} md={4} key={suggestion.id}>
                <RecommendationCard recommendation={suggestion} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Preferences Dialog */}
      <Dialog open={preferencesOpen} onClose={() => setPreferencesOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Customize Your Preferences
          <IconButton
            onClick={() => setPreferencesOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Budget</InputLabel>
                <Select
                  value={preferences.budget}
                  label="Budget"
                  onChange={(e) => setPreferences({ ...preferences, budget: e.target.value })}
                >
                  <MenuItem value="low">Budget ($0-$500)</MenuItem>
                  <MenuItem value="medium">Medium ($500-$2000)</MenuItem>
                  <MenuItem value="high">Luxury ($2000+)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Travel Style</InputLabel>
                <Select
                  value={preferences.travelStyle}
                  label="Travel Style"
                  onChange={(e) => setPreferences({ ...preferences, travelStyle: e.target.value })}
                >
                  <MenuItem value="adventure">Adventure</MenuItem>
                  <MenuItem value="relaxation">Relaxation</MenuItem>
                  <MenuItem value="cultural">Cultural</MenuItem>
                  <MenuItem value="business">Business</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Duration</InputLabel>
                <Select
                  value={preferences.duration}
                  label="Duration"
                  onChange={(e) => setPreferences({ ...preferences, duration: e.target.value })}
                >
                  <MenuItem value="weekend">Weekend (2-3 days)</MenuItem>
                  <MenuItem value="1-week">1 Week</MenuItem>
                  <MenuItem value="2-weeks">2 Weeks</MenuItem>
                  <MenuItem value="1-month">1 Month+</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Interests
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {travelInterests.map((interest) => (
                  <Chip
                    key={interest}
                    label={interest}
                    clickable
                    color={preferences.interests.includes(interest) ? 'primary' : 'default'}
                    onClick={() => {
                      const newInterests = preferences.interests.includes(interest)
                        ? preferences.interests.filter(i => i !== interest)
                        : [...preferences.interests, interest];
                      setPreferences({ ...preferences, interests: newInterests });
                    }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreferencesOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdatePreferences} variant="contained">
            Update Preferences
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleRefreshRecommendations}
        disabled={refreshing}
      >
        <Refresh />
      </Fab>
    </Container>
  );
};

export default AIRecommendationsPage;