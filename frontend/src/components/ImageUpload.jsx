import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardMedia,
  CardContent,
  TextField,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Chip
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Edit,
  Save,
  Cancel,
  Image as ImageIcon
} from '@mui/icons-material';
import { uploadImage } from '../api/upload';

const ImageUpload = ({ images = [], onImagesChange, maxImages = 5 }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editCaption, setEditCaption] = useState('');
  const [editAlt, setEditAlt] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images allowed`);
      return;
    }

    setUploading(true);
    setError('');

    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name} is not an image file`);
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name} is too large. Maximum size is 5MB`);
        }

        const result = await uploadImage(file, '', `Image: ${file.name}`);
        return result.image;
      });

      const uploadedImages = await Promise.all(uploadPromises);
      const newImages = [...images, ...uploadedImages];
      onImagesChange(newImages);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error.message || 'Failed to upload images');
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const handleEditImage = (index) => {
    const image = images[index];
    setEditingIndex(index);
    setEditCaption(image.caption || '');
    setEditAlt(image.alt || '');
  };

  const handleSaveEdit = () => {
    const newImages = [...images];
    newImages[editingIndex] = {
      ...newImages[editingIndex],
      caption: editCaption,
      alt: editAlt
    };
    onImagesChange(newImages);
    setEditingIndex(-1);
    setEditCaption('');
    setEditAlt('');
  };

  const handleCancelEdit = () => {
    setEditingIndex(-1);
    setEditCaption('');
    setEditAlt('');
  };

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          component="label"
          startIcon={<CloudUpload />}
          disabled={uploading || images.length >= maxImages}
        >
          {uploading ? 'Uploading...' : 'Upload Images'}
          <input
            ref={fileInputRef}
            type="file"
            hidden
            multiple
            accept="image/*"
            onChange={handleFileSelect}
          />
        </Button>
        
        {uploading && <CircularProgress size={24} />}
        
        <Chip 
          label={`${images.length}/${maxImages} images`} 
          color={images.length >= maxImages ? 'error' : 'default'}
          size="small"
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {images.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <ImageIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            No images uploaded yet. Click "Upload Images" to add photos from your device.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {images.map((image, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={image.url}
                  alt={image.alt || `Image ${index + 1}`}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ p: 2 }}>
                  {editingIndex === index ? (
                    <Box>
                      <TextField
                        fullWidth
                        label="Caption"
                        value={editCaption}
                        onChange={(e) => setEditCaption(e.target.value)}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <TextField
                        fullWidth
                        label="Alt Text"
                        value={editAlt}
                        onChange={(e) => setEditAlt(e.target.value)}
                        size="small"
                        sx={{ mb: 2 }}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={handleSaveEdit}
                        >
                          <Save />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={handleCancelEdit}
                        >
                          <Cancel />
                        </IconButton>
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1, minHeight: 20 }}>
                        {image.caption || 'No caption'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                        Alt: {image.alt || 'No alt text'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleEditImage(index)}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ImageUpload;