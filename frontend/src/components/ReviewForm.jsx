import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  FormControlLabel,
  Switch
} from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';

const ReviewForm = ({ open, onClose, onSubmit, targetType, targetId, existingReview = null }) => {
  const [formData, setFormData] = useState(existingReview || {
    title: '',
    content: '',
    overallRating: 0,
    aspectRatings: {
      value: 0,
      service: 0,
      cleanliness: 0,
      location: 0,
      facilities: 0
    },
    tripType: '',
    visitDate: '',
    stayDuration: '',
    wouldRecommend: true,
    pros: '',
    cons: '',
    tags: ''
  });

  const handleSubmit = () => {
    const reviewData = {
      ...formData,
      targetType,
      targetId,
      pros: formData.pros.split(',').map(p => p.trim()).filter(Boolean),
      cons: formData.cons.split(',').map(c => c.trim()).filter(Boolean),
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };
    onSubmit(reviewData);
  };

  const aspectLabels = {
    value: 'Value for Money',
    service: 'Service Quality',
    cleanliness: 'Cleanliness',
    location: 'Location',
    facilities: 'Facilities'
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {existingReview ? 'Edit Review' : 'Write a Review'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 2 }}>
          {/* Overall Rating */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Overall Rating *
            </Typography>
            <Rating
              value={formData.overallRating}
              onChange={(e, value) => setFormData({ ...formData, overallRating: value })}
              size="large"
              precision={0.5}
            />
          </Box>

          {/* Title */}
          <TextField
            label="Review Title"
            fullWidth
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Summarize your experience"
          />

          {/* Content */}
          <TextField
            label="Review"
            fullWidth
            required
            multiline
            rows={4}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="Share your detailed experience..."
          />

          {/* Aspect Ratings */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Detailed Ratings
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(aspectLabels).map(([key, label]) => (
                <Grid item xs={12} sm={6} key={key}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" sx={{ minWidth: 120 }}>
                      {label}
                    </Typography>
                    <Rating
                      value={formData.aspectRatings[key]}
                      onChange={(e, value) =>
                        setFormData({
                          ...formData,
                          aspectRatings: { ...formData.aspectRatings, [key]: value }
                        })
                      }
                      size="small"
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Trip Details */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Trip Type</InputLabel>
                <Select
                  value={formData.tripType}
                  onChange={(e) => setFormData({ ...formData, tripType: e.target.value })}
                  label="Trip Type"
                >
                  <MenuItem value="solo">Solo</MenuItem>
                  <MenuItem value="couple">Couple</MenuItem>
                  <MenuItem value="family">Family</MenuItem>
                  <MenuItem value="friends">Friends</MenuItem>
                  <MenuItem value="business">Business</MenuItem>
                  <MenuItem value="group">Group</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Visit Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={formData.visitDate}
                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
              />
            </Grid>
          </Grid>

          {/* Pros and Cons */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Pros (comma-separated)"
                fullWidth
                value={formData.pros}
                onChange={(e) => setFormData({ ...formData, pros: e.target.value })}
                placeholder="Great location, Friendly staff"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cons (comma-separated)"
                fullWidth
                value={formData.cons}
                onChange={(e) => setFormData({ ...formData, cons: e.target.value })}
                placeholder="Noisy, Expensive"
              />
            </Grid>
          </Grid>

          {/* Tags */}
          <TextField
            label="Tags (comma-separated)"
            fullWidth
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="beach, luxury, family-friendly"
          />

          {/* Would Recommend */}
          <FormControlLabel
            control={
              <Switch
                checked={formData.wouldRecommend}
                onChange={(e) => setFormData({ ...formData, wouldRecommend: e.target.checked })}
              />
            }
            label="I would recommend this"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!formData.title || !formData.content || !formData.overallRating}
        >
          {existingReview ? 'Update Review' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewForm;
