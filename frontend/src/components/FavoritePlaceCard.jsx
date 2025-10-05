import React, { useState } from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Box,
  Avatar,
  Chip,
  IconButton,
  Button,
  Rating,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Divider
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  Comment,
  Visibility,
  LocationOn,
  CalendarToday,
  Person,
  Close
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useSelector } from 'react-redux';
import { toggleLikePlace, addCommentToPlace } from '../api/favoritePlaces';

const FavoritePlaceCard = ({ place, onUpdate, onClick }) => {
  const { user } = useSelector((state) => state.auth);
  const [liked, setLiked] = useState(place.likes?.some(like => like.user === user?._id) || false);
  const [likesCount, setLikesCount] = useState(place.likesCount || place.likes?.length || 0);
  const [showDetails, setShowDetails] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(place.comments || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLiked(place.likes?.some(like => like.user === user?._id) || false);
    setLikesCount(place.likesCount || place.likes?.length || 0);
    setComments(place.comments || []);
  }, [place, user?._id]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!user) return;

    const wasLiked = liked;
    const previousLikesCount = likesCount;
    
    setLiked(!wasLiked);
    setLikesCount(wasLiked ? previousLikesCount - 1 : previousLikesCount + 1);

    try {
      const response = await toggleLikePlace(place._id);
      
      if (response.data.isLiked !== !wasLiked || response.data.likesCount !== (wasLiked ? previousLikesCount - 1 : previousLikesCount + 1)) {
        setLiked(response.data.isLiked);
        setLikesCount(response.data.likesCount);
      }
      
      if (onUpdate) {
        onUpdate({ 
          ...place, 
          likesCount: response.data.likesCount,
          isLiked: response.data.isLiked
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      setLiked(wasLiked);
      setLikesCount(previousLikesCount);
      
      alert('Failed to update like. Please try again.');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) return;

    setLoading(true);
    try {
      const response = await addCommentToPlace(place._id, newComment.trim());
      setComments([...comments, response.data]);
      setNewComment('');
      
      if (onUpdate) {
        onUpdate({ ...place, commentsCount: (place.commentsCount || 0) + 1 });
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const mainImage = place.images?.find(img => img.isMain) || place.images?.[0];

  return (
    <>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          cursor: 'pointer',
          transition: 'transform 0.2s, box-shadow 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4
          }
        }}
        onClick={onClick}
      >
        {mainImage && (
          <CardMedia
            component="img"
            height="200"
            image={mainImage.url}
            alt={mainImage.alt || place.placeName}
            sx={{ objectFit: 'cover' }}
          />
        )}
        
        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Typography variant="h6" component="h3" gutterBottom noWrap>
            {place.placeName}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {place.city ? `${place.city}, ` : ''}{place.country}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating value={place.rating} readOnly size="small" />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
              ({place.rating}/5)
            </Typography>
          </Box>

          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              mb: 1
            }}
          >
            {place.description}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar 
              src={place.user?.avatar} 
              sx={{ width: 24, height: 24, mr: 1 }}
            >
              {place.user?.name?.charAt(0)}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              by {place.user?.name}
            </Typography>
          </Box>

          {place.categories && place.categories.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
              {place.categories.slice(0, 2).map((category, index) => (
                <Chip 
                  key={index}
                  label={category} 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              ))}
              {place.categories.length > 2 && (
                <Chip 
                  label={`+${place.categories.length - 2}`} 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              )}
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              size="small" 
              onClick={handleLike}
              disabled={!user}
              color={liked ? 'error' : 'default'}
            >
              {liked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            <Typography variant="caption" sx={{ mr: 1 }}>
              {likesCount}
            </Typography>
            
            <IconButton 
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setShowComments(true);
              }}
            >
              <Comment />
            </IconButton>
            <Typography variant="caption">
              {place.commentsCount || 0}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Visibility sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="caption" color="text.secondary">
              {place.viewsCount || 0}
            </Typography>
          </Box>
        </CardActions>
      </Card>

      {/* Details Dialog */}
      <Dialog 
        open={showDetails} 
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5">{place.placeName}</Typography>
          <IconButton onClick={() => setShowDetails(false)}>
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent>
          {mainImage && (
            <Box sx={{ mb: 2 }}>
              <img 
                src={mainImage.url} 
                alt={mainImage.alt || place.placeName}
                style={{ width: '100%', height: '300px', objectFit: 'cover', borderRadius: 8 }}
              />
              {mainImage.caption && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {mainImage.caption}
                </Typography>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar src={place.user?.avatar} sx={{ mr: 2 }}>
              {place.user?.name?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1">{place.user?.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                Visited {place.visitDate ? formatDistanceToNow(new Date(place.visitDate), { addSuffix: true }) : 'recently'}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="body1">
              {place.city ? `${place.city}, ` : ''}{place.country}, {place.continent}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Rating value={place.rating} readOnly />
            <Typography variant="body1" sx={{ ml: 1 }}>
              {place.rating}/5 stars
            </Typography>
          </Box>

          <Typography variant="body1" paragraph>
            {place.description}
          </Typography>

          {place.personalTips && place.personalTips.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>Personal Tips:</Typography>
              {place.personalTips.map((tip, index) => (
                <Typography key={index} variant="body2" sx={{ mb: 1 }}>
                  • {tip}
                </Typography>
              ))}
            </Box>
          )}

          {place.bestTimeToVisit && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>Best Time to Visit:</Typography>
              <Typography variant="body2">{place.bestTimeToVisit}</Typography>
            </Box>
          )}

          {place.budget && place.budget.amount && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>Budget:</Typography>
              <Typography variant="body2">
                {place.budget.amount} {place.budget.currency}
                {place.budget.notes && ` - ${place.budget.notes}`}
              </Typography>
            </Box>
          )}

          {place.categories && place.categories.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>Categories:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {place.categories.map((category, index) => (
                  <Chip key={index} label={category} size="small" />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowComments(true)} startIcon={<Comment />}>
            Comments ({place.commentsCount || 0})
          </Button>
          <Button onClick={handleLike} startIcon={liked ? <Favorite /> : <FavoriteBorder />}>
            {liked ? 'Liked' : 'Like'} ({likesCount})
          </Button>
        </DialogActions>
      </Dialog>

      {/* Comments Dialog */}
      <Dialog 
        open={showComments} 
        onClose={() => setShowComments(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Comments for {place.placeName}
        </DialogTitle>
        
        <DialogContent>
          {user && (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Share your thoughts about this place..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                variant="outlined"
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || loading}
                sx={{ mt: 1 }}
                variant="contained"
                size="small"
              >
                Add Comment
              </Button>
            </Box>
          )}

          <Divider sx={{ mb: 2 }} />

          {comments.length === 0 ? (
            <Typography color="text.secondary" textAlign="center">
              No comments yet. Be the first to share your thoughts!
            </Typography>
          ) : (
            <Stack spacing={2}>
              {comments.map((comment, index) => (
                <Box key={index}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar src={comment.user?.avatar} sx={{ width: 32, height: 32, mr: 1 }}>
                      {comment.user?.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">{comment.user?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ ml: 5 }}>
                    {comment.content}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setShowComments(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default FavoritePlaceCard;