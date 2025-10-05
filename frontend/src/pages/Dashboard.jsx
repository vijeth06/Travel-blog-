import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Paper,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Divider,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  LinearProgress,
  Badge,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CardMedia
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Create,
  Analytics,
  Settings,
  Person,
  Article,
  Visibility,
  ThumbUp,
  Comment,
  Share,
  TrendingUp,
  Bookmark,
  Notifications,
  Edit,
  Delete,
  MoreVert,
  Add,
  CardTravel,
  FlightTakeoff,
  Favorite,
  Group,
  Info,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Refresh,
  Close,
  LocationOn
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { getUserProfile } from '../redux/authSlice';
import { getBlogs } from '../api/blogs';
import { styled, alpha, keyframes } from '@mui/material/styles';

// Custom animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

// Styled components
const DashboardCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  border: '1px solid rgba(255,255,255,0.2)',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  animation: `${fadeIn} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 16px 48px rgba(0,0,0,0.15)',
  },
}));

const StatsCard = styled(Card)(({ theme, color }) => ({
  borderRadius: 16,
  background: `linear-gradient(135deg, ${color}15 0%, ${color}25 100%)`,
  border: `2px solid ${color}30`,
  transition: 'all 0.3s ease',
  animation: `${fadeIn} 0.8s ease-out`,
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: `0 8px 32px ${color}40`,
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
  border: 0,
  borderRadius: 25,
  boxShadow: '0 3px 15px 2px rgba(255, 107, 53, 0.3)',
  color: 'white',
  padding: '12px 30px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #F7931E 30%, #FF6B35 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px 4px rgba(255, 107, 53, 0.4)',
  },
}));

const AnimatedProgress = styled(LinearProgress)(({ theme }) => ({
  height: 8,
  borderRadius: 4,
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  '& .MuiLinearProgress-bar': {
    borderRadius: 4,
    background: 'linear-gradient(90deg, #FF6B35, #F7931E, #1E88E5)',
    animation: `${shimmer} 2s infinite`,
  },
}));

const FloatingActionButton = styled(Button)(({ theme }) => ({
  position: 'fixed',
  bottom: 24,
  right: 24,
  borderRadius: '50%',
  width: 64,
  height: 64,
  minWidth: 64,
  background: 'linear-gradient(45deg, #1E88E5 30%, #42A5F5 90%)',
  boxShadow: '0 8px 32px rgba(30, 136, 229, 0.4)',
  zIndex: 1000,
  animation: `${pulse} 2s infinite`,
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 12px 40px rgba(30, 136, 229, 0.6)',
  },
}));

export default function Dashboard() {
  const [userBlogs, setUserBlogs] = useState([]);
  const [stats, setStats] = useState({
    totalBlogs: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    followers: 0,
    following: 0,
    bookmarks: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated && !token) {
      navigate('/login');
      return;
    }

    // Fetch user profile if not loaded
    if (token && !user) {
      dispatch(getUserProfile());
    }

    // Load user profile data
    if (user) {
      setStats(prev => ({
        ...prev,
        followers: user.followers?.length || 0,
        following: user.following?.length || 0,
        totalBlogs: user.totalPosts || 0,
        totalViews: user.totalViews || 0,
        totalLikes: user.totalLikes || 0
      }));
    }

    // Load user blogs
    getBlogs()
      .then(res => {
        const blogs = res.data?.blogs || res.blogs || [];
        // For now, show all blogs since we don't have proper user filtering yet
        setUserBlogs(blogs.slice(0, 10));
        
        // Calculate additional stats
        const totalComments = blogs.reduce((sum, blog) => sum + (blog.commentsCount || 0), 0);
        const totalViews = blogs.reduce((sum, blog) => sum + (blog.views || 0), 0);
        const totalLikes = blogs.reduce((sum, blog) => sum + (blog.likesCount || 0), 0);
        
        setStats(prev => ({
          ...prev,
          totalComments,
          totalViews: totalViews || prev.totalViews,
          totalLikes: totalLikes || prev.totalLikes,
          revenue: Math.floor(totalViews * 0.05), // Mock revenue calculation
          bookmarks: Math.floor(Math.random() * 50) + 10
        }));
      })
      .catch(console.error);

    // Mock recent activity
    setRecentActivity([
      { id: 1, type: 'like', message: 'Sarah liked your post "Amazing Swiss Alps Adventure"', time: '2 minutes ago', avatar: 'S' },
      { id: 2, type: 'comment', message: 'John commented on "Tropical Paradise in Maldives"', time: '15 minutes ago', avatar: 'J' },
      { id: 3, type: 'follow', message: 'Emma started following you', time: '1 hour ago', avatar: 'E' },
      { id: 4, type: 'view', message: 'Your post reached 1000 views!', time: '2 hours ago', avatar: '👁️' },
      { id: 5, type: 'bookmark', message: 'Mike bookmarked your "Cultural Immersion in Kyoto"', time: '3 hours ago', avatar: 'M' }
    ]);

    // Mock notifications
    setNotifications([
      { id: 1, type: 'success', message: 'Your post "Swiss Alps Adventure" is trending!', unread: true },
      { id: 2, type: 'info', message: 'Weekly analytics report is ready', unread: true },
      { id: 3, type: 'warning', message: 'Complete your profile to get more visibility', unread: false },
      { id: 4, type: 'error', message: 'Failed to upload image. Please try again.', unread: false }
    ]);

    setLoading(false);
  }, [navigate, dispatch, isAuthenticated, token, user]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditBlog = (blog) => {
    setSelectedBlog(blog);
    setOpenDialog(true);
  };

  const handleDeleteBlog = (blogId) => {
    // Mock delete functionality
    setUserBlogs(prev => prev.filter(blog => blog._id !== blogId));
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'like': return <Favorite color="error" />;
      case 'comment': return <Comment color="primary" />;
      case 'follow': return <Person color="success" />;
      case 'view': return <Visibility color="info" />;
      case 'bookmark': return <Bookmark color="warning" />;
      default: return <Info />;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle color="success" />;
      case 'error': return <ErrorIcon color="error" />;
      case 'warning': return <Warning color="warning" />;
      case 'info': return <Info color="info" />;
      default: return <Info />;
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" gutterBottom sx={{ 
          fontWeight: 800, 
          background: 'linear-gradient(45deg, #1E88E5, #FF6B35)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: `${fadeIn} 1s ease-out`
        }}>
          Welcome back, {user?.name || 'Traveler'}! 🌟
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          Here's what's happening with your travel stories today
        </Typography>
        
        {/* Quick Actions */}
        <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
          <GradientButton
            startIcon={<Create />}
            component={Link}
            to="/blogs/new"
          >
            Write New Story
          </GradientButton>
          <Button
            variant="outlined"
            startIcon={<Analytics />}
            onClick={() => setTabValue(1)}
            sx={{ borderRadius: 25, px: 3 }}
          >
            View Analytics
          </Button>
          <Button
            variant="outlined"
            startIcon={<Settings />}
            onClick={() => navigate('/settings')}
            sx={{ borderRadius: 25, px: 3 }}
          >
            Settings
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#1E88E5">
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <FlightTakeoff sx={{ fontSize: 48, color: '#1E88E5', mb: 2 }} />
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, color: '#1E88E5' }}>
                {stats?.totalBlogs || 0}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Stories Published
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label="+3 this week" 
                  size="small" 
                  sx={{ backgroundColor: '#1E88E515', color: '#1E88E5' }}
                />
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#FF6B35">
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Visibility sx={{ fontSize: 48, color: '#FF6B35', mb: 2 }} />
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, color: '#FF6B35' }}>
                {(stats?.totalViews || 0).toLocaleString()}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Views
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label="+12% this month" 
                  size="small" 
                  sx={{ backgroundColor: '#FF6B3515', color: '#FF6B35' }}
                />
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#4CAF50">
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Favorite sx={{ fontSize: 48, color: '#4CAF50', mb: 2 }} />
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, color: '#4CAF50' }}>
                {stats?.totalLikes || 0}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Likes
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label="+8% this week" 
                  size="small" 
                  sx={{ backgroundColor: '#4CAF5015', color: '#4CAF50' }}
                />
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatsCard color="#9C27B0">
            <CardContent sx={{ textAlign: 'center', py: 3 }}>
              <Group sx={{ fontSize: 48, color: '#9C27B0', mb: 2 }} />
              <Typography variant="h3" gutterBottom sx={{ fontWeight: 800, color: '#9C27B0' }}>
                {stats?.followers || 0}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Followers
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label="+5 new followers" 
                  size="small" 
                  sx={{ backgroundColor: '#9C27B015', color: '#9C27B0' }}
                />
              </Box>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} lg={8}>
          {/* Tabs */}
          <DashboardCard sx={{ mb: 4 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable">
                <Tab label="My Stories" icon={<FlightTakeoff />} />
                <Tab label="Analytics" icon={<Analytics />} />
                <Tab label="Bookmarks" icon={<Bookmark />} />
                <Tab label="Drafts" icon={<Edit />} />
              </Tabs>
            </Box>

            {/* Tab Content */}
            {tabValue === 0 && (
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" fontWeight={700}>
                    My Travel Stories ({userBlogs.length})
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    component={Link}
                    to="/blogs/new"
                    sx={{ borderRadius: 25 }}
                  >
                    New Story
                  </Button>
                </Box>

                {userBlogs && userBlogs.length > 0 ? (
                  <Grid container spacing={3}>
                    {userBlogs.map((blog) => (
                      <Grid item xs={12} md={6} key={blog._id || blog.id}>
                        <Card sx={{ 
                          borderRadius: 16, 
                          transition: 'all 0.3s ease',
                          '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                        }}>
                          <CardMedia
                            component="img"
                            height="200"
                            image={blog.featuredImage || `https://source.unsplash.com/800x600/?${blog.tags?.[0] || 'travel'}`}
                            alt={blog.title || 'Blog post'}
                          />
                          <CardContent>
                            <Typography variant="h6" gutterBottom noWrap>
                              {blog.title || 'Untitled'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {blog.excerpt || (blog.content && blog.content.substring(0, 100) + '...') || 'No description available'}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                              {blog.location && (
                                <Chip 
                                  icon={<LocationOn />} 
                                  label={blog.location} 
                                  size="small" 
                                  variant="outlined"
                                />
                              )}
                              {blog.category?.name && (
                                <Chip 
                                  label={blog.category.name} 
                                  size="small" 
                                  sx={{ backgroundColor: '#1E88E515', color: '#1E88E5' }}
                                />
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
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Comment fontSize="small" color="action" />
                                  <Typography variant="caption">{blog.commentsCount || 0}</Typography>
                                </Box>
                              </Stack>
                              
                              <Stack direction="row" spacing={1}>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleEditBlog(blog)}
                                  sx={{ color: '#1E88E5' }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                                <IconButton 
                                  size="small" 
                                  onClick={() => handleDeleteBlog(blog._id)}
                                  sx={{ color: '#f44336' }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Stack>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 8 }}>
                    <FlightTakeoff sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                      No stories yet
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      Start sharing your travel adventures with the world!
                    </Typography>
                    <GradientButton
                      startIcon={<Create />}
                      component={Link}
                      to="/blogs/new"
                    >
                      Write Your First Story
                    </GradientButton>
                  </Box>
                )}
              </CardContent>
            )}

            {tabValue === 1 && (
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight={700}>
                  Analytics Overview
                </Typography>
                
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                      <Typography variant="h4" color="primary" fontWeight={800}>
                        {(((stats?.totalViews || 0) / 1000) || 0).toFixed(1)}K
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Monthly Views
                      </Typography>
                      <AnimatedProgress variant="determinate" value={75} sx={{ mt: 2 }} />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                      <Typography variant="h4" color="success.main" fontWeight={800}>
                        ${stats?.revenue || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Estimated Revenue
                      </Typography>
                      <AnimatedProgress variant="determinate" value={60} sx={{ mt: 2 }} />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                      <Typography variant="h4" color="warning.main" fontWeight={800}>
                        {stats?.totalComments || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Engagement
                      </Typography>
                      <AnimatedProgress variant="determinate" value={85} sx={{ mt: 2 }} />
                    </Paper>
                  </Grid>
                </Grid>

                <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f5f5f5', borderRadius: 3 }}>
                  <Typography variant="h6" color="text.secondary">
                    📊 Analytics Chart Coming Soon
                  </Typography>
                </Box>
              </CardContent>
            )}

            {tabValue === 2 && (
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight={700}>
                  Bookmarked Stories ({stats?.bookmarks || 0})
                </Typography>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Bookmark sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Your bookmarked stories will appear here
                  </Typography>
                </Box>
              </CardContent>
            )}

            {tabValue === 3 && (
              <CardContent>
                <Typography variant="h5" gutterBottom fontWeight={700}>
                  Draft Stories
                </Typography>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Edit sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Your draft stories will appear here
                  </Typography>
                </Box>
              </CardContent>
            )}
          </DashboardCard>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} lg={4}>
          {/* Recent Activity */}
          <DashboardCard sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  Recent Activity
                </Typography>
                <IconButton size="small">
                  <Refresh />
                </IconButton>
              </Box>
              
              <List>
                {recentActivity && recentActivity.length > 0 ? recentActivity.map((activity) => (
                  <ListItem key={activity.id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 40, height: 40, backgroundColor: '#1E88E515' }}>
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.message || 'No message'}
                      secondary={activity.time || 'Unknown time'}
                      primaryTypographyProps={{ fontSize: '0.9rem' }}
                      secondaryTypographyProps={{ fontSize: '0.8rem' }}
                    />
                  </ListItem>
                )) : (
                  <ListItem>
                    <ListItemText primary="No recent activity" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </DashboardCard>

          {/* Notifications */}
          <DashboardCard sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" fontWeight={700}>
                  Notifications
                </Typography>
                <Badge badgeContent={notifications.filter(n => n.unread).length} color="error">
                  <Notifications />
                </Badge>
              </Box>
              
              <List>
                {notifications && notifications.length > 0 ? notifications.map((notification) => (
                  <ListItem key={notification.id} sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 36, height: 36, backgroundColor: 'transparent' }}>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={notification.message || 'No message'}
                      primaryTypographyProps={{ 
                        fontSize: '0.9rem',
                        fontWeight: notification.unread ? 600 : 400
                      }}
                    />
                    {notification.unread && (
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'error.main' }} />
                    )}
                  </ListItem>
                )) : (
                  <ListItem>
                    <ListItemText primary="No notifications" />
                  </ListItem>
                )}
              </List>
            </CardContent>
          </DashboardCard>

          {/* Quick Stats */}
          <DashboardCard>
            <CardContent>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Quick Stats
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Profile Completion</Typography>
                  <Typography variant="body2" fontWeight={600}>85%</Typography>
                </Box>
                <AnimatedProgress variant="determinate" value={85} />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Monthly Goal</Typography>
                  <Typography variant="body2" fontWeight={600}>3/5 posts</Typography>
                </Box>
                <AnimatedProgress variant="determinate" value={60} />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Stories this month</Typography>
                  <Chip label="3" size="small" color="primary" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Average reading time</Typography>
                  <Chip label="4 min" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Top category</Typography>
                  <Chip label="Adventure" size="small" color="success" />
                </Box>
              </Stack>
            </CardContent>
          </DashboardCard>
        </Grid>
      </Grid>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={() => navigate('/blogs/new')}
      >
        <Add sx={{ fontSize: 32 }} />
      </FloatingActionButton>

      {/* Edit Blog Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">Edit Story</Typography>
            <IconButton onClick={() => setOpenDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary">
            Edit functionality will be implemented here
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}