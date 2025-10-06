import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import {
  ShoppingCart,
  Delete,
  CheckCircle,
  Warning,
  ArrowForward,
  ShoppingBag
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CartItem from '../components/CartItem';
import * as cartAPI from '../api/cart';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionTest, setConnectionTest] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [updating, setUpdating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    // Test connection first
    const testConnection = async () => {
      try {
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
        const response = await fetch(`${API_BASE_URL}/cart/count`, { credentials: 'include' });
        if (response.status === 401) {
          setConnectionTest('✅ Server connection successful (auth required)');
        } else if (response.ok) {
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
    fetchCart();
    validateCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('Fetching cart...');
      const data = await cartAPI.getCart();
      console.log('Cart response:', data);
      
      setCart(data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError(err.message || 'Failed to fetch cart');
    } finally {
      setLoading(false);
    }
  };

  const validateCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      console.log('Validating cart...');
      const data = await cartAPI.validateCart();
      console.log('Cart validation response:', data);
      setValidationResult(data);
    } catch (err) {
      console.error('Failed to validate cart:', err);
      // Don't show error for validation as it's not critical
    }
  };

  const handleUpdateItem = async (itemId, updateData) => {
    try {
      setUpdating(true);
      console.log('Updating cart item:', itemId, updateData);
      
      const updatedCart = await cartAPI.updateCartItem(itemId, updateData);
      console.log('Updated cart:', updatedCart);
      
      setCart(updatedCart);
      validateCart();
    } catch (err) {
      console.error('Failed to update item:', err);
      setError(err.message || 'Failed to update item');
    } finally {
      setUpdating(false);
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      setUpdating(true);
      console.log('Removing cart item:', itemId);
      
      const updatedCart = await cartAPI.removeFromCart(itemId);
      console.log('Updated cart after removal:', updatedCart);
      
      setCart(updatedCart);
      validateCart();
    } catch (err) {
      console.error('Failed to remove item:', err);
      setError(err.message || 'Failed to remove item');
    } finally {
      setUpdating(false);
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('Are you sure you want to clear your cart?')) {
      return;
    }

    try {
      setUpdating(true);
      console.log('Clearing cart...');
      
      await cartAPI.clearCart();
      console.log('Cart cleared successfully');
      
      setCart({ items: [], totalAmount: 0, totalItems: 0 });
      setValidationResult(null);
    } catch (err) {
      console.error('Failed to clear cart:', err);
      setError(err.message || 'Failed to clear cart');
    } finally {
      setUpdating(false);
    }
  };

  const handleProceedToCheckout = () => {
    if (validationResult && !validationResult.valid) {
      setError('Please resolve cart issues before proceeding to checkout');
      return;
    }
    navigate('/checkout');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          <ShoppingCart sx={{ mr: 2, verticalAlign: 'middle' }} />
          Shopping Cart
        </Typography>
        {cart && cart.items.length > 0 && (
          <Typography variant="h6" color="text.secondary">
            {cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''} in your cart
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

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Validation Issues */}
      {validationResult && validationResult.issues.length > 0 && (
        <Alert 
          severity={validationResult.valid ? "warning" : "error"} 
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle2" gutterBottom>
            Cart Issues:
          </Typography>
          <List dense>
            {validationResult.issues.map((issue, index) => (
              <ListItem key={index} sx={{ py: 0 }}>
                <ListItemText 
                  primary={issue.issue}
                  secondary={issue.packageTitle}
                />
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {cart && cart.items.length > 0 ? (
        <Grid container spacing={4}>
          {/* Cart Items */}
          <Grid item xs={12} md={8}>
            <Box sx={{ mb: 3 }}>
              {cart.items.map((item) => (
                <CartItem
                  key={item._id}
                  item={item}
                  onUpdateItem={handleUpdateItem}
                  onRemove={handleRemoveItem}
                  loading={updating}
                />
              ))}
            </Box>

            {/* Clear Cart Button */}
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={handleClearCart}
                disabled={updating}
              >
                Clear Cart
              </Button>
            </Box>
          </Grid>

          {/* Cart Summary */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 24 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Order Summary
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body1">
                    Subtotal ({cart.totalItems} item{cart.totalItems !== 1 ? 's' : ''}):
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                    {formatPrice(cart.totalAmount)}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Taxes & Fees:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Calculated at checkout
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Total:
                </Typography>
                <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>
                  {formatPrice(cart.totalAmount)}
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                fullWidth
                endIcon={<ArrowForward />}
                onClick={handleProceedToCheckout}
                disabled={updating || (validationResult && !validationResult.valid)}
                sx={{ mb: 2 }}
              >
                Proceed to Checkout
              </Button>

              <Button
                variant="outlined"
                size="large"
                fullWidth
                onClick={() => navigate('/packages')}
              >
                Continue Shopping
              </Button>

              {/* Security Notice */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CheckCircle color="success" fontSize="small" sx={{ mr: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Secure Checkout
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Your payment information is encrypted and secure. We never store your credit card details.
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      ) : (
        /* Empty Cart */
        <Paper elevation={2} sx={{ p: 6, textAlign: 'center' }}>
          <ShoppingBag sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
            Your cart is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Looks like you haven't added any travel packages to your cart yet.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<ShoppingCart />}
            onClick={() => navigate('/packages')}
          >
            Start Shopping
          </Button>
        </Paper>
      )}
    </Container>
  );
};

export default Cart;
