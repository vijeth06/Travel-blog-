import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Rating,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Divider,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Menu,
  Alert,
  Snackbar
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  Reply as ReplyIcon,
  Flag as FlagIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
  Verified as VerifiedIcon,
  Star as StarIcon,
  FilterList as FilterIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useSelector } from 'react-redux';
import api from '../services/api';

const ReviewSystem = ({ targetType, targetId, showWriteReview = true }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [writeDialogOpen, setWriteDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [filters, setFilters] = useState({
    rating: '',
    verified: false,
    tripType: '',
    sortBy: 'newest'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalReviews: 0
  });
  const [tabValue, setTabValue] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { user, isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    fetchReviews();
    fetchStats();
  }, [targetType, targetId, filters, pagination.currentPage]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.currentPage,
        ...filters
      });

      const response = await api.get(`/reviews/${targetType}/${targetId}?${params}`);
      setReviews(response.data.reviews);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get(`/reviews/${targetType}/${targetId}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        {/* Review Statistics */}
        <ReviewStats stats={stats} />

        {/* Write Review Button */}
        {showWriteReview && isAuthenticated && (
          <Box mb={3}>
            <Button
              variant="contained"
              size="large"
              onClick={() => setWriteDialogOpen(true)}
              sx={{ mb: 2 }}
            >
              Write a Review
            </Button>
          </Box>
        )}

        {/* Review Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label={`All Reviews (${pagination.totalReviews})`} />
            <Tab label="Most Helpful" />
            <Tab label="Recent" />
            <Tab label="Verified Only" />
          </Tabs>
        </Paper>

        {/* Filters and Sorting */}
        <ReviewFilters 
          filters={filters} 
          onFilterChange={handleFilterChange}
          targetType={targetType}
        />

        {/* Reviews List */}
        <ReviewsList 
          reviews={reviews}
          loading={loading}
          user={user}
          isAuthenticated={isAuthenticated}
          onEdit={setEditingReview}
          onReviewUpdate={fetchReviews}
          showSnackbar={showSnackbar}
        />

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Button
              disabled={!pagination.hasPrev}
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
            >
              Previous
            </Button>
            <Typography sx={{ mx: 2, alignSelf: 'center' }}>
              Page {pagination.currentPage} of {pagination.totalPages}
            </Typography>
            <Button
              disabled={!pagination.hasNext}
              onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
            >
              Next
            </Button>
          </Box>
        )}

        {/* Write/Edit Review Dialog */}
        <ReviewDialog
          open={writeDialogOpen || !!editingReview}
          onClose={() => {
            setWriteDialogOpen(false);
            setEditingReview(null);
          }}
          targetType={targetType}
          targetId={targetId}
          editingReview={editingReview}
          onSuccess={() => {
            fetchReviews();
            fetchStats();
            showSnackbar(editingReview ? 'Review updated!' : 'Review submitted!');
          }}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </LocalizationProvider>
  );
};

// Review Statistics Component
const ReviewStats = ({ stats }) => {
  const { averageRating = 0, totalReviews = 0, ratingDistribution = {} } = stats;

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box textAlign="center">
              <Typography variant="h2" component="div" gutterBottom>
                {averageRating.toFixed(1)}
              </Typography>
              <Rating value={averageRating} readOnly precision={0.1} size="large" />
              <Typography variant="body2" color="text.secondary">
                Based on {totalReviews} reviews
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>Rating Distribution</Typography>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Box key={rating} display="flex" alignItems="center" mb={1}>
                <Typography variant="body2" sx={{ minWidth: 20 }}>
                  {rating}
                </Typography>
                <StarIcon sx={{ fontSize: 16, mx: 1 }} />
                <LinearProgress
                  variant="determinate"
                  value={(ratingDistribution[rating] || 0) / totalReviews * 100}
                  sx={{ flexGrow: 1, mx: 1 }}
                />
                <Typography variant="body2" sx={{ minWidth: 30 }}>
                  {ratingDistribution[rating] || 0}
                </Typography>
              </Box>
            ))}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Review Filters Component
const ReviewFilters = ({ filters, onFilterChange, targetType }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const tripTypes = ['solo', 'couple', 'family', 'friends', 'business', 'group'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'highest_rating', label: 'Highest Rating' },
    { value: 'lowest_rating', label: 'Lowest Rating' },
    { value: 'most_helpful', label: 'Most Helpful' }
  ];

  return (
    <Box mb={3}>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={(e) => setAnchorEl(e.currentTarget)}
          >
            Filters
          </Button>
        </Grid>
        
        <Grid item>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={filters.sortBy}
              onChange={(e) => onFilterChange('sortBy', e.target.value)}
              label="Sort By"
            >
              {sortOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item>
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Rating</InputLabel>
            <Select
              value={filters.rating}
              onChange={(e) => onFilterChange('rating', e.target.value)}
              label="Rating"
            >
              <MenuItem value="">All</MenuItem>
              {[5, 4, 3, 2, 1].map((rating) => (
                <MenuItem key={rating} value={rating}>
                  {rating}+ Stars
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item>
          <FormControlLabel
            control={
              <Checkbox
                checked={filters.verified}
                onChange={(e) => onFilterChange('verified', e.target.checked)}
              />
            }
            label="Verified Only"
          />
        </Grid>
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <Box p={2} minWidth={200}>
          <Typography variant="subtitle2" gutterBottom>Trip Type</Typography>
          <FormControl fullWidth size="small">
            <Select
              value={filters.tripType}
              onChange={(e) => onFilterChange('tripType', e.target.value)}
              displayEmpty
            >
              <MenuItem value="">All Trip Types</MenuItem>
              {tripTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Menu>
    </Box>
  );
};

// Reviews List Component
const ReviewsList = ({ 
  reviews, 
  loading, 
  user, 
  isAuthenticated, 
  onEdit, 
  onReviewUpdate, 
  showSnackbar 
}) => {
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  const toggleExpanded = (reviewId) => {
    const newExpanded = new Set(expandedReviews);
    if (newExpanded.has(reviewId)) {
      newExpanded.delete(reviewId);
    } else {
      newExpanded.add(reviewId);
    }
    setExpandedReviews(newExpanded);
  };

  const handleHelpful = async (reviewId, isHelpful) => {
    try {
      const endpoint = isHelpful ? 'helpful' : 'not-helpful';
      await api.post(`/reviews/${reviewId}/${endpoint}`);
      onReviewUpdate();
      showSnackbar('Thank you for your feedback!');
    } catch (error) {
      showSnackbar('Failed to submit feedback', 'error');
    }
  };

  if (loading) {
    return <Box>Loading reviews...</Box>;
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" align="center" color="text.secondary">
            No reviews yet. Be the first to share your experience!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {reviews.map((review) => {
        const isExpanded = expandedReviews.has(review._id);
        const isOwner = user?.id === review.author._id;
        
        return (
          <Card key={review._id} sx={{ mb: 3 }}>
            <CardContent>
              {/* Review Header */}
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box display="flex" gap={2}>
                  <Avatar src={review.author.avatar} alt={review.author.name} />
                  <Box>
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="h6">{review.author.name}</Typography>
                      {review.isVerified && (
                        <VerifiedIcon sx={{ color: 'primary.main', fontSize: 16 }} />
                      )}
                    </Box>
                    <Rating value={review.overallRating} readOnly size="small" />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(review.createdAt).toLocaleDateString()}
                      {review.visitDate && ` • Visited ${new Date(review.visitDate).toLocaleDateString()}`}
                    </Typography>
                  </Box>
                </Box>

                {isOwner && (
                  <Box>
                    <IconButton onClick={() => onEdit(review)}>
                      <EditIcon />
                    </IconButton>
                  </Box>
                )}
              </Box>

              {/* Review Content */}
              <Typography variant="h6" gutterBottom>{review.title}</Typography>
              <Typography variant="body1" paragraph>
                {isExpanded ? review.content : `${review.content.substring(0, 300)}...`}
                {review.content.length > 300 && (
                  <Button size="small" onClick={() => toggleExpanded(review._id)}>
                    {isExpanded ? 'Show Less' : 'Read More'}
                  </Button>
                )}
              </Typography>

              {/* Review Tags */}
              {(review.pros?.length > 0 || review.cons?.length > 0) && (
                <Box mb={2}>
                  {review.pros?.length > 0 && (
                    <Box mb={1}>
                      <Typography variant="subtitle2" color="success.main" gutterBottom>
                        Pros:
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {review.pros.map((pro, index) => (
                          <Chip key={index} label={pro} color="success" size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {review.cons?.length > 0 && (
                    <Box>
                      <Typography variant="subtitle2" color="error.main" gutterBottom>
                        Cons:
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap">
                        {review.cons.map((con, index) => (
                          <Chip key={index} label={con} color="error" size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {/* Trip Details */}
              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                {review.tripType && (
                  <Chip label={`Trip: ${review.tripType}`} size="small" />
                )}
                {review.traveledWith && (
                  <Chip label={`With: ${review.traveledWith}`} size="small" />
                )}
                {review.wouldRecommend !== undefined && (
                  <Chip 
                    label={review.wouldRecommend ? 'Recommends' : 'Doesn\'t Recommend'} 
                    color={review.wouldRecommend ? 'success' : 'error'}
                    size="small"
                  />
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Review Actions */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" gap={1}>
                  {isAuthenticated && !isOwner && (
                    <>
                      <Button
                        size="small"
                        startIcon={<ThumbUpIcon />}
                        onClick={() => handleHelpful(review._id, true)}
                      >
                        Helpful ({review.helpful?.length || 0})
                      </Button>
                      <Button
                        size="small"
                        startIcon={<ThumbDownIcon />}
                        onClick={() => handleHelpful(review._id, false)}
                      >
                        Not Helpful ({review.notHelpful?.length || 0})
                      </Button>
                    </>
                  )}
                </Box>

                <Box display="flex" gap={1}>
                  <IconButton size="small">
                    <ReplyIcon />
                  </IconButton>
                  <IconButton size="small">
                    <ShareIcon />
                  </IconButton>
                  {isAuthenticated && !isOwner && (
                    <IconButton size="small">
                      <FlagIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};

// Review Dialog Component (Write/Edit Review)
const ReviewDialog = ({ 
  open, 
  onClose, 
  targetType, 
  targetId, 
  editingReview, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    overallRating: 5,
    aspectRatings: {},
    visitDate: new Date(),
    tripType: '',
    wouldRecommend: true,
    pros: [],
    cons: [],
    traveledWith: '',
    reasonForVisit: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingReview) {
      setFormData({
        title: editingReview.title || '',
        content: editingReview.content || '',
        overallRating: editingReview.overallRating || 5,
        aspectRatings: editingReview.aspectRatings || {},
        visitDate: editingReview.visitDate ? new Date(editingReview.visitDate) : new Date(),
        tripType: editingReview.tripType || '',
        wouldRecommend: editingReview.wouldRecommend !== undefined ? editingReview.wouldRecommend : true,
        pros: editingReview.pros || [],
        cons: editingReview.cons || [],
        traveledWith: editingReview.traveledWith || '',
        reasonForVisit: editingReview.reasonForVisit || ''
      });
    } else {
      // Reset form for new review
      setFormData({
        title: '',
        content: '',
        overallRating: 5,
        aspectRatings: {},
        visitDate: new Date(),
        tripType: '',
        wouldRecommend: true,
        pros: [],
        cons: [],
        traveledWith: '',
        reasonForVisit: ''
      });
    }
  }, [editingReview, open]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const reviewData = {
        ...formData,
        targetType,
        targetId
      };

      if (editingReview) {
        await api.put(`/reviews/${editingReview._id}`, reviewData);
      } else {
        await api.post('/reviews', reviewData);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingReview ? 'Edit Review' : 'Write a Review'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Review Title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Summarize your experience"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Typography component="legend">Overall Rating</Typography>
              <Rating
                value={formData.overallRating}
                onChange={(e, value) => setFormData(prev => ({ ...prev, overallRating: value }))}
                size="large"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Visit Date"
                value={formData.visitDate}
                onChange={(newValue) => setFormData(prev => ({ ...prev, visitDate: newValue }))}
                renderInput={(params) => <TextField {...params} fullWidth />}
                maxDate={new Date()}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Your Review"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Share your experience with others..."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Trip Type</InputLabel>
                <Select
                  value={formData.tripType}
                  onChange={(e) => setFormData(prev => ({ ...prev, tripType: e.target.value }))}
                  label="Trip Type"
                >
                  <MenuItem value="solo">Solo Travel</MenuItem>
                  <MenuItem value="couple">Couple</MenuItem>
                  <MenuItem value="family">Family</MenuItem>
                  <MenuItem value="friends">Friends</MenuItem>
                  <MenuItem value="business">Business</MenuItem>
                  <MenuItem value="group">Group</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.wouldRecommend}
                    onChange={(e) => setFormData(prev => ({ ...prev, wouldRecommend: e.target.checked }))}
                  />
                }
                label="Would you recommend this?"
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={submitting || !formData.title || !formData.content}
        >
          {submitting ? 'Submitting...' : editingReview ? 'Update Review' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewSystem;