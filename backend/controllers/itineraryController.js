const Itinerary = require('../models/Itinerary');
const User = require('../models/User');

// Create itinerary
exports.createItinerary = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      title,
      description,
      destination,
      country,
      startDate,
      endDate,
      budget,
      travelers,
      visibility,
      tags
    } = req.body;

    const itinerary = new Itinerary({
      user: userId,
      title,
      description,
      destination,
      country,
      startDate,
      endDate,
      budget,
      travelers,
      visibility: visibility || 'private',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : []
    });

    await itinerary.save();
    await itinerary.populate('user', 'name avatar');

    res.status(201).json({ itinerary });
  } catch (error) {
    console.error('Create itinerary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's itineraries
exports.getUserItineraries = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const currentUserId = req.user?._id;

    // If no userId in params, use current user
    const targetUserId = userId || currentUserId;

    if (!targetUserId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const query = { user: targetUserId };

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // If not the owner, only show public itineraries or followers-only if following
    if (currentUserId?.toString() !== targetUserId.toString()) {
      const user = await User.findById(targetUserId);
      const isFollowing = user?.followers?.includes(currentUserId);

      if (isFollowing) {
        query.visibility = { $in: ['public', 'followers'] };
      } else {
        query.visibility = 'public';
      }
    }

    const itineraries = await Itinerary.find(query)
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Itinerary.countDocuments(query);

    res.json({
      itineraries,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItineraries: total
    });
  } catch (error) {
    console.error('Get user itineraries error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single itinerary
exports.getItinerary = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const currentUserId = req.user?._id;

    const itinerary = await Itinerary.findById(itineraryId)
      .populate('user', 'name avatar')
      .populate('collaborators.user', 'name avatar');

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Check visibility permissions
    const isOwner = itinerary.user._id.toString() === currentUserId?.toString();
    const isCollaborator = itinerary.collaborators.some(
      c => c.user._id.toString() === currentUserId?.toString()
    );

    if (!isOwner && !isCollaborator) {
      if (itinerary.visibility === 'private') {
        return res.status(403).json({ message: 'This itinerary is private' });
      }

      if (itinerary.visibility === 'followers') {
        const user = await User.findById(itinerary.user._id);
        const isFollowing = user.followers?.includes(currentUserId);
        
        if (!isFollowing) {
          return res.status(403).json({ message: 'This itinerary is for followers only' });
        }
      }
    }

    // Check if current user liked or saved
    const isLiked = currentUserId ? itinerary.likes.includes(currentUserId) : false;
    const isSaved = currentUserId ? itinerary.saves.includes(currentUserId) : false;

    res.json({
      itinerary: {
        ...itinerary.toObject(),
        isLiked,
        isSaved
      }
    });
  } catch (error) {
    console.error('Get itinerary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update itinerary
exports.updateItinerary = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const userId = req.user._id;
    const updates = req.body;

    const itinerary = await Itinerary.findById(itineraryId);

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    // Check if user is owner or editor
    const isOwner = itinerary.user.toString() === userId.toString();
    const isEditor = itinerary.collaborators.some(
      c => c.user.toString() === userId.toString() && c.role === 'editor'
    );

    if (!isOwner && !isEditor) {
      return res.status(403).json({ message: 'Unauthorized to edit this itinerary' });
    }

    // Update allowed fields
    const allowedUpdates = [
      'title', 'description', 'destination', 'country', 'startDate', 'endDate',
      'days', 'budget', 'travelers', 'visibility', 'tags', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        itinerary[field] = updates[field];
      }
    });

    await itinerary.save();
    await itinerary.populate('user', 'name avatar');

    res.json({ itinerary });
  } catch (error) {
    console.error('Update itinerary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add day to itinerary
exports.addDay = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const { dayNumber, date, title, activities, notes } = req.body;

    const itinerary = await Itinerary.findOne({
      _id: itineraryId,
      user: req.user._id
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found or unauthorized' });
    }

    itinerary.days.push({
      dayNumber,
      date,
      title,
      activities: activities || [],
      notes
    });

    // Sort days by dayNumber
    itinerary.days.sort((a, b) => a.dayNumber - b.dayNumber);

    await itinerary.save();

    res.json({ itinerary });
  } catch (error) {
    console.error('Add day error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add activity to day
exports.addActivity = async (req, res) => {
  try {
    const { itineraryId, dayId } = req.params;
    const activityData = req.body;

    const itinerary = await Itinerary.findOne({
      _id: itineraryId,
      user: req.user._id
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found or unauthorized' });
    }

    const day = itinerary.days.id(dayId);
    if (!day) {
      return res.status(404).json({ message: 'Day not found' });
    }

    day.activities.push(activityData);
    
    // Recalculate budget spent
    itinerary.calculateSpent();
    
    await itinerary.save();

    res.json({ itinerary });
  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle itinerary like
exports.toggleLike = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const userId = req.user._id;

    const itinerary = await Itinerary.findById(itineraryId);

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    const likeIndex = itinerary.likes.indexOf(userId);
    let isLiked;

    if (likeIndex > -1) {
      itinerary.likes.splice(likeIndex, 1);
      isLiked = false;
    } else {
      itinerary.likes.push(userId);
      isLiked = true;
    }

    await itinerary.save();

    res.json({
      isLiked,
      likeCount: itinerary.likes.length
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Toggle save itinerary
exports.toggleSave = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const userId = req.user._id;

    const itinerary = await Itinerary.findById(itineraryId);

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    const saveIndex = itinerary.saves.indexOf(userId);
    let isSaved;

    if (saveIndex > -1) {
      itinerary.saves.splice(saveIndex, 1);
      isSaved = false;
    } else {
      itinerary.saves.push(userId);
      isSaved = true;
    }

    await itinerary.save();

    res.json({
      isSaved,
      saveCount: itinerary.saves.length
    });
  } catch (error) {
    console.error('Toggle save error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get saved itineraries
exports.getSavedItineraries = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;

    const itineraries = await Itinerary.find({
      saves: userId
    })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Itinerary.countDocuments({ saves: userId });

    res.json({
      itineraries,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItineraries: total
    });
  } catch (error) {
    console.error('Get saved itineraries error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add collaborator
exports.addCollaborator = async (req, res) => {
  try {
    const { itineraryId } = req.params;
    const { userId: collaboratorId, role } = req.body;

    const itinerary = await Itinerary.findOne({
      _id: itineraryId,
      user: req.user._id
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found or unauthorized' });
    }

    // Check if already a collaborator
    const exists = itinerary.collaborators.some(
      c => c.user.toString() === collaboratorId
    );

    if (exists) {
      return res.status(400).json({ message: 'User is already a collaborator' });
    }

    itinerary.collaborators.push({
      user: collaboratorId,
      role: role || 'viewer'
    });

    await itinerary.save();
    await itinerary.populate('collaborators.user', 'name avatar');

    res.json({ itinerary });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete itinerary
exports.deleteItinerary = async (req, res) => {
  try {
    const { itineraryId } = req.params;

    const itinerary = await Itinerary.findOne({
      _id: itineraryId,
      user: req.user._id
    });

    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found or unauthorized' });
    }

    await itinerary.deleteOne();

    res.json({ message: 'Itinerary deleted successfully' });
  } catch (error) {
    console.error('Delete itinerary error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Search public itineraries
exports.searchItineraries = async (req, res) => {
  try {
    const { destination, country, minDays, maxDays, page = 1, limit = 10 } = req.query;

    const query = { visibility: 'public' };

    if (destination) {
      query.destination = new RegExp(destination, 'i');
    }

    if (country) {
      query.country = new RegExp(country, 'i');
    }

    const itineraries = await Itinerary.find(query)
      .populate('user', 'name avatar')
      .sort({ likeCount: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Filter by duration if specified
    let filteredItineraries = itineraries;
    if (minDays || maxDays) {
      filteredItineraries = itineraries.filter(it => {
        const days = it.durationDays;
        if (minDays && days < parseInt(minDays)) return false;
        if (maxDays && days > parseInt(maxDays)) return false;
        return true;
      });
    }

    const total = await Itinerary.countDocuments(query);

    res.json({
      itineraries: filteredItineraries,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalItineraries: total
    });
  } catch (error) {
    console.error('Search itineraries error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
