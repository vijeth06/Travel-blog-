import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import { Star, ShoppingCart, CheckCircle } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { getPremiumTemplates, purchaseTemplate } from '../api/premiumTemplates';

const PremiumTemplatesPage = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await getPremiumTemplates();
      setTemplates(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load templates', err);
      setError('Failed to load premium templates');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (templateId) => {
    try {
      setPurchasing(templateId);
      const res = await purchaseTemplate(templateId);
      const tripId = res.data?.data?._id;
      navigate(`/trips/${tripId}`);
    } catch (err) {
      console.error('Failed to purchase template', err);
      setError('Failed to purchase template');
    } finally {
      setPurchasing(null);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Premium Trip Templates
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Professionally curated itineraries ready to use
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {templates.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No premium templates available yet
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {templates.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {template.imageUrl && (
                  <Box
                    component="img"
                    src={template.imageUrl}
                    alt={template.title}
                    sx={{ height: 200, objectFit: 'cover' }}
                  />
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip label={template.category} size="small" color="primary" sx={{ mr: 1 }} />
                    <Chip label={`${template.duration} days`} size="small" variant="outlined" />
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {template.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {template.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>Destination:</strong> {template.destination}
                  </Typography>
                  {template.estimatedCost && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Cost:</strong> ${template.estimatedCost.min} - ${template.estimatedCost.max}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                    {template.rating > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Star sx={{ fontSize: 16, color: '#FFC107', mr: 0.5 }} />
                        <Typography variant="caption">{template.rating.toFixed(1)}</Typography>
                      </Box>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      {template.purchaseCount} purchases
                    </Typography>
                  </Box>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={purchasing === template._id ? <CircularProgress size={16} /> : template.price === 0 ? <CheckCircle /> : <ShoppingCart />}
                    onClick={() => handlePurchase(template._id)}
                    disabled={purchasing === template._id}
                  >
                    {template.price === 0 ? 'Get Free' : `Purchase $${template.price}`}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default PremiumTemplatesPage;
