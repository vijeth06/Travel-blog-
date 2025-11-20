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
import { Person, Email, Lock, PersonAdd } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../redux/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import GoogleAuthButton from '../../components/GoogleAuthButton';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
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
    
    // Basic validation
    if (!form.name || !form.email || !form.password) {
      return;
    }
    
    if (form.password.length < 6) {
      return;
    }
    
    try {
      const result = await dispatch(registerUser(form)).unwrap();
      // Redirect to home page instead of dashboard
      navigate('/');
    } catch (err) {
      // Error is handled by Redux
      console.error('Registration failed:', err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Join Our Community
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Start sharing your travel adventures today
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

        {/* Google Sign Up */}
        <GoogleAuthButton mode="signup" />

        <Divider sx={{ my: 3 }}>
          <Typography variant="body2" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            name="name"
            label="Full Name"
            value={form.name}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Person />
                </InputAdornment>
              ),
            }}
          />
          
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
            disabled={loading}
            startIcon={loading ? null : <PersonAdd />}
            sx={{ 
              backgroundColor: '#2E7D32',
              mb: 2,
              '&:hover': { backgroundColor: '#1B5E20' }
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
          
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#2E7D32', textDecoration: 'none' }}>
                Sign in here
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}
