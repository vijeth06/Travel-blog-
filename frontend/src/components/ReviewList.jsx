import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Rating,
  Avatar,
  Chip,
  IconButton,
  Button,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Menu,
  MenuItem
} from '@mui/material';
import {
  ThumbUp as ThumbUpIcon,
  ThumbUpOutlined as ThumbUpOutlinedIcon,
  MoreVert as MoreVertIcon,
  CheckCircle as CheckCircleIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

const ReviewList = ({ reviews, stats, onHelpful, onReport, currentUserId }) => {
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  const handleMenuOpen = (event, review) => {
    setMenuAnchor(event.currentTarget);
    setSelectedReview(review);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedReview(null);
  };

  const handleReport = () => {
    if (selectedReview) {
      onReport(selectedReview._id);
    }
    handleMenuClose();
  };

  const RatingBreakdown = () => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Rating Breakdown
        </Typography>
        {stats && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mr: 2 }}>
                {stats.averageRating?.toFixed(1) || 'N/A'}
              </Typography>
              <Box sx={{ flex: 1 }}>
                <Rating value={stats.averageRating || 0} readOnly precision={0.1} />
                <Typography variant="body2" color="text.secondary">
                  Based on {stats.totalReviews || 0} reviews
                </Typography>
              </Box>
            </Box>
            
            {stats.ratingDistribution && (
              <Box sx={{ mt: 2 }}>
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.ratingDistribution[rating] || 0;
                  const percentage = stats.totalReviews > 0 
                    ? (count / stats.totalReviews) * 100 
                    : 0;
                  
                  return (
                    <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Typography variant="body2" sx={{ minWidth: 60 }}>
                        {rating} <StarIcon fontSize="small" sx={{ verticalAlign: 'middle', fontSize: 16 }} />
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{ flex: 1, mx: 2, height: 8, borderRadius: 1 }}
                      />
                      <Typography variant="body2" sx={{ minWidth: 40 }}>
                        {count}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            )}

            {stats.aspectAverages && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Average Aspect Ratings
                </Typography>
                <Grid container spacing={1}>
                  {Object.entries(stats.aspectAverages).map(([aspect, value]) => (
                    value > 0 && (
                      <Grid item xs={6} key={aspect}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>
                            {aspect}
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">
                            {value.toFixed(1)}
                          </Typography>
                        </Box>
                      </Grid>
                    )
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const ReviewCard = ({ review }) => {
    const isHelpful = review.helpfulVotes?.includes(currentUserId);

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Avatar src={review.author?.avatar}>
                {review.author?.name?.[0]}
              </Avatar>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {review.author?.name}
                  </Typography>
                  {review.isVerified && (
                    <CheckCircleIcon color="primary" fontSize="small" />
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                  {review.tripType && ` • ${review.tripType}`}
                </Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={(e) => handleMenuOpen(e, review)}>
              <MoreVertIcon />
            </IconButton>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Rating value={review.overallRating} readOnly precision={0.5} />
            <Typography variant="h6" gutterBottom sx={{ mt: 1 }}>
              {review.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {review.content}
            </Typography>
          </Box>

          {review.pros && review.pros.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" fontWeight="bold" color="success.main">
                ✓ Pros:
              </Typography>
              <Typography variant="body2">
                {review.pros.join(', ')}
              </Typography>
            </Box>
          )}

          {review.cons && review.cons.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" fontWeight="bold" color="error.main">
                ✗ Cons:
              </Typography>
              <Typography variant="body2">
                {review.cons.join(', ')}
              </Typography>
            </Box>
          )}

          {review.tags && review.tags.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
              {review.tags.map((tag, idx) => (
                <Chip key={idx} label={tag} size="small" variant="outlined" />
              ))}
            </Stack>
          )}

          {review.wouldRecommend && (
            <Chip
              label="Would Recommend"
              color="success"
              size="small"
              variant="outlined"
              sx={{ mb: 2 }}
            />
          )}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              size="small"
              startIcon={isHelpful ? <ThumbUpIcon /> : <ThumbUpOutlinedIcon />}
              onClick={() => onHelpful(review._id)}
              color={isHelpful ? 'primary' : 'inherit'}
            >
              Helpful ({review.helpfulCount || 0})
            </Button>
            {review.visitDate && (
              <Typography variant="caption" color="text.secondary">
                Visited: {new Date(review.visitDate).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      <RatingBreakdown />
      
      <Typography variant="h6" gutterBottom>
        Reviews ({reviews.length})
      </Typography>
      
      {reviews.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              No reviews yet. Be the first to review!
            </Typography>
          </CardContent>
        </Card>
      ) : (
        reviews.map((review) => (
          <ReviewCard key={review._id} review={review} />
        ))
      )}

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleReport}>
          <FlagIcon sx={{ mr: 1 }} fontSize="small" />
          Report Review
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ReviewList;
