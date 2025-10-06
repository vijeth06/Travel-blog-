import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  CircularProgress,
  Alert,
  Pagination,
  Button,
  Fab
} from '@mui/material';
import { ShoppingCart } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PackageCard from '../components/PackageCard';
import SearchFilters from '../components/SearchFilters';
import * as packagesAPI from '../api/packages';
import * as categoriesAPI from '../api/categories';
import * as cartAPI from '../api/cart';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionTest, setConnectionTest] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalPackages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    type: '',
    location: '',
    priceRange: [0, 10000],
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [cartCount, setCartCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    // Test connection first
    const testConnection = async () => {
      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/packages?limit=1`);
        if (response.ok) {
          setConnectionTest('✅ Server connection successful');
        } else {
          setConnectionTest('⚠️ Server responded with error');
        }
      } catch (err) {
        setConnectionTest('❌ Cannot connect to server');
        console.error('Connection test failed:', err);
      }
    };

    testConnection();
    fetchPackages();
    fetchCategories();
    fetchCartCount();
  }, [filters, pagination.currentPage]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: pagination.currentPage,
        limit: 12,
        ...filters,
        minPrice: filters.priceRange[0],
        maxPrice: filters.priceRange[1]
      };

      // Remove empty filters
      Object.keys(params).forEach(key => {
        if (!params[key] || params[key] === '' || (Array.isArray(params[key]) && params[key].length === 0)) {
          delete params[key];
        }
      });

      console.log('Fetching packages with params:', params);
      const data = await packagesAPI.getPackages(params);
      console.log('Packages response:', data);

      setPackages(data.packages || []);
      setPagination({
        currentPage: data.currentPage || 1,
        totalPages: data.totalPages || 1,
        totalPackages: data.totalPackages || 0
      });
    } catch (err) {
      console.error('Failed to fetch packages:', err);
      setError(err.message || 'Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('Fetching categories...');
      const data = await categoriesAPI.getCategories();
      console.log('Categories response:', data);
      setCategories(data.categories || data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      // Don't show error for categories as it's not critical
    }
  };

  const fetchCartCount = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('Fetching cart count...');
      const data = await cartAPI.getCartItemCount();
      console.log('Cart count response:', data);
      setCartCount(data.count || 0);
    } catch (err) {
      console.error('Failed to fetch cart count:', err);
      // Don't show error for cart count as it's not critical
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (event, page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = async (pkg) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // For demo purposes, use default travel dates (next month)
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() + 1);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + parseInt(pkg.duration.split(' ')[0]) || 3);

      const cartData = {
        packageId: pkg._id,
        quantity: 1,
        travelDates: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString()
        },
        travelers: pkg.type === 'Family' ? 4 : pkg.type === 'Couple' ? 2 : 1
      };

      await cartAPI.addToCart(cartData);
      setCartCount(prev => prev + 1);
      // Show success message or notification
    } catch (err) {
      setError('Failed to add to cart');
    }
  };

  const handleToggleFavorite = (packageId) => {
    // Implement favorite functionality
    console.log('Toggle favorite for package:', packageId);
  };

  const handleViewCart = () => {
    navigate('/cart');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Travel Packages
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Discover amazing destinations and book your next adventure
        </Typography>
        {pagination.totalPackages > 0 && (
          <Typography variant="body1" color="text.secondary">
            {pagination.totalPackages} packages available
          </Typography>
        )}
      </Box>

      {/* Connection Test */}
      {connectionTest && (
        <Alert 
          severity={connectionTest.includes('✅') ? 'success' : connectionTest.includes('⚠️') ? 'warning' : 'error'} 
          sx={{ mb: 3 }}
        >
          {connectionTest}
        </Alert>
      )}

      {/* Search and Filters */}
      <SearchFilters
        onFiltersChange={handleFiltersChange}
        categories={categories}
        initialFilters={filters}
        loading={loading}
      />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size={60} />
        </Box>
      )}

      {/* Packages Grid */}
      {!loading && packages.length > 0 && (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {packages.map((pkg) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={pkg._id}>
                <PackageCard
                  package={pkg}
                  onAddToCart={handleAddToCart}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={false} // Implement favorite logic
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
        </>
      )}

      {/* No Packages Found */}
      {!loading && packages.length === 0 && !error && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" gutterBottom>
            No packages found
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Try adjusting your search criteria or filters
          </Typography>
          <Button
            variant="contained"
            onClick={() => handleFiltersChange({
              search: '',
              category: '',
              type: '',
              location: '',
              priceRange: [0, 10000],
              sortBy: 'createdAt',
              sortOrder: 'desc'
            })}
          >
            Clear All Filters
          </Button>
        </Box>
      )}

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <Fab
          color="primary"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000
          }}
          onClick={handleViewCart}
        >
          <Box sx={{ position: 'relative' }}>
            <ShoppingCart />
            <Box
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                backgroundColor: 'error.main',
                color: 'white',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}
            >
              {cartCount}
            </Box>
          </Box>
        </Fab>
      )}
    </Container>
  );
};

export default Packages;
