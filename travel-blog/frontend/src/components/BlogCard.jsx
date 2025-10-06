import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  CardActions,
  Button,
  Tooltip
} from '@mui/material';
import {
  ChatBubbleOutline,
  LocationOn,
  CalendarToday,
  Visibility
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import LikeButton from '../features/social/LikeButton';
import ShareButton from '../features/social/ShareButton';
import { getBlogLikeStatus } from '../api/blogs';

const BlogCard = ({ blog, onLike, onShare, showAuthor = true }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [initialLiked, setInitialLiked] = useState(false);
  const [initialLikeCount, setInitialLikeCount] = useState(blog.likesCount || 0);

  useEffect(() => {
    // Check if user has liked this blog
    if (user && blog._id) {
      checkLikeStatus();
    }
  }, [user, blog._id]);

  const checkLikeStatus = async () => {
    try {
      const response = await getBlogLikeStatus(blog._id);
      setInitialLiked(response.isLiked);
      setInitialLikeCount(response.likeCount);
    } catch (error) {
      console.error('Error checking like status:', error);
    }
  };

  const handleCardClick = () => {
    navigate(`/blogs/${blog._id}`);
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    navigate(`/users/${blog.author._id}`);
  };

  return (
    <Card 
      sx={{ 
        maxWidth: 400, 
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
        },
        transition: 'all 0.3s ease-in-out'
      }}
      onClick={handleCardClick}
    >
      {blog.images && blog.images.length > 0 && (
        <CardMedia
          component="img"
          height="200"
          image={blog.images[0]}
          alt={blog.title}
          sx={{
            objectFit: 'cover'
          }}
        />
      )}
      
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h6" 
            component="h2" 
            sx={{ 
              fontWeight: 600,
              lineHeight: 1.3,
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {blog.title}
          </Typography>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 2
            }}
          >
            {blog.excerpt || blog.content}
          </Typography>
        </Box>

        {/* Categories */}
        {blog.categories && blog.categories.length > 0 && (
          <Box sx={{ mb: 2 }}>
            {blog.categories.slice(0, 2).map((category, index) => (
              <Chip
                key={index}
                label={category.name || category}
                size="small"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
            {blog.categories.length > 2 && (
              <Chip
                label={`+${blog.categories.length - 2}`}
                size="small"
                variant="outlined"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            )}
          </Box>
        )}

        {/* Location */}
        {blog.location && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOn sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {blog.location.name || `${blog.location.coordinates[1]}, ${blog.location.coordinates[0]}`}
            </Typography>
          </Box>
        )}

        {/* Author Info */}
        {showAuthor && blog.author && (
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 1,
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 }
            }}
            onClick={handleAuthorClick}
          >
            <Avatar 
              src={blog.author.profilePicture} 
              sx={{ width: 24, height: 24, mr: 1 }}
            >
              {blog.author.name?.charAt(0)}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              {blog.author.name}
            </Typography>
          </Box>
        )}

        {/* Date */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <CalendarToday sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LikeButton
              targetType="Blog"
              targetId={blog._id}
              initialLiked={initialLiked}
              initialCount={initialLikeCount}
              size="small"
              variant="icon"
              showCount={false}
            />
            <Typography variant="caption" sx={{ mr: 1 }}>
              {initialLikeCount}
            </Typography>

            <Tooltip title="Comments">
              <IconButton size="small">
                <ChatBubbleOutline fontSize="small" />
              </IconButton>
            </Tooltip>
            <Typography variant="caption" sx={{ mr: 1 }}>
              {blog.commentsCount || 0}
            </Typography>

            <Tooltip title="Views">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Visibility sx={{ fontSize: 16, mr: 0.5, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {blog.views || 0}
                </Typography>
              </Box>
            </Tooltip>
          </Box>

          <ShareButton
            targetType="Blog"
            targetId={blog._id}
            title={blog.title}
            description={blog.excerpt || blog.content?.substring(0, 150) + '...'}
            imageUrl={blog.featuredImage}
            url={`${window.location.origin}/blogs/${blog._id}`}
            size="small"
            variant="icon"
          />
        </Box>
      </CardActions>
    </Card>
  );
};

export default BlogCard;