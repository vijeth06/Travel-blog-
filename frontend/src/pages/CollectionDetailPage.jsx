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
  IconButton,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip
} from '@mui/material';
import { Delete, Add, ArrowBack, Edit, Favorite } from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getCollectionById,
  updateCollection,
  addCollectionItem,
  removeCollectionItem,
  deleteCollection,
  followCollection
} from '../api/collections';

const CollectionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newItemType, setNewItemType] = useState('blog');
  const [newItemRefId, setNewItemRefId] = useState('');

  useEffect(() => {
    loadCollection();
  }, [id]);

  const loadCollection = async () => {
    try {
      const res = await getCollectionById(id);
      const data = res.data?.data;
      setCollection(data);
      setTitle(data?.title || '');
      setDescription(data?.description || '');
      setIsPublic(data?.isPublic || false);
      setTags(data?.tags?.join(', ') || '');
    } catch (e) {
      console.error('Failed to load collection', e);
      setError('Failed to load collection');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const tagArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await updateCollection(id, { title, description, isPublic, tags: tagArray });
      setCollection(res.data?.data);
      setEditMode(false);
    } catch (e) {
      console.error('Failed to update collection', e);
      setError('Failed to update collection');
    }
  };

  const handleAddItem = async () => {
    if (!newItemRefId.trim()) return;
    try {
      const res = await addCollectionItem(id, { type: newItemType, refId: newItemRefId });
      setCollection(res.data?.data);
      setAddDialogOpen(false);
      setNewItemRefId('');
    } catch (e) {
      console.error('Failed to add item', e);
      setError('Failed to add item');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const res = await removeCollectionItem(id, itemId);
      setCollection(res.data?.data);
    } catch (e) {
      console.error('Failed to remove item', e);
      setError('Failed to remove item');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCollection(id);
      navigate('/collections');
    } catch (e) {
      console.error('Failed to delete collection', e);
      setError('Failed to delete collection');
    }
  };

  const handleFollow = async () => {
    try {
      const res = await followCollection(id);
      setCollection(res.data?.data);
    } catch (e) {
      console.error('Failed to follow collection', e);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!collection) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Collection not found.</Alert>
      </Container>
    );
  }

  const isOwner = true; // Simplified - in real app check against current user

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/collections')} sx={{ mr: 2 }}>
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Collection Details
        </Typography>
        {!isOwner && (
          <IconButton onClick={handleFollow}>
            <Favorite />
          </IconButton>
        )}
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error" onClose={() => setError('')}>{error}</Alert>
        </Box>
      )}

      <Box sx={{ mb: 3 }}>
        {editMode ? (
          <>
            <TextField
              fullWidth
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
            />
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              multiline
              minRows={2}
            />
            <TextField
              fullWidth
              label="Tags (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              margin="normal"
            />
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button variant="contained" onClick={handleSave}>Save</Button>
              <Button onClick={() => setEditMode(false)}>Cancel</Button>
              <Button
                variant={isPublic ? 'outlined' : 'contained'}
                onClick={() => setIsPublic(!isPublic)}
              >
                {isPublic ? 'Public' : 'Private'}
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="h5" gutterBottom>{collection.title}</Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {collection.description || 'No description'}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {collection.tags?.map((tag, idx) => (
                <Chip key={idx} label={tag} />
              ))}
              <Chip label={collection.isPublic ? 'Public' : 'Private'} color={collection.isPublic ? 'primary' : 'default'} />
            </Box>
            {isOwner && (
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button startIcon={<Edit />} onClick={() => setEditMode(true)}>Edit</Button>
                <Button color="error" onClick={handleDelete}>Delete</Button>
              </Box>
            )}
          </>
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Items ({collection.items?.length || 0})</Typography>
        {isOwner && (
          <Button variant="outlined" startIcon={<Add />} onClick={() => setAddDialogOpen(true)}>
            Add Item
          </Button>
        )}
      </Box>

      {collection.items?.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No items yet.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {collection.items.map((item) => (
            <Grid item xs={12} sm={6} key={item._id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    {item.type.toUpperCase()}
                  </Typography>
                  <Typography variant="body2">Ref: {item.refId}</Typography>
                </CardContent>
                {isOwner && (
                  <CardActions sx={{ justifyContent: 'flex-end' }}>
                    <IconButton size="small" onClick={() => handleRemoveItem(item._id)}>
                      <Delete />
                    </IconButton>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Item</DialogTitle>
        <DialogContent>
          <TextField
            select
            fullWidth
            margin="normal"
            label="Type"
            SelectProps={{ native: true }}
            value={newItemType}
            onChange={(e) => setNewItemType(e.target.value)}
          >
            <option value="trip">Trip</option>
            <option value="blog">Blog</option>
            <option value="package">Package</option>
          </TextField>
          <TextField
            fullWidth
            label="Reference ID"
            margin="normal"
            value={newItemRefId}
            onChange={(e) => setNewItemRefId(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddItem} variant="contained" disabled={!newItemRefId.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CollectionDetailPage;
