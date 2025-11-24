import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Avatar,
  Chip,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  Tooltip,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  EmojiEvents,
  Star,
  TrendingUp,
  Assignment,
  Flight,
  LocationOn,
  Camera,
  Share,
  Favorite,
  Comment,
  Close,
  AccessTime,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import axios from 'axios';

const GamificationPage = () => {
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);
  const [userStats, setUserStats] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      fetchGamificationData();
      fetchUserAnalytics();
    }
  }, [token]);

  // Session time tracker
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setSessionTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const fetchUserAnalytics = async () => {
    try {
      const [statsRes, activityRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/gamification/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/gamification/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => ({ data: null })) // Optional endpoint
      ]);

      setUserStats(statsRes.data);
      setActivityData(activityRes.data);
    } catch (error) {
      console.error('Error fetching user analytics:', error);
    }
  };

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      const [profileRes, achievementsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/gamification/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${process.env.REACT_APP_API_URL}/gamification/achievements`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setProfile(profileRes.data);
      setAchievements(achievementsRes.data.achievements || []);
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLevelProgress = () => {
    if (!profile) return 0;
    const currentLevelPoints = profile.totalPoints % 1000;
    return (currentLevelPoints / 1000) * 100;
  };

  const getAchievementIcon = (type) => {
    switch (type) {
      case 'first_blog':
        return <Assignment color="primary" />;
      case 'travel_expert':
        return <Flight color="secondary" />;
      case 'explorer':
        return <LocationOn color="success" />;
      case 'photographer':
        return <Camera color="warning" />;
      case 'social_butterfly':
        return <Share color="info" />;
      default:
        return <EmojiEvents color="primary" />;
    }
  };

  const handleAchievementClick = (achievement) => {
    setSelectedAchievement(achievement);
  };

  const handleCloseDialog = () => {
    setSelectedAchievement(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Loading your achievements...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
        Your Travel Achievements
      </Typography>

      {/* Profile Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ width: 70, height: 70, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
              >
                <Typography variant="h5" color="white">
                  {profile?.level || 1}
                </Typography>
              </Avatar>
              <Typography variant="h6" gutterBottom>
                Level {profile?.level || 1} Traveler
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profile?.totalPoints || 0} total points
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Progress to Level {(profile?.level || 1) + 1}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={getLevelProgress()}
                  sx={{ height: 6, borderRadius: 3 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {profile?.nextLevelPoints - (profile?.totalPoints || 0)} points to go
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card elevation={2}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Activity Stats
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                    <Typography variant="h5" color="primary">
                      {profile?.stats?.blogsCreated || 0}
                    </Typography>
                    <Typography variant="caption">Blogs Written</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                    <Typography variant="h5" color="secondary">
                      {profile?.stats?.countriesVisited || 0}
                    </Typography>
                    <Typography variant="caption">Countries</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                    <Typography variant="h5" color="success.main">
                      {profile?.stats?.photosUploaded || 0}
                    </Typography>
                    <Typography variant="caption">Photos</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 1.5, textAlign: 'center' }}>
                    <Typography variant="h5" color="warning.main">
                      {profile?.stats?.likesReceived || 0}
                    </Typography>
                    <Typography variant="caption">Likes</Typography>
                  </Paper>
                </Grid>
              </Grid>
              
              {/* Real-time Session Tracking */}
              <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'primary.main' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTime color="primary" />
                    <Typography variant="subtitle1" fontWeight="bold">
                      Current Session
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    {formatTime(sessionTime)}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                  Active time since page load
                </Typography>
              </Box>

              {/* Real User Analytics Data */}
              {userStats && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'success.light', borderRadius: 2, color: 'white' }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    📊 Your Platform Analytics
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Total Time on Platform
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {userStats.totalTimeSpent ? formatTime(userStats.totalTimeSpent) : '0h 0m'}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Current Streak
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {userStats.loginStreak || 0} days 🔥
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Activities Completed
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {userStats.activitiesCompleted || 0}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        Last Active
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {userStats.lastActive ? new Date(userStats.lastActive).toLocaleDateString() : 'Today'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              )}

              {/* Activity Heatmap/Timeline */}
              {activityData && activityData.recentActivities && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Recent Activity
                  </Typography>
                  <List dense>
                    {activityData.recentActivities.slice(0, 5).map((activity, index) => (
                      <ListItem key={index} sx={{ py: 0.5 }}>
                        <ListItemText
                          primary={activity.type || activity.action}
                          secondary={activity.createdAt ? new Date(activity.createdAt).toLocaleString() : 'Recently'}
                          primaryTypographyProps={{ variant: 'caption' }}
                          secondaryTypographyProps={{ variant: 'caption', fontSize: '0.7rem' }}
                        />
                        <Chip 
                          label={`+${activity.points || 0} pts`} 
                          size="small" 
                          color="primary" 
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Achievements */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Achievements ({achievements.length})
          </Typography>
          <Grid container spacing={2}>
            {achievements.map((achievement) => (
              <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 3,
                    },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onClick={() => handleAchievementClick(achievement)}
                >
                  <CardContent sx={{ textAlign: 'center', flexGrow: 1 }}>
                    <Badge
                      badgeContent={achievement.points}
                      color="primary"
                      sx={{ width: '100%', mb: 1 }}
                    >
                      <Avatar
                        sx={{
                          width: 50,
                          height: 50,
                          mx: 'auto',
                          bgcolor: achievement.unlocked ? 'gold' : 'grey.300',
                        }}
                      >
                        {getAchievementIcon(achievement.type)}
                      </Avatar>
                    </Badge>
                    <Typography variant="subtitle1" gutterBottom>
                      {achievement.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {achievement.description}
                    </Typography>
                    {achievement.unlocked && (
                      <Chip
                        label={`Unlocked ${new Date(achievement.unlockedAt).toLocaleDateString()}`}
                        color="success"
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Achievement Detail Dialog */}
      <Dialog
        open={!!selectedAchievement}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedAchievement && (
          <>
            <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
              <IconButton
                onClick={handleCloseDialog}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <Close />
              </IconButton>
              <Avatar
                sx={{
                  width: 70,
                  height: 70,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: selectedAchievement.unlocked ? 'gold' : 'grey.300',
                }}
              >
                {getAchievementIcon(selectedAchievement.type)}
              </Avatar>
              <Typography variant="h5">{selectedAchievement.title}</Typography>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedAchievement.description}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, flexWrap: 'wrap', gap: 1 }}>
                <Chip
                  label={`${selectedAchievement.points} Points`}
                  color="primary"
                  icon={<Star />}
                />
                {selectedAchievement.unlocked ? (
                  <Chip
                    label={`Unlocked ${new Date(selectedAchievement.unlockedAt).toLocaleDateString()}`}
                    color="success"
                    icon={<EmojiEvents />}
                  />
                ) : (
                  <Chip
                    label="Not Unlocked"
                    color="default"
                    variant="outlined"
                  />
                )}
              </Box>
              {selectedAchievement.requirements && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Requirements:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedAchievement.requirements}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default GamificationPage;