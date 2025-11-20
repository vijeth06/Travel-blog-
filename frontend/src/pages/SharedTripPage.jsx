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
  Chip,
  Link as MuiLink
} from '@mui/material';
import { OpenInNew } from '@mui/icons-material';
import { useParams, Link } from 'react-router-dom';
import { getSharedTrip } from '../api/trips';

const SharedTripPage = () => {
  const { token } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSharedTrip(token);
        setTrip(res.data?.data);
      } catch (e) {
        console.error('Failed to load shared trip', e);
        setError('Failed to load shared trip or trip is not public');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !trip) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{error || 'Trip not found'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Chip label="Shared Trip" color="primary" sx={{ mb: 2 }} />
        <Typography variant="h4" component="h1" gutterBottom>
          {trip.title}
        </Typography>
        {trip.user?.name && (
          <Typography variant="subtitle1" color="text.secondary" gutterBottom>
            Created by {trip.user.name}
          </Typography>
        )}
        {trip.description && (
          <Typography variant="body1" color="text.secondary" paragraph>
            {trip.description}
          </Typography>
        )}
        {(trip.startDate || trip.endDate) && (
          <Typography variant="body2" color="text.secondary">
            {trip.startDate && `From ${new Date(trip.startDate).toLocaleDateString()}`}
            {trip.endDate && ` to ${new Date(trip.endDate).toLocaleDateString()}`}
          </Typography>
        )}
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Trip Items ({trip.items?.length || 0})
      </Typography>

      {trip.items?.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No items in this trip yet.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {trip.items.map((item) => (
            <Grid item xs={12} sm={6} key={item._id}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    {item.type.toUpperCase()}
                  </Typography>
                  {(item.type === 'blog' || item.type === 'package') && (
                    <MuiLink
                      component={Link}
                      to={item.type === 'blog' ? `/blogs/${item.refId}` : `/packages/${item.refId}`}
                      sx={{ display: 'inline-flex', alignItems: 'center', fontSize: '0.9rem', mb: 1 }}
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
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default SharedTripPage;
