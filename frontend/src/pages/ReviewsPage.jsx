import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import {
  getReviews,
  getReviewStats,
  createReview,
  markReviewHelpful,
  reportReview,
  getUserReviews
} from '../api/reviews';

const ReviewsPage = ({ targetType, targetId, targetTitle, showUserReviews = false }) => {
  const [tab, setTab] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [error, setError] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Only show the container wrapper when it's a standalone page (showUserReviews mode)
  const isStandalone = showUserReviews && !targetType && !targetId;

  useEffect(() => {
    loadReviews();
    if (!showUserReviews && targetType && targetId) {
      loadStats();
    }
  }, [tab, targetType, targetId, showUserReviews]);

  const loadReviews = async () => {
    // Don't load if missing required params
    if (!showUserReviews && (!targetType || !targetId)) {
      setReviews([]);
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      let data;
      if (showUserReviews) {
        if (!currentUser._id) {
          setReviews([]);
          setLoading(false);
          return;
        }
        data = await getUserReviews(currentUser._id);
      } else {
        const filters = {
          sortBy: tab === 0 ? 'newest' : tab === 1 ? 'helpful' : 'rating'
        };
        data = await getReviews(targetType, targetId, filters);
      }
      setReviews(data.reviews || []);
    } catch (error) {
      console.error('Load reviews error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load reviews';
      setError(errorMessage);
      setReviews([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    if (!targetType || !targetId) return;
    
    try {
      const data = await getReviewStats(targetType, targetId);
      setStats(data);
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  const handleCreateReview = async (reviewData) => {
    try {
      await createReview(reviewData);
      setFormOpen(false);
      loadReviews();
      if (!showUserReviews) {
        loadStats();
      }
    } catch (error) {
      console.error('Create review error:', error);
      setError(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleMarkHelpful = async (reviewId) => {
    try {
      await markReviewHelpful(reviewId);
      loadReviews();
    } catch (error) {
      console.error('Mark helpful error:', error);
    }
  };

  const handleReport = async (reviewId) => {
    try {
      await reportReview(reviewId, 'inappropriate');
      setError('Review reported. Thank you for your feedback.');
    } catch (error) {
      console.error('Report error:', error);
      setError('Failed to report review');
    }
  };

  const content = (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {showUserReviews ? 'My Reviews' : targetTitle ? `Reviews for ${targetTitle}` : 'Reviews'}
        </Typography>
        {!showUserReviews && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setFormOpen(true)}
          >
            Write Review
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {!showUserReviews && (
        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
          <Tab label="Most Recent" />
          <Tab label="Most Helpful" />
          <Tab label="Highest Rated" />
        </Tabs>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <ReviewList
          reviews={reviews}
          stats={stats}
          onHelpful={handleMarkHelpful}
          onReport={handleReport}
          currentUserId={currentUser._id}
        />
      )}

      <ReviewForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreateReview}
        targetType={targetType}
        targetId={targetId}
      />
    </>
  );

  return isStandalone ? (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {content}
    </Container>
  ) : (
    content
  );
};

export default ReviewsPage;
