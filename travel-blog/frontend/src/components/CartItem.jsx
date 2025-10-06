import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  IconButton,
  TextField,
  Button,
  Chip,
  Divider,
  Grid
} from '@mui/material';

import {
  Delete,
  Edit,
  Save,
  Cancel,
  LocationOn,
  AccessTime,
  People
} from '@mui/icons-material';
import { format } from 'date-fns';

const CartItem = ({ 
  item, 
  onUpdateQuantity, 
  onUpdateItem, 
  onRemove, 
  loading = false 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    quantity: item.quantity,
    travelers: item.travelers,
    specialRequests: item.specialRequests || ''
  });

  const handleEdit = () => {
    setIsEditing(true);
    setEditData({
      quantity: item.quantity,
      travelers: item.travelers,
      specialRequests: item.specialRequests || ''
    });
  };

  const handleSave = () => {
    onUpdateItem(item._id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      quantity: item.quantity,
      travelers: item.travelers,
      specialRequests: item.specialRequests || ''
    });
  };

  const handleQuantityChange = (newQuantity) => {
    if (newQuantity < 1) return;
    setEditData(prev => ({ ...prev, quantity: newQuantity }));
  };

  const handleTravelersChange = (newTravelers) => {
    if (newTravelers < 1) return;
    setEditData(prev => ({ ...prev, travelers: newTravelers }));
  };

  const formatDate = (date) => {
    return format(new Date(date), 'MMM dd, yyyy');
  };

  const calculateItemTotal = () => {
    return item.priceAtTime * item.quantity;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  return (
    <Card sx={{ mb: 2 }}>
      <Grid container>
        <Grid xs={12} md={4}>
          <CardMedia
            component="img"
            height="200"
            image={item.package?.images?.[0] || '/placeholder-image.jpg'}
            alt={item.package?.title}
            sx={{ objectFit: 'cover' }}
          />
        </Grid>
        
        <Grid xs={12} md={8}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Typography variant="h6" component="h3">
                {item.package?.title}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {!isEditing ? (
                  <>
                    <IconButton 
                      size="small" 
                      onClick={handleEdit}
                      disabled={loading}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => onRemove(item._id)}
                      disabled={loading}
                    >
                      <Delete />
                    </IconButton>
                  </>
                ) : (
                  <>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      <Save />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      <Cancel />
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>

            {/* Package Details */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn color="action" fontSize="small" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                  {item.package?.location}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccessTime color="action" fontSize="small" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                  {item.package?.duration}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <People color="action" fontSize="small" />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                  {item.package?.type}
                </Typography>
              </Box>
            </Box>

            {/* Travel Dates */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Travel Dates: {formatDate(item.travelDates.startDate)} - {formatDate(item.travelDates.endDate)}
              </Typography>
            </Box>

            {/* Quantity and Travelers */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid xs={6} md={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Quantity
                </Typography>
                {isEditing ? (
                  <TextField
                    type="number"
                    size="small"
                    value={editData.quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                    inputProps={{ min: 1 }}
                    fullWidth
                  />
                ) : (
                  <Typography variant="body1">
                    {item.quantity}
                  </Typography>
                )}
              </Grid>
              
              <Grid xs={6} md={3}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Travelers
                </Typography>
                {isEditing ? (
                  <TextField
                    type="number"
                    size="small"
                    value={editData.travelers}
                    onChange={(e) => handleTravelersChange(parseInt(e.target.value))}
                    inputProps={{ min: 1 }}
                    fullWidth
                  />
                ) : (
                  <Typography variant="body1">
                    {item.travelers}
                  </Typography>
                )}
              </Grid>
              
              <Grid xs={12} md={6}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Price per item
                </Typography>
                <Typography variant="body1" color="primary" fontWeight="bold">
                  {formatPrice(item.priceAtTime)}
                </Typography>
              </Grid>
            </Grid>

            {/* Special Requests */}
            {(isEditing || item.specialRequests) && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Special Requests
                </Typography>
                {isEditing ? (
                  <TextField
                    multiline
                    rows={2}
                    size="small"
                    value={editData.specialRequests}
                    onChange={(e) => setEditData(prev => ({ ...prev, specialRequests: e.target.value }))}
                    placeholder="Any special requests..."
                    fullWidth
                  />
                ) : (
                  <Typography variant="body2">
                    {item.specialRequests || 'None'}
                  </Typography>
                )}
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Total */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Total for this item:
              </Typography>
              <Typography variant="h6" color="primary" fontWeight="bold">
                {formatPrice(calculateItemTotal())}
              </Typography>
            </Box>

            {/* Availability Warning */}
            {!item.package?.availability && (
              <Box sx={{ mt: 2 }}>
                <Chip 
                  label="This package is no longer available" 
                  color="error" 
                  size="small" 
                />
              </Box>
            )}
          </CardContent>
        </Grid>
      </Grid>
    </Card>
  );
};

export default CartItem;
