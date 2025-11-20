import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  Avatar,
  CircularProgress,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Share as ShareIcon,
  People as PeopleIcon,
  AttachMoney as MoneyIcon,
  CalendarToday as CalendarIcon
} from '@mui/icons-material';
import {
  getUserItineraries,
  createItinerary,
  toggleItineraryLike,
  toggleItinerarySave,
  getSavedItineraries,
  addDay,
  addActivity
} from '../api/itinerary';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const ItineraryPage = () => {
  const [tab, setTab] = useState(0);
  const [itineraries, setItineraries] = useState([]);
  const [savedItineraries, setSavedItineraries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [newItinerary, setNewItinerary] = useState({
    title: '',
    description: '',
    destination: '',
    country: '',
    startDate: '',
    endDate: '',
    budget: { total: 0, currency: 'USD' },
    travelers: 1,
    visibility: 'private',
    tags: ''
  });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  useEffect(() => {
    loadItineraries();
  }, [tab]);

  const loadItineraries = async () => {
    setLoading(true);
    try {
      if (tab === 0) {
        const data = await getUserItineraries(currentUser._id);
        setItineraries(data.itineraries);
      } else if (tab === 1) {
        const data = await getSavedItineraries();
        setSavedItineraries(data.itineraries);
      }
    } catch (error) {
      console.error('Load itineraries error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateItinerary = async () => {
    try {
      const itineraryData = {
        ...newItinerary,
        budget: {
          total: parseFloat(newItinerary.budget.total) || 0,
          currency: newItinerary.budget.currency
        },
        travelers: parseInt(newItinerary.travelers) || 1
      };
      
      const { itinerary } = await createItinerary(itineraryData);
      setCreateDialogOpen(false);
      setActiveStep(0);
      setNewItinerary({
        title: '',
        description: '',
        destination: '',
        country: '',
        startDate: '',
        endDate: '',
        budget: { total: 0, currency: 'USD' },
        travelers: 1,
        visibility: 'private',
        tags: ''
      });
      navigate(`/itinerary/${itinerary._id}`);
    } catch (error) {
      console.error('Create itinerary error:', error);
    }
  };

  const handleLike = async (itineraryId) => {
    try {
      const { isLiked, likeCount } = await toggleItineraryLike(itineraryId);
      updateItineraryInList(itineraryId, { isLiked, likeCount });
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleSave = async (itineraryId) => {
    try {
      const { isSaved, saveCount } = await toggleItinerarySave(itineraryId);
      updateItineraryInList(itineraryId, { isSaved, saveCount });
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const updateItineraryInList = (id, updates) => {
    if (tab === 0) {
      setItineraries(prev =>
        prev.map(it => (it._id === id ? { ...it, ...updates } : it))
      );
    } else {
      setSavedItineraries(prev =>
        prev.map(it => (it._id === id ? { ...it, ...updates } : it))
      );
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'warning',
      confirmed: 'info',
      ongoing: 'primary',
      completed: 'success',
      cancelled: 'error'
    };
    return colors[status] || 'default';
  };

  const steps = ['Basic Info', 'Dates & Budget', 'Review'];

  const ItineraryCard = ({ itinerary }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {itinerary.title}
          </Typography>
          <Chip
            label={itinerary.status}
            color={getStatusColor(itinerary.status)}
            size="small"
          />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <CalendarIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <PeopleIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {itinerary.travelers} {itinerary.travelers === 1 ? 'Traveler' : 'Travelers'}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <MoneyIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            Budget: {itinerary.budget?.currency} {itinerary.budget?.total || 0}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          📍 {itinerary.destination}, {itinerary.country}
        </Typography>

        <Typography variant="body2" sx={{ mb: 2 }} noWrap>
          {itinerary.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
          {itinerary.tags?.slice(0, 3).map((tag, idx) => (
            <Chip key={idx} label={tag} size="small" variant="outlined" />
          ))}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleLike(itinerary._id);
              }}
              color={itinerary.isLiked ? 'error' : 'default'}
            >
              {itinerary.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
              {itinerary.likeCount || 0}
            </Typography>

            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleSave(itinerary._id);
              }}
              color={itinerary.isSaved ? 'primary' : 'default'}
            >
              {itinerary.isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
            </IconButton>
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
              {itinerary.saveCount || 0}
            </Typography>
          </Box>

          <Button
            size="small"
            variant="outlined"
            onClick={() => navigate(`/itinerary/${itinerary._id}`)}
          >
            View Details
          </Button>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
          <Avatar src={itinerary.user?.avatar} sx={{ width: 24, height: 24 }}>
            {itinerary.user?.name?.[0]}
          </Avatar>
          <Typography variant="caption" color="text.secondary">
            by {itinerary.user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            · {formatDistanceToNow(new Date(itinerary.createdAt), { addSuffix: true })}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Travel Itineraries</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Itinerary
        </Button>
      </Box>

      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="My Itineraries" />
        <Tab label="Saved" />
        <Tab label="Explore" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {(tab === 0 ? itineraries : savedItineraries).map((itinerary) => (
            <Grid item xs={12} sm={6} md={4} key={itinerary._id}>
              <ItineraryCard itinerary={itinerary} />
            </Grid>
          ))}
          {(tab === 0 ? itineraries : savedItineraries).length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="text.secondary">
                  {tab === 0 ? 'No itineraries yet' : 'No saved itineraries'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {tab === 0 ? 'Create your first travel itinerary' : 'Save itineraries to view them here'}
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}

      {/* Create Itinerary Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Create New Itinerary</DialogTitle>
        <DialogContent>
          <Stepper activeStep={activeStep} sx={{ my: 3 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {activeStep === 0 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Title"
                fullWidth
                required
                value={newItinerary.title}
                onChange={(e) => setNewItinerary({ ...newItinerary, title: e.target.value })}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={3}
                value={newItinerary.description}
                onChange={(e) => setNewItinerary({ ...newItinerary, description: e.target.value })}
              />
              <TextField
                label="Destination"
                fullWidth
                required
                value={newItinerary.destination}
                onChange={(e) => setNewItinerary({ ...newItinerary, destination: e.target.value })}
              />
              <TextField
                label="Country"
                fullWidth
                value={newItinerary.country}
                onChange={(e) => setNewItinerary({ ...newItinerary, country: e.target.value })}
              />
              <TextField
                label="Tags (comma-separated)"
                fullWidth
                value={newItinerary.tags}
                onChange={(e) => setNewItinerary({ ...newItinerary, tags: e.target.value })}
              />
            </Box>
          )}

          {activeStep === 1 && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={newItinerary.startDate}
                onChange={(e) => setNewItinerary({ ...newItinerary, startDate: e.target.value })}
              />
              <TextField
                label="End Date"
                type="date"
                fullWidth
                required
                InputLabelProps={{ shrink: true }}
                value={newItinerary.endDate}
                onChange={(e) => setNewItinerary({ ...newItinerary, endDate: e.target.value })}
              />
              <TextField
                label="Total Budget"
                type="number"
                fullWidth
                value={newItinerary.budget.total}
                onChange={(e) =>
                  setNewItinerary({
                    ...newItinerary,
                    budget: { ...newItinerary.budget, total: e.target.value }
                  })
                }
              />
              <TextField
                label="Number of Travelers"
                type="number"
                fullWidth
                value={newItinerary.travelers}
                onChange={(e) => setNewItinerary({ ...newItinerary, travelers: e.target.value })}
              />
            </Box>
          )}

          {activeStep === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Review Your Itinerary
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="Title" secondary={newItinerary.title} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Destination" secondary={`${newItinerary.destination}, ${newItinerary.country}`} />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="Dates"
                    secondary={`${newItinerary.startDate} to ${newItinerary.endDate}`}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Budget" secondary={`${newItinerary.budget.currency} ${newItinerary.budget.total}`} />
                </ListItem>
                <ListItem>
                  <ListItemText primary="Travelers" secondary={newItinerary.travelers} />
                </ListItem>
              </List>
            </Box>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              disabled={activeStep === 0}
              onClick={() => setActiveStep(activeStep - 1)}
            >
              Back
            </Button>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              {activeStep === steps.length - 1 ? (
                <Button variant="contained" onClick={handleCreateItinerary}>
                  Create
                </Button>
              ) : (
                <Button variant="contained" onClick={() => setActiveStep(activeStep + 1)}>
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ItineraryPage;
