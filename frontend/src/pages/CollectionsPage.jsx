import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tabs,
  Tab,
  IconButton
} from '@mui/material';
import { Add, Public, Lock, Visibility, Favorite, Delete } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import {
  getCollections,
  getPublicCollections,
  createCollection,
  deleteCollection,
  followCollection
} from '../api/collections';

const CollectionsPage = () => {
  const navigate = useNavigate();
  const [myCollections, setMyCollections] = useState([]);
  const [publicCollections, setPublicCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newIsPublic, setNewIsPublic] = useState(false);
  const [newTags, setNewTags] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 0) {
        const res = await getCollections();
        setMyCollections(res.data?.data || []);
      } else {
        const res = await getPublicCollections();
        setPublicCollections(res.data?.data || []);
      }
    } catch (e) {
      console.error('Failed to load collections', e);
      setError('Failed to load collections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    try {
      const tags = newTags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await createCollection({
        title: newTitle,
        description: newDescription,
        isPublic: newIsPublic,
        tags
      });
      const newCollection = res.data?.data;
      setMyCollections([newCollection, ...myCollections]);
      setDialogOpen(false);
      setNewTitle('');
      setNewDescription('');
      setNewIsPublic(false);
      setNewTags('');
      navigate(`/collections/${newCollection._id}`);
    } catch (e) {
      console.error('Failed to create collection', e);
      setError('Failed to create collection');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCollection(id);
      setMyCollections(myCollections.filter(c => c._id !== id));
    } catch (e) {
      console.error('Failed to delete collection', e);
      setError('Failed to delete collection');
    }
  };

  const handleFollow = async (id) => {
    try {
      await followCollection(id);
      loadData();
    } catch (e) {
      console.error('Failed to follow collection', e);
    }
  };

  const collections = activeTab === 0 ? myCollections : publicCollections;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Collections
        </Typography>
        {activeTab === 0 && (
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
            Create Collection
          </Button>
        )}
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
        </Box>
      )}

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab label="My Collections" />
        <Tab label="Discover Public Collections" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : collections.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {activeTab === 0 ? 'No collections yet' : 'No public collections available'}
          </Typography>
          {activeTab === 0 && (
            <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)} sx={{ mt: 2 }}>
              Create Your First Collection
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={3}>
          {collections.map((collection) => (
            <Grid item xs={12} sm={6} md={4} key={collection._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                    {collection.isPublic ? <Public fontSize="small" /> : <Lock fontSize="small" />}
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                      {collection.title}
                    </Typography>
                  </Box>
                  {collection.user?.name && (
                    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                      by {collection.user.name}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {collection.description || 'No description'}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                    {collection.tags?.slice(0, 3).map((tag, idx) => (
                      <Chip key={idx} label={tag} size="small" />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      <Visibility fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                      {collection.views || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {collection.items?.length || 0} items
                    </Typography>
                    {collection.followers?.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        <Favorite fontSize="small" sx={{ verticalAlign: 'middle', mr: 0.5 }} />
                        {collection.followers.length}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between' }}>
                  <Button size="small" onClick={() => navigate(`/collections/${collection._id}`)}>
                    View
                  </Button>
                  {activeTab === 0 ? (
                    <IconButton size="small" color="error" onClick={() => handleDelete(collection._id)}>
                      <Delete />
                    </IconButton>
                  ) : (
                    <IconButton size="small" onClick={() => handleFollow(collection._id)}>
                      <Favorite />
                    </IconButton>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Collection</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            margin="normal"
            autoFocus
          />
          <TextField
            fullWidth
            label="Description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            margin="normal"
            multiline
            minRows={2}
          />
          <TextField
            fullWidth
            label="Tags (comma-separated)"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            margin="normal"
            helperText="e.g., Backpacking, Europe, Budget Travel"
          />
          <Box sx={{ mt: 2 }}>
            <Button
              variant={newIsPublic ? 'contained' : 'outlined'}
              startIcon={newIsPublic ? <Public /> : <Lock />}
              onClick={() => setNewIsPublic(!newIsPublic)}
            >
              {newIsPublic ? 'Public' : 'Private'}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={!newTitle.trim()}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CollectionsPage;
