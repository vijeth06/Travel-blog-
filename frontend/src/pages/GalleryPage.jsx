import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  IconButton,
  ImageList,
  ImageListItem,
  Chip,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import {
  getUserGalleries,
  createGallery,
  toggleGalleryLike,
  getFollowingStories,
  createStory
} from '../api/gallery';
import { useNavigate } from 'react-router-dom';

const GalleryPage = () => {
  const [tab, setTab] = useState(0);
  const [galleries, setGalleries] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [storyDialogOpen, setStoryDialogOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [newGallery, setNewGallery] = useState({
    title: '',
    description: '',
    tags: '',
    destination: '',
    visibility: 'public'
  });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  useEffect(() => {
    loadGalleries();
    loadStories();
  }, []);

  const loadGalleries = async () => {
    setLoading(true);
    try {
      const data = await getUserGalleries(currentUser._id);
      setGalleries(data.galleries);
    } catch (error) {
      console.error('Load galleries error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStories = async () => {
    try {
      const data = await getFollowingStories();
      setStories(data.groupedStories);
    } catch (error) {
      console.error('Load stories error:', error);
    }
  };

  const handleCreateGallery = async () => {
    try {
      await createGallery(newGallery);
      setCreateDialogOpen(false);
      setNewGallery({ title: '', description: '', tags: '', destination: '', visibility: 'public' });
      loadGalleries();
    } catch (error) {
      console.error('Create gallery error:', error);
    }
  };

  const handleLike = async (galleryId) => {
    try {
      const { isLiked, likeCount } = await toggleGalleryLike(galleryId);
      setGalleries(prev =>
        prev.map(g =>
          g._id === galleryId
            ? { ...g, isLiked, likeCount }
            : g
        )
      );
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const StoryViewer = ({ story, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      if (!story || !story.stories.length) return;

      const timer = setInterval(() => {
        if (currentIndex < story.stories.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          onClose();
        }
      }, story.stories[currentIndex]?.duration || 5000);

      return () => clearInterval(timer);
    }, [currentIndex, story, onClose]);

    if (!story || !story.stories.length) return null;

    const currentStory = story.stories[currentIndex];

    return (
      <Dialog
        open={true}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            backgroundColor: 'black',
            color: 'white',
            height: '80vh'
          }
        }}
      >
        <Box sx={{ position: 'relative', height: '100%' }}>
          {/* Progress bars */}
          <Box sx={{ display: 'flex', gap: 0.5, p: 1, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }}>
            {story.stories.map((_, idx) => (
              <Box
                key={idx}
                sx={{
                  flex: 1,
                  height: 3,
                  backgroundColor: 'rgba(255,255,255,0.3)',
                  borderRadius: 1,
                  overflow: 'hidden'
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    backgroundColor: 'white',
                    width: idx < currentIndex ? '100%' : idx === currentIndex ? '50%' : '0%',
                    transition: 'width 0.1s'
                  }}
                />
              </Box>
            ))}
          </Box>

          {/* Story header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, position: 'absolute', top: 10, left: 0, right: 0, zIndex: 1 }}>
            <Avatar src={story.user.avatar}>{story.user.name[0]}</Avatar>
            <Typography variant="subtitle2">{story.user.name}</Typography>
            <Box sx={{ flex: 1 }} />
            <IconButton onClick={onClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Story content */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              position: 'relative'
            }}
          >
            {currentStory.mediaType === 'image' ? (
              <img
                src={currentStory.mediaUrl}
                alt="Story"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            ) : (
              <video
                src={currentStory.mediaUrl}
                autoPlay
                muted
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
              />
            )}
          </Box>

          {/* Story caption */}
          {currentStory.caption && (
            <Box sx={{ position: 'absolute', bottom: 20, left: 0, right: 0, p: 2, textAlign: 'center' }}>
              <Typography variant="body2">{currentStory.caption}</Typography>
            </Box>
          )}

          {/* Navigation */}
          <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex' }}>
            <Box
              sx={{ flex: 1, cursor: 'pointer' }}
              onClick={() => currentIndex > 0 && setCurrentIndex(prev => prev - 1)}
            />
            <Box
              sx={{ flex: 1, cursor: 'pointer' }}
              onClick={() => {
                if (currentIndex < story.stories.length - 1) {
                  setCurrentIndex(prev => prev + 1);
                } else {
                  onClose();
                }
              }}
            />
          </Box>
        </Box>
      </Dialog>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Photo Gallery & Stories</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setStoryDialogOpen(true)}
          >
            Add Story
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateDialogOpen(true)}
          >
            Create Gallery
          </Button>
        </Box>
      </Box>

      {/* Stories Section */}
      {stories.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>Stories</Typography>
          <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
            {stories.map((story) => (
              <Box
                key={story.user._id}
                sx={{
                  textAlign: 'center',
                  cursor: 'pointer',
                  minWidth: 80
                }}
                onClick={() => setSelectedStory(story)}
              >
                <Avatar
                  src={story.user.avatar}
                  sx={{
                    width: 70,
                    height: 70,
                    border: story.hasUnviewed ? '3px solid' : '2px solid',
                    borderColor: story.hasUnviewed ? 'primary.main' : 'grey.300',
                    mb: 0.5
                  }}
                >
                  {story.user.name[0]}
                </Avatar>
                <Typography variant="caption" noWrap sx={{ display: 'block', maxWidth: 80 }}>
                  {story.user.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {/* Galleries Section */}
      <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab label="My Galleries" />
        <Tab label="Saved" />
        <Tab label="Explore" />
      </Tabs>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {galleries.map((gallery) => (
            <Grid item xs={12} sm={6} md={4} key={gallery._id}>
              <Card
                sx={{
                  cursor: 'pointer',
                  '&:hover': { transform: 'translateY(-4px)', transition: 'transform 0.2s' }
                }}
                onClick={() => navigate(`/gallery/${gallery._id}`)}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={gallery.coverPhoto || gallery.photos[0]?.url || 'https://via.placeholder.com/400x300'}
                  alt={gallery.title}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom noWrap>
                    {gallery.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {gallery.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(gallery._id);
                        }}
                        color={gallery.isLiked ? 'error' : 'default'}
                      >
                        {gallery.isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                      </IconButton>
                      <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                        {gallery.likeCount || 0}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <VisibilityIcon fontSize="small" color="action" />
                      <Typography variant="caption">{gallery.views || 0}</Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, mt: 1, flexWrap: 'wrap' }}>
                    {gallery.tags?.slice(0, 3).map((tag, idx) => (
                      <Chip key={idx} label={tag} size="small" />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Gallery Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Gallery</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Title"
              fullWidth
              value={newGallery.title}
              onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={newGallery.description}
              onChange={(e) => setNewGallery({ ...newGallery, description: e.target.value })}
            />
            <TextField
              label="Destination"
              fullWidth
              value={newGallery.destination}
              onChange={(e) => setNewGallery({ ...newGallery, destination: e.target.value })}
            />
            <TextField
              label="Tags (comma-separated)"
              fullWidth
              value={newGallery.tags}
              onChange={(e) => setNewGallery({ ...newGallery, tags: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
              <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleCreateGallery}>
                Create
              </Button>
            </Box>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Story Viewer */}
      {selectedStory && (
        <StoryViewer
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </Container>
  );
};

export default GalleryPage;
