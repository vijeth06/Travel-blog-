import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Business
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

const UnifiedLogin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0); // 0 = Traveler/Blogger, 1 = Provider
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [travelerForm, setTravelerForm] = useState({
    email: '',
    password: ''
  });

  const [providerForm, setProviderForm] = useState({
    email: '',
    password: ''
  });

  const handleTravelerChange = (e) => {
    setTravelerForm({ ...travelerForm, [e.target.name]: e.target.value });
  };

  const handleProviderChange = (e) => {
    setProviderForm({ ...providerForm, [e.target.name]: e.target.value });
  };

  const handleTravelerLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(travelerForm)
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user is actually a traveler/blogger (not package provider)
        if (data.user.role === 'package_provider') {
          setError('Please use the Package Provider login tab');
          setLoading(false);
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Redirect based on role
        if (data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } else {
        setError(data.msg || data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProviderLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(providerForm)
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user is actually a package provider
        if (data.user.role !== 'package_provider') {
          setError('Please use the Traveler/Blogger login tab');
          setLoading(false);
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Show verification warning if not verified
        if (!data.user.providerInfo?.verified) {
          navigate('/provider/pending');
        } else {
          navigate('/provider/dashboard');
        }
      } else {
        setError(data.msg || data.message || 'Login failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Login to Travel Blog
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose your account type below
          </Typography>
        </Box>

        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab
            icon={<Person />}
            label="Traveler / Blogger"
            iconPosition="start"
          />
          <Tab
            icon={<Business />}
            label="Package Provider"
            iconPosition="start"
          />
        </Tabs>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Traveler/Blogger Login Form */}
        {activeTab === 0 && (
          <form onSubmit={handleTravelerLogin}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={travelerForm.email}
              onChange={handleTravelerChange}
              required
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={travelerForm.password}
              onChange={handleTravelerChange}
              required
              disabled={loading}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mb: 2 }}
            >
              {loading ? 'Logging in...' : 'Login as Traveler/Blogger'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link to="/register" style={{ textDecoration: 'none', color: '#1976d2' }}>
                  Register here
                </Link>
              </Typography>
            </Box>
          </form>
        )}

        {/* Package Provider Login Form */}
        {activeTab === 1 && (
          <form onSubmit={handleProviderLogin}>
            <TextField
              fullWidth
              label="Provider Email"
              name="email"
              type="email"
              value={providerForm.email}
              onChange={handleProviderChange}
              required
              disabled={loading}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={providerForm.password}
              onChange={handleProviderChange}
              required
              disabled={loading}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              color="secondary"
              sx={{ mb: 2 }}
            >
              {loading ? 'Logging in...' : 'Login as Package Provider'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2">
                Want to become a provider?{' '}
                <Link to="/provider/register" style={{ textDecoration: 'none', color: '#1976d2' }}>
                  Register here
                </Link>
              </Typography>
            </Box>
          </form>
        )}
      </Paper>
    </Container>
  );
};

export default UnifiedLogin;
