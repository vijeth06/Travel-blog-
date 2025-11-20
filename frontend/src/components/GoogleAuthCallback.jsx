import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../redux/authSlice';
import { getApiUrl } from '../config/api';
import axios from 'axios';

const GoogleAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const processCallback = async () => {
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      const userId = searchParams.get('userId');
      const error = searchParams.get('error');

      if (error) {
        // Handle error
        navigate('/login?error=' + error);
        return;
      }

      if (accessToken && refreshToken && userId) {
        try {
          // Store tokens in localStorage
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', refreshToken);

          // Fetch user profile
          const response = await axios.get(`${getApiUrl()}/auth/profile`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });

          // Update Redux store
          dispatch(setCredentials({
            user: response.data,
            token: accessToken
          }));

          // Redirect to home page
          navigate('/');
        } catch (err) {
          console.error('Error processing Google callback:', err);
          navigate('/login?error=auth_failed');
        }
      } else {
        navigate('/login?error=invalid_callback');
      }
    };

    processCallback();
  }, [searchParams, navigate, dispatch]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 2
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" color="text.secondary">
        Completing Google Sign In...
      </Typography>
    </Box>
  );
};

export default GoogleAuthCallback;
