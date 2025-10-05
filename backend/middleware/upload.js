const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories
const subdirs = ['blogs', 'packages', 'avatars', 'temp'];
subdirs.forEach(dir => {
  const dirPath = path.join(uploadsDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Configure multer for local file storage (FREE)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'temp'; // default
    
    // Determine upload path based on route or field
    if (req.route.path.includes('blog')) {
      uploadPath = 'blogs';
    } else if (req.route.path.includes('package')) {
      uploadPath = 'packages';
    } else if (req.route.path.includes('avatar') || req.route.path.includes('profile')) {
      uploadPath = 'avatars';
    }
    
    cb(null, path.join(uploadsDir, uploadPath));
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 10 // Maximum 10 files
  },
  fileFilter: fileFilter
});

// Middleware for single file upload
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ 
          message: err.message || 'File upload failed',
          type: 'upload_error'
        });
      }
      
      // Add file URL to request
      if (req.file) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        req.file.url = `${baseUrl}/uploads/${path.relative(uploadsDir, req.file.path).replace(/\\/g, '/')}`;
      }
      
      next();
    });
  };
};

// Middleware for multiple file upload
const uploadMultiple = (fieldName, maxCount = 10) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        return res.status(400).json({ 
          message: err.message || 'File upload failed',
          type: 'upload_error'
        });
      }
      
      // Add file URLs to request
      if (req.files && req.files.length > 0) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        req.files.forEach(file => {
          file.url = `${baseUrl}/uploads/${path.relative(uploadsDir, file.path).replace(/\\/g, '/')}`;
        });
      }
      
      next();
    });
  };
};

// Utility function to delete file
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
  return false;
};

// Cleanup old files (run periodically)
const cleanupOldFiles = (directory, maxAgeHours = 24) => {
  const dirPath = path.join(uploadsDir, directory);
  if (!fs.existsSync(dirPath)) return;

  const files = fs.readdirSync(dirPath);
  const now = Date.now();
  const maxAge = maxAgeHours * 60 * 60 * 1000;

  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (now - stats.mtime.getTime() > maxAge) {
      deleteFile(filePath);
    }
  });
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  deleteFile,
  cleanupOldFiles
};
