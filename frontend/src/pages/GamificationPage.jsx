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
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import axios from 'axios';

const GamificationPage = () => {
  const [profile, setProfile] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      fetchGamificationData();
    }
  }, [token]);

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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        🎮 Your Travel Achievements
      </Typography>

      {/* Profile Stats */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
              >
                <Typography variant="h4" color="white">
                  {profile?.level || 1}
                </Typography>
              </Avatar>
              <Typography variant="h5" gutterBottom>
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
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary">
                  {profile?.nextLevelPoints - (profile?.totalPoints || 0)} points to go
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 Activity Stats
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">
                      {profile?.stats?.blogsCreated || 0}
                    </Typography>
                    <Typography variant="caption">Blogs Written</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="secondary">
                      {profile?.stats?.countriesVisited || 0}
                    </Typography>
                    <Typography variant="caption">Countries</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {profile?.stats?.photosUploaded || 0}
                    </Typography>
                    <Typography variant="caption">Photos</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {profile?.stats?.likesReceived || 0}
                    </Typography>
                    <Typography variant="caption">Likes</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Achievements */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            🏆 Achievements ({achievements.length})
          </Typography>
          <Grid container spacing={2}>
            {achievements.map((achievement) => (
              <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                  onClick={() => handleAchievementClick(achievement)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Badge
                      badgeContent={achievement.points}
                      color="primary"
                      sx={{ width: '100%', mb: 1 }}
                    >
                      <Avatar
                        sx={{
                          width: 60,
                          height: 60,
                          mx: 'auto',
                          bgcolor: achievement.unlocked ? 'gold' : 'grey.300',
                        }}
                      >
                        {getAchievementIcon(achievement.type)}
                      </Avatar>
                    </Badge>
                    <Typography variant="h6" gutterBottom>
                      {achievement.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
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
                  width: 80,
                  height: 80,
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
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