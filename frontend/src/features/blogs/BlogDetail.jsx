import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Grid, 
  Button,
  Chip,
  Avatar,
  Rating,
  Divider,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Paper,
  Breadcrumbs,
  Link as MuiLink,
  Tooltip,
  Badge
} from '@mui/material';
import { 
  LocationOn, 
  AccessTime, 
  Person, 
  Favorite, 
  FavoriteBorder,
  Comment, 
  Share,
  Bookmark,
  BookmarkBorder,
  ArrowBack,
  Verified,
  TrendingUp,
  EmojiEvents
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import SaveToTripButton from '../../components/SaveToTripButton';
import ReactionPicker from '../../components/ReactionPicker';
import ReviewsPage from '../../pages/ReviewsPage';

// Sample blog data
const sampleBlog = {
  _id: '1',
  title: 'Exploring the Hidden Gems of Bali: A Complete Travel Guide',
  content: `
    <h2>Introduction</h2>
    <p>Bali, the Island of the Gods, offers more than just beautiful beaches. From the spiritual temples of Ubud to the hidden waterfalls of Munduk, this Indonesian paradise is a traveler's dream.</p>

    <h2>When to Visit Bali</h2>
    <p>Bali has two main seasons: the dry season (April to October) and the wet season (November to March). The best time to visit is during the dry season when you'll enjoy sunny days and minimal rainfall.</p>

    <h2>Must-Visit Destinations</h2>
    <h3>1. Ubud - The Cultural Heart</h3>
    <p>Ubud is Bali's cultural center, known for its traditional arts, yoga studios, and spiritual atmosphere. Don't miss the Sacred Monkey Forest and Ubud Palace.</p>

    <h3>2. Munduk - Hidden Waterfalls</h3>
    <p>Located in the northern mountains, Munduk is home to some of Bali's most beautiful waterfalls. The Munduk Waterfall and Banyumala Twin Waterfalls are perfect for swimming.</p>

    <h2>Local Cuisine</h2>
    <p>Must-try dishes include Nasi Goreng, Mie Goreng, Satay, and Babi Guling (Balinese suckling pig).</p>

    <h2>Conclusion</h2>
    <p>Bali is truly a magical destination that offers something for every type of traveler. The key to enjoying Bali is to embrace the local culture and explore beyond the tourist hotspots.</p>
  `,
  author: { 
    name: 'Sarah Johnson', 
    bio: 'Adventure travel writer and photographer based in Australia.',
    avatar: 'https://source.unsplash.com/random/100x100/?portrait,woman'
  },
  location: 'Bali, Indonesia',
  category: 'Adventure',
  images: ['https://source.unsplash.com/random/1200x600/?bali,temple'],
  likes: Array(127).fill('user'),
  comments: [
    {
      _id: 'comment1',
      content: 'Amazing guide! I visited Bali last year and this brings back so many memories.',
      author: { name: 'Mike Chen', avatar: 'https://source.unsplash.com/random/50x50/?portrait,man' },
      createdAt: '2024-01-20T10:30:00Z'
    }
  ],
  createdAt: '2024-01-15T10:30:00Z',
  rating: 4.8,
  tags: ['bali', 'indonesia', 'temple', 'culture', 'adventure'],
  views: 2847,
  readTime: '8 min read'
};

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/blogs/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setBlog(data.blog || data);
          
          // Check if blog is bookmarked
          try {
            const bookmarks = await getUserBookmarks(null, 'blog');
            const isBookmarked = bookmarks.some(b => b.targetId?._id === id || b.targetId === id);
            setBookmarked(isBookmarked);
          } catch (err) {
            console.error('Failed to check bookmark status:', err);
          }
        } else {
          console.error('Failed to fetch blog');
          navigate('/blogs');
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
        navigate('/blogs');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchBlog();
    }
  }, [id, navigate]);

  const handleLike = () => setLiked(!liked);
  
  const handleBookmark = async () => {
    try {
      if (bookmarked) {
        // Remove bookmark - need to find the bookmark ID first
        const bookmarks = await getUserBookmarks(null, 'blog');
        const existingBookmark = bookmarks.find(b => b.targetId?._id === id || b.targetId === id);
        if (existingBookmark) {
          await removeBookmark(existingBookmark._id);
        }
        setBookmarked(false);
      } else {
        // Create bookmark
        await createBookmark({
          targetType: 'blog',
          targetId: id,
          title: blog?.title || 'Untitled'
        });
        setBookmarked(true);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4">Loading...</Typography>
      </Container>
    );
  }

  if (!blog) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Blog post not found</Typography>
        <Button component={Link} to="/blogs" variant="contained">Back to Stories</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <MuiLink component={Link} to="/" color="inherit">Home</MuiLink>
        <MuiLink component={Link} to="/blogs" color="inherit">Stories</MuiLink>
        <Typography color="text.primary">{blog.title}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          {blog.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar src={blog.author.avatar} sx={{ mr: 1 }}>
              {blog.author.name.charAt(0)}
            </Avatar>
            <Typography variant="body1" sx={{ fontWeight: 500 }}>
              {blog.author.name}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationOn sx={{ mr: 1, fontSize: 16, color: '#1E88E5' }} />
            <Typography variant="body2" color="text.secondary">
              {blog.location}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTime sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {new Date(blog.createdAt).toLocaleDateString()} • {blog.readTime}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Chip label={blog.category} sx={{ 
            background: 'linear-gradient(45deg, #1E88E5 30%, #42A5F5 90%)',
            color: 'white',
            fontWeight: 600
          }} />
          <Rating value={blog.rating} precision={0.1} readOnly />
          <Typography variant="body2" color="text.secondary">({blog.rating})</Typography>
          
          {/* Quality Indicators */}
          {blog.views > 1000 && (
            <Tooltip title="Popular Content - High engagement from readers">
              <Chip 
                icon={<TrendingUp />} 
                label="Trending" 
                color="success" 
                size="small"
                variant="outlined"
              />
            </Tooltip>
          )}
          {blog.likes.length > 100 && (
            <Tooltip title="Highly Rated - Loved by the community">
              <Chip 
                icon={<Verified />} 
                label="Highly Rated" 
                color="primary" 
                size="small"
                variant="outlined"
              />
            </Tooltip>
          )}
          {blog.comments.length > 50 && (
            <Tooltip title="Active Discussion - Lots of reader engagement">
              <Chip 
                icon={<Comment />} 
                label="Active Discussion" 
                color="info" 
                size="small"
                variant="outlined"
              />
            </Tooltip>
          )}
          {blog.rating >= 4.5 && (
            <Tooltip title="Editor's Choice - Exceptional quality content">
              <Chip 
                icon={<EmojiEvents />} 
                label="Editor's Choice" 
                color="warning" 
                size="small"
                variant="outlined"
              />
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Main Image */}
      <Box sx={{ mb: 4 }}>
        <img 
          src={blog.images[0]} 
          alt={blog.title}
          style={{ 
            width: '100%', 
            height: '500px', 
            objectFit: 'cover',
            borderRadius: '12px'
          }}
        />
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <Button
          variant={liked ? "contained" : "outlined"}
          startIcon={liked ? <Favorite /> : <FavoriteBorder />}
          onClick={handleLike}
          sx={{ 
            borderColor: '#f44336', 
            color: liked ? 'white' : '#f44336',
            backgroundColor: liked ? '#f44336' : 'transparent'
          }}
        >
          {liked ? 'Liked' : 'Like'} ({blog.likes.length})
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Comment />}
          sx={{ borderColor: '#2196f3', color: '#2196f3' }}
        >
          Comment ({blog.comments.length})
        </Button>
        
        <Button
          variant={bookmarked ? "contained" : "outlined"}
          startIcon={bookmarked ? <Bookmark /> : <BookmarkBorder />}
          onClick={handleBookmark}
          sx={{ 
            borderColor: '#ff9800', 
            color: bookmarked ? 'white' : '#ff9800',
            backgroundColor: bookmarked ? '#ff9800' : 'transparent'
          }}
        >
          {bookmarked ? 'Saved' : 'Save'}
        </Button>
        
        <Button
          variant="outlined"
          startIcon={<Share />}
          sx={{ borderColor: '#4caf50', color: '#4caf50' }}
        >
          Share
        </Button>

        <SaveToTripButton entityId={blog._id} type="blog" />
        <ReactionPicker targetType="blog" targetId={blog._id} />
      </Box>

      {/* Content */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4, mb: 4 }}>
            <div dangerouslySetInnerHTML={{ __html: blog.content }} />
          </Paper>

          {/* Tags */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" gutterBottom>Tags</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {blog.tags.map((tag, index) => (
                <Chip 
                  key={index} 
                  label={tag} 
                  variant="outlined"
                  sx={{ 
                    borderColor: '#1E88E5', 
                    color: '#1E88E5',
                    borderWidth: '2px',
                    '&:hover': {
                      backgroundColor: 'rgba(30, 136, 229, 0.05)',
                    }
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Comments */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Comments ({blog.comments.length})
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder="Share your thoughts..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{ mb: 2 }}
              />
              <Button variant="contained" sx={{ 
                background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
                boxShadow: '0 3px 15px 2px rgba(255, 107, 53, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #F7931E 30%, #FF6B35 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px 4px rgba(255, 107, 53, 0.4)',
                }
              }}>
                Post Comment
              </Button>
            </Box>

            <List>
              {blog.comments.map((comment) => (
                <ListItem key={comment._id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar src={comment.author.avatar}>
                      {comment.author.name.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {comment.author.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                    secondary={comment.content}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Author Info */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar src={blog.author.avatar} sx={{ mr: 2, width: 60, height: 60 }}>
                  {blog.author.name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {blog.author.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Travel Writer
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {blog.author.bio}
              </Typography>
              <Button variant="outlined" fullWidth sx={{ 
                borderColor: '#1E88E5', 
                color: '#1E88E5',
                borderWidth: '2px',
                '&:hover': {
                  borderColor: '#1E88E5',
                  backgroundColor: 'rgba(30, 136, 229, 0.05)',
                }
              }}>
                Follow Author
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Story Stats</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Views</Typography>
                <Typography variant="body2">{blog.views.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Likes</Typography>
                <Typography variant="body2">{blog.likes.length}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">Rating</Typography>
                <Typography variant="body2">{blog.rating}/5</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reviews Section */}
      <Box sx={{ mt: 6 }}>
        <ReviewsPage 
          targetType="blog" 
          targetId={id} 
          targetTitle={blog.title}
        />
      </Box>
    </Container>
  );
}
