import React, { useState } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Divider,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  CircularProgress
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  TravelExplore
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/EnhancedAuthContext';
import GoogleAuthButton from '../components/GoogleAuthButton';

const EnhancedLoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, verify2FA } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    trustDevice: false
  });

  const [show2FA, setShow2FA] = useState(false);
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(searchParams.get('error') || '');
  const [loading, setLoading] = useState(false);
  const [accountLocked, setAccountLocked] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(null);

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'trustDevice' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password, formData.trustDevice);

    if (result.success) {
      if (result.requires2FA) {
        setShow2FA(true);
        setUserId(result.userId);
        setError(result.suspicious ? 'Unusual activity detected. Please verify with 2FA.' : '');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
      setAccountLocked(result.locked);
      setAttemptsLeft(result.attemptsLeft);
    }

    setLoading(false);
  };

  const handle2FASubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await verify2FA(userId, otp, formData.trustDevice);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  if (show2FA) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <TravelExplore sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                Two-Factor Authentication
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Enter the 6-digit code sent to your email
              </Typography>
            </Box>

            {error && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handle2FASubmit}>
              <TextField
                fullWidth
                label="Verification Code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                required
                inputProps={{ 
                  maxLength: 6,
                  style: { textAlign: 'center', fontSize: '24px', letterSpacing: '8px' }
                }}
                sx={{ mb: 2 }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.trustDevice}
                    onChange={(e) => setFormData({ ...formData, trustDevice: e.target.checked })}
                    name="trustDevice"
                  />
                }
                label="Trust this device for 30 days"
                sx={{ mb: 2 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || otp.length !== 6}
                sx={{ mb: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify & Sign In'}
              </Button>

              <Button
                fullWidth
                variant="text"
                onClick={() => setShow2FA(false)}
              >
                Back to Login
              </Button>
            </form>
          </Paper>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <TravelExplore sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign in to continue your travel journey
            </Typography>
          </Box>

          {/* Google Sign In */}
          <GoogleAuthButton mode="signin" />

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR
            </Typography>
          </Divider>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity={accountLocked ? "error" : "warning"} 
              sx={{ mb: 2 }}
            >
              {error}
              {attemptsLeft !== null && !accountLocked && (
                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                  {attemptsLeft} attempt(s) remaining
                </Typography>
              )}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={accountLocked}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              disabled={accountLocked}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 1 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.trustDevice}
                    onChange={handleChange}
                    name="trustDevice"
                    disabled={accountLocked}
                  />
                }
                label="Remember me"
              />
              <Link component={RouterLink} to="/forgot-password" variant="body2">
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || accountLocked}
              sx={{ mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </form>

          {/* Sign Up Link */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link component={RouterLink} to="/register" fontWeight="bold">
                Sign Up
              </Link>
            </Typography>
          </Box>

          {/* Security Info */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" display="block">
              🔒 Secured with enterprise-grade encryption
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              🛡️ Two-factor authentication available
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default EnhancedLoginPage;
