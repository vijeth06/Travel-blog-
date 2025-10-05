import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Chip,
  Rating,
  Avatar,
  Button,
  TextField,
  Divider,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tooltip,
  Fade,
  CircularProgress
} from '@mui/material';
import {
  Close,
  Favorite,
  FavoriteBorder,
  Comment,
  Visibility,
  LocationOn,
  CalendarToday,
  Schedule,
  AttachMoney,
  TipsAndUpdates as Tips,
  Send,
  Star
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { favoritePlacesAPI } from '../api/favoritePlaces';
import { formatDistanceToNow } from 'date-fns';

const FavoritePlaceDetail = ({ open, onClose, place, onLikeToggle, onCommentAdd }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (place) {
      setLikesCount(place.likesCount || 0);
      setComments(place.comments || []);
      setCurrentImageIndex(0);
      
      // Check if current user has liked this place
      if (user && place.likes) {
        setIsLiked(place.likes.some(like => like.user._id === user.id || like.user === user.id));
      }
    }
  }, [place, user]);

  const handleLikeToggle = async () => {
    if (!user || !place || isTogglingLike) return;

    setIsTogglingLike(true);
    try {
      const response = await favoritePlacesAPI.toggleLikePlace(place._id);
      setIsLiked(response.data.isLiked);
      setLikesCount(response.data.likesCount);
      
      if (onLikeToggle) {
        onLikeToggle(place._id, response.data);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsTogglingLike(false);
    }
  };

  const handleCommentSubmit = async () => {
    if (!user || !place || !newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const response = await favoritePlacesAPI.addCommentToPlace(place._id, newComment.trim());
      setComments(prev => [...prev, response.data]);
      setNewComment('');
      
      if (onCommentAdd) {
        onCommentAdd(place._id, response.data);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleCommentSubmit();
    }
  };

  if (!place) return null;

  const mainImage = place.images?.find(img => img.isMain) || place.images?.[0];
  const allImages = place.images || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ p: 0, position: 'relative' }}>
        {/* Image Gallery */}
        <Box sx={{ position: 'relative', height: 300, overflow: 'hidden' }}>
          {mainImage && (
            <img
              src={allImages[currentImageIndex]?.url || mainImage.url}
              alt={allImages[currentImageIndex]?.alt || mainImage.alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
          )}
          
          {/* Image Navigation */}
          {allImages.length > 1 && (
            <Box sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1
            }}>
              {allImages.map((_, index) => (
                <Box
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: index === currentImageIndex ? 'white' : 'rgba(255,255,255,0.5)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </Box>
          )}

          {/* Close Button */}
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(0,0,0,0.5)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(0,0,0,0.7)'
              }
            }}
          >
            <Close />
          </IconButton>

          {/* Overlay with basic info */}
          <Box sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
            color: 'white',
            p: 3
          }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {place.placeName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <LocationOn fontSize="small" />
                <Typography variant="body2">
                  {place.city}, {place.country} • {place.continent}
                </Typography>
              </Box>
              <Rating value={place.rating} readOnly size="small" />
            </Box>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* User Info and Actions */}
        <Box sx={{ p: 3, borderBottom: '1px solid #eee' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={place.user?.avatar} sx={{ width: 48, height: 48 }}>
                {place.user?.name?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {place.user?.name || 'Anonymous'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Visited {place.visitDate ? new Date(place.visitDate).toLocaleDateString() : 'Unknown date'}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant={isLiked ? "contained" : "outlined"}
                color="error"
                startIcon={isTogglingLike ? <CircularProgress size={16} /> : (isLiked ? <Favorite /> : <FavoriteBorder />)}
                onClick={handleLikeToggle}
                disabled={!user || isTogglingLike}
                size="small"
              >
                {likesCount}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Comment />}
                size="small"
              >
                {comments.length}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Visibility />}
                size="small"
              >
                {place.viewsCount || 0}
              </Button>
            </Box>
          </Box>

          {/* Categories */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {place.categories?.map((category, index) => (
              <Chip
                key={index}
                label={category}
                size="small"
                variant="outlined"
                color="primary"
              />
            ))}
          </Box>
        </Box>

        {/* Description */}
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            My Experience
          </Typography>
          <Typography variant="body1" paragraph sx={{ lineHeight: 1.7 }}>
            {place.description}
          </Typography>
        </Box>

        {/* Trip Details */}
        <Box sx={{ px: 3, pb: 3 }}>
          <Grid container spacing={3}>
            {/* Visit Info */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Trip Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemIcon><CalendarToday color="action" /></ListItemIcon>
                      <ListItemText
                        primary="Visit Date"
                        secondary={place.visitDate ? new Date(place.visitDate).toLocaleDateString() : 'Not specified'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Schedule color="action" /></ListItemIcon>
                      <ListItemText
                        primary="Duration"
                        secondary={place.stayDuration || 'Not specified'}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Star color="action" /></ListItemIcon>
                      <ListItemText
                        primary="Best Time to Visit"
                        secondary={place.bestTimeToVisit || 'Not specified'}
                      />
                    </ListItem>
                    {place.budget && (
                      <ListItem>
                        <ListItemIcon><AttachMoney color="action" /></ListItemIcon>
                        <ListItemText
                          primary="Budget"
                          secondary={`${place.budget.amount} ${place.budget.currency} - ${place.budget.notes}`}
                        />
                      </ListItem>
                    )}
                  </List>
                </CardContent>
              </Card>
            </Grid>

            {/* Personal Tips */}
            {place.personalTips && place.personalTips.length > 0 && (
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      <Tips sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Personal Tips
                    </Typography>
                    <List dense>
                      {place.personalTips.map((tip, index) => (
                        <ListItem key={index}>
                          <ListItemText
                            primary={`${index + 1}. ${tip}`}
                            sx={{ '& .MuiListItemText-primary': { fontSize: '0.9rem' } }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>

        <Divider />

        {/* Comments Section */}
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Comments ({comments.length})
          </Typography>

          {/* Add Comment */}
          {user && (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <Avatar src={user.avatar} sx={{ width: 32, height: 32 }}>
                  {user.name?.charAt(0)}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={2}
                    placeholder="Share your thoughts about this place..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={handleKeyPress}
                    variant="outlined"
                    size="small"
                  />
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={isSubmittingComment ? <CircularProgress size={16} /> : <Send />}
                      onClick={handleCommentSubmit}
                      disabled={!newComment.trim() || isSubmittingComment}
                    >
                      Comment
                    </Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}

          {/* Comments List */}
          <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {comments.length === 0 ? (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                No comments yet. Be the first to share your thoughts!
              </Typography>
            ) : (
              comments.map((comment, index) => (
                <Fade in key={comment._id || index} timeout={300}>
                  <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                    <Avatar src={comment.user?.avatar} sx={{ width: 32, height: 32 }}>
                      {comment.user?.name?.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {comment.user?.name || 'Anonymous'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {comment.createdAt ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true }) : 'Just now'}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                        {comment.content}
                      </Typography>
                    </Box>
                  </Box>
                </Fade>
              ))
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default FavoritePlaceDetail;