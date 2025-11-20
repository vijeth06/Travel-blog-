import React, { useState, useEffect } from 'react';
import { getUserBookmarks, removeBookmark } from '../api/bookmarks';
import { getBlogs } from '../api/blogs';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  Paper,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Alert
} from '@mui/material';
import {
  Bookmark,
  BookmarkBorder,
  Visibility,
  ThumbUp,
  Comment,
  Share,
  Delete,
  Edit,
  ArrowBack
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';

const SavedStories = () => {
  const [savedStories, setSavedStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Fetch real saved stories from bookmarks
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchSavedStories = async () => {
      setLoading(true);
      try {
        // Fetch bookmarks
        const bookmarksData = await getUserBookmarks(null, 'blog');
        
        // If bookmarks contain populated blog data
        if (bookmarksData && Array.isArray(bookmarksData)) {
          const stories = bookmarksData.map(bookmark => ({
            id: bookmark._id,
            blogId: bookmark.targetId?._id || bookmark.targetId,
            title: bookmark.title || bookmark.targetId?.title || 'Untitled',
            excerpt: bookmark.targetId?.excerpt || bookmark.targetId?.content?.substring(0, 150) || '',
            author: bookmark.targetId?.author?.name || 'Unknown',
            image: bookmark.targetId?.coverImage || 'https://source.unsplash.com/800x400/?travel',
            savedDate: bookmark.createdAt,
            views: bookmark.targetId?.views || 0,
            likes: bookmark.targetId?.likesCount || 0,
            comments: bookmark.targetId?.commentsCount || 0,
            category: bookmark.targetId?.category?.name || 'Travel'
          }));
          setSavedStories(stories);
        }
      } catch (error) {
        console.error('Failed to fetch saved stories:', error);
        setSavedStories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedStories();
  }, [isAuthenticated, navigate]);

  const handleRemoveFromSaved = async (storyId) => {
    try {
      await removeBookmark(storyId);
      setSavedStories(prev => prev.filter(story => story.id !== storyId));
    } catch (error) {
      console.error('Failed to remove bookmark:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading your saved stories...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton 
            component={Link} 
            to="/dashboard" 
            sx={{ color: 'white' }}
          >
            <ArrowBack />
          </IconButton>
          <Bookmark sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" component="h1">
              Saved Stories
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Your bookmarked travel stories and inspiration
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip 
            label={`${savedStories.length} Stories Saved`} 
            variant="outlined" 
            sx={{ color: 'white', borderColor: 'white' }}
          />
          <Chip 
            label="All Categories" 
            variant="outlined" 
            sx={{ color: 'white', borderColor: 'white' }}
          />
        </Box>
      </Paper>

      {savedStories.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Bookmark sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Saved Stories Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Start exploring and save stories that inspire your next adventure!
          </Typography>
          <Button
            component={Link}
            to="/blogs"
            variant="contained"
            size="large"
          >
            Explore Stories
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {savedStories.map((story) => (
            <Grid item xs={12} md={6} lg={4} key={story.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={story.image}
                  alt={story.title}
                />
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                    <Chip 
                      label={story.category} 
                      size="small" 
                      color="primary" 
                    />
                    <Typography variant="caption" color="text.secondary">
                      Saved {story.savedDate}
                    </Typography>
                  </Box>
                  
                  <Typography variant="h6" component="h3" gutterBottom>
                    {story.title}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {story.excerpt}
                  </Typography>
                  
                  <Typography variant="caption" color="text.secondary">
                    By {story.author}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Visibility fontSize="small" />
                      <Typography variant="caption">{story.views}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <ThumbUp fontSize="small" />
                      <Typography variant="caption">{story.likes}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Comment fontSize="small" />
                      <Typography variant="caption">{story.comments}</Typography>
                    </Box>
                  </Box>
                </CardContent>
                
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    <Button size="small" startIcon={<Visibility />}>
                      Read
                    </Button>
                    <IconButton size="small">
                      <Share />
                    </IconButton>
                  </Box>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleRemoveFromSaved(story.id)}
                  >
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            component={Link}
            to="/blogs"
            variant="outlined"
            startIcon={<Bookmark />}
          >
            Find More Stories
          </Button>
          <Button
            component={Link}
            to="/blogs/new"
            variant="outlined"
            startIcon={<Edit />}
          >
            Write Your Story
          </Button>
          <Button
            component={Link}
            to="/dashboard"
            variant="outlined"
            startIcon={<ArrowBack />}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SavedStories;