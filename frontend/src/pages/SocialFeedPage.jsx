import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Skeleton,
  Button,
  Divider,
  Chip,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  PersonAdd,
  LocationOn,
  AccessTime
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import BlogCard from '../components/BlogCard';
import FollowButton from '../features/social/FollowButton';
import { getSocialFeed, getRecommendedUsers } from '../api/social';

const SocialFeedPage = () => {
  const [feedBlogs, setFeedBlogs] = useState([]);
  const [recommendedUsers, setRecommendedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedLoading, setFeedLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [socket, setSocket] = useState(null);
  const [newPostAlert, setNewPostAlert] = useState(null);

  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socketInstance = io(getSocketUrl(), {
      transports: ['websocket'],
      reconnection: true
    });

    socketInstance.on('connect', () => {
      console.log('✅ WebSocket connected:', socketInstance.id);
      // Join user's personal room for notifications
      if (user && (user.id || user._id)) {
        socketInstance.emit('join-user-room', user.id || user._id);
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
    });

    // Listen for new blog posts from followed users
    socketInstance.on('new-blog-post', (data) => {
      console.log('📝 New blog post received:', data);
      setNewPostAlert(data);
      // Add to feed if from followed user
      if (data.blog) {
        setFeedBlogs(prev => [data.blog, ...prev]);
      }
    });

    // Listen for blog updates (likes, comments)
    socketInstance.on('blog-updated', (data) => {
      console.log('🔄 Blog updated:', data);
      updateBlogInFeed(data.blogId, data.updates);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadInitialData();
  }, [isAuthenticated, navigate]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadSocialFeed(1, true),
        loadRecommendedUsers()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadSocialFeed = async (pageNum = 1, reset = false) => {
    try {
      setFeedLoading(true);
      const response = await getSocialFeed(pageNum, 10);
      const blogs = response.blogs || response.data?.blogs || [];

      if (reset) {
        setFeedBlogs(blogs);
      } else {
        setFeedBlogs(prev => [...prev, ...blogs]);
      }

      const pages = response.pages || response.data?.pages || 1;
      setHasMore(pageNum < pages);
      setPage(pageNum);
    } finally {
      setFeedLoading(false);
    }
  };

  const loadRecommendedUsers = async () => {
    try {
      const response = await getRecommendedUsers(5);
      setRecommendedUsers(response.users || response.data?.users || []);
    } catch (error) {
      console.error('Error loading recommended users:', error);
    }
  };

  const handleLoadMore = () => {
    if (!feedLoading && hasMore) {
      loadSocialFeed(page + 1, false);
    }
  };

  const handleFollowChange = () => {
    // Refresh recommended users and feed after following/unfollowing
    loadRecommendedUsers();
    loadSocialFeed(1, true); // Reload feed to include new followed user's posts
  };

  const updateBlogInFeed = (blogId, updates) => {
    setFeedBlogs(prev => prev.map(blog => 
      blog._id === blogId 
        ? { ...blog, ...updates, engagement: { ...blog.engagement, ...updates.engagement } }
        : blog
    ));
  };

  const handleCloseAlert = () => {
    setNewPostAlert(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {[...Array(3)].map((_, index) => (
              <Card key={index} sx={{ mb: 3 }}>
                <CardHeader
                  avatar={<Skeleton variant="circular" width={40} height={40} />}
                  title={<Skeleton variant="text" width="40%" />}
                  subheader={<Skeleton variant="text" width="20%" />}
                />
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" width="80%" />
                  <Skeleton variant="text" width="60%" />
                </CardContent>
              </Card>
            ))}
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2 }}>
              <Skeleton variant="text" width="60%" height={30} />
              {[...Array(3)].map((_, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="text" width="50%" />
                  </Box>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* New Post Alert */}
      <Snackbar
        open={!!newPostAlert}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseAlert} 
          severity="info" 
          sx={{ width: '100%' }}
          action={
            <Button color="inherit" size="small" onClick={() => {
              loadSocialFeed(1, true);
              handleCloseAlert();
            }}>
              VIEW
            </Button>
          }
        >
          {newPostAlert?.author?.name || 'Someone'} posted: "{newPostAlert?.blog?.title || 'New post'}"
        </Alert>
      </Snackbar>

      <Grid container spacing={3}>
        {/* Main Feed */}
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Your Social Feed
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Stay updated with travel stories from people you follow
            </Typography>
          </Box>

          {feedBlogs.length === 0 && !feedLoading ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Your feed is empty
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Start following other travelers to see their stories here, or explore all blogs to find interesting content.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/blogs')}
                >
                  Explore All Blogs
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/blogs/new')}
                >
                  Write Your First Story
                </Button>
              </Box>
            </Paper>
          ) : (
            <>
              <Grid container spacing={3}>
                {feedBlogs.map((blog) => (
                  <Grid item xs={12} key={blog._id}>
                    <BlogCard
                      blog={blog}
                      showAuthor
                    />
                  </Grid>
                ))}
              </Grid>

              {hasMore && (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                  <Button
                    onClick={handleLoadMore}
                    disabled={feedLoading}
                    variant="outlined"
                    size="large"
                  >
                    {feedLoading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Loading...
                      </>
                    ) : (
                      'Load More Stories'
                    )}
                  </Button>
                </Box>
              )}
            </>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Recommended Users */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonAdd sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Discover Travelers
              </Typography>
            </Box>

            {recommendedUsers.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No recommendations available
              </Typography>
            ) : (
              <List sx={{ p: 0 }}>
                {recommendedUsers.map((user, index) => (
                  <React.Fragment key={user._id}>
                    <ListItem
                      sx={{
                        px: 0,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'action.hover' },
                        borderRadius: 1
                      }}
                      onClick={() => navigate(`/users/${user._id}`)}
                    >
                      <ListItemAvatar>
                        <Avatar
                          src={user.avatar}
                          sx={{ width: 40, height: 40 }}
                        >
                          {user.name?.charAt(0)?.toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight={600}>
                            {user.name}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            {user.bio && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {user.bio.length > 50 ? `${user.bio.substring(0, 50)}...` : user.bio}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {user.followerCount || 0} followers • {user.postCount || 0} posts
                            </Typography>
                          </Box>
                        }
                      />
                      <FollowButton
                        userId={user._id}
                        userName={user.name}
                        size="small"
                        variant="chip"
                        onFollowChange={handleFollowChange}
                      />
                    </ListItem>
                    {index < recommendedUsers.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>

          {/* Trending Topics */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Trending Topics
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {[
                'Beach Destinations',
                'Mountain Hiking',
                'City Breaks',
                'Food Travel',
                'Adventure Sports',
                'Cultural Tours'
              ].map((topic) => (
                <Chip
                  key={topic}
                  label={topic}
                  size="small"
                  variant="outlined"
                  clickable
                  onClick={() => navigate(`/search?q=${encodeURIComponent(topic)}`)}
                  sx={{
                    '&:hover': {
                      bgcolor: 'primary.main',
                      color: 'white'
                    }
                  }}
                />
              ))}
            </Box>
          </Paper>

          {/* Quick Actions */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/blogs/new')}
                sx={{ justifyContent: 'flex-start' }}
              >
                ✍️ Write a Travel Story
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/packages')}
                sx={{ justifyContent: 'flex-start' }}
              >
                🏝️ Browse Travel Packages
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/map')}
                sx={{ justifyContent: 'flex-start' }}
              >
                🗺️ Explore Map
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/gamification')}
                sx={{ justifyContent: 'flex-start' }}
              >
                🏆 View Achievements
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default SocialFeedPage;