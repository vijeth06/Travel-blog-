import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Paper,
  Chip,
  Avatar,
  Stack
} from '@mui/material';
import {
  FlightTakeoff,
  Visibility,
  Favorite,
  Group,
  Create,
  Analytics,
  Settings
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { getProfile } from '../api/auth';
import { getBlogs } from '../api/blogs';

const SimpleDashboard = () => {
  const [user, setUser] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
    followers: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Load user profile
    getProfile()
      .then(res => {
        if (res && res.data) {
          setUser(res.data);
        }
      })
      .catch(() => {
        navigate('/login');
      });

    // Load blogs
    getBlogs()
      .then(res => {
        if (res && res.data && res.data.blogs) {
          const blogData = res.data.blogs;
          setBlogs(blogData.slice(0, 6));
          
          // Calculate stats
          const totalViews = blogData.reduce((sum, blog) => sum + (blog.views || 0), 0);
          const totalLikes = blogData.reduce((sum, blog) => sum + (blog.likesCount || 0), 0);
          
          // Get real follower count from user profile
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          const followersCount = user.followers?.length || 0;
          
          setStats({
            totalBlogs: blogData.length,
            totalViews,
            totalLikes,
            followers: followersCount
          });
        }
      })
      .catch(err => {
        console.error('Failed to load blogs:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
          Welcome back, {user?.name || 'Traveler'}! 🌟
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Here's your travel blog dashboard
        </Typography>
        
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<Create />}
            component={Link}
            to="/blogs/new"
            sx={{ borderRadius: 25 }}
          >
            Write New Story
          </Button>
          <Button
            variant="outlined"
            startIcon={<Analytics />}
            sx={{ borderRadius: 25 }}
          >
            View Analytics
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <FlightTakeoff sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                {stats.totalBlogs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Stories Published
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Visibility sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                {stats.totalViews.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Views
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Favorite sx={{ fontSize: 40, color: 'error.main', mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                {stats.totalLikes}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Likes
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Group sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" fontWeight={700}>
                {stats.followers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Followers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Blogs */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom fontWeight={700}>
          Recent Stories ({blogs.length})
        </Typography>
        
        {blogs.length > 0 ? (
          <Grid container spacing={3}>
            {blogs.map((blog, index) => (
              <Grid item xs={12} md={6} key={blog._id || index}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom noWrap>
                      {blog.title || 'Untitled'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {blog.excerpt || (blog.content && blog.content.substring(0, 100) + '...') || 'No description'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      {blog.location && (
                        <Chip label={blog.location} size="small" variant="outlined" />
                      )}
                      {blog.category?.name && (
                        <Chip label={blog.category.name} size="small" color="primary" />
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Stack direction="row" spacing={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Visibility fontSize="small" color="action" />
                          <Typography variant="caption">{blog.views || 0}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Favorite fontSize="small" color="action" />
                          <Typography variant="caption">{blog.likesCount || 0}</Typography>
                        </Box>
                      </Stack>
                      
                      <Button size="small" variant="outlined">
                        Edit
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <FlightTakeoff sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No stories yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start sharing your travel adventures!
            </Typography>
            <Button
              variant="contained"
              startIcon={<Create />}
              component={Link}
              to="/blogs/new"
            >
              Write Your First Story
            </Button>
          </Box>
        )}
      </Paper>

      {/* Quick Actions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight={700}>
          Quick Actions
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button variant="outlined" startIcon={<Create />} component={Link} to="/blogs/new">
            New Story
          </Button>
          <Button variant="outlined" startIcon={<Analytics />}>
            Analytics
          </Button>
          <Button variant="outlined" startIcon={<Settings />}>
            Settings
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
};

export default SimpleDashboard;