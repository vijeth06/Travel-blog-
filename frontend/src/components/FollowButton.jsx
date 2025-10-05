import React, { useState } from 'react';
import {
  Button,
  IconButton,
  CircularProgress,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  PersonAdd,
  PersonRemove,
  Notifications,
  NotificationsOff
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { followUser, unfollowUser } from '../api/users';

const FollowButton = ({ 
  userId, 
  isFollowing: initialIsFollowing = false, 
  variant = 'contained',
  size = 'medium',
  showIcon = true,
  onFollowChange
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleFollow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.id === userId) {
      setSnackbar({
        open: true,
        message: "You can't follow yourself!",
        severity: 'info'
      });
      return;
    }

    try {
      setLoading(true);
      
      if (isFollowing) {
        await unfollowUser(userId);
        setIsFollowing(false);
        setSnackbar({
          open: true,
          message: 'Successfully unfollowed user',
          severity: 'success'
        });
      } else {
        await followUser(userId);
        setIsFollowing(true);
        setSnackbar({
          open: true,
          message: 'Successfully followed user',
          severity: 'success'
        });
      }

      if (onFollowChange) {
        onFollowChange(isFollowing);
      }
    } catch (error) {
      console.error('Error following/unfollowing user:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update follow status',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (variant === 'icon') {
    return (
      <>
        <Tooltip title={isFollowing ? 'Unfollow' : 'Follow'}>
          <IconButton
            onClick={handleFollow}
            disabled={loading}
            color={isFollowing ? 'primary' : 'default'}
            size={size}
          >
            {loading ? (
              <CircularProgress size={20} />
            ) : isFollowing ? (
              <PersonRemove />
            ) : (
              <PersonAdd />
            )}
          </IconButton>
        </Tooltip>
        
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    );
  }

  return (
    <>
      <Button
        variant={variant}
        color={isFollowing ? 'inherit' : 'primary'}
        onClick={handleFollow}
        disabled={loading}
        size={size}
        startIcon={
          loading ? (
            <CircularProgress size={16} />
          ) : showIcon ? (
            isFollowing ? <PersonRemove /> : <PersonAdd />
          ) : null
        }
        sx={{
          ...(variant === 'contained' && !isFollowing && {
            background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #F7931E 30%, #FF6B35 90%)',
            }
          }),
          ...(isFollowing && {
            borderColor: 'grey.400',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'error.main',
              color: 'error.main',
              backgroundColor: 'error.50'
            }
          })
        }}
      >
        {loading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
      </Button>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FollowButton;
