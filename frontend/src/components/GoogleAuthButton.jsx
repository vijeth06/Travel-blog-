import React from 'react';
import { Button } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import { getApiUrl } from '../config/api';

const GoogleAuthButton = ({ mode = 'signin', fullWidth = true }) => {
  const handleGoogleAuth = () => {
    // Redirect to backend Google OAuth endpoint
    const baseUrl = getApiUrl();
    window.location.href = `${baseUrl}/auth/v2/google`;
  };

  const buttonText = mode === 'signin' ? 'Continue with Google' : 'Sign up with Google';

  return (
    <Button
      variant="outlined"
      fullWidth={fullWidth}
      onClick={handleGoogleAuth}
      startIcon={<GoogleIcon />}
      sx={{
        borderColor: '#dadce0',
        color: '#3c4043',
        textTransform: 'none',
        fontSize: '14px',
        fontWeight: 500,
        padding: '10px 24px',
        '&:hover': {
          borderColor: '#d2e3fc',
          backgroundColor: '#f8f9fa'
        },
        '& .MuiButton-startIcon': {
          marginRight: '12px'
        }
      }}
    >
      {buttonText}
    </Button>
  );
};

export default GoogleAuthButton;
