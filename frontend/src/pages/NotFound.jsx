import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Home, ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          py: 8
        }}
      >
        <Typography
          variant="h1"
          sx={{
            fontSize: '8rem',
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 2
          }}
        >
          404
        </Typography>
        
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Oops! Page Not Found
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
          The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Button
            variant="contained"
            startIcon={<Home />}
            onClick={() => navigate('/')}
            sx={{
              background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
              boxShadow: '0 3px 15px 2px rgba(255, 107, 53, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #F7931E 30%, #FF6B35 90%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px 4px rgba(255, 107, 53, 0.4)',
              }
            }}
          >
            Go Home
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() => navigate(-1)}
            sx={{
              borderColor: '#1E88E5',
              color: '#1E88E5',
              borderWidth: '2px',
              '&:hover': {
                borderColor: '#1E88E5',
                backgroundColor: 'rgba(30, 136, 229, 0.05)',
                borderWidth: '2px',
              }
            }}
          >
            Go Back
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default NotFound;