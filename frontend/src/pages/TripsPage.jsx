import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  MenuItem
} from '@mui/material';
import { Add, TravelExplore } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getTrips, createTrip, autoBuildTrip } from '../api/trips';

const TripsPage = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [autoOpen, setAutoOpen] = useState(false);
  const [autoDestination, setAutoDestination] = useState('');
  const [autoDays, setAutoDays] = useState(3);
  const [autoBudget, setAutoBudget] = useState('medium');
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoInterests, setAutoInterests] = useState([]);

  const interestOptions = [
    'Adventure',
    'Culture',
    'Food',
    'Nature',
    'Beach',
    'City',
    'History'
  ];
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTrips();
        setTrips(res.data?.data || []);
      } catch (e) {
        console.error('Failed to load trips', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) return;
    try {
      setCreating(true);
      const res = await createTrip({ title, description });
      setTrips((prev) => [res.data.data, ...prev]);
      setTitle('');
      setDescription('');
      setOpen(false);
    } catch (e) {
      console.error('Failed to create trip', e);
    } finally {
      setCreating(false);
    }
  };

  const handleAutoBuild = async () => {
    try {
      setAutoLoading(true);
      const res = await autoBuildTrip({
        destination: autoDestination || undefined,
        days: autoDays,
        budget: autoBudget,
        interests: autoInterests
      });
      const trip = res.data?.data;
      if (trip) {
        setTrips((prev) => [trip, ...prev]);
        setAutoOpen(false);
        setAutoDestination('');
        setAutoDays(3);
        setAutoBudget('medium');
        setAutoInterests([]);
        navigate(`/trips/${trip._id}`);
      }
    } catch (e) {
      console.error('Failed to auto-build trip', e);
    } finally {
      setAutoLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Trips
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setAutoOpen(true)}
          >
            Auto-build Trip
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
          >
            Create Trip
          </Button>
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : trips.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <TravelExplore sx={{ fontSize: 48, mb: 2, color: 'primary.main' }} />
          <Typography variant="h6" gutterBottom>
            No trips yet
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Start by creating a trip to group your favorite blogs, packages, and places.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
            sx={{ mt: 2 }}
          >
            Create your first trip
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {trips.map((trip) => (
            <Grid item xs={12} sm={6} md={4} key={trip._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/trips/${trip._id}`)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {trip.title}
                  </Typography>
                  {trip.description && (
                    <Typography variant="body2" color="text.secondary" gutterBottom noWrap>
                      {trip.description}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    {trip.items?.length || 0} items
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => navigate(`/trips/${trip._id}`)}>
                    View details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={() => !creating && setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Trip</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            fullWidth
            label="Description"
            margin="normal"
            multiline
            minRows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => !creating && setOpen(false)} disabled={creating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} variant="contained" disabled={creating || !title.trim()}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={autoOpen} onClose={() => !autoLoading && setAutoOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Auto-build Trip</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Destination (optional)"
            margin="normal"
            value={autoDestination}
            onChange={(e) => setAutoDestination(e.target.value)}
            helperText="Country, city, or region to focus on"
          />
          <TextField
            fullWidth
            type="number"
            label="Number of days"
            margin="normal"
            value={autoDays}
            onChange={(e) => setAutoDays(Number(e.target.value) || 1)}
            inputProps={{ min: 1, max: 30 }}
          />
          <TextField
            select
            fullWidth
            label="Budget level"
            margin="normal"
            value={autoBudget}
            onChange={(e) => setAutoBudget(e.target.value)}
          >
            <MenuItem value="low">Low</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="high">High</MenuItem>
          </TextField>
          <TextField
            select
            fullWidth
            label="Interests (optional)"
            margin="normal"
            SelectProps={{
              multiple: true,
              renderValue: (selected) => selected.join(', ')
            }}
            value={autoInterests}
            onChange={(e) =>
              setAutoInterests(
                typeof e.target.value === 'string'
                  ? e.target.value.split(',')
                  : e.target.value
              )
            }
            helperText="Choose themes to personalize your trip"
          >
            {interestOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => !autoLoading && setAutoOpen(false)} disabled={autoLoading}>
            Cancel
          </Button>
          <Button onClick={handleAutoBuild} variant="contained" disabled={autoLoading}>
            {autoLoading ? 'Building...' : 'Build Trip'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TripsPage;
