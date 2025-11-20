import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  Chip,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Alert,
  Divider,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  People,
  PersonAdd,
  Search,
  TrendingUp,
  Star,
  LocationOn,
  Article
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllUsers, getUserById } from '../api/users';
import { getBlogs } from '../api/blogs';
import FollowButton from '../features/social/FollowButton';
import { formatDistanceToNow } from 'date-fns';

const FollowingPage = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchUserData();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Fetch current user's detailed info
      const userResponse = await getUserById(user.id);
      const userData = userResponse.data || userResponse;
      
      // Fetch following users details
      if (userData.following && userData.following.length > 0) {
        const followingPromises = userData.following.map(userId => getUserById(userId));
        const followingResults = await Promise.allSettled(followingPromises);
        const followingData = followingResults
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value.data || result.value);
        setFollowing(followingData);
      }
      
      // Fetch followers details
      if (userData.followers && userData.followers.length > 0) {
        const followersPromises = userData.followers.map(userId => getUserById(userId));
        const followersResults = await Promise.allSettled(followersPromises);
        const followersData = followersResults
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value.data || result.value);
        setFollowers(followersData);
      }
      
      // Fetch suggested users (users not followed)
      const allUsersResponse = await getAllUsers({ limit: 20 });
      const allUsers = allUsersResponse.data?.users || allUsersResponse.users || [];
      const suggested = allUsers
        .filter(u => u._id !== user.id && !userData.following?.includes(u._id))
        .slice(0, 10);
      setSuggestedUsers(suggested);
      
      // Fetch recent posts from followed users
      if (userData.following && userData.following.length > 0) {
        const blogsResponse = await getBlogs({ 
          author: userData.following.join(','),
          limit: 10,
          sort: 'latest'
        });
        const blogs = blogsResponse.data?.blogs || blogsResponse.blogs || [];
        setRecentPosts(blogs);
      }
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load following data');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowChange = (userId, isNowFollowing) => {
    if (isNowFollowing) {
      // Move user from suggested to following
      const userToMove = suggestedUsers.find(u => u._id === userId);
      if (userToMove) {
        setFollowing(prev => [...prev, userToMove]);
        setSuggestedUsers(prev => prev.filter(u => u._id !== userId));
      }
    } else {
      // Move user from following to suggested
      const userToMove = following.find(u => u._id === userId);
      if (userToMove) {
        setFollowing(prev => prev.filter(u => u._id !== userId));
        setSuggestedUsers(prev => [...prev, userToMove]);
      }
    }
  };

  const filteredUsers = (users) => {
    if (!searchTerm) return users;
    return users.filter(user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <People sx={{ fontSize: '3rem', color: 'primary.main' }} />
          Your Travel Community
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Connect with fellow travelers and discover amazing stories
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {following.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Following
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                {followers.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Followers
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                {recentPosts.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recent Posts
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <TextField
            fullWidth
            placeholder="Search users by name, bio, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
            <Tab icon={<People />} label={`Following (${following.length})`} />
            <Tab icon={<People />} label={`Followers (${followers.length})`} />
            <Tab icon={<PersonAdd />} label="Discover" />
            <Tab icon={<Article />} label={`Recent Posts (${recentPosts.length})`} />
          </Tabs>
        </Box>

        <CardContent>
          {/* Following Tab */}
          {currentTab === 0 && (
            <Box>
              {filteredUsers(following).length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary" gutterBottom>
                    {searchTerm ? 'No users found matching your search' : 'You are not following anyone yet'}
                  </Typography>
                  {!searchTerm && (
                    <Button
                      variant="contained"
                      onClick={() => setCurrentTab(2)}
                      sx={{
                        background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #F7931E 30%, #FF6B35 90%)',
                        }
                      }}
                    >
                      Discover Users
                    </Button>
                  )}
                </Box>
              ) : (
                <List>
                  {filteredUsers(following).map((followedUser, index) => (
                    <React.Fragment key={followedUser._id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar
                            src={followedUser.avatar}
                            sx={{ width: 56, height: 56, cursor: 'pointer' }}
                            onClick={() => navigate(`/users/${followedUser._id}`)}
                          >
                            {followedUser.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                onClick={() => navigate(`/users/${followedUser._id}`)}
                              >
                                {followedUser.name}
                              </Typography>
                              {followedUser.authorVerified && (
                                <Chip label="Verified" color="success" size="small" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              {followedUser.bio && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                  {followedUser.bio.substring(0, 100)}...
                                </Typography>
                              )}
                              {followedUser.location && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <LocationOn sx={{ fontSize: 14 }} />
                                  <Typography variant="caption">
                                    {followedUser.location}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <FollowButton
                            userId={followedUser._id}
                            initialFollowing
                            size="small"
                            variant="button"
                            onFollowChange={(isFollowing, followerCount) => handleFollowChange(followedUser._id, isFollowing, followerCount)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < filteredUsers(following).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}

          {/* Followers Tab */}
          {currentTab === 1 && (
            <Box>
              {filteredUsers(followers).length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    {searchTerm ? 'No followers found matching your search' : 'No followers yet'}
                  </Typography>
                </Box>
              ) : (
                <List>
                  {filteredUsers(followers).map((follower, index) => (
                    <React.Fragment key={follower._id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar
                            src={follower.avatar}
                            sx={{ width: 56, height: 56, cursor: 'pointer' }}
                            onClick={() => navigate(`/users/${follower._id}`)}
                          >
                            {follower.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                onClick={() => navigate(`/users/${follower._id}`)}
                              >
                                {follower.name}
                              </Typography>
                              {follower.authorVerified && (
                                <Chip label="Verified" color="success" size="small" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              {follower.bio && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                  {follower.bio.substring(0, 100)}...
                                </Typography>
                              )}
                              {follower.location && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                  <LocationOn sx={{ fontSize: 14 }} />
                                  <Typography variant="caption">
                                    {follower.location}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <FollowButton
                            userId={follower._id}
                            initialFollowing={following.some(f => f._id === follower._id)}
                            size="small"
                            variant="button"
                            onFollowChange={(isFollowing, followerCount) => handleFollowChange(follower._id, isFollowing, followerCount)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < filteredUsers(followers).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}

          {/* Discover Tab */}
          {currentTab === 2 && (
            <Box>
              {filteredUsers(suggestedUsers).length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    {searchTerm ? 'No users found matching your search' : 'No new users to discover'}
                  </Typography>
                </Box>
              ) : (
                <List>
                  {filteredUsers(suggestedUsers).map((suggestedUser, index) => (
                    <React.Fragment key={suggestedUser._id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar
                            src={suggestedUser.avatar}
                            sx={{ width: 56, height: 56, cursor: 'pointer' }}
                            onClick={() => navigate(`/users/${suggestedUser._id}`)}
                          >
                            {suggestedUser.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography
                                variant="subtitle1"
                                sx={{ fontWeight: 'bold', cursor: 'pointer' }}
                                onClick={() => navigate(`/users/${suggestedUser._id}`)}
                              >
                                {suggestedUser.name}
                              </Typography>
                              {suggestedUser.authorVerified && (
                                <Chip label="Verified" color="success" size="small" />
                              )}
                              {suggestedUser.totalPosts > 10 && (
                                <Chip label="Active" color="primary" size="small" />
                              )}
                            </Box>
                          }
                          secondary={
                            <Box>
                              {suggestedUser.bio && (
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                  {suggestedUser.bio.substring(0, 100)}...
                                </Typography>
                              )}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                {suggestedUser.location && (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <LocationOn sx={{ fontSize: 14 }} />
                                    <Typography variant="caption">
                                      {suggestedUser.location}
                                    </Typography>
                                  </Box>
                                )}
                                <Typography variant="caption" color="text.secondary">
                                  {suggestedUser.followers?.length || 0} followers
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {suggestedUser.totalPosts || 0} posts
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                        <ListItemSecondaryAction>
                          <FollowButton
                            userId={suggestedUser._id}
                            initialFollowing={false}
                            size="small"
                            variant="button"
                            onFollowChange={(isFollowing, followerCount) => handleFollowChange(suggestedUser._id, isFollowing, followerCount)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                      {index < filteredUsers(suggestedUsers).length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}

          {/* Recent Posts Tab */}
          {currentTab === 3 && (
            <Box>
              {recentPosts.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    No recent posts from people you follow
                  </Typography>
                </Box>
              ) : (
                <List>
                  {recentPosts.map((post, index) => (
                    <React.Fragment key={post._id}>
                      <ListItem
                        button
                        onClick={() => navigate(`/blogs/${post._id}`)}
                        sx={{ borderRadius: 2, mb: 1 }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={post.author?.avatar}
                            sx={{ width: 48, height: 48 }}
                          >
                            {post.author?.name?.charAt(0)?.toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                              {post.title}
                            </Typography>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                by {post.author?.name} • {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {post.content?.substring(0, 100)}...
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentPosts.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default FollowingPage;
