import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent, 
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { getBlogs } from '../api/blogs';

export default function BlogDisplayTest() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        console.log('🔍 Testing blog fetch...');
        
        const response = await getBlogs();
        console.log('📡 API Response:', response);
        
        setApiResponse(response);
        const blogData = response.data?.blogs || response.blogs || [];
        console.log('📚 Extracted blogs:', blogData);
        
        setBlogs(blogData);
        setError('');
      } catch (err) {
        console.error('❌ Error fetching blogs:', err);
        setError(err.message || 'Failed to fetch blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Testing Blog Display...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        🧪 Blog Display Test
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error: {error}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 API Response Debug Info
          </Typography>
          <Typography variant="body2" component="pre" sx={{ 
            backgroundColor: '#f5f5f5', 
            p: 2, 
            borderRadius: 1,
            overflow: 'auto',
            fontSize: '0.8rem'
          }}>
            {JSON.stringify(apiResponse, null, 2)}
          </Typography>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📈 Statistics
          </Typography>
          <Typography variant="body1">
            Total blogs found: <strong>{blogs.length}</strong>
          </Typography>
          <Typography variant="body1">
            Blogs with authors: <strong>{blogs.filter(b => b.author).length}</strong>
          </Typography>
          <Typography variant="body1">
            Blogs with categories: <strong>{blogs.filter(b => b.category).length}</strong>
          </Typography>
          <Typography variant="body1">
            Blogs with images: <strong>{blogs.filter(b => b.images?.length > 0).length}</strong>
          </Typography>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📝 Blog List
          </Typography>
          {blogs.length === 0 ? (
            <Alert severity="warning">
              No blogs found. Check the API connection and database.
            </Alert>
          ) : (
            <List>
              {blogs.map((blog, index) => (
                <React.Fragment key={blog._id || index}>
                  <ListItem alignItems="flex-start">
                    <ListItemText
                      primary={
                        <Typography variant="h6" component="div">
                          {blog.title || 'Untitled'}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Author:</strong> {blog.author?.name || 'Unknown'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Category:</strong> {blog.category?.name || 'None'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Location:</strong> {blog.location || 'Not specified'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Created:</strong> {new Date(blog.createdAt).toLocaleDateString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Images:</strong> {blog.images?.length || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Tags:</strong> {blog.tags?.join(', ') || 'None'}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < blogs.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button 
          variant="contained" 
          onClick={() => window.location.reload()}
          sx={{ mr: 2 }}
        >
          🔄 Refresh Test
        </Button>
        <Button 
          variant="outlined" 
          onClick={() => console.log('Current blogs state:', blogs)}
        >
          🖥️ Log to Console
        </Button>
      </Box>
    </Container>
  );
}