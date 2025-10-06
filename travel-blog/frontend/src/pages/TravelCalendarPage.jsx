import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
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
  IconButton,
  Tooltip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert,
  Fab,
  Avatar,
  Badge
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Event as EventIcon,
  Flight as FlightIcon,
  Hotel as HotelIcon,
  Restaurant as RestaurantIcon,
  LocalActivity as ActivityIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarIcon,
  CloudQueue as WeatherIcon,
  AttachMoney as MoneyIcon,
  Group as GroupIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useSelector } from 'react-redux';
import api from '../services/api';

const TravelCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState({});
  const [seasonalRecommendations, setSeasonalRecommendations] = useState([]);

  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchEvents();
    fetchWeatherData();
    fetchSeasonalRecommendations();
  }, [currentDate]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await api.get(`/calendar/events?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      // Use mock data
      setEvents(generateMockEvents());
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherData = async () => {
    try {
      // This would integrate with a weather API
      setWeatherData(generateMockWeather());
    } catch (error) {
      console.error('Error fetching weather:', error);
    }
  };

  const fetchSeasonalRecommendations = async () => {
    try {
      const month = currentDate.getMonth();
      const response = await api.get(`/recommendations/seasonal?month=${month}`);
      setSeasonalRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setSeasonalRecommendations(generateMockRecommendations());
    }
  };

  const generateMockEvents = () => [
    {
      id: '1',
      title: 'Flight to Paris',
      type: 'flight',
      date: new Date(2025, 9, 15, 14, 30),
      endDate: new Date(2025, 9, 15, 20, 45),
      location: 'Charles de Gaulle Airport',
      description: 'Direct flight to Paris',
      status: 'confirmed',
      cost: 850,
      participants: ['Alice', 'Bob']
    },
    {
      id: '2',
      title: 'Hotel Check-in',
      type: 'hotel',
      date: new Date(2025, 9, 15, 22, 0),
      endDate: new Date(2025, 9, 20, 12, 0),
      location: 'Hotel Plaza Athénée',
      description: '4-night stay in luxury hotel',
      status: 'confirmed',
      cost: 2400,
      participants: ['Alice', 'Bob']
    },
    {
      id: '3',
      title: 'Eiffel Tower Visit',
      type: 'activity',
      date: new Date(2025, 9, 16, 10, 0),
      endDate: new Date(2025, 9, 16, 12, 0),
      location: 'Eiffel Tower',
      description: 'Skip-the-line tickets',
      status: 'booked',
      cost: 60,
      participants: ['Alice', 'Bob']
    },
    {
      id: '4',
      title: 'Dinner at Le Jules Verne',
      type: 'restaurant',
      date: new Date(2025, 9, 17, 19, 30),
      endDate: new Date(2025, 9, 17, 22, 0),
      location: 'Eiffel Tower Restaurant',
      description: 'Michelin-starred dining experience',
      status: 'confirmed',
      cost: 400,
      participants: ['Alice', 'Bob']
    }
  ];

  const generateMockWeather = () => ({
    '2025-10-15': { temp: 18, condition: 'sunny', precipitation: 0 },
    '2025-10-16': { temp: 16, condition: 'cloudy', precipitation: 20 },
    '2025-10-17': { temp: 14, condition: 'rainy', precipitation: 80 },
    '2025-10-18': { temp: 17, condition: 'partly-cloudy', precipitation: 10 },
    '2025-10-19': { temp: 19, condition: 'sunny', precipitation: 0 },
    '2025-10-20': { temp: 15, condition: 'cloudy', precipitation: 30 }
  });

  const generateMockRecommendations = () => [
    {
      id: '1',
      title: 'Fall Foliage Tours',
      description: 'Perfect season for autumn colors',
      destinations: ['Vermont', 'New Hampshire', 'Maine'],
      bestMonths: ['September', 'October', 'November']
    },
    {
      id: '2',
      title: 'European Christmas Markets',
      description: 'Magical holiday atmosphere',
      destinations: ['Germany', 'Austria', 'Czech Republic'],
      bestMonths: ['November', 'December']
    },
    {
      id: '3',
      title: 'Indian Ocean Islands',
      description: 'Dry season with perfect weather',
      destinations: ['Maldives', 'Seychelles', 'Mauritius'],
      bestMonths: ['October', 'November', 'December', 'January', 'February', 'March']
    }
  ];

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'flight': return <FlightIcon />;
      case 'hotel': return <HotelIcon />;
      case 'restaurant': return <RestaurantIcon />;
      case 'activity': return <ActivityIcon />;
      default: return <EventIcon />;
    }
  };

  const getEventColor = (type, status) => {
    const colors = {
      flight: '#2196F3',
      hotel: '#4CAF50',
      restaurant: '#FF9800',
      activity: '#9C27B0'
    };
    
    const baseColor = colors[type] || '#757575';
    return status === 'confirmed' ? baseColor : `${baseColor}80`;
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTotalCost = () => {
    return events.reduce((total, event) => total + (event.cost || 0), 0);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setEventDialogOpen(true);
  };

  const handleAddEvent = () => {
    setEditingEvent(null);
    setSelectedDate(new Date());
    setEventDialogOpen(true);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Travel Calendar & Planner
        </Typography>

        <Grid container spacing={3}>
          {/* Main Calendar */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                {/* Calendar Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <IconButton onClick={() => navigateMonth(-1)}>
                    <ChevronLeftIcon />
                  </IconButton>
                  
                  <Typography variant="h4" component="h2">
                    {currentDate.toLocaleDateString('en-US', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </Typography>
                  
                  <IconButton onClick={() => navigateMonth(1)}>
                    <ChevronRightIcon />
                  </IconButton>
                </Box>

                {/* View Controls */}
                <Box display="flex" justifyContent="center" mb={3}>
                  <Button
                    variant={view === 'month' ? 'contained' : 'outlined'}
                    onClick={() => setView('month')}
                    sx={{ mr: 1 }}
                  >
                    Month
                  </Button>
                  <Button
                    variant={view === 'week' ? 'contained' : 'outlined'}
                    onClick={() => setView('week')}
                    sx={{ mr: 1 }}
                  >
                    Week
                  </Button>
                  <Button
                    variant={view === 'day' ? 'contained' : 'outlined'}
                    onClick={() => setView('day')}
                  >
                    Day
                  </Button>
                </Box>

                {/* Calendar Grid */}
                <Grid container spacing={1}>
                  {/* Day Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <Grid item xs key={day}>
                      <Typography 
                        variant="subtitle2" 
                        align="center" 
                        sx={{ fontWeight: 'bold', py: 1 }}
                      >
                        {day}
                      </Typography>
                    </Grid>
                  ))}

                  {/* Calendar Days */}
                  {getDaysInMonth().map((date, index) => {
                    const dayEvents = date ? getEventsForDate(date) : [];
                    const isToday = date && date.toDateString() === new Date().toDateString();
                    const hasEvents = dayEvents.length > 0;

                    return (
                      <Grid item xs key={index}>
                        <Paper
                          elevation={hasEvents ? 2 : 0}
                          sx={{
                            height: 120,
                            p: 1,
                            cursor: date ? 'pointer' : 'default',
                            bgcolor: isToday ? 'primary.light' : hasEvents ? 'grey.50' : 'transparent',
                            border: isToday ? 2 : 1,
                            borderColor: isToday ? 'primary.main' : 'grey.200',
                            '&:hover': date ? { bgcolor: 'grey.100' } : {}
                          }}
                          onClick={() => date && handleDateClick(date)}
                        >
                          {date && (
                            <>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: isToday ? 'bold' : 'normal',
                                  color: isToday ? 'primary.main' : 'text.primary'
                                }}
                              >
                                {date.getDate()}
                              </Typography>
                              
                              {/* Weather indicator */}
                              {weatherData[date.toISOString().split('T')[0]] && (
                                <Box display="flex" alignItems="center" mb={0.5}>
                                  <WeatherIcon sx={{ fontSize: 12, mr: 0.5 }} />
                                  <Typography variant="caption">
                                    {weatherData[date.toISOString().split('T')[0]].temp}°C
                                  </Typography>
                                </Box>
                              )}

                              {/* Events */}
                              {dayEvents.slice(0, 2).map((event) => (
                                <Chip
                                  key={event.id}
                                  label={event.title}
                                  size="small"
                                  sx={{
                                    fontSize: '0.6rem',
                                    height: 18,
                                    mb: 0.5,
                                    bgcolor: getEventColor(event.type, event.status),
                                    color: 'white',
                                    '& .MuiChip-label': { px: 0.5 }
                                  }}
                                />
                              ))}
                              
                              {dayEvents.length > 2 && (
                                <Typography variant="caption" color="text.secondary">
                                  +{dayEvents.length - 2} more
                                </Typography>
                              )}
                            </>
                          )}
                        </Paper>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              {/* Quick Stats */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Trip Summary
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="primary">
                          {events.length}
                        </Typography>
                        <Typography variant="body2">Events</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box textAlign="center">
                        <Typography variant="h4" color="secondary">
                          ${getTotalCost().toLocaleString()}
                        </Typography>
                        <Typography variant="body2">Total Cost</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Upcoming Events
                  </Typography>
                  <List dense>
                    {events
                      .filter(event => new Date(event.date) >= new Date())
                      .slice(0, 5)
                      .map((event) => (
                      <ListItem key={event.id} sx={{ px: 0 }}>
                        <ListItemIcon>
                          <Avatar sx={{ bgcolor: getEventColor(event.type, event.status), width: 32, height: 32 }}>
                            {getEventIcon(event.type)}
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={event.title}
                          secondary={`${new Date(event.date).toLocaleDateString()} at ${formatTime(event.date)}`}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>

              {/* Seasonal Recommendations */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Seasonal Recommendations
                  </Typography>
                  {seasonalRecommendations.map((recommendation) => (
                    <Alert 
                      key={recommendation.id} 
                      severity="info" 
                      sx={{ mb: 2 }}
                      icon={<CalendarIcon />}
                    >
                      <Typography variant="subtitle2" gutterBottom>
                        {recommendation.title}
                      </Typography>
                      <Typography variant="body2">
                        {recommendation.description}
                      </Typography>
                      <Box mt={1}>
                        {recommendation.destinations.map((dest) => (
                          <Chip 
                            key={dest}
                            label={dest} 
                            size="small" 
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </Box>
                    </Alert>
                  ))}
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>

        {/* Add Event FAB */}
        <Fab
          color="primary"
          aria-label="add event"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={handleAddEvent}
        >
          <AddIcon />
        </Fab>

        {/* Event Dialog */}
        <EventDialog
          open={eventDialogOpen}
          onClose={() => setEventDialogOpen(false)}
          selectedDate={selectedDate}
          editingEvent={editingEvent}
          onSave={(eventData) => {
            // Handle saving event
            console.log('Saving event:', eventData);
            setEventDialogOpen(false);
            fetchEvents();
          }}
        />
      </Container>
    </LocalizationProvider>
  );
};

// Event Dialog Component
const EventDialog = ({ open, onClose, selectedDate, editingEvent, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'activity',
    date: new Date(),
    endDate: new Date(),
    location: '',
    description: '',
    cost: '',
    participants: []
  });

  useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title || '',
        type: editingEvent.type || 'activity',
        date: editingEvent.date ? new Date(editingEvent.date) : new Date(),
        endDate: editingEvent.endDate ? new Date(editingEvent.endDate) : new Date(),
        location: editingEvent.location || '',
        description: editingEvent.description || '',
        cost: editingEvent.cost || '',
        participants: editingEvent.participants || []
      });
    } else if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate,
        endDate: selectedDate
      }));
    }
  }, [editingEvent, selectedDate, open]);

  const handleSubmit = () => {
    onSave(formData);
  };

  const eventTypes = [
    { value: 'flight', label: 'Flight', icon: <FlightIcon /> },
    { value: 'hotel', label: 'Accommodation', icon: <HotelIcon /> },
    { value: 'restaurant', label: 'Dining', icon: <RestaurantIcon /> },
    { value: 'activity', label: 'Activity', icon: <ActivityIcon /> },
    { value: 'transport', label: 'Transport', icon: <FlightIcon /> },
    { value: 'meeting', label: 'Meeting', icon: <GroupIcon /> }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingEvent ? 'Edit Event' : 'Add New Event'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="Event Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Flight to Paris"
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  label="Event Type"
                >
                  {eventTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box display="flex" alignItems="center" gap={1}>
                        {type.icon}
                        {type.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Start Date"
                value={formData.date}
                onChange={(newValue) => setFormData(prev => ({ ...prev, date: newValue }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Start Time"
                value={formData.date}
                onChange={(newValue) => setFormData(prev => ({ ...prev, date: newValue }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Charles de Gaulle Airport"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Additional details about this event..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cost"
                type="number"
                value={formData.cost}
                onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                InputProps={{
                  startAdornment: <MoneyIcon sx={{ mr: 1 }} />
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Participants"
                value={formData.participants.join(', ')}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  participants: e.target.value.split(',').map(p => p.trim()).filter(p => p)
                }))}
                placeholder="Alice, Bob, Charlie"
                helperText="Comma-separated names"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={!formData.title}
        >
          {editingEvent ? 'Update Event' : 'Add Event'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TravelCalendar;