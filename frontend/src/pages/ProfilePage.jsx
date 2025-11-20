import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tab,
  Tabs,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LocationOn,
  CalendarToday,
  Email,
  Phone,
  Language,
  Edit,
  PersonAdd,
  PersonRemove,
  Article,
  Favorite,
  Visibility,
  TravelExplore
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { getUserById } from '../api/users';
import FollowButton from '../features/social/FollowButton';
import { getBlogs } from '../api/blogs';

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector((state) => state.auth);
  const [user, setUser] = useState(null);
  const [userBlogs, setUserBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [userResponse, blogsResponse] = await Promise.all([
          getUserById(id),
          getBlogs({ author: id })
        ]);
        
        setUser(userResponse.data || userResponse);
        setUserBlogs(blogsResponse.data?.blogs || blogsResponse.blogs || []);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchUserData();
    }
  }, [id, currentUser]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'User not found'}</Alert>
      </Container>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === user._id;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Profile Header */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="center" sx={{ flexDirection: { xs: 'column', sm: 'row' } }}>
            <Grid item sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
              <Avatar
                src={user.avatar}
                sx={{ width: 120, height: 120, fontSize: '3rem' }}
              >
                {user.name?.charAt(0)?.toUpperCase()}
              </Avatar>
            </Grid>
            
            <Grid item xs>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 1, sm: 2 }
              }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                    textAlign: { xs: 'center', sm: 'left' }
                  }}
                >
                  {user.name}
                </Typography>
                {user.role === 'admin' && (
                  <Chip label="Admin" color="error" size="small" />
                )}
                {user.role === 'author' && (
                  <Chip label="Author" color="primary" size="small" />
                )}
                {user.authorVerified && (
                  <Chip label="Verified" color="success" size="small" sx={{ ml: 1 }} />
                )}
              </Box>

              {user.bio && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  {user.bio}
                </Typography>
              )}

              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 2, sm: 3 }, 
                mb: 2,
                justifyContent: { xs: 'center', sm: 'flex-start' },
                flexWrap: 'wrap'
              }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {userBlogs.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Posts
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {user.followerCount || user.followers?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Followers
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {user.followingCount || user.following?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Following
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ 
                display: 'flex', 
                gap: 2,
                justifyContent: { xs: 'center', sm: 'flex-start' },
                flexWrap: 'wrap',
                mt: { xs: 2, sm: 0 }
              }}>
                {isOwnProfile ? (
                  <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => navigate('/profile')}
                  >
                    Edit Profile
                  </Button>
                ) : (
                  <FollowButton
                    userId={user._id}
                    userName={user.name}
                    showFollowerCount
                    size="medium"
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Profile Details */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4} sx={{ order: { xs: 2, md: 1 } }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                About
              </Typography>
              <List dense>
                {user.email && (
                  <ListItem>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText primary={user.email} />
                  </ListItem>
                )}
                {user.phone && (
                  <ListItem>
                    <ListItemIcon>
                      <Phone />
                    </ListItemIcon>
                    <ListItemText primary={user.phone} />
                  </ListItem>
                )}
                {user.country && (
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn />
                    </ListItemIcon>
                    <ListItemText primary={`${user.city ? user.city + ', ' : ''}${user.country}`} />
                  </ListItem>
                )}
                {user.website && (
                  <ListItem>
                    <ListItemIcon>
                      <Language />
                    </ListItemIcon>
                    <ListItemText primary={user.website} />
                  </ListItem>
                )}
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`Joined ${formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}`} 
                  />
                </ListItem>
              </List>

              {user.travelPreferences && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Travel Preferences
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {user.travelPreferences.budgetRange && (
                      <Chip label={user.travelPreferences.budgetRange} size="small" />
                    )}
                    {user.travelPreferences.travelStyle && (
                      <Chip label={user.travelPreferences.travelStyle} size="small" />
                    )}
                    {user.travelPreferences.groupSize && (
                      <Chip label={user.travelPreferences.groupSize} size="small" />
                    )}
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8} sx={{ order: { xs: 1, md: 2 } }}>
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
                <Tab icon={<Article />} label="Posts" />
                <Tab icon={<TravelExplore />} label="Travel Stats" />
              </Tabs>
            </Box>

            <CardContent>
              {currentTab === 0 && (
                <Box>
                  {userBlogs.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography color="text.secondary">
                        No posts yet
                      </Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {userBlogs.map((blog) => (
                        <Grid item xs={12} key={blog._id}>
                          <Card variant="outlined" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/blogs/${blog._id}`)}>
                            <CardContent>
                              <Typography variant="h6" gutterBottom>
                                {blog.title}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {blog.content?.substring(0, 150)}...
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Visibility sx={{ fontSize: 16 }} />
                                  <Typography variant="caption">{blog.views || 0}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <Favorite sx={{ fontSize: 16 }} />
                                  <Typography variant="caption">{blog.likesCount || 0}</Typography>
                                </Box>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </Box>
              )}

              {currentTab === 1 && (
                <Box>
                  <Grid container spacing={3}>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                          {user.totalPosts || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Posts
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                          {user.totalLikes || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Likes
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                          {user.totalViews || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Views
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
                          {user.favoriteLocations?.length || 0}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Favorite Places
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProfilePage;