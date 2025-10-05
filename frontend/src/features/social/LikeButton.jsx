import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Button,
  Typography,
  Box,
  Tooltip,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useSocket } from '../../hooks/useSocket';
import api from '../../api/api';

const LikeButton = ({ 
  targetType = 'Blog', 
  targetId, 
  initialLiked = false, 
  initialCount = 0, 
  size = 'medium',
  showCount = true,
  variant = 'icon' // 'icon' or 'button'
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const socket = useSocket();

  useEffect(() => {
    setLiked(initialLiked);
    setLikeCount(initialCount);
  }, [initialLiked, initialCount]);

  // Listen for real-time like updates
  useEffect(() => {
    if (socket.isSocketConnected() && targetId) {
      const handleLikeUpdate = (data) => {
        if (data.targetId === targetId && data.targetType === targetType) {
          setLikeCount(data.likeCount);
          // Only update liked state if it's the current user
          if (data.userId === user?.id) {
            setLiked(data.liked);
          }
        }
      };

      socket.on('like-updated', handleLikeUpdate);

      return () => {
        socket.off('like-updated', handleLikeUpdate);
      };
    }
  }, [socket, targetId, targetType, user?.id]);

  const handleLike = async () => {
    if (!isAuthenticated) {
      // Could show login prompt or redirect
      return;
    }

    if (loading) return;

    try {
      setLoading(true);
      const newLikedState = !liked;

      // Optimistic update
      setLiked(newLikedState);
      setLikeCount(prev => newLikedState ? prev + 1 : prev - 1);

      // API call
      const response = await api.post('/likes', {
        targetType,
        targetId
      });

      const { liked: serverLiked, likeCount: serverCount } = response.data;
      
      // Update with server response
      setLiked(serverLiked);
      setLikeCount(serverCount);

      // Emit socket event for real-time updates
      if (socket.isSocketConnected()) {
        socket.emit('new-like', {
          targetType,
          targetId,
          userId: user.id,
          liked: serverLiked,
          likeCount: serverCount
        });
      }

    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update
      setLiked(!liked);
      setLikeCount(prev => liked ? prev + 1 : prev - 1);
    } finally {
      setLoading(false);
    }
  };

  const LikeIcon = () => {
    if (loading) {
      return <CircularProgress size={size === 'small' ? 16 : 20} />;
    }
    return liked ? (
      <Favorite color="error" />
    ) : (
      <FavoriteBorder />
    );
  };

  if (variant === 'button') {
    return (
      <Button
        startIcon={<LikeIcon />}
        onClick={handleLike}
        disabled={loading || !isAuthenticated}
        size={size}
        sx={{
          color: liked ? 'error.main' : 'text.secondary',
          '&:hover': {
            backgroundColor: liked ? 'error.light' : 'action.hover'
          }
        }}
      >
        {showCount && likeCount > 0 && (
          <Typography variant="body2" sx={{ ml: 0.5 }}>
            {likeCount}
          </Typography>
        )}
      </Button>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Tooltip title={isAuthenticated ? (liked ? 'Unlike' : 'Like') : 'Login to like'}>
        <IconButton
          onClick={handleLike}
          disabled={loading || !isAuthenticated}
          size={size}
          sx={{
            color: liked ? 'error.main' : 'text.secondary',
            '&:hover': {
              backgroundColor: liked ? 'error.light' : 'action.hover'
            }
          }}
        >
          <Badge
            badgeContent={showCount && likeCount > 0 ? likeCount : null}
            color="error"
            sx={{
              '& .MuiBadge-badge': {
                fontSize: '0.75rem',
                minWidth: '16px',
                height: '16px'
              }
            }}
          >
            <LikeIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      {showCount && variant === 'icon' && likeCount > 0 && (
        <Typography variant="body2" color="text.secondary">
          {likeCount}
        </Typography>
      )}
    </Box>
  );
};

export default LikeButton;
