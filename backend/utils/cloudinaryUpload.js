const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

/**
 * Upload image to Cloudinary from buffer
 * @param {Buffer} buffer - Image buffer from multer
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const defaultOptions = {
      folder: 'travel-blog',
      resource_type: 'auto',
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }
      ],
      ...options
    };

    const uploadStream = cloudinary.uploader.upload_stream(
      defaultOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Upload blog image to Cloudinary
 * @param {Buffer} buffer - Image buffer
 * @param {String} blogId - Blog ID for folder organization
 * @returns {Promise<Object>} Upload result with URL
 */
const uploadBlogImage = async (buffer, blogId) => {
  try {
    const result = await uploadToCloudinary(buffer, {
      folder: `travel-blog/blogs/${blogId}`,
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:good', fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    throw new Error(`Blog image upload failed: ${error.message}`);
  }
};

/**
 * Upload profile picture to Cloudinary
 * @param {Buffer} buffer - Image buffer
 * @param {String} userId - User ID
 * @returns {Promise<Object>} Upload result with URL
 */
const uploadProfilePicture = async (buffer, userId) => {
  try {
    const result = await uploadToCloudinary(buffer, {
      folder: `travel-blog/profiles/${userId}`,
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto:good', fetch_format: 'auto' }
      ]
    });

    return {
      url: result.secure_url,
      publicId: result.public_id
    };
  } catch (error) {
    throw new Error(`Profile picture upload failed: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Image deletion failed: ${error.message}`);
  }
};

/**
 * Upload multiple images to Cloudinary
 * @param {Array<Buffer>} buffers - Array of image buffers
 * @param {String} folder - Folder path
 * @returns {Promise<Array>} Array of upload results
 */
const uploadMultipleImages = async (buffers, folder) => {
  try {
    const uploadPromises = buffers.map(buffer =>
      uploadToCloudinary(buffer, {
        folder: `travel-blog/${folder}`,
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto:good', fetch_format: 'auto' }
        ]
      })
    );

    const results = await Promise.all(uploadPromises);
    
    return results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    }));
  } catch (error) {
    throw new Error(`Multiple images upload failed: ${error.message}`);
  }
};

module.exports = {
  uploadToCloudinary,
  uploadBlogImage,
  uploadProfilePicture,
  deleteFromCloudinary,
  uploadMultipleImages
};
