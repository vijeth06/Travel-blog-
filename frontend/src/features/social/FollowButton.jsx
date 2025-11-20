import React, { useState, useEffect } from 'react';
import {
  Button,
  IconButton,
  Typography,
  Box,
  Tooltip,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  PersonAdd,
  PersonRemove,
  Check
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useSocket } from '../../hooks/useSocket';
import api from '../../api/api';

const FollowButton = ({ 
  userId, 
  userName = '',
  initialFollowing = false,
  size = 'medium',
  variant = 'button', // 'button', 'icon', or 'chip'
  showFollowerCount = false,
  onFollowChange = null
}) => {
  const [following, setFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const socket = useSocket();

  // Don't show follow button for own profile
  const isOwnProfile = user?.id === userId;

  useEffect(() => {
    setFollowing(initialFollowing);
    if (showFollowerCount) {
      fetchFollowerCount();
    }
    // Also fetch following status from backend to ensure accuracy
    if (isAuthenticated && userId) {
      fetchFollowingStatus();
    }
  }, [initialFollowing, userId, showFollowerCount, isAuthenticated]);

  // Listen for real-time follow updates
  useEffect(() => {
    if (socket.isSocketConnected() && userId) {
      const handleFollowUpdate = (data) => {
        if (data.followedUserId === userId) {
          setFollowerCount(data.followerCount);
          // Only update following state if it's the current user who followed/unfollowed
          if (data.followerId === user?.id) {
            setFollowing(data.following);
          }
        }
      };

      socket.on('follow-updated', handleFollowUpdate);

      return () => {
        socket.off('follow-updated', handleFollowUpdate);
      };
    }
  }, [socket, userId, user?.id]);

  const fetchFollowerCount = async () => {
    try {
      const response = await api.get(`/follow/followers/${userId}`);
      const count = response.data?.data?.total || response.data?.total || response.data?.count;
      if (typeof count === 'number') {
        setFollowerCount(count);
      }
    } catch (error) {
      console.error('Error fetching follower count:', error);
    }
  };

  const fetchFollowingStatus = async () => {
    try {
      const response = await api.get(`/follow/status/${userId}`);
      const isFollowingServer = response.data?.data?.following ?? response.data?.following;
      if (typeof isFollowingServer === 'boolean') {
        setFollowing(isFollowingServer);
      }
    } catch (error) {
      console.error('Error fetching following status:', error);
    }
  };

  const handleFollow = async () => {
    if (!isAuthenticated || isOwnProfile || loading) return;

    try {
      setLoading(true);
      // API call - toggle follow status via follow service
      const response = await api.post('/follow/toggle', { userId });

      const serverFollowing = response.data?.data?.following ?? response.data?.following;
      const serverCount = response.data?.data?.followerCount ?? response.data?.followerCount;
      
      // Update with server response
      setFollowing(serverFollowing);
      if (showFollowerCount && serverCount !== undefined) {
        setFollowerCount(serverCount);
      }

      // Emit socket event for real-time updates
      if (socket.isSocketConnected()) {
        socket.emit('follow-action', {
          followerId: user.id,
          followedUserId: userId,
          following: serverFollowing,
          followerCount: serverCount || followerCount
        });
      }

      // Callback for parent component
      if (onFollowChange) {
        onFollowChange(serverFollowing, serverCount || followerCount);
      }

    } catch (error) {
      console.error('Error toggling follow:', error);
      // On error, refetch status/count to stay consistent
      fetchFollowingStatus();
      if (showFollowerCount) {
        fetchFollowerCount();
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't render for own profile
  if (isOwnProfile || !userId) {
    return null;
  }

  const buttonProps = {
    onClick: handleFollow,
    disabled: loading || !isAuthenticated,
    size
  };

  const LoadingIcon = () => (
    loading ? <CircularProgress size={16} /> : null
  );

  if (variant === 'icon') {
    return (
      <Tooltip title={isAuthenticated ? (following ? 'Unfollow' : 'Follow') : 'Login to follow'}>
        <IconButton {...buttonProps}>
          {loading ? (
            <CircularProgress size={20} />
          ) : following ? (
            <PersonRemove />
          ) : (
            <PersonAdd />
          )}
        </IconButton>
      </Tooltip>
    );
  }

  if (variant === 'chip') {
    return (
      <Chip
        icon={following ? <Check /> : <PersonAdd />}
        label={following ? 'Following' : 'Follow'}
        onClick={handleFollow}
        disabled={loading || !isAuthenticated}
        variant={following ? 'filled' : 'outlined'}
        color={following ? 'primary' : 'default'}
        size={size}
      />
    );
  }

  // Default button variant
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Button
        {...buttonProps}
        variant={following ? 'outlined' : 'contained'}
        color={following ? 'inherit' : 'primary'}
        startIcon={loading ? (
          <CircularProgress size={16} />
        ) : following ? (
          <Check />
        ) : (
          <PersonAdd />
        )}
        sx={{
          minWidth: 100,
          textTransform: 'none',
          borderRadius: 2,
          ...(following && {
            '&:hover': {
              backgroundColor: 'error.light',
              borderColor: 'error.main',
              color: 'error.main',
              '& .MuiButton-startIcon': {
                transform: 'rotate(0deg)'
              }
            }
          })
        }}
      >
        {following ? 'Following' : 'Follow'}
      </Button>
      
      {showFollowerCount && followerCount > 0 && (
        <Typography variant="body2" color="text.secondary">
          {followerCount} follower{followerCount !== 1 ? 's' : ''}
        </Typography>
      )}
    </Box>
  );
};

export default FollowButton;
