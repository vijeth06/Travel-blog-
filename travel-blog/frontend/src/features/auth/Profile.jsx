import { 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Avatar, 
  Button, 
  Grid,
  Card,
  CardContent,
  Divider,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Badge,
  IconButton,
  LinearProgress,
  Tooltip,
  CardMedia,
  Stack,
  Fade,
  Slide,
  Zoom,
  useTheme,
  alpha,
  Skeleton
} from '@mui/material';
import { 
  Person, 
  Email, 
  Edit, 
  FlightTakeoff,
  LocationOn,
  AccessTime,
  Favorite,
  Comment,
  Visibility,
  Save,
  Cancel,
  Close,
  PhotoCamera,
  Share,
  EmojiEvents,
  TrendingUp,
  Public,
  CalendarToday,
  Language,
  Instagram,
  Twitter,
  Facebook,
  LinkedIn,
  VerifiedUser,
  Star,
  Timeline,
  Map,
  BookmarkBorder,
  ThumbUp,
  ChatBubbleOutline,
  MoreVert,
  Settings,
  Notifications,
  Security,
  Help
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile, updateUserProfile } from '../../redux/authSlice';
import { getBlogs } from '../../api/blogs';
import { Link, useNavigate } from 'react-router-dom';

export default function Profile() {
  const [userBlogs, setUserBlogs] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    city: '',
    country: '',
    website: '',
    phone: '',
    instagram: '',
    twitter: '',
    linkedin: '',
    facebook: ''
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [achievements] = useState([
    { id: 1, title: 'First Story', description: 'Published your first travel story', icon: '🎉', earned: true },
    { id: 2, title: 'Explorer', description: 'Visited 5 different countries', icon: '🌍', earned: true },
    { id: 3, title: 'Storyteller', description: 'Published 10 stories', icon: '📖', earned: false },
    { id: 4, title: 'Popular Writer', description: 'Got 100 likes on a story', icon: '⭐', earned: true },
    { id: 5, title: 'Community Favorite', description: 'Got 50 followers', icon: '❤️', earned: false }
  ]);
  const [recentActivity] = useState([
    { id: 1, type: 'story', title: 'Published "Amazing Journey to Bali"', time: '2 hours ago', icon: FlightTakeoff },
    { id: 2, type: 'like', title: 'Liked "Tokyo Street Food Guide"', time: '5 hours ago', icon: Favorite },
    { id: 3, type: 'follow', title: 'Started following @traveler_jane', time: '1 day ago', icon: Person },
    { id: 4, type: 'comment', title: 'Commented on "Paris in Spring"', time: '2 days ago', icon: Comment }
  ]);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  
  const { user, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    // Fetch user profile if not loaded
    if (!user && !loading) {
      dispatch(getUserProfile());
    }
    
    getBlogs()
      .then(res => {
        console.log('Fetched blogs for profile:', res);
        const allBlogs = res.data?.blogs || res.blogs || [];
        // Filter blogs by current user
        const userBlogs = allBlogs.filter(blog => 
          blog.author && blog.author._id === user?._id
        );
        console.log('User blogs filtered:', userBlogs);
        setUserBlogs(userBlogs.slice(0, 5)); // Show first 5
      })
      .catch(err => {
        console.error('Failed to load blogs:', err);
        setUserBlogs([]);
      });
  }, [isAuthenticated, navigate, dispatch, user, loading]);

  // Initialize edit form when user data is available
  useEffect(() => {
    if (user) {
      setEditForm({
        name: user.name || '',
        bio: user.bio || '',
        city: user.city || '',
        country: user.country || '',
        website: user.website || '',
        phone: user.phone || '',
        instagram: user.instagram || '',
        twitter: user.twitter || '',
        linkedin: user.linkedin || '',
        facebook: user.facebook || ''
      });
    }
  }, [user]);

  // Handle avatar file selection
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    // Reset form to original values
    if (user) {
      setEditForm({
        name: user.name || '',
        bio: user.bio || '',
        city: user.city || '',
        country: user.country || '',
        website: user.website || '',
        phone: user.phone || '',
        instagram: user.instagram || '',
        twitter: user.twitter || '',
        linkedin: user.linkedin || '',
        facebook: user.facebook || ''
      });
    }
  };

  const handleEditChange = (field) => (event) => {
    setEditForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleEditSave = async () => {
    setSaveLoading(true);
    try {
      // Dispatch the actual API call to update user profile
      await dispatch(updateUserProfile(editForm)).unwrap();
      
      setSnackbar({ 
        open: true, 
        message: 'Profile updated successfully!', 
        severity: 'success' 
      });
      setIsEditing(false);
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (error) {
      console.error('Profile update error:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to update profile. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setSaveLoading(false);
    }
  };

  if (error) return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          {error}
        </Typography>
        <Button component={Link} to="/login" variant="contained" sx={{ backgroundColor: '#2E7D32' }}>
          Go to Login
        </Button>
      </Paper>
    </Container>
  );

  if (!user) return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6">Loading...</Typography>
      </Paper>
    </Container>
  );

  return (
    <Box sx={{ 
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
      py: 4
    }}>
      <Container maxWidth="lg">
        {/* Hero Section with Cover Photo */}
        <Fade in timeout={800}>
          <Paper 
            elevation={0}
            sx={{ 
              position: 'relative',
              borderRadius: 4,
              overflow: 'hidden',
              mb: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              minHeight: 300
            }}
          >
            <Box sx={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'flex-end',
              p: 4
            }}>
              <Box sx={{ display: 'flex', alignItems: 'end', width: '100%', gap: 3 }}>
                {/* Profile Avatar */}
                <Zoom in timeout={1000}>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      user.verified && (
                        <VerifiedUser sx={{ color: '#1976d2', fontSize: 24 }} />
                      )
                    }
                  >
                    <Avatar 
                      src={avatarPreview || user.avatar}
                      sx={{ 
                        width: 140, 
                        height: 140, 
                        border: '4px solid white',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        fontSize: '3.5rem',
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #FF6B35, #F7931E)'
                      }}
                    >
                      {user.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                  </Badge>
                </Zoom>

                {/* Profile Info */}
                <Box sx={{ flexGrow: 1, color: 'white' }}>
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                    {user.name}
                    {user.verified && <VerifiedUser sx={{ ml: 1, color: '#1976d2' }} />}
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 2, opacity: 0.9 }}>
                    ✈️ Travel Storyteller • 🌍 Explorer • 📸 Content Creator
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                    <Chip 
                      icon={<Favorite />} 
                      label={`${user.followers?.length || 0} followers`}
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                    <Chip 
                      icon={<FlightTakeoff />} 
                      label={`${userBlogs.length} stories`}
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                    <Chip 
                      icon={<LocationOn />} 
                      label={user.location || 'Worldwide'}
                      sx={{ 
                        backgroundColor: 'rgba(255,255,255,0.2)', 
                        color: 'white',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                  </Stack>
                  {user.bio && (
                    <Typography variant="body1" sx={{ maxWidth: 600, opacity: 0.95, lineHeight: 1.6 }}>
                      {user.bio}
                    </Typography>
                  )}
                </Box>

                {/* Action Buttons */}
                <Stack direction="column" spacing={2}>
                  <Button 
                    variant="contained" 
                    startIcon={<Edit />}
                    onClick={handleEditClick}
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      color: theme.palette.primary.main,
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        backgroundColor: 'white',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                      }
                    }}
                  >
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outlined" 
                    startIcon={<Share />}
                    sx={{ 
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        borderColor: 'white'
                      }
                    }}
                  >
                    Share
                  </Button>
                </Stack>
              </Box>
            </Box>
          </Paper>
        </Fade>

        {/* Enhanced Stats Cards */}
        <Slide direction="up" in timeout={1000}>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                color: 'white',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <FlightTakeoff sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                    {userBlogs.length}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Stories Published
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.error.main}, ${theme.palette.error.dark})`,
                color: 'white',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Favorite sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                    {user.followers?.length || 0}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Followers
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                color: 'white',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <ThumbUp sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                    {userBlogs.reduce((total, blog) => total + (blog.likes?.length || 0), 0)}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Total Likes
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.warning.main}, ${theme.palette.warning.dark})`,
                color: 'white',
                transform: 'translateY(0)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.2)'
                }
              }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Public sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                  <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                    {achievements.filter(a => a.earned).length}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Achievements
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Slide>

        {/* Enhanced Tabs */}
        <Paper elevation={0} sx={{ 
          borderRadius: 3, 
          mb: 4,
          background: 'rgba(255,255,255,0.8)',
          backdropFilter: 'blur(10px)'
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                '&.Mui-selected': {
                  color: theme.palette.primary.main
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: 2,
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
              }
            }}
          >
            <Tab 
              icon={<FlightTakeoff />} 
              label="My Stories" 
              iconPosition="start"
            />
            <Tab 
              icon={<Person />} 
              label="About Me" 
              iconPosition="start"
            />
            <Tab 
              icon={<EmojiEvents />} 
              label="Achievements" 
              iconPosition="start"
            />
            <Tab 
              icon={<Timeline />} 
              label="Activity" 
              iconPosition="start"
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {tabValue === 0 && (
          <Fade in timeout={600}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.text.primary }}>
                  My Travel Stories
                </Typography>
                <Button 
                  component={Link} 
                  to="/blogs/new" 
                  variant="contained"
                  startIcon={<FlightTakeoff />}
                  size="large"
                  sx={{ 
                    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                    borderRadius: 3,
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                    }
                  }}
                >
                  Write New Story
                </Button>
              </Box>
              
              {userBlogs.length > 0 ? (
                <Grid container spacing={3}>
                  {userBlogs.map((blog, index) => (
                    <Grid item xs={12} md={6} key={blog._id}>
                      <Zoom in timeout={800 + index * 200}>
                        <Card 
                          component={Link} 
                          to={`/blogs/${blog._id}`}
                          sx={{ 
                            textDecoration: 'none',
                            height: '100%',
                            background: 'rgba(255,255,255,0.9)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              transform: 'translateY(-8px)',
                              boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                            }
                          }}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                              <Avatar 
                                sx={{ 
                                  backgroundColor: theme.palette.primary.main,
                                  mr: 2,
                                  width: 48,
                                  height: 48
                                }}
                              >
                                <FlightTakeoff />
                              </Avatar>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.primary }}>
                                  {blog.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                  {new Date(blog.createdAt).toLocaleDateString('en-US', { 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                  })}
                                </Typography>
                              </Box>
                            </Box>
                            
                            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                              <Chip 
                                icon={<ThumbUp />}
                                size="small" 
                                label={`${blog.likesCount || (Array.isArray(blog.likes) ? blog.likes.length : 0)} likes`}
                                sx={{ 
                                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                  color: theme.palette.primary.main
                                }}
                              />
                              <Chip 
                                icon={<LocationOn />}
                                size="small" 
                                label={blog.location || 'Worldwide'}
                                sx={{ 
                                  backgroundColor: alpha(theme.palette.secondary.main, 0.1),
                                  color: theme.palette.secondary.main
                                }}
                              />
                              <Chip 
                                icon={<Visibility />}
                                size="small" 
                                label={`${blog.views || 0} views`}
                                sx={{ 
                                  backgroundColor: alpha(theme.palette.success.main, 0.1),
                                  color: theme.palette.success.main
                                }}
                              />
                            </Stack>
                            
                            {blog.excerpt && (
                              <Typography variant="body2" color="text.secondary" sx={{ 
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden'
                              }}>
                                {blog.excerpt}
                              </Typography>
                            )}
                          </CardContent>
                        </Card>
                      </Zoom>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Paper sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 4
                }}>
                  <FlightTakeoff sx={{ fontSize: 80, color: theme.palette.primary.main, mb: 3, opacity: 0.7 }} />
                  <Typography variant="h4" gutterBottom sx={{ fontWeight: 600 }}>
                    No stories yet
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                    Your travel adventures are waiting to be shared! Start writing your first story and inspire others with your journey.
                  </Typography>
                  <Button 
                    component={Link} 
                    to="/blogs/new" 
                    variant="contained"
                    startIcon={<FlightTakeoff />}
                    size="large"
                    sx={{ 
                      background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                      borderRadius: 3,
                      px: 4,
                      py: 1.5
                    }}
                  >
                    Write Your First Story
                  </Button>
                </Paper>
              )}
            </Box>
          </Fade>
        )}

        {tabValue === 1 && (
          <Fade in timeout={600}>
            <Grid container spacing={4}>
              {/* Personal Information */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  height: '100%'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" gutterBottom sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      fontWeight: 600,
                      color: theme.palette.primary.main,
                      mb: 3
                    }}>
                      <Person sx={{ mr: 2, fontSize: 28 }} />
                      Personal Information
                    </Typography>
                    
                    <Stack spacing={3}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Email sx={{ mr: 2, color: theme.palette.text.secondary }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Email</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.email}</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ mr: 2, color: theme.palette.text.secondary }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Full Name</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>{user.name}</Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <LocationOn sx={{ mr: 2, color: theme.palette.text.secondary, mt: 0.5 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Location</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {user.location || 'Not specified'}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <CalendarToday sx={{ mr: 2, color: theme.palette.text.secondary, mt: 0.5 }} />
                        <Box>
                          <Typography variant="body2" color="text.secondary">Member Since</Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {new Date(user.createdAt).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {user.bio && (
                        <Box>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>About Me</Typography>
                          <Typography variant="body1" sx={{ 
                            lineHeight: 1.6,
                            p: 2,
                            backgroundColor: alpha(theme.palette.primary.main, 0.05),
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                          }}>
                            {user.bio}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Social Links & Travel Stats */}
              <Grid item xs={12} md={6}>
                <Stack spacing={3}>
                  {/* Social Links */}
                  <Card sx={{ 
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h5" gutterBottom sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        fontWeight: 600,
                        color: theme.palette.secondary.main,
                        mb: 3
                      }}>
                        <Language sx={{ mr: 2, fontSize: 28 }} />
                        Social Links
                      </Typography>
                      
                      <Stack spacing={2}>
                        {[
                          { platform: 'Instagram', icon: Instagram, color: '#E4405F', handle: user.instagram },
                          { platform: 'Twitter', icon: Twitter, color: '#1DA1F2', handle: user.twitter },
                          { platform: 'LinkedIn', icon: LinkedIn, color: '#0077B5', handle: user.linkedin },
                          { platform: 'Facebook', icon: Facebook, color: '#1877F2', handle: user.facebook }
                        ].map(({ platform, icon: Icon, color, handle }) => (
                          <Box key={platform} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Icon sx={{ mr: 2, color }} />
                              <Typography variant="body1">{platform}</Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {handle || 'Not connected'}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>

                  {/* Travel Stats */}
                  <Card sx={{ 
                    background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)}, ${alpha(theme.palette.info.main, 0.1)})`,
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography variant="h5" gutterBottom sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        fontWeight: 600,
                        color: theme.palette.success.main,
                        mb: 3
                      }}>
                        <TrendingUp sx={{ mr: 2, fontSize: 28 }} />
                        Travel Stats
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                              {user.followers?.length || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">Followers</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                              {user.following?.length || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">Following</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                              {userBlogs.length}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">Stories</Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ textAlign: 'center', p: 2 }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>
                              {userBlogs.reduce((total, blog) => total + (blog.likes?.length || 0), 0)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">Total Likes</Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>
            </Grid>
          </Fade>
        )}

        {tabValue === 2 && (
          <Fade in timeout={600}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ 
                fontWeight: 700, 
                color: theme.palette.text.primary,
                mb: 4,
                display: 'flex',
                alignItems: 'center'
              }}>
                <EmojiEvents sx={{ mr: 2, color: theme.palette.warning.main }} />
                Achievements & Badges
              </Typography>
              
              <Grid container spacing={3}>
                {achievements.map((achievement, index) => (
                  <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                    <Zoom in timeout={800 + index * 200}>
                      <Card sx={{ 
                        height: '100%',
                        background: achievement.earned 
                          ? `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)}, ${alpha(theme.palette.success.main, 0.1)})`
                          : 'rgba(255,255,255,0.6)',
                        backdropFilter: 'blur(10px)',
                        border: achievement.earned 
                          ? `2px solid ${alpha(theme.palette.warning.main, 0.3)}`
                          : '1px solid rgba(0,0,0,0.1)',
                        position: 'relative',
                        overflow: 'visible',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                        }
                      }}>
                        {achievement.earned && (
                          <Box sx={{ 
                            position: 'absolute',
                            top: -10,
                            right: -10,
                            backgroundColor: theme.palette.success.main,
                            borderRadius: '50%',
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                          }}>
                            <Star sx={{ color: 'white', fontSize: 18 }} />
                          </Box>
                        )}
                        
                        <CardContent sx={{ textAlign: 'center', p: 4 }}>
                          <Typography variant="h2" sx={{ mb: 2, opacity: achievement.earned ? 1 : 0.3 }}>
                            {achievement.icon}
                          </Typography>
                          <Typography variant="h6" gutterBottom sx={{ 
                            fontWeight: 600,
                            color: achievement.earned ? theme.palette.text.primary : theme.palette.text.secondary
                          }}>
                            {achievement.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {achievement.description}
                          </Typography>
                          
                          {achievement.earned ? (
                            <Chip 
                              label="Earned" 
                              color="success" 
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          ) : (
                            <Chip 
                              label="Locked" 
                              variant="outlined" 
                              size="small"
                              sx={{ opacity: 0.6 }}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>

              {/* Progress Section */}
              <Paper sx={{ 
                mt: 4, 
                p: 4,
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <Typography variant="h5" gutterBottom sx={{ 
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  mb: 3
                }}>
                  Progress Overview
                </Typography>
                
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>Stories Published</Typography>
                        <Typography variant="body2" color="text.secondary">{userBlogs.length}/10</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min((userBlogs.length / 10) * 100, 100)} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`
                          }
                        }}
                      />
                    </Box>
                    
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>Followers</Typography>
                        <Typography variant="body2" color="text.secondary">{user.followers?.length || 0}/50</Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min(((user.followers?.length || 0) / 50) * 100, 100)} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: alpha(theme.palette.error.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundColor: theme.palette.error.main
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>Total Likes</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {userBlogs.reduce((total, blog) => total + (blog.likes?.length || 0), 0)}/100
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={Math.min((userBlogs.reduce((total, blog) => total + (blog.likes?.length || 0), 0) / 100) * 100, 100)} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: alpha(theme.palette.success.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundColor: theme.palette.success.main
                          }
                        }}
                      />
                    </Box>
                    
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>Achievements</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {achievements.filter(a => a.earned).length}/{achievements.length}
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={(achievements.filter(a => a.earned).length / achievements.length) * 100} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 4,
                          backgroundColor: alpha(theme.palette.warning.main, 0.1),
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundColor: theme.palette.warning.main
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </Fade>
        )}

        {tabValue === 3 && (
          <Fade in timeout={600}>
            <Box>
              <Typography variant="h4" gutterBottom sx={{ 
                fontWeight: 700, 
                color: theme.palette.text.primary,
                mb: 4,
                display: 'flex',
                alignItems: 'center'
              }}>
                <Timeline sx={{ mr: 2, color: theme.palette.info.main }} />
                Recent Activity
              </Typography>
              
              {recentActivity.length > 0 ? (
                <Stack spacing={2}>
                  {recentActivity.map((activity, index) => (
                    <Zoom in timeout={600 + index * 200} key={activity.id}>
                      <Card sx={{ 
                        background: 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateX(8px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                        }
                      }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar sx={{ 
                              backgroundColor: alpha(theme.palette.primary.main, 0.1),
                              color: theme.palette.primary.main,
                              mr: 3
                            }}>
                              <activity.icon />
                            </Avatar>
                            <Box sx={{ flexGrow: 1 }}>
                              <Typography variant="body1" sx={{ fontWeight: 500, mb: 0.5 }}>
                                {activity.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {activity.time}
                              </Typography>
                            </Box>
                            <IconButton size="small">
                              <MoreVert />
                            </IconButton>
                          </Box>
                        </CardContent>
                      </Card>
                    </Zoom>
                  ))}
                </Stack>
              ) : (
                <Paper sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 4
                }}>
                  <Timeline sx={{ fontSize: 80, color: theme.palette.info.main, mb: 3, opacity: 0.7 }} />
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
                    No recent activity
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    Start exploring and your activity will appear here!
                  </Typography>
                </Paper>
              )}
            </Box>
          </Fade>
        )}

        {/* Enhanced Edit Profile Dialog */}
      <Dialog 
        open={isEditing} 
        onClose={handleEditCancel} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: 'white',
          py: 3
        }}>
          <Edit sx={{ fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Edit Profile
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            {/* Avatar Upload Section */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <IconButton
                      component="label"
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: 'white',
                        width: 40,
                        height: 40,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.dark
                        }
                      }}
                    >
                      <PhotoCamera />
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleAvatarChange}
                      />
                    </IconButton>
                  }
                >
                  <Avatar 
                    src={avatarPreview || user.avatar}
                    sx={{ 
                      width: 100, 
                      height: 100,
                      fontSize: '2.5rem',
                      fontWeight: 'bold',
                      background: 'linear-gradient(45deg, #FF6B35, #F7931E)'
                    }}
                  >
                    {user.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </Badge>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    Profile Picture
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click the camera icon to upload a new profile picture
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 3 }} />
            </Grid>

            {/* Basic Information */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={editForm.name}
                onChange={handleEditChange('name')}
                variant="outlined"
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label="Location"
                value={editForm.location}
                onChange={handleEditChange('location')}
                variant="outlined"
                placeholder="City, Country"
                sx={{ mb: 3 }}
              />
              <TextField
                fullWidth
                label="Website"
                value={editForm.website}
                onChange={handleEditChange('website')}
                variant="outlined"
                placeholder="https://yourwebsite.com"
              />
            </Grid>

            {/* Bio */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Bio"
                value={editForm.bio}
                onChange={handleEditChange('bio')}
                variant="outlined"
                multiline
                rows={6}
                placeholder="Tell us about yourself, your travel experiences, and what inspires you to explore..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    alignItems: 'flex-start'
                  }
                }}
              />
            </Grid>

            {/* Social Media Links */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: theme.palette.primary.main }}>
                Social Media Links
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Instagram"
                    value={editForm.instagram}
                    onChange={handleEditChange('instagram')}
                    variant="outlined"
                    placeholder="@username"
                    InputProps={{
                      startAdornment: <Instagram sx={{ mr: 1, color: '#E4405F' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Twitter"
                    value={editForm.twitter}
                    onChange={handleEditChange('twitter')}
                    variant="outlined"
                    placeholder="@username"
                    InputProps={{
                      startAdornment: <Twitter sx={{ mr: 1, color: '#1DA1F2' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="LinkedIn"
                    value={editForm.linkedin}
                    onChange={handleEditChange('linkedin')}
                    variant="outlined"
                    placeholder="linkedin.com/in/username"
                    InputProps={{
                      startAdornment: <LinkedIn sx={{ mr: 1, color: '#0077B5' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Facebook"
                    value={editForm.facebook}
                    onChange={handleEditChange('facebook')}
                    variant="outlined"
                    placeholder="facebook.com/username"
                    InputProps={{
                      startAdornment: <Facebook sx={{ mr: 1, color: '#1877F2' }} />
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions sx={{ p: 4, gap: 2 }}>
          <Button 
            onClick={handleEditCancel} 
            startIcon={<Cancel />}
            disabled={saveLoading}
            variant="outlined"
            size="large"
            sx={{ px: 4 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleEditSave} 
            variant="contained" 
            startIcon={<Save />}
            disabled={saveLoading}
            size="large"
            sx={{ 
              px: 4,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              '&:hover': {
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`
              }
            }}
          >
            {saveLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ 
            width: '100%',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      </Container>
    </Box>
  );
}