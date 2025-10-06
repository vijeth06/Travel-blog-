import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Paper,
  CircularProgress,
  Pagination,
  Grid
} from '@mui/material';

import {
  Search,
  Public,
  LocationOn,
  Clear,
  FilterList
} from '@mui/icons-material';
import CountryCard from './CountryCard';
import { searchCountries, getCountriesByContinent, getIndianRegions } from '../api/countries';

const CountrySearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    continent: '',
    region: '',
    isIndia: '',
    featured: false,
    sortBy: 'name'
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [continents] = useState([
    'Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania'
  ]);

  useEffect(() => {
    performSearch();
  }, [filters, page]);

  const performSearch = async (query = searchQuery, currentPage = page) => {
    setLoading(true);
    try {
      const params = {
        q: query,
        page: currentPage,
        limit: 12,
        ...filters
      };

      const data = await searchCountries(params);
      setCountries(data.results || []);
      setTotalPages(data.totalPages || 1);
      setPage(currentPage);
    } catch (error) {
      console.error('Search failed:', error);
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    performSearch();
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setPage(1);
  };

  const clearFilters = () => {
    setFilters({
      continent: '',
      region: '',
      isIndia: '',
      featured: false,
      sortBy: 'name'
    });
    setSearchQuery('');
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box sx={{ py: 4 }}>
      {/* Search Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          <Public sx={{ mr: 2, verticalAlign: 'middle' }} />
          Explore Countries
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Discover amazing destinations around the world
        </Typography>
      </Box>

      {/* Search Bar */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <form onSubmit={handleSearch}>
          <Grid container spacing={2} alignItems="center">
            <Grid xs={12} md={4}>
              <TextField
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search countries, cities, destinations..."
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                }}
              />
            </Grid>
            
            <Grid xs={12} md={2}>
              <FormControl fullWidth>
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
            </Grid>

            <Grid xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Region</InputLabel>
                <Select
                  value={filters.isIndia}
                  onChange={(e) => handleFilterChange('isIndia', e.target.value)}
                  label="Region"
                >
                  <MenuItem value="">All Regions</MenuItem>
                  <MenuItem value="true">India</MenuItem>
                  <MenuItem value="false">International</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid xs={12} md={2}>
              <FormControl fullWidth>
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="name">Name</MenuItem>
                  <MenuItem value="popularity">Popularity</MenuItem>
                  <MenuItem value="blogs">Blog Posts</MenuItem>
                  <MenuItem value="packages">Packages</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid xs={12} md={2}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ flex: 1 }}
                >
                  {loading ? <CircularProgress size={20} /> : 'Search'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  startIcon={<Clear />}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

        {/* Active Filters */}
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {filters.continent && (
            <Chip
              label={`Continent: ${filters.continent}`}
              onDelete={() => handleFilterChange('continent', '')}
              size="small"
            />
          )}
          {filters.isIndia === 'true' && (
            <Chip
              label="India"
              onDelete={() => handleFilterChange('isIndia', '')}
              size="small"
            />
          )}
          {filters.isIndia === 'false' && (
            <Chip
              label="International"
              onDelete={() => handleFilterChange('isIndia', '')}
              size="small"
            />
          )}
          {filters.featured && (
            <Chip
              label="Featured"
              onDelete={() => handleFilterChange('featured', false)}
              size="small"
            />
          )}
        </Box>
      </Paper>

      {/* Results */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      ) : countries.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No countries found
          </Typography>
          <Typography color="text.secondary">
            Try adjusting your search terms or filters
          </Typography>
        </Paper>
      ) : (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              {countries.length} countries found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Page {page} of {totalPages}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {countries.map((country) => (
              <Grid xs={12} sm={6} md={4} lg={3} key={country._id}>
                <CountryCard country={country} />
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
    </Box>
  );
};

export default CountrySearch;