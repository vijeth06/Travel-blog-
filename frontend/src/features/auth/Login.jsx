import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert,
  InputAdornment,
  Divider
} from '@mui/material';
import { Email, Lock, Login as LoginIcon } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { getApiUrl } from '../../config/api';
import GoogleAuthButton from '../../components/GoogleAuthButton';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [connectionTest, setConnectionTest] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { loading, error } = useSelector((state) => state.auth);

  // Test API connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/auth/profile`);
        if (response.status === 401) {
          setConnectionTest('✅ Server is running and ready');
        } else {
          setConnectionTest('✅ Server is running');
        }
      } catch (err) {
        setConnectionTest('❌ Cannot connect to server - Please start the backend');
        console.error('Connection test failed:', err);
      }
    };
    testConnection();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const result = await dispatch(loginUser(form)).unwrap();
      
      // Role-based redirect
      if (result.user) {
        const role = result.user.role;
        
        if (role === 'admin') {
          navigate('/admin');
        } else if (role === 'package_provider') {
          // Check if provider is verified
          if (result.user.providerInfo?.verified) {
            navigate('/provider/dashboard');
          } else {
            navigate('/provider/pending');
          }
        } else if (role === 'author') {
          navigate('/dashboard');
        } else {
          // visitor or other roles
          navigate('/dashboard');
        }
      } else {
        // Fallback if no user data
        navigate('/');
      }
    } catch (err) {
      // Error is handled by Redux
      console.error('Login failed:', err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Sign in to continue your travel journey
          </Typography>
        </Box>

        {connectionTest && (
          <Alert 
            severity={connectionTest.includes('✅') ? 'success' : connectionTest.includes('⚠️') ? 'warning' : 'error'} 
            sx={{ mb: 2 }}
          >
            {connectionTest}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Google Sign In */}
        <GoogleAuthButton mode="signin" />

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            name="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Email />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            fullWidth
            name="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            startIcon={<LoginIcon />}
            disabled={loading}
            sx={{ 
              backgroundColor: '#2E7D32',
              mb: 2,
              '&:hover': { backgroundColor: '#1B5E20' }
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#2E7D32', textDecoration: 'none' }}>
                Sign up here
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}
