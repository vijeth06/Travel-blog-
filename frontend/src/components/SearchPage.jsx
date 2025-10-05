import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Paper,
  Autocomplete,
  CircularProgress,
  Pagination,
  Grid
} from '@mui/material';

import {
  Search,
  FilterList,
  LocationOn,
  DateRange,
  AttachMoney,
  Star,
  Clear,
  Public
} from '@mui/icons-material';
import { useSearchParams, useNavigate } from 'react-router-dom';
import BlogCard from './BlogCard';
import PackageCard from './PackageCard';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [searchType, setSearchType] = useState('blogs');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    country: '',
    countryCode: '',
    continent: '',
    priceRange: [0, 10000],
    rating: 0,
    dateRange: null,
    sortBy: 'relevance'
  });
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [countries, setCountries] = useState([]);
  const [continents] = useState([
    'Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'
  ]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCategories();
    fetchLocations();
    fetchCountries();
  }, []);

  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch('/api/maps/popular-locations');
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (error) {
      console.error('Failed to fetch locations:', error);
    }
  };

  const fetchCountries = async () => {
    try {
      const response = await fetch('/api/countries?limit=100');
      if (response.ok) {
        const data = await response.json();
        setCountries(data.countries || []);
      }
    } catch (error) {
      console.error('Failed to fetch countries:', error);
    }
  };

  const performSearch = async (query = searchQuery, currentPage = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        type: searchType,
        page: currentPage,
        limit: 12,
        ...filters
      });

      const endpoint = searchType === 'blogs' ? '/api/blogs/search' : '/api/packages/search';
      const response = await fetch(`${endpoint}?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
        setTotalPages(data.totalPages || 1);
        setPage(currentPage);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery.trim() });
      performSearch();
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    performSearch(searchQuery, 1);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      country: '',
      countryCode: '',
      continent: '',
      priceRange: [0, 10000],
      rating: 0,
      dateRange: null,
      sortBy: 'relevance'
    });
    performSearch(searchQuery, 1);
  };

  const handlePageChange = (event, value) => {
    performSearch(searchQuery, value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Search Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          Search & Discover
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Find amazing travel stories and packages
        </Typography>

        {/* Search Bar */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <form onSubmit={handleSearch}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <TextField
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search destinations, stories, experiences..."
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ flex: 1, minWidth: 300 }}
              />
              
              <FormControl sx={{ minWidth: 120 }}>
                <InputLabel>Type</InputLabel>
                <Select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  label="Type"
                >
                  <MenuItem value="blogs">Stories</MenuItem>
                  <MenuItem value="packages">Packages</MenuItem>
                </Select>
              </FormControl>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ minWidth: 100 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Search'}
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>

      <Grid container spacing={3}>
        {/* Filters Sidebar */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 3, position: 'sticky', top: 100 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
                <FilterList sx={{ mr: 1 }} />
                Filters
              </Typography>
              <Button size="small" onClick={clearFilters} startIcon={<Clear />}>
                Clear
              </Button>
            </Box>

            {/* Category Filter */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Location Filter */}
            <Autocomplete
              options={locations}
              getOptionLabel={(option) => option.name || ''}
              value={filters.location}
              onChange={(event, newValue) => handleFilterChange('location', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Location"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              )}
              sx={{ mb: 3 }}
            />

            {/* Country Filter */}
            <Autocomplete
              options={countries}
              getOptionLabel={(option) => option.name || ''}
              value={filters.country}
              onChange={(event, newValue) => handleFilterChange('country', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Country"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: <Public sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    loading="lazy"
                    width="20"
                    src={`https://flagcdn.com/w20/${option.code?.toLowerCase()}.png`}
                    alt={`${option.name} flag`}
                    style={{ marginRight: 8 }}
                  />
                  {option.name}
                  {option.isIndia && (
                    <Chip label="India" size="small" sx={{ ml: 1 }} />
                  )}
                </Box>
              )}
              sx={{ mb: 3 }}
            />

            {/* Continent Filter */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Continent</InputLabel>
              <Select
                value={filters.continent}
                onChange={(e) => handleFilterChange('continent', e.target.value)}
                label="Continent"
              >
                <MenuItem value="">All Continents</MenuItem>
                {continents.map((continent) => (
                  <MenuItem key={continent} value={continent}>
                    {continent}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Price Range Filter (for packages) */}
            {searchType === 'packages' && (
              <Box sx={{ mb: 3 }}>
                <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoney sx={{ mr: 1 }} />
                  Price Range
                </Typography>
                <Slider
                  value={filters.priceRange}
                  onChange={(e, newValue) => handleFilterChange('priceRange', newValue)}
                  valueLabelDisplay="auto"
                  min={0}
                  max={10000}
                  step={100}
                  marks={[
                    { value: 0, label: '$0' },
                    { value: 5000, label: '$5K' },
                    { value: 10000, label: '$10K+' }
                  ]}
                />
              </Box>
            )}

            {/* Rating Filter */}
            <Box sx={{ mb: 3 }}>
              <Typography gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Star sx={{ mr: 1 }} />
                Minimum Rating
              </Typography>
              <Slider
                value={filters.rating}
                onChange={(e, newValue) => handleFilterChange('rating', newValue)}
                valueLabelDisplay="auto"
                min={0}
                max={5}
                step={0.5}
                marks={[
                  { value: 0, label: '0' },
                  { value: 2.5, label: '2.5' },
                  { value: 5, label: '5' }
                ]}
              />
            </Box>

            {/* Sort By */}
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                label="Sort By"
              >
                <MenuItem value="relevance">Relevance</MenuItem>
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
                <MenuItem value="popular">Most Popular</MenuItem>
                {searchType === 'packages' && (
                  <>
                    <MenuItem value="price_low">Price: Low to High</MenuItem>
                    <MenuItem value="price_high">Price: High to Low</MenuItem>
                  </>
                )}
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={9}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress size={60} />
            </Box>
          ) : results.length === 0 ? (
            <Paper sx={{ p: 6, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                No results found
              </Typography>
              <Typography color="text.secondary">
                Try adjusting your search terms or filters
              </Typography>
            </Paper>
          ) : (
            <>
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {results.length} results found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Page {page} of {totalPages}
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {results.map((item) => (
                  <Grid item xs={12} sm={6} lg={4} key={item._id}>
                    {searchType === 'blogs' ? (
                      <BlogCard blog={item} />
                    ) : (
                      <PackageCard package={item} />
                    )}
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default SearchPage;
