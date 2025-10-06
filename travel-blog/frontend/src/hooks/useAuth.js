import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile, setCredentials } from '../redux/authSlice';
import socketService from '../services/socketService';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is logged in on app start
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken && !user) {
        try {
          await dispatch(getUserProfile()).unwrap();
        } catch (error) {
          console.error('Failed to get user profile:', error);
          localStorage.removeItem('token');
        }
      }
    };

    initializeAuth();
  }, [dispatch, user]);

  useEffect(() => {
    // Initialize socket connection when user is authenticated
    if (isAuthenticated && user) {
      socketService.connect(user.id);
    } else {
      socketService.disconnect();
    }

    return () => {
      if (!isAuthenticated) {
        socketService.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  const login = (userData) => {
    dispatch(setCredentials(userData));
    socketService.connect(userData.user.id);
  };

  const logout = () => {
    localStorage.removeItem('token');
    socketService.disconnect();
    window.location.href = '/login';
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
  };
};

export default useAuth;