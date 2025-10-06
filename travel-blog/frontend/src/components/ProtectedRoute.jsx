import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { getUserProfile } from '../redux/authSlice';
import { CircularProgress, Box, Container } from '@mui/material';

const ProtectedRoute = ({ children }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { user, isAuthenticated, token, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    // If we have a token but no user data, fetch the profile
    if (token && !user && !loading) {
      dispatch(getUserProfile());
    }
  }, [dispatch, token, user, loading]);

  // Show loading while checking authentication
  if (loading || (token && !user)) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={60} />
          <div>Loading...</div>
        </Box>
      </Container>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default ProtectedRoute;