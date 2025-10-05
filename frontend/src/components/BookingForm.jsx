import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const BookingForm = ({ package: pkg, onSubmit, loading = false }) => {
  const [formData, setFormData] = useState({
    travelers: [
      {
        name: '',
        age: '',
        gender: '',
        passport: '',
        nationality: ''
      }
    ],
    contactInfo: {
      phone: '',
      email: '',
      address: '',
      emergencyContact: {
        name: '',
        phone: '',
        relation: ''
      }
    },
    travelDates: {
      startDate: null,
      endDate: null
    },
    numberOfTravelers: 1,
    paymentInfo: {
      method: 'Credit Card'
    },
    specialRequests: ''
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (field, value, index = null, subField = null) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (field === 'travelers' && index !== null) {
        newData.travelers[index] = {
          ...newData.travelers[index],
          [subField]: value
        };
      } else if (field === 'contactInfo' && subField) {
        if (subField.includes('.')) {
          const [parent, child] = subField.split('.');
          newData.contactInfo[parent] = {
            ...newData.contactInfo[parent],
            [child]: value
          };
        } else {
          newData.contactInfo[subField] = value;
        }
      } else if (field === 'travelDates') {
        newData.travelDates[subField] = value;
      } else {
        newData[field] = value;
      }
      
      return newData;
    });
  };

  const addTraveler = () => {
    setFormData(prev => ({
      ...prev,
      travelers: [
        ...prev.travelers,
        {
          name: '',
          age: '',
          gender: '',
          passport: '',
          nationality: ''
        }
      ],
      numberOfTravelers: prev.numberOfTravelers + 1
    }));
  };

  const removeTraveler = (index) => {
    if (formData.travelers.length > 1) {
      setFormData(prev => ({
        ...prev,
        travelers: prev.travelers.filter((_, i) => i !== index),
        numberOfTravelers: prev.numberOfTravelers - 1
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate travelers
    formData.travelers.forEach((traveler, index) => {
      if (!traveler.name) newErrors[`traveler_${index}_name`] = 'Name is required';
      if (!traveler.age) newErrors[`traveler_${index}_age`] = 'Age is required';
      if (!traveler.gender) newErrors[`traveler_${index}_gender`] = 'Gender is required';
    });

    // Validate contact info
    if (!formData.contactInfo.phone) newErrors.phone = 'Phone is required';
    if (!formData.contactInfo.email) newErrors.email = 'Email is required';
    if (!formData.contactInfo.address) newErrors.address = 'Address is required';

    // Validate travel dates
    if (!formData.travelDates.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.travelDates.endDate) newErrors.endDate = 'End date is required';
    
    if (formData.travelDates.startDate && formData.travelDates.endDate) {
      if (formData.travelDates.endDate <= formData.travelDates.startDate) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const bookingData = {
        ...formData,
        packageId: pkg._id,
        totalAmount: pkg.price * formData.numberOfTravelers
      };
      onSubmit(bookingData);
    }
  };

  const calculateTotal = () => {
    let total = pkg.price * formData.numberOfTravelers;
    if (pkg.discount && pkg.discount.percentage > 0) {
      total = total * (1 - pkg.discount.percentage / 100);
    }
    return total;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Book Your Trip
        </Typography>
        
        <form onSubmit={handleSubmit}>
          {/* Travel Dates */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Travel Dates
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Start Date"
                  value={formData.travelDates.startDate}
                  onChange={(date) => handleInputChange('travelDates', date, null, 'startDate')}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={!!errors.startDate}
                      helperText={errors.startDate}
                    />
                  )}
                  minDate={new Date()}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="End Date"
                  value={formData.travelDates.endDate}
                  onChange={(date) => handleInputChange('travelDates', date, null, 'endDate')}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      error={!!errors.endDate}
                      helperText={errors.endDate}
                    />
                  )}
                  minDate={formData.travelDates.startDate || new Date()}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Travelers Information */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Travelers Information
              </Typography>
              <Button variant="outlined" onClick={addTraveler}>
                Add Traveler
              </Button>
            </Box>

            {formData.travelers.map((traveler, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">
                    Traveler {index + 1}
                  </Typography>
                  {formData.travelers.length > 1 && (
                    <Button 
                      color="error" 
                      onClick={() => removeTraveler(index)}
                    >
                      Remove
                    </Button>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      value={traveler.name}
                      onChange={(e) => handleInputChange('travelers', e.target.value, index, 'name')}
                      error={!!errors[`traveler_${index}_name`]}
                      helperText={errors[`traveler_${index}_name`]}
                    />
                  </Grid>
                  <Grid xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Age"
                      type="number"
                      value={traveler.age}
                      onChange={(e) => handleInputChange('travelers', e.target.value, index, 'age')}
                      error={!!errors[`traveler_${index}_age`]}
                      helperText={errors[`traveler_${index}_age`]}
                    />
                  </Grid>
                  <Grid xs={12} md={3}>
                    <FormControl fullWidth error={!!errors[`traveler_${index}_gender`]}>
                      <InputLabel>Gender</InputLabel>
                      <Select
                        value={traveler.gender}
                        onChange={(e) => handleInputChange('travelers', e.target.value, index, 'gender')}
                      >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Passport Number (Optional)"
                      value={traveler.passport}
                      onChange={(e) => handleInputChange('travelers', e.target.value, index, 'passport')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Nationality (Optional)"
                      value={traveler.nationality}
                      onChange={(e) => handleInputChange('travelers', e.target.value, index, 'nationality')}
                    />
                  </Grid>
                </Grid>
              </Paper>
            ))}
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Contact Information */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={formData.contactInfo.phone}
                  onChange={(e) => handleInputChange('contactInfo', e.target.value, null, 'phone')}
                  error={!!errors.phone}
                  helperText={errors.phone}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.contactInfo.email}
                  onChange={(e) => handleInputChange('contactInfo', e.target.value, null, 'email')}
                  error={!!errors.email}
                  helperText={errors.email}
                />
              </Grid>
              <Grid xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  value={formData.contactInfo.address}
                  onChange={(e) => handleInputChange('contactInfo', e.target.value, null, 'address')}
                  error={!!errors.address}
                  helperText={errors.address}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
              Emergency Contact
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.contactInfo.emergencyContact.name}
                  onChange={(e) => handleInputChange('contactInfo', e.target.value, null, 'emergencyContact.name')}
                />
              </Grid>
              <Grid xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.contactInfo.emergencyContact.phone}
                  onChange={(e) => handleInputChange('contactInfo', e.target.value, null, 'emergencyContact.phone')}
                />
              </Grid>
              <Grid xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Relation"
                  value={formData.contactInfo.emergencyContact.relation}
                  onChange={(e) => handleInputChange('contactInfo', e.target.value, null, 'emergencyContact.relation')}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* Special Requests */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Special Requests (Optional)"
              multiline
              rows={3}
              value={formData.specialRequests}
              onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            />
          </Box>

          {/* Payment Method */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Payment Method
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={formData.paymentInfo.method}
                onChange={(e) => handleInputChange('paymentInfo', { method: e.target.value })}
              >
                <MenuItem value="Credit Card">Credit Card</MenuItem>
                <MenuItem value="Debit Card">Debit Card</MenuItem>
                <MenuItem value="PayPal">PayPal</MenuItem>
                <MenuItem value="Bank Transfer">Bank Transfer</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Total Amount */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              Booking Summary
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>Package Price:</Typography>
              <Typography>${pkg.price} x {formData.numberOfTravelers}</Typography>
            </Box>
            {pkg.discount && pkg.discount.percentage > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography color="error">Discount ({pkg.discount.percentage}%):</Typography>
                <Typography color="error">
                  -${(pkg.price * formData.numberOfTravelers * pkg.discount.percentage / 100).toFixed(2)}
                </Typography>
              </Box>
            )}
            <Divider sx={{ my: 1 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="h6">Total Amount:</Typography>
              <Typography variant="h6" color="primary">
                ${calculateTotal().toFixed(2)}
              </Typography>
            </Box>
          </Paper>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </form>
      </Paper>
    </LocalizationProvider>
  );
};

export default BookingForm;
