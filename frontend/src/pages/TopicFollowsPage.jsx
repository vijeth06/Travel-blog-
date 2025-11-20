import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Chip,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add, Delete, Notifications, NotificationsOff } from '@mui/icons-material';
import { getFollowedTopics, followTopic, unfollowTopic, getTopicFeed } from '../api/topicFollows';
import { Link } from 'react-router-dom';

const TopicFollowsPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [follows, setFollows] = useState([]);
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [followType, setFollowType] = useState('tag');
  const [followValue, setFollowValue] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 0) {
        const res = await getFollowedTopics();
        setFollows(res.data?.data || []);
      } else {
        const res = await getTopicFeed();
        setFeed(res.data?.data || []);
      }
    } catch (err) {
      console.error('Failed to load data', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!followValue.trim()) return;
    try {
      await followTopic({ followType, followValue: followValue.trim() });
      setDialogOpen(false);
      setFollowValue('');
      loadData();
    } catch (err) {
      console.error('Failed to follow topic', err);
      setError('Failed to follow topic');
    }
  };

  const handleUnfollow = async (type, value) => {
    try {
      await unfollowTopic({ followType: type, followValue: value });
      loadData();
    } catch (err) {
      console.error('Failed to unfollow topic', err);
      setError('Failed to unfollow topic');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Topics & Interests
        </Typography>
        {activeTab === 0 && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
            Follow Topic
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="My Topics" />
        <Tab label="Personalized Feed" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : activeTab === 0 ? (
        follows.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No topics followed yet
            </Typography>
            <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)} sx={{ mt: 2 }}>
              Follow Your First Topic
            </Button>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {follows.map((follow) => (
              <Grid item xs={12} sm={6} md={4} key={follow._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <Box>
                        <Chip label={follow.followType} size="small" sx={{ mb: 1 }} />
                        <Typography variant="h6">{follow.followValue}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {follow.notificationsEnabled ? <Notifications fontSize="small" /> : <NotificationsOff fontSize="small" />}
                          {follow.notificationsEnabled ? ' Notifications ON' : ' Notifications OFF'}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleUnfollow(follow.followType, follow.followValue)}
                      >
                        Unfollow
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      ) : (
        feed.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              Follow topics to see personalized content
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {feed.map((blog) => (
              <Grid item xs={12} sm={6} md={4} key={blog._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {blog.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {blog.excerpt || blog.content.substring(0, 100)}...
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                      {blog.tags?.slice(0, 3).map((tag, idx) => (
                        <Chip key={idx} label={tag} size="small" />
                      ))}
                    </Box>
                    <Button component={Link} to={`/blogs/${blog._id}`} size="small">
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Follow a Topic</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            margin="normal"
            label="Type"
            SelectProps={{ native: true }}
            value={followType}
            onChange={(e) => setFollowType(e.target.value)}
          >
            <option value="tag">Tag</option>
            <option value="continent">Continent</option>
            <option value="country">Country</option>
            <option value="city">City</option>
            <option value="category">Category</option>
          </TextField>
          <TextField
            fullWidth
            label="Value"
            margin="normal"
            value={followValue}
            onChange={(e) => setFollowValue(e.target.value)}
            helperText="e.g., Adventure, Asia, Japan, Tokyo"
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleFollow} variant="contained" disabled={!followValue.trim()}>
            Follow
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TopicFollowsPage;
