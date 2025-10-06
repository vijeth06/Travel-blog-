import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Typography,
  Box,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LikeButton = ({ 
  targetType, 
  targetId, 
  initialLiked = false, 
  initialCount = 0,
  size = 'medium',
  showCount = true,
  color = 'error'
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLiked(initialLiked);
    setLikeCount(initialCount);
  }, [initialLiked, initialCount]);

  const handleLike = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/likes/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetType,
          targetId
        })
      });

      const data = await response.json();

      if (response.ok) {
        setLiked(data.liked);
        setLikeCount(data.likeCount);
      } else {
        console.error('Like toggle failed:', data.message);
      }
    } catch (error) {
      console.error('Like error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCount = (count) => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Tooltip title={liked ? 'Unlike' : 'Like'}>
        <IconButton
          onClick={handleLike}
          disabled={loading}
          size={size}
          color={liked ? color : 'default'}
          sx={{
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}
        >
          {loading ? (
            <CircularProgress size={size === 'small' ? 16 : 24} />
          ) : liked ? (
            <Favorite />
          ) : (
            <FavoriteBorder />
          )}
        </IconButton>
      </Tooltip>
      
      {showCount && (
        <Typography 
          variant={size === 'small' ? 'caption' : 'body2'} 
          color="text.secondary"
          sx={{ 
            minWidth: '20px',
            fontWeight: liked ? 'bold' : 'normal',
            color: liked ? `${color}.main` : 'text.secondary'
          }}
        >
          {formatCount(likeCount)}
        </Typography>
      )}
    </Box>
  );
};

export default LikeButton;
