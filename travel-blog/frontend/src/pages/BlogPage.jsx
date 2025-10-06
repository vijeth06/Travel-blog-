import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  IconButton,
  Button,
  Grid,
  CircularProgress,
  Alert,
  CardMedia,
  Stack
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Bookmark,
  BookmarkBorder,
  Share,
  LocationOn,
  CalendarToday,
  Visibility,
  Comment,
  Person
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { getBlogById, likeBlog, unlikeBlog, bookmarkBlog, unbookmarkBlog } from '../api/blogs';
import CommentSection from '../features/comments/CommentSection';

const BlogPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const response = await getBlogById(id);
        const blogData = response.data || response;
        setBlog(blogData);
        setLikesCount(blogData.likesCount || 0);
        
        if (user) {
          setIsLiked(blogData.likes?.includes(user.id) || false);
          setIsBookmarked(user.bookmarkedBlogs?.includes(id) || false);
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id, user]);

  const handleLike = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isLiked) {
        await unlikeBlog(id);
        setIsLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        await likeBlog(id);
        setIsLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      if (isBookmarked) {
        await unbookmarkBlog(id);
        setIsBookmarked(false);
      } else {
        await bookmarkBlog(id);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog.title,
          text: blog.excerpt || blog.content?.substring(0, 100),
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
      // Could show a toast notification here
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !blog) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Blog post not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Blog Header */}
      <Card sx={{ mb: 4 }}>
        {blog.images && blog.images.length > 0 && (
          <CardMedia
            component="img"
            height="400"
            image={blog.images[0]}
            alt={blog.title}
            sx={{ objectFit: 'cover' }}
          />
        )}
        
        <CardContent sx={{ p: 4 }}>
          {/* Categories */}
          {blog.categories && blog.categories.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {blog.categories.map((category, index) => (
                <Chip
                  key={index}
                  label={category}
                  size="small"
                  sx={{ mr: 1, mb: 1 }}
                  color="primary"
                />
              ))}
            </Box>
          )}

          {/* Title */}
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
              lineHeight: { xs: 1.2, md: 1.167 }
            }}
          >
            {blog.title}
          </Typography>

          {/* Author and Meta Info */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 3, 
            flexWrap: 'wrap', 
            gap: { xs: 1, md: 2 },
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' }
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} 
                 onClick={() => navigate(`/users/${blog.author._id}`)}>
              <Avatar src={blog.author.avatar} sx={{ width: 40, height: 40, mr: 1 }}>
                {blog.author.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {blog.author.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                </Typography>
              </Box>
            </Box>

            <Divider orientation="vertical" flexItem />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Visibility sx={{ fontSize: 16 }} />
                <Typography variant="caption">{blog.views || 0} views</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Comment sx={{ fontSize: 16 }} />
                <Typography variant="caption">{blog.commentsCount || 0} comments</Typography>
              </Box>
            </Box>

            {blog.location && (
              <>
                <Divider orientation="vertical" flexItem />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOn sx={{ fontSize: 16 }} />
                  <Typography variant="caption">{blog.location}</Typography>
                </Box>
              </>
            )}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            mb: 3,
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', sm: 'flex-start' }
          }}>
            <IconButton onClick={handleLike} color={isLiked ? "error" : "default"}>
              {isLiked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <Typography variant="body2">{likesCount}</Typography>

            <IconButton onClick={handleBookmark} color={isBookmarked ? "primary" : "default"}>
              {isBookmarked ? <Bookmark /> : <BookmarkBorder />}
            </IconButton>

            <IconButton onClick={handleShare}>
              <Share />
            </IconButton>

            {user && user.id === blog.author._id && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`/blogs/edit/${blog._id}`)}
                sx={{ 
                  ml: { xs: 0, sm: 'auto' },
                  mt: { xs: 1, sm: 0 },
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Edit Post
              </Button>
            )}
          </Box>

          {/* Content */}
          <Typography variant="body1" sx={{ lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
            {blog.content}
          </Typography>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Tags:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {blog.tags.map((tag, index) => (
                  <Chip
                    key={index}
                    label={`#${tag}`}
                    size="small"
                    variant="outlined"
                    clickable
                    onClick={() => navigate(`/blogs?tag=${tag}`)}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Additional Images */}
          {blog.images && blog.images.length > 1 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                More Photos:
              </Typography>
              <Grid container spacing={2}>
                {blog.images.slice(1).map((image, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="200"
                        image={image}
                        alt={`${blog.title} - Image ${index + 2}`}
                        sx={{ 
                          objectFit: 'cover',
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          '&:hover': {
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Comments ({blog.commentsCount || 0})
          </Typography>
          <CommentSection blogId={id} />
        </CardContent>
      </Card>
    </Container>
  );
};

export default BlogPage;