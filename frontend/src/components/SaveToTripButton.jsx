import React, { useState, useEffect } from 'react';
import {
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import { PlaylistAdd } from '@mui/icons-material';
import { getTrips, addTripItem, createTrip } from '../api/trips';

/**
 * SaveToTripButton
 *
 * Props:
 * - entityId: string (blog/package/place _id)
 * - type: 'blog' | 'package' | 'place'
 * - variant: 'icon' | 'button' (default 'button')
 * - size, sx, color: optional MUI button props
 */
const SaveToTripButton = ({ entityId, type, variant = 'button', size = 'small', sx, color = 'primary' }) => {
  const [open, setOpen] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [note, setNote] = useState('');
  const [newTripTitle, setNewTripTitle] = useState('');
  const [creatingTrip, setCreatingTrip] = useState(false);

  const loadTrips = async () => {
    setLoading(true);
    try {
      const res = await getTrips();
      setTrips(res.data?.data || []);
    } catch (e) {
      console.error('Failed to load trips', e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    loadTrips();
  };

  const handleClose = () => {
    if (submitting || creatingTrip) return;
    setOpen(false);
    setSelectedTripId('');
    setNote('');
    setNewTripTitle('');
  };

  const handleCreateTrip = async () => {
    if (!newTripTitle.trim()) return;
    try {
      setCreatingTrip(true);
      const res = await createTrip({ title: newTripTitle });
      const created = res.data?.data;
      if (created) {
        setTrips((prev) => [created, ...prev]);
        setSelectedTripId(created._id);
        setNewTripTitle('');
      }
    } catch (e) {
      console.error('Failed to create trip from dialog', e);
    } finally {
      setCreatingTrip(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedTripId) return;
    try {
      setSubmitting(true);
      await addTripItem(selectedTripId, {
        type,
        refId: entityId,
        note: note || undefined
      });
      handleClose();
    } catch (e) {
      console.error('Failed to save to trip', e);
    } finally {
      setSubmitting(false);
    }
  };

  const triggerProps = {
    onClick: handleOpen,
    size,
    color,
    sx,
    'aria-label': 'Save to trip'
  };

  return (
    <>
      {variant === 'icon' ? (
        <IconButton {...triggerProps}>
          <PlaylistAdd />
        </IconButton>
      ) : (
        <Button startIcon={<PlaylistAdd />} variant="outlined" {...triggerProps}>
          Save to Trip
        </Button>
      )}

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Save to Trip</DialogTitle>
        <DialogContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} />
            </Box>
          ) : trips.length === 0 ? (
            <Box sx={{ py: 2 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                You don't have any trips yet. Create one to get started.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="New trip title"
                  value={newTripTitle}
                  onChange={(e) => setNewTripTitle(e.target.value)}
                />
                <Button
                  onClick={handleCreateTrip}
                  variant="contained"
                  disabled={!newTripTitle.trim() || creatingTrip}
                >
                  {creatingTrip ? 'Creating...' : 'Create'}
                </Button>
              </Box>
            </Box>
          ) : (
            <>
              <TextField
                select
                fullWidth
                margin="normal"
                label="Choose a trip"
                value={selectedTripId}
                onChange={(e) => setSelectedTripId(e.target.value)}
              >
                {trips.map((trip) => (
                  <MenuItem key={trip._id} value={trip._id}>
                    {trip.title}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                margin="normal"
                label="Optional note"
                multiline
                minRows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Need a new trip? Enter a title below.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="New trip title"
                    value={newTripTitle}
                    onChange={(e) => setNewTripTitle(e.target.value)}
                  />
                  <Button
                    onClick={handleCreateTrip}
                    variant="outlined"
                    disabled={!newTripTitle.trim() || creatingTrip}
                  >
                    {creatingTrip ? 'Creating...' : 'Add'}
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={submitting || creatingTrip}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!selectedTripId || submitting}
          >
            {submitting ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SaveToTripButton;
