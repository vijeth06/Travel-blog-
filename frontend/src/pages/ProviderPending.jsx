import React from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Alert,
  Button
} from '@mui/material';
import {
  Pending,
  AccessTime,
  Business
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProviderPending = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
          <Pending sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Account Pending Verification
          </Typography>
        </Box>

        <Alert severity="warning" sx={{ mb: 3, textAlign: 'left' }}>
          <Typography variant="h6" gutterBottom>
            <AccessTime sx={{ verticalAlign: 'middle', mr: 1 }} />
            Your account is awaiting admin approval
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Thank you for registering as a package provider! Our admin team is currently reviewing your application.
          </Typography>
        </Alert>

        <Box sx={{ bgcolor: 'background.default', p: 3, borderRadius: 1, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            <Business sx={{ verticalAlign: 'middle', mr: 1 }} />
            Your Information
          </Typography>
          <Box sx={{ textAlign: 'left', mt: 2 }}>
            <Typography variant="body1"><strong>Name:</strong> {user.name}</Typography>
            <Typography variant="body1"><strong>Email:</strong> {user.email}</Typography>
            <Typography variant="body1"><strong>Company:</strong> {user.providerInfo?.companyName}</Typography>
            <Typography variant="body1"><strong>License:</strong> {user.providerInfo?.businessLicense}</Typography>
            <Typography variant="body1" sx={{ mt: 2 }}>
              <strong>Status:</strong>{' '}
              <span style={{ color: '#ed6c02' }}>⏳ Pending Verification</span>
            </Typography>
          </Box>
        </Box>

        <Box sx={{ bgcolor: 'info.light', p: 2, borderRadius: 1, mb: 3 }}>
          <Typography variant="body2" color="info.dark">
            <strong>What happens next?</strong>
          </Typography>
          <Typography variant="body2" color="info.dark" sx={{ mt: 1 }}>
            1. Admin will review your business license and company information<br />
            2. You'll receive an email notification once verified<br />
            3. After verification, you can create and manage travel packages<br />
            4. Your packages will be visible to all travelers
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          <strong>Estimated Review Time:</strong> 1-2 business days
        </Typography>

        <Button
          variant="outlined"
          onClick={handleLogout}
          sx={{ mt: 2 }}
        >
          Logout
        </Button>
      </Paper>
    </Container>
  );
};

export default ProviderPending;
