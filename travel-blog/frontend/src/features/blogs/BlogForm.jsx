import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Grid,
  Card,
  CardContent,
  IconButton
} from '@mui/material';
import { 
  Title, 
  Description, 
  LocationOn, 
  Save, 
  ArrowBack,
  Add,
  Close,
  Image
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { createBlog, getBlogById, updateBlog } from '../../api/blogs';
import { getCategories } from '../../api/categories';
import { useNavigate, useParams, Link } from 'react-router-dom';
import ImageUpload from '../../components/ImageUpload';

export default function BlogForm() {
  const { id } = useParams();
  const [form, setForm] = useState({ 
    title: '', 
    content: '', 
    location: '',
    category: '',
    tags: [],
    images: []
  });
  const [error, setError] = useState('');
  const [newTag, setNewTag] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch categories
    getCategories().then(data => {
      setCategories(data.categories || []);
    }).catch(error => {
      console.error('Error fetching categories:', error);
    });

    // Fetch blog data if editing
    if (id) {
      getBlogById(id).then(blog => {
        setForm({ 
          title: blog.title, 
          content: blog.content, 
          location: blog.location || '',
          category: blog.category?._id || '', // Use ObjectId instead of name
          tags: blog.tags || [],
          images: blog.images || []
        });
      }).catch(error => {
        console.error('Error fetching blog:', error);
        setError('Failed to load blog data');
      });
    }
  }, [id]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAddTag = () => {
    if (newTag.trim() && !form.tags.includes(newTag.trim())) {
      setForm({ ...form, tags: [...form.tags, newTag.trim()] });
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setForm({ ...form, tags: form.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleAddImage = () => {
    if (newImage.trim()) {
      const imageObj = {
        url: newImage.trim(),
        caption: '',
        alt: `Image ${form.images.length + 1}`
      };
      // Check if URL already exists
      const urlExists = form.images.some(img => 
        (typeof img === 'string' ? img : img.url) === newImage.trim()
      );
      if (!urlExists) {
        setForm({ ...form, images: [...form.images, imageObj] });
        setNewImage('');
      }
    }
  };

  const handleRemoveImage = (imageToRemove) => {
    setForm({ 
      ...form, 
      images: form.images.filter(img => 
        (typeof img === 'string' ? img : img.url) !== 
        (typeof imageToRemove === 'string' ? imageToRemove : imageToRemove.url)
      ) 
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!form.title.trim()) {
      return setError('Title is required');
    }
    if (!form.content.trim()) {
      return setError('Content is required');
    }
    
    const token = localStorage.getItem('token');
    if (!token) return setError('Login required');
    
    try {
      // Prepare data for backend
      const blogData = {
        title: form.title.trim(),
        content: form.content.trim(),
        location: form.location?.trim() || undefined,
        tags: form.tags || [],
        // Ensure all images are in proper object format
        images: form.images.map(img => 
          typeof img === 'string' 
            ? { url: img, caption: '', alt: '' }
            : { url: img.url, caption: img.caption || '', alt: img.alt || '' }
        ),
        // Only include category if it's not empty (should be ObjectId)
        ...(form.category && form.category.trim() ? { category: form.category } : {})
      };
      
      console.log('Submitting blog data:', blogData);
      
      if (id) {
        const result = await updateBlog(id, blogData);
        console.log('Blog updated:', result);
      } else {
        const result = await createBlog(blogData);
        console.log('Blog created:', result);
      }
      navigate('/blogs');
    } catch (err) {
      console.error('Blog save error:', err);
      setError(err.message || err.msg || 'Failed to save blog');
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Button 
        component={Link} 
        to="/blogs" 
        startIcon={<ArrowBack />}
        sx={{ mb: 3, color: '#2E7D32' }}
      >
        Back to Stories
      </Button>

      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {id ? 'Edit Story' : 'Share Your Travel Story'}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {id ? 'Update your travel experience' : 'Tell us about your amazing adventure'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="title"
                label="Story Title"
                value={form.title}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <Title sx={{ mr: 1, color: 'text.secondary' }} />
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="location"
                label="Location"
                value={form.location}
                onChange={handleChange}
                InputProps={{
                  startAdornment: (
                    <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  label="Category"
                >
                  <MenuItem value="">
                    <em>Select Category (Optional)</em>
                  </MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Tags
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Add a tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                  <Button 
                    variant="outlined" 
                    onClick={handleAddTag}
                    startIcon={<Add />}
                  >
                    Add
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {form.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleRemoveTag(tag)}
                      sx={{ backgroundColor: '#E8F5E8' }}
                    />
                  ))}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Images
              </Typography>
              <ImageUpload
                images={form.images}
                onImagesChange={(images) => setForm({ ...form, images })}
                maxImages={5}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="content"
                label="Your Story"
                multiline
                rows={12}
                value={form.content}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <Description sx={{ mr: 1, color: 'text.secondary' }} />
                  ),
                }}
                helperText="Share your travel experience, tips, and memories..."
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                startIcon={<Save />}
                sx={{ 
                  backgroundColor: '#2E7D32',
                  '&:hover': { backgroundColor: '#1B5E20' }
                }}
              >
                {id ? 'Update Story' : 'Publish Story'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
}
