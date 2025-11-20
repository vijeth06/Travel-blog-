import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
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
  Link as MuiLink,
  Chip,
  Divider,
  Paper,
  Snackbar
} from '@mui/material';
import { Delete, Add, ArrowBack, OpenInNew, Share, Lightbulb, AttachMoney, GetApp, Event } from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  getTripById,
  updateTrip,
  addTripItem,
  removeTripItem,
  deleteTrip,
  shareTrip,
  getTripSuggestions,
  getTripCost
} from '../api/trips';

const TripDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newItemType, setNewItemType] = useState('blog');
  const [newItemRefId, setNewItemRefId] = useState('');
  const [newItemNote, setNewItemNote] = useState('');
  const [shareToken, setShareToken] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [suggestions, setSuggestions] = useState(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [cost, setCost] = useState(null);
  const [costOpen, setCostOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTripById(id);
        const data = res.data?.data;
        setTrip(data);
        setTitle(data?.title || '');
        setDescription(data?.description || '');
        setStartDate(data?.startDate ? data.startDate.substring(0, 10) : '');
        setEndDate(data?.endDate ? data.endDate.substring(0, 10) : '');
        setShareToken(data?.shareToken || '');
      } catch (e) {
        console.error('Failed to load trip', e);
        setError('Failed to load trip');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleSaveMeta = async () => {
    try {
      setSaving(true);
      const res = await updateTrip(id, { 
        title, 
        description, 
        startDate: startDate || undefined, 
        endDate: endDate || undefined 
      });
      setTrip(res.data?.data);
      setSnackbar({ open: true, message: 'Trip updated successfully' });
    } catch (e) {
      console.error('Failed to update trip', e);
      setError('Failed to update trip');
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemRefId.trim()) return;
    try {
      const res = await addTripItem(id, {
        type: newItemType,
        refId: newItemRefId,
        note: newItemNote
      });
      setTrip(res.data?.data);
      setAddDialogOpen(false);
      setNewItemRefId('');
      setNewItemNote('');
    } catch (e) {
      console.error('Failed to add item', e);
      setError('Failed to add item');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      const res = await removeTripItem(id, itemId);
      setTrip(res.data?.data);
    } catch (e) {
      console.error('Failed to remove item', e);
      setError('Failed to remove item');
    }
  };

  const handleDeleteTrip = async () => {
    try {
      await deleteTrip(id);
      navigate('/trips');
    } catch (e) {
      console.error('Failed to delete trip', e);
      setError('Failed to delete trip');
    }
  };

  const handleShare = async () => {
    try {
      const res = await shareTrip(id);
      const token = res.data?.data?.shareToken;
      setShareToken(token);
      const shareUrl = `${window.location.origin}/trips/shared/${token}`;
      navigator.clipboard.writeText(shareUrl);
      setSnackbar({ open: true, message: 'Share link copied to clipboard!' });
    } catch (e) {
      console.error('Failed to share trip', e);
      setError('Failed to share trip');
    }
  };

  const handleGetSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      setSuggestionsOpen(true);
      const res = await getTripSuggestions(id);
      setSuggestions(res.data?.data);
    } catch (e) {
      console.error('Failed to get suggestions', e);
      setError('Failed to get suggestions');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleAddSuggestion = async (type, refId, title) => {
    try {
      const res = await addTripItem(id, { type, refId, note: title });
      setTrip(res.data?.data);
      setSnackbar({ open: true, message: 'Item added to trip' });
      setSuggestionsOpen(false);
    } catch (e) {
      console.error('Failed to add suggestion', e);
      setError('Failed to add suggestion');
    }
  };

  const handleGetCost = async () => {
    try {
      const res = await getTripCost(id);
      setCost(res.data?.data);
      setCostOpen(true);
    } catch (e) {
      console.error('Failed to get cost', e);
      setError('Failed to get cost estimate');
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

  if (!trip) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Trip not found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/trips')} sx={{ mr: 2 }}>
          Back to Trips
        </Button>
        <Typography variant="h4" component="h1">
          Trip Details
        </Typography>
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <Box sx={{ mb: 3 }}>
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
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </Grid>
        </Grid>
        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={handleSaveMeta} disabled={saving || !title.trim()}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button color="secondary" startIcon={<Share />} onClick={handleShare}>
            Share Trip
          </Button>
          <Button color="info" startIcon={<Lightbulb />} onClick={handleGetSuggestions}>
            Get Suggestions
          </Button>
          <Button color="success" startIcon={<AttachMoney />} onClick={handleGetCost}>
            Cost Estimate
          </Button>
          <Button 
            color="info" 
            startIcon={<GetApp />} 
            onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/export/trip/${id}/pdf`, '_blank')}
          >
            Export PDF
          </Button>
          <Button 
            color="info" 
            startIcon={<Event />} 
            onClick={() => window.open(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/export/trip/${id}/ics`, '_blank')}
            disabled={!startDate || !endDate}
          >
            Export Calendar
          </Button>
          <Button color="error" onClick={handleDeleteTrip}>
            Delete Trip
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Items ({trip.items?.length || 0})</Typography>
        <Button variant="outlined" startIcon={<Add />} onClick={() => setAddDialogOpen(true)}>
          Add Item
        </Button>
      </Box>

      {trip.items?.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No items yet. Add blogs, packages, or places to this trip.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {trip.items.map((item) => (
            <Grid item xs={12} sm={6} key={item._id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    {item.type.toUpperCase()}
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    Ref ID: {item.refId}
                  </Typography>
                  {(item.type === 'blog' || item.type === 'package') && (
                    <MuiLink
                      component={Link}
                      to={item.type === 'blog' ? `/blogs/${item.refId}` : `/packages/${item.refId}`}
                      sx={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.85rem', mb: 0.5 }}
                    >
                      View {item.type === 'blog' ? 'blog' : 'package'}
                      <OpenInNew sx={{ fontSize: 14, ml: 0.5 }} />
                    </MuiLink>
                  )}
                  {item.note && (
                    <Typography variant="body2" color="text.secondary">
                      {item.note}
                    </Typography>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end' }}>
                  <IconButton aria-label="Remove item" onClick={() => handleRemoveItem(item._id)}>
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Item to Trip</DialogTitle>
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
            <option value="blog">Blog</option>
            <option value="package">Package</option>
            <option value="place">Place</option>
          </TextField>
          <TextField
            fullWidth
            label="Reference ID"
            margin="normal"
            value={newItemRefId}
            onChange={(e) => setNewItemRefId(e.target.value)}
            helperText="Paste the blog/package/place ID for now"
          />
          <TextField
            fullWidth
            label="Note (optional)"
            margin="normal"
            multiline
            minRows={2}
            value={newItemNote}
            onChange={(e) => setNewItemNote(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleAddItem} variant="contained" disabled={!newItemRefId.trim()}>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={suggestionsOpen} onClose={() => setSuggestionsOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Smart Suggestions for This Trip</DialogTitle>
        <DialogContent>
          {loadingSuggestions ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : suggestions ? (
            <Box>
              {suggestions.packages?.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>Suggested Packages</Typography>
                  <Grid container spacing={2}>
                    {suggestions.packages.map((pkg) => (
                      <Grid item xs={12} key={pkg._id}>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="subtitle1">{pkg.title}</Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {pkg.location} • ${pkg.price}
                          </Typography>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            onClick={() => handleAddSuggestion('package', pkg._id, pkg.title)}
                          >
                            Add to Trip
                          </Button>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              {suggestions.blogs?.length > 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Suggested Blogs</Typography>
                  <Grid container spacing={2}>
                    {suggestions.blogs.map((blog) => (
                      <Grid item xs={12} key={blog._id}>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="subtitle1">{blog.title}</Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            {blog.location} • {blog.views} views
                          </Typography>
                          <Button 
                            size="small" 
                            variant="outlined" 
                            onClick={() => handleAddSuggestion('blog', blog._id, blog.title)}
                          >
                            Add to Trip
                          </Button>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
              {(!suggestions.packages?.length && !suggestions.blogs?.length) && (
                <Typography color="text.secondary">No suggestions found for this trip.</Typography>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSuggestionsOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={costOpen} onClose={() => setCostOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Trip Cost Estimate</DialogTitle>
        <DialogContent>
          {cost ? (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Packages Cost:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right">${cost.packagesCost}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">Food & Misc ({cost.days} days):</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1" align="right">${cost.estimatedDailyCost}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider />
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6">Total Estimate:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h6" align="right" color="primary">${cost.totalEstimate}</Typography>
                </Grid>
              </Grid>
              <Alert severity="info" sx={{ mt: 2 }}>
                This is an estimate. Daily costs assume $100/day for food, transport, and miscellaneous expenses.
              </Alert>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCostOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
      />
    </Container>
  );
};

export default TripDetailPage;
