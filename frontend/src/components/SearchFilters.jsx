import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Button,
  Chip,
  Collapse,
  IconButton,
  Grid
} from '@mui/material';

import {
  Search,
  FilterList,
  Clear,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';

const SearchFilters = ({ 
  onFiltersChange, 
  categories = [], 
  initialFilters = {},
  loading = false 
}) => {
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    type: '',
    location: '',
    priceRange: [0, 10000],
    sortBy: 'createdAt',
    sortOrder: 'desc',
    ...initialFilters
  });

  const [expanded, setExpanded] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const packageTypes = ['Single', 'Family', 'Couple'];
  const sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'price', label: 'Price' },
    { value: 'title', label: 'Name' },
    { value: 'rating.average', label: 'Rating' }
  ];

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      onFiltersChange(filters);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters, onFiltersChange]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePriceRangeChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handlePriceRangeCommitted = (event, newValue) => {
    handleFilterChange('priceRange', newValue);
  };

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      type: '',
      location: '',
      priceRange: [0, 10000],
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    setPriceRange([0, 10000]);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.type) count++;
    if (filters.location) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) count++;
    return count;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
      {/* Search Bar */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search packages, destinations..."
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          InputProps={{
            startAdornment: <Search color="action" sx={{ mr: 1 }} />,
            endAdornment: filters.search && (
              <IconButton
                size="small"
                onClick={() => handleFilterChange('search', '')}
              >
                <Clear />
              </IconButton>
            )
          }}
          disabled={loading}
        />
      </Box>

      {/* Quick Filters */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Button
          variant={expanded ? "contained" : "outlined"}
          startIcon={<FilterList />}
          endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
          onClick={() => setExpanded(!expanded)}
          size="small"
        >
          Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
        </Button>

        {getActiveFiltersCount() > 0 && (
          <Button
            variant="text"
            startIcon={<Clear />}
            onClick={clearFilters}
            size="small"
            color="error"
          >
            Clear All
          </Button>
        )}
      </Box>

      {/* Active Filters Chips */}
      {getActiveFiltersCount() > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {filters.category && (
            <Chip
              label={`Category: ${categories.find(c => c._id === filters.category)?.name || filters.category}`}
              onDelete={() => handleFilterChange('category', '')}
              size="small"
            />
          )}
          {filters.type && (
            <Chip
              label={`Type: ${filters.type}`}
              onDelete={() => handleFilterChange('type', '')}
              size="small"
            />
          )}
          {filters.location && (
            <Chip
              label={`Location: ${filters.location}`}
              onDelete={() => handleFilterChange('location', '')}
              size="small"
            />
          )}
          {(filters.priceRange[0] > 0 || filters.priceRange[1] < 10000) && (
            <Chip
              label={`Price: ${formatPrice(filters.priceRange[0])} - ${formatPrice(filters.priceRange[1])}`}
              onDelete={() => handleFilterChange('priceRange', [0, 10000])}
              size="small"
            />
          )}
        </Box>
      )}

      {/* Expanded Filters */}
      <Collapse in={expanded}>
        <Grid container spacing={2}>
          {/* Category Filter */}
          <Grid xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                disabled={loading}
              >
                <MenuItem value="">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category._id} value={category._id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Type Filter */}
          <Grid xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Type</InputLabel>
              <Select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                disabled={loading}
              >
                <MenuItem value="">All Types</MenuItem>
                {packageTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Location Filter */}
          <Grid xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Location"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              disabled={loading}
            />
          </Grid>

          {/* Sort By */}
          <Grid xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                disabled={loading}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Price Range */}
          <Grid xs={12}>
            <Typography variant="body2" gutterBottom>
              Price Range: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
            </Typography>
            <Slider
              value={priceRange}
              onChange={handlePriceRangeChange}
              onChangeCommitted={handlePriceRangeCommitted}
              valueLabelDisplay="auto"
              min={0}
              max={10000}
              step={100}
              valueLabelFormat={formatPrice}
              disabled={loading}
              sx={{ mt: 1 }}
            />
          </Grid>

          {/* Sort Order */}
          <Grid xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Order</InputLabel>
              <Select
                value={filters.sortOrder}
                onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                disabled={loading}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Collapse>
    </Paper>
  );
};

export default SearchFilters;
