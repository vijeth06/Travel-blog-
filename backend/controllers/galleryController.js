const PhotoGallery = require('../models/PhotoGallery');
const Story = require('../models/Story');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// Create photo gallery
exports.createGallery = async (req, res) => {
  try {
    const { title, description, tags, destination, country, visibility } = req.body;
    const userId = req.user._id;

    const gallery = new PhotoGallery({
      user: userId,
      title,
      description,
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(',').map(tag => tag.trim()) : []),
      destination,
      country,
      visibility: visibility || 'public'
    });

    await gallery.save();
    await gallery.populate('user', 'name avatar');

    res.status(201).json({ gallery });
  } catch (error) {
    console.error('Create gallery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add photos to gallery
exports.addPhotos = async (req, res) => {
  try {
    const { galleryId } = req.params;
    const { photos } = req.body; // Array of { url, caption, location, takenAt }

    const gallery = await PhotoGallery.findOne({
      _id: galleryId,
      user: req.user._id
    });

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found or unauthorized' });
    }

    const newPhotos = photos.map((photo, index) => ({
      url: photo.url,
      publicId: photo.publicId,
      caption: photo.caption,
      takenAt: photo.takenAt,
      location: photo.location,
      order: gallery.photos.length + index
    }));

    gallery.photos.push(...newPhotos);

    if (!gallery.coverPhoto && newPhotos.length > 0) {
      gallery.coverPhoto = newPhotos[0].url;
    }

    await gallery.save();

    res.json({ gallery });
  } catch (error) {
    console.error('Add photos error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's galleries
exports.getUserGalleries = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const currentUserId = req.user?._id;

    // If no userId in params, use current user
    const targetUserId = userId || currentUserId;

    if (!targetUserId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const query = { user: targetUserId };

    // If not the owner, only show public galleries or followers-only if following
    if (currentUserId?.toString() !== targetUserId.toString()) {
      const user = await User.findById(targetUserId);
      const isFollowing = user?.followers?.includes(currentUserId);

      if (isFollowing) {
        query.visibility = { $in: ['public', 'followers'] };
      } else {
        query.visibility = 'public';
      }
    }

    const galleries = await PhotoGallery.find(query)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await PhotoGallery.countDocuments(query);

    res.json({
      galleries,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalGalleries: total
    });
  } catch (error) {
    console.error('Get user galleries error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single gallery
exports.getGallery = async (req, res) => {
  try {
    const { galleryId } = req.params;
    const currentUserId = req.user?._id;

    const gallery = await PhotoGallery.findById(galleryId)
      .populate('user', 'name avatar followerCount');

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    // Check visibility permissions
    if (gallery.visibility === 'private' && gallery.user._id.toString() !== currentUserId?.toString()) {
      return res.status(403).json({ message: 'This gallery is private' });
    }

    if (gallery.visibility === 'followers') {
      const user = await User.findById(gallery.user._id);
      const isFollowing = user.followers?.includes(currentUserId);
      
      if (!isFollowing && gallery.user._id.toString() !== currentUserId?.toString()) {
        return res.status(403).json({ message: 'This gallery is for followers only' });
      }
    }

    // Increment view count
    gallery.views += 1;
    await gallery.save();

    // Check if current user liked
    const isLiked = currentUserId ? gallery.likes.includes(currentUserId) : false;

    res.json({
      gallery: {
        ...gallery.toObject(),
        isLiked
      }
    });
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle gallery like
exports.toggleGalleryLike = async (req, res) => {
  try {
    const { galleryId } = req.params;
    const userId = req.user._id;

    const gallery = await PhotoGallery.findById(galleryId);

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found' });
    }

    const likeIndex = gallery.likes.indexOf(userId);
    let isLiked;

    if (likeIndex > -1) {
      gallery.likes.splice(likeIndex, 1);
      isLiked = false;
    } else {
      gallery.likes.push(userId);
      isLiked = true;
    }

    await gallery.save();

    res.json({
      isLiked,
      likeCount: gallery.likes.length
    });
  } catch (error) {
    console.error('Toggle gallery like error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete gallery
exports.deleteGallery = async (req, res) => {
  try {
    const { galleryId } = req.params;

    const gallery = await PhotoGallery.findOne({
      _id: galleryId,
      user: req.user._id
    });

    if (!gallery) {
      return res.status(404).json({ message: 'Gallery not found or unauthorized' });
    }

    // Delete photos from cloudinary
    for (const photo of gallery.photos) {
      if (photo.publicId) {
        try {
          await cloudinary.uploader.destroy(photo.publicId);
        } catch (err) {
          console.error('Cloudinary delete error:', err);
        }
      }
    }

    await gallery.deleteOne();

    res.json({ message: 'Gallery deleted successfully' });
  } catch (error) {
    console.error('Delete gallery error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// STORIES CONTROLLERS

// Create story
exports.createStory = async (req, res) => {
  try {
    const { mediaType, mediaUrl, thumbnail, caption, duration, location } = req.body;
    const userId = req.user._id;

    const story = new Story({
      user: userId,
      mediaType,
      mediaUrl,
      thumbnail,
      caption,
      duration: duration || 5000,
      location
    });

    await story.save();
    await story.populate('user', 'name avatar');

    // Emit real-time event
    const io = req.app.get('io');
    if (io) {
      const user = await User.findById(userId);
      if (user.followers && user.followers.length > 0) {
        user.followers.forEach(followerId => {
          io.to(`user_${followerId}`).emit('new-story', {
            userId,
            userName: user.name,
            userAvatar: user.avatar
          });
        });
      }
    }

    res.status(201).json({ story });
  } catch (error) {
    console.error('Create story error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get stories from followed users
exports.getFollowingStories = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    const followingIds = user.following || [];

    // Get active stories from followed users and own stories
    const stories = await Story.find({
      user: { $in: [...followingIds, userId] },
      expiresAt: { $gt: new Date() }
    })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    // Group stories by user
    const groupedStories = stories.reduce((acc, story) => {
      const userId = story.user._id.toString();
      
      if (!acc[userId]) {
        acc[userId] = {
          user: story.user,
          stories: [],
          hasUnviewed: false
        };
      }

      const hasViewed = story.views.some(v => v.user.toString() === req.user._id.toString());
      acc[userId].stories.push({
        ...story.toObject(),
        hasViewed
      });

      if (!hasViewed) {
        acc[userId].hasUnviewed = true;
      }

      return acc;
    }, {});

    res.json({ groupedStories: Object.values(groupedStories) });
  } catch (error) {
    console.error('Get following stories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's stories
exports.getUserStories = async (req, res) => {
  try {
    const { userId } = req.params;

    const stories = await Story.find({
      user: userId,
      expiresAt: { $gt: new Date() }
    })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });

    // Mark which stories current user has viewed
    const storiesWithViewStatus = stories.map(story => {
      const hasViewed = story.views.some(v => v.user.toString() === req.user._id.toString());
      return {
        ...story.toObject(),
        hasViewed
      };
    });

    res.json({ stories: storiesWithViewStatus });
  } catch (error) {
    console.error('Get user stories error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// View story
exports.viewStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user._id;

    const story = await Story.findById(storyId);

    if (!story) {
      return res.status(404).json({ message: 'Story not found or expired' });
    }

    await story.addView(userId);

    // Emit real-time view notification to story owner
    const io = req.app.get('io');
    if (io && story.user.toString() !== userId.toString()) {
      io.to(`user_${story.user}`).emit('story-viewed', {
        storyId,
        viewerId: userId,
        viewerName: req.user.name
      });
    }

    res.json({ 
      message: 'Story viewed',
      viewCount: story.views.length
    });
  } catch (error) {
    console.error('View story error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete story
exports.deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findOne({
      _id: storyId,
      user: req.user._id
    });

    if (!story) {
      return res.status(404).json({ message: 'Story not found or unauthorized' });
    }

    await story.deleteOne();

    res.json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get story viewers
exports.getStoryViewers = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findOne({
      _id: storyId,
      user: req.user._id
    }).populate('views.user', 'name avatar');

    if (!story) {
      return res.status(404).json({ message: 'Story not found or unauthorized' });
    }

    res.json({ viewers: story.views });
  } catch (error) {
    console.error('Get story viewers error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
