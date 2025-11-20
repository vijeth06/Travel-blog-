// Enhanced Authentication Context for React Frontend
// Example implementation showing best practices

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE = '/api/auth/v2';

  // Configure axios interceptor for automatic token refresh
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        // If access token expired, refresh it
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refreshToken');
            const response = await axios.post(`${API_BASE}/refresh-token`, {
              refreshToken
            });

            const newAccessToken = response.data.accessToken;
            setAccessToken(newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axios(originalRequest);
          } catch (refreshError) {
            // Refresh failed, logout user
            logout();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [accessToken]);

  // Register new user
  const register = async (userData) => {
    try {
      const response = await axios.post(`${API_BASE}/register`, userData);
      return {
        success: true,
        data: response.data,
        requiresVerification: response.data.requiresVerification
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
        validationErrors: error.response?.data?.errors
      };
    }
  };

  // Verify email with OTP
  const verifyEmail = async (email, otp) => {
    try {
      const response = await axios.post(`${API_BASE}/verify-email`, {
        email,
        otp
      });

      const { accessToken, refreshToken, user } = response.data;
      
      setAccessToken(accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Verification failed'
      };
    }
  };

  // Login
  const login = async (email, password, trustDevice = false) => {
    try {
      const response = await axios.post(`${API_BASE}/login`, {
        email,
        password,
        trustDevice
      });

      // Check if 2FA is required
      if (response.data.requires2FA) {
        return {
          success: true,
          requires2FA: true,
          userId: response.data.userId,
          method: response.data.method,
          suspicious: response.data.suspicious
        };
      }

      // Login successful
      const { accessToken, refreshToken, user } = response.data;
      
      setAccessToken(accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
        locked: error.response?.data?.locked,
        lockUntil: error.response?.data?.lockUntil,
        attemptsLeft: error.response?.data?.attemptsLeft
      };
    }
  };

  // Verify 2FA
  const verify2FA = async (userId, otp, trustDevice = false) => {
    try {
      const response = await axios.post(`${API_BASE}/verify-2fa`, {
        userId,
        otp,
        trustDevice
      });

      const { accessToken, refreshToken, user } = response.data;
      
      setAccessToken(accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || '2FA verification failed'
      };
    }
  };

  // Logout
  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await axios.post(`${API_BASE}/logout`, { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('refreshToken');
    }
  };

  // Logout from all devices
  const logoutAll = async () => {
    try {
      await axios.post(`${API_BASE}/logout-all`);
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('refreshToken');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Logout failed'
      };
    }
  };

  // Get active sessions
  const getSessions = async () => {
    try {
      const response = await axios.get(`${API_BASE}/sessions`);
      return {
        success: true,
        sessions: response.data.sessions
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch sessions'
      };
    }
  };

  // Revoke session
  const revokeSession = async (sessionId) => {
    try {
      await axios.delete(`${API_BASE}/sessions/${sessionId}`);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to revoke session'
      };
    }
  };

  // Enable 2FA
  const enable2FA = async (method = 'email') => {
    try {
      const response = await axios.post(`${API_BASE}/2fa/enable`, { method });
      return {
        success: true,
        backupCodes: response.data.backupCodes,
        method: response.data.method
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to enable 2FA'
      };
    }
  };

  // Disable 2FA
  const disable2FA = async (password) => {
    try {
      await axios.post(`${API_BASE}/2fa/disable`, { password });
      
      // Update user state
      if (user) {
        setUser({ ...user, twoFactorEnabled: false });
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to disable 2FA'
      };
    }
  };

  // Request password reset
  const requestPasswordReset = async (email) => {
    try {
      await axios.post(`${API_BASE}/password/reset-request`, { email });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Request failed'
      };
    }
  };

  // Reset password
  const resetPassword = async (email, otp, newPassword) => {
    try {
      await axios.post(`${API_BASE}/password/reset`, {
        email,
        otp,
        newPassword
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password reset failed',
        validationErrors: error.response?.data?.errors
      };
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      await axios.post(`${API_BASE}/password/change`, {
        currentPassword,
        newPassword
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Password change failed',
        validationErrors: error.response?.data?.errors
      };
    }
  };

  // Resend OTP
  const resendOTP = async (email, type = 'email_verification') => {
    try {
      await axios.post(`${API_BASE}/resend-otp`, { email, type });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to resend OTP'
      };
    }
  };

  // Update profile
  const updateProfile = async (updates) => {
    try {
      const response = await axios.put(`${API_BASE}/profile`, updates);
      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Profile update failed'
      };
    }
  };

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE}/refresh-token`, {
            refreshToken
          });

          setAccessToken(response.data.accessToken);
          setUser(response.data.user);
        } catch (error) {
          // Token invalid, clear storage
          localStorage.removeItem('refreshToken');
        }
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Handle Google OAuth callback
  const handleGoogleCallback = async (newAccessToken, newRefreshToken, userId) => {
    try {
      // Store tokens
      localStorage.setItem('refreshToken', newRefreshToken);
      setAccessToken(newAccessToken);

      // Fetch user profile
      const response = await axios.get(`${API_BASE}/profile`, {
        headers: { Authorization: `Bearer ${newAccessToken}` }
      });

      setUser(response.data.user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Google authentication failed'
      };
    }
  };

  const value = {
    user,
    accessToken,
    loading,
    isAuthenticated: !!user,
    register,
    verifyEmail,
    login,
    verify2FA,
    logout,
    logoutAll,
    getSessions,
    revokeSession,
    enable2FA,
    disable2FA,
    requestPasswordReset,
    resetPassword,
    changePassword,
    resendOTP,
    updateProfile,
    handleGoogleCallback
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
