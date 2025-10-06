const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');

// Check if Cloudinary is configured
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name';

let storage;
let cloudinary;

if (isCloudinaryConfigured) {
  // Use Cloudinary if configured
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  cloudinary = require('cloudinary').v2;
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'travel-blog',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 1200, height: 800, crop: 'limit', quality: 'auto' }
      ]
    },
  });
} else {
  // Use local storage as fallback
  const uploadsDir = path.join(__dirname, '../uploads/images');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `image-${uniqueSuffix}${ext}`);
    }
  });
}

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Upload single image
router.post('/image', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    const imageData = {
      url: isCloudinaryConfigured ? req.file.path : `/uploads/images/${req.file.filename}`,
      publicId: req.file.filename,
      caption: req.body.caption || '',
      alt: req.body.alt || `Image uploaded by ${req.user.name}`,
    };

    res.status(200).json({
      message: 'Image uploaded successfully',
      image: imageData
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Upload multiple images
router.post('/images', protect, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No image files provided' });
    }

    const images = req.files.map((file, index) => ({
      url: isCloudinaryConfigured ? file.path : `/uploads/images/${file.filename}`,
      publicId: file.filename,
      caption: req.body.captions ? req.body.captions[index] || '' : '',
      alt: req.body.alts ? req.body.alts[index] || `Image ${index + 1} uploaded by ${req.user.name}` : `Image ${index + 1} uploaded by ${req.user.name}`,
    }));

    res.status(200).json({
      message: 'Images uploaded successfully',
      images: images
    });
  } catch (error) {
    console.error('Images upload error:', error);
    res.status(500).json({ message: 'Failed to upload images' });
  }
});

// Delete image
router.delete('/image/:publicId', protect, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (isCloudinaryConfigured) {
      // Delete from Cloudinary
      const result = await cloudinary.uploader.destroy(publicId);
      
      if (result.result === 'ok') {
        res.status(200).json({ message: 'Image deleted successfully' });
      } else {
        res.status(404).json({ message: 'Image not found' });
      }
    } else {
      // Delete from local storage
      const filePath = path.join(__dirname, '../uploads/images', publicId);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        res.status(200).json({ message: 'Image deleted successfully' });
      } else {
        res.status(404).json({ message: 'Image not found' });
      }
    }
  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({ message: 'Failed to delete image' });
  }
});

module.exports = router;