import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Paper,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Group as GroupIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '../services/api';

const AdvancedSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    destination: '',
    category: '',
    budget: [0, 10000],
    duration: '',
    startDate: null,
    endDate: null,
    groupSize: '',
    travelStyle: '',
    rating: 0,
    amenities: [],
    difficulty: ''
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [destinations, setDestinations] = useState([]);
  
  const travelStyles = [
    'Adventure', 'Relaxation', 'Cultural', 'Business', 'Family', 'Solo', 'Romantic', 'Backpacking'
  ];
  
  const amenities = [
    'WiFi', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Beach Access', 'Mountain View',
    'City View', 'Pet Friendly', 'Parking', 'Airport Shuttle', 'Room Service', 'Laundry'
  ];

  const difficulties = ['Easy', 'Moderate', 'Challenging', 'Expert'];

  useEffect(() => {
    fetchCategories();
    fetchDestinations();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchDestinations = async () => {
    try {
      const response = await api.get('/countries');
      setDestinations(response.data);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const searchParams = new URLSearchParams();
      
      if (searchQuery) searchParams.append('q', searchQuery);
      if (filters.destination) searchParams.append('destination', filters.destination);
      if (filters.category) searchParams.append('category', filters.category);
      if (filters.budget[0] > 0) searchParams.append('minBudget', filters.budget[0]);
      if (filters.budget[1] < 10000) searchParams.append('maxBudget', filters.budget[1]);
      if (filters.duration) searchParams.append('duration', filters.duration);
      if (filters.startDate) searchParams.append('startDate', filters.startDate.toISOString());
      if (filters.endDate) searchParams.append('endDate', filters.endDate.toISOString());
      if (filters.groupSize) searchParams.append('groupSize', filters.groupSize);
      if (filters.travelStyle) searchParams.append('travelStyle', filters.travelStyle);
      if (filters.rating > 0) searchParams.append('minRating', filters.rating);
      if (filters.amenities.length > 0) searchParams.append('amenities', filters.amenities.join(','));
      if (filters.difficulty) searchParams.append('difficulty', filters.difficulty);

      const response = await api.get(`/search/advanced?${searchParams.toString()}`);
      setResults(response.data);
    } catch (error) {
      console.error('Error searching:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      destination: '',
      category: '',
      budget: [0, 10000],
      duration: '',
      startDate: null,
      endDate: null,
      groupSize: '',
      travelStyle: '',
      rating: 0,
      amenities: [],
      difficulty: ''
    });
    setSearchQuery('');
  };

  const formatBudget = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Advanced Travel Search
        </Typography>

        {/* Search Bar */}
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Box display="flex" gap={2} alignItems="center">
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search destinations, activities, experiences..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleSearch}
              disabled={loading}
              sx={{ minWidth: 120 }}
            >
              {loading ? 'Searching...' : 'Search'}
            </Button>
            <IconButton onClick={clearFilters} title="Clear all filters">
              <ClearIcon />
            </IconButton>
          </Box>
        </Paper>

        <Grid container spacing={4}>
          {/* Filters Panel */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <FilterIcon sx={{ mr: 1 }} />
                <Typography variant="h6">Filters</Typography>
              </Box>

              {/* Destination Filter */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <LocationIcon sx={{ mr: 1 }} />
                  <Typography>Destination</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Autocomplete
                    options={destinations}
                    getOptionLabel={(option) => option.name || ''}
                    value={destinations.find(d => d._id === filters.destination) || null}
                    onChange={(event, newValue) => handleFilterChange('destination', newValue?._id || '')}
                    renderInput={(params) => <TextField {...params} placeholder="Select destination" />}
                    fullWidth
                  />
                </AccordionDetails>
              </Accordion>

              {/* Budget Filter */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <MoneyIcon sx={{ mr: 1 }} />
                  <Typography>Budget Range</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ px: 2 }}>
                    <Slider
                      value={filters.budget}
                      onChange={(event, newValue) => handleFilterChange('budget', newValue)}
                      valueLabelDisplay="auto"
                      valueLabelFormat={formatBudget}
                      min={0}
                      max={10000}
                      step={100}
                      marks={[
                        { value: 0, label: '$0' },
                        { value: 2500, label: '$2.5K' },
                        { value: 5000, label: '$5K' },
                        { value: 7500, label: '$7.5K' },
                        { value: 10000, label: '$10K+' }
                      ]}
                    />
                    <Box display="flex" justifyContent="space-between" mt={1}>
                      <Typography variant="body2">
                        {formatBudget(filters.budget[0])}
                      </Typography>
                      <Typography variant="body2">
                        {formatBudget(filters.budget[1])}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Dates Filter */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <CalendarIcon sx={{ mr: 1 }} />
                  <Typography>Travel Dates</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box display="flex" flexDirection="column" gap={2}>
                    <DatePicker
                      label="Start Date"
                      value={filters.startDate}
                      onChange={(newValue) => handleFilterChange('startDate', newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                      minDate={new Date()}
                    />
                    <DatePicker
                      label="End Date"
                      value={filters.endDate}
                      onChange={(newValue) => handleFilterChange('endDate', newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                      minDate={filters.startDate || new Date()}
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Travel Style */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <GroupIcon sx={{ mr: 1 }} />
                  <Typography>Travel Style</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FormControl fullWidth>
                    <InputLabel>Travel Style</InputLabel>
                    <Select
                      value={filters.travelStyle}
                      onChange={(e) => handleFilterChange('travelStyle', e.target.value)}
                      label="Travel Style"
                    >
                      <MenuItem value="">Any</MenuItem>
                      {travelStyles.map((style) => (
                        <MenuItem key={style} value={style}>
                          {style}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </AccordionDetails>
              </Accordion>

              {/* Group Size */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Group Size</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FormControl fullWidth>
                    <InputLabel>Group Size</InputLabel>
                    <Select
                      value={filters.groupSize}
                      onChange={(e) => handleFilterChange('groupSize', e.target.value)}
                      label="Group Size"
                    >
                      <MenuItem value="">Any</MenuItem>
                      <MenuItem value="1">Solo (1 person)</MenuItem>
                      <MenuItem value="2">Couple (2 people)</MenuItem>
                      <MenuItem value="3-5">Small Group (3-5 people)</MenuItem>
                      <MenuItem value="6-10">Medium Group (6-10 people)</MenuItem>
                      <MenuItem value="10+">Large Group (10+ people)</MenuItem>
                    </Select>
                  </FormControl>
                </AccordionDetails>
              </Accordion>

              {/* Rating Filter */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Minimum Rating</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Rating
                      value={filters.rating}
                      onChange={(event, newValue) => handleFilterChange('rating', newValue || 0)}
                      precision={0.5}
                    />
                    <Typography variant="body2">
                      {filters.rating > 0 ? `${filters.rating}+ stars` : 'Any rating'}
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Amenities */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Amenities</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Autocomplete
                    multiple
                    options={amenities}
                    value={filters.amenities}
                    onChange={(event, newValue) => handleFilterChange('amenities', newValue)}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option}
                          {...getTagProps({ index })}
                          size="small"
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder="Select amenities"
                        variant="outlined"
                      />
                    )}
                  />
                </AccordionDetails>
              </Accordion>

              {/* Difficulty Level */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Difficulty Level</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FormControl fullWidth>
                    <InputLabel>Difficulty</InputLabel>
                    <Select
                      value={filters.difficulty}
                      onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                      label="Difficulty"
                    >
                      <MenuItem value="">Any</MenuItem>
                      {difficulties.map((level) => (
                        <MenuItem key={level} value={level}>
                          {level}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </AccordionDetails>
              </Accordion>
            </Paper>
          </Grid>

          {/* Results Panel */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Search Results ({results.length})
              </Typography>
              <Divider sx={{ mb: 3 }} />

              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <Typography>Searching...</Typography>
                </Box>
              ) : results.length === 0 ? (
                <Box textAlign="center" py={4}>
                  <Typography variant="h6" color="text.secondary">
                    No results found
                  </Typography>
                  <Typography color="text.secondary">
                    Try adjusting your search criteria or filters
                  </Typography>
                </Box>
              ) : (
                <Grid container spacing={3}>
                  {results.map((result) => (
                    <Grid item xs={12} sm={6} key={result._id}>
                      <Card 
                        sx={{ 
                          height: '100%',
                          cursor: 'pointer',
                          '&:hover': { transform: 'translateY(-4px)' },
                          transition: 'transform 0.2s'
                        }}
                      >
                        {result.image && (
                          <Box
                            component="img"
                            src={result.image}
                            alt={result.title}
                            sx={{
                              width: '100%',
                              height: 200,
                              objectFit: 'cover'
                            }}
                          />
                        )}
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {result.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {result.description?.substring(0, 100)}...
                          </Typography>
                          
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box display="flex" alignItems="center" gap={1}>
                              <Rating value={result.rating || 0} readOnly size="small" />
                              <Typography variant="body2">
                                ({result.reviewCount || 0})
                              </Typography>
                            </Box>
                            {result.price && (
                              <Typography variant="h6" color="primary">
                                {formatBudget(result.price)}
                              </Typography>
                            )}
                          </Box>

                          {result.tags && (
                            <Box mt={2}>
                              {result.tags.slice(0, 3).map((tag) => (
                                <Chip
                                  key={tag}
                                  label={tag}
                                  size="small"
                                  sx={{ mr: 1, mb: 1 }}
                                />
                              ))}
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </LocalizationProvider>
  );
};

export default AdvancedSearchPage;