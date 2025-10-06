import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Avatar,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip
} from '@mui/material';
import {
  LocationOn,
  Close,
  Visibility,
  Favorite,
  Comment,
  ZoomIn,
  ZoomOut,
  MyLocation,
  Layers
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Simple map implementation using OpenStreetMap tiles
const MapView = ({ blogs = [], selectedBlog = null, onBlogSelect, height = '400px' }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) return;

    // Create a simple map container
    const mapContainer = mapRef.current;
    mapContainer.innerHTML = '';
    
    // Create map wrapper
    const mapWrapper = document.createElement('div');
    mapWrapper.style.cssText = `
      width: 100%;
      height: ${height};
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
      overflow: hidden;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
    `;
    
    // Add map placeholder content
    mapWrapper.innerHTML = `
      <div style="text-align: center; color: white;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🗺️</div>
        <div style="font-size: 1.2rem; font-weight: 600; margin-bottom: 0.5rem;">Interactive Travel Map</div>
        <div style="font-size: 0.9rem; opacity: 0.8;">Explore ${blogs.length} travel destinations</div>
      </div>
    `;
    
    mapContainer.appendChild(mapWrapper);
    
    // Create markers overlay
    const markersContainer = document.createElement('div');
    markersContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    `;
    mapWrapper.appendChild(markersContainer);
    
    setMap({ container: mapWrapper, markersContainer });
    setLoading(false);
  }, [height, blogs.length]);

  // Create markers for blogs with locations
  useEffect(() => {
    if (!map || !blogs.length) return;

    const blogsWithLocation = blogs.filter(blog => blog.location && blog.geotag);
    const newMarkers = [];

    blogsWithLocation.forEach((blog, index) => {
      // Create marker element
      const marker = document.createElement('div');
      marker.style.cssText = `
        position: absolute;
        width: 40px;
        height: 40px;
        background: linear-gradient(45deg, #FF6B35 30%, #F7931E 90%);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        pointer-events: auto;
        transition: all 0.3s ease;
        z-index: ${selectedBlog && selectedBlog._id === blog._id ? 1000 : index + 1};
        transform: ${selectedBlog && selectedBlog._id === blog._id ? 'scale(1.2)' : 'scale(1)'};
      `;
      
      // Position marker (simulate coordinates)
      const x = 20 + (index * 60) % (map.container.offsetWidth - 80);
      const y = 50 + (Math.floor(index / 8) * 80) % (map.container.offsetHeight - 100);
      
      marker.style.left = `${x}px`;
      marker.style.top = `${y}px`;
      marker.textContent = (index + 1).toString();
      
      // Add hover effects
      marker.addEventListener('mouseenter', () => {
        if (!selectedBlog || selectedBlog._id !== blog._id) {
          marker.style.transform = 'scale(1.1)';
        }
      });
      
      marker.addEventListener('mouseleave', () => {
        if (!selectedBlog || selectedBlog._id !== blog._id) {
          marker.style.transform = 'scale(1)';
        }
      });
      
      // Add click handler
      marker.addEventListener('click', () => {
        setSelectedMarker(blog);
        setDialogOpen(true);
        if (onBlogSelect) {
          onBlogSelect(blog);
        }
      });
      
      map.markersContainer.appendChild(marker);
      newMarkers.push({ element: marker, blog });
    });

    setMarkers(newMarkers);

    // Cleanup function
    return () => {
      newMarkers.forEach(marker => {
        if (marker.element.parentNode) {
          marker.element.parentNode.removeChild(marker.element);
        }
      });
    };
  }, [map, blogs, selectedBlog, onBlogSelect]);

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedMarker(null);
  };

  const handleViewBlog = (blog) => {
    navigate(`/blogs/${blog._id}`);
    handleCloseDialog();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ height }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Map Container */}
      <div ref={mapRef} style={{ width: '100%', height }} />
      
      {/* Map Controls */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          zIndex: 1000
        }}
      >
        <Tooltip title="Zoom In">
          <IconButton
            size="small"
            sx={{
              backgroundColor: 'white',
              boxShadow: 2,
              '&:hover': { backgroundColor: 'grey.100' }
            }}
          >
            <ZoomIn />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Zoom Out">
          <IconButton
            size="small"
            sx={{
              backgroundColor: 'white',
              boxShadow: 2,
              '&:hover': { backgroundColor: 'grey.100' }
            }}
          >
            <ZoomOut />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="My Location">
          <IconButton
            size="small"
            sx={{
              backgroundColor: 'white',
              boxShadow: 2,
              '&:hover': { backgroundColor: 'grey.100' }
            }}
          >
            <MyLocation />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Legend */}
      <Card
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          minWidth: 200,
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Travel Destinations
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
                border: '2px solid white',
                boxShadow: 1
              }}
            />
            <Typography variant="caption">Blog Location</Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Click markers to view blog details
          </Typography>
        </CardContent>
      </Card>

      {/* Blog Detail Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedMarker && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LocationOn color="primary" />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" component="div">
                  {selectedMarker.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedMarker.location}
                </Typography>
              </Box>
              <IconButton onClick={handleCloseDialog} size="small">
                <Close />
              </IconButton>
            </DialogTitle>
            
            <DialogContent>
              <Box sx={{ mb: 2 }}>
                {selectedMarker.images && selectedMarker.images.length > 0 && (
                  <img
                    src={selectedMarker.images[0]}
                    alt={selectedMarker.title}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '8px',
                      marginBottom: '16px'
                    }}
                  />
                )}
                
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {selectedMarker.content?.substring(0, 200)}...
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar
                    src={selectedMarker.author?.avatar}
                    sx={{ width: 32, height: 32 }}
                  >
                    {selectedMarker.author?.name?.charAt(0)}
                  </Avatar>
                  <Typography variant="body2">
                    by {selectedMarker.author?.name}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Visibility sx={{ fontSize: 16 }} />
                    <Typography variant="caption">
                      {selectedMarker.views || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Favorite sx={{ fontSize: 16 }} />
                    <Typography variant="caption">
                      {selectedMarker.likesCount || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Comment sx={{ fontSize: 16 }} />
                    <Typography variant="caption">
                      {selectedMarker.commentsCount || 0}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </DialogContent>
            
            <DialogActions>
              <Button onClick={handleCloseDialog}>
                Close
              </Button>
              <Button
                variant="contained"
                onClick={() => handleViewBlog(selectedMarker)}
                sx={{
                  background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #F7931E 30%, #FF6B35 90%)',
                  }
                }}
              >
                Read Full Story
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default MapView;