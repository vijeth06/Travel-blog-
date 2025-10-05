import React from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const DashboardTest = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Dashboard Test Page
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        This is a simple test to check if the dashboard route works.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button variant="contained" component={Link} to="/dashboard">
          Go to Full Dashboard
        </Button>
        <Button variant="outlined" component={Link} to="/">
          Go Home
        </Button>
      </Box>
    </Container>
  );
};

export default DashboardTest;