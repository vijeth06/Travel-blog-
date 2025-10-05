const Booking = require('../models/Booking');
const Package = require('../models/Package');
const User = require('../models/User');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res) => {
  try {
    const {
      packageId,
      travelers,
      contactInfo,
      travelDates,
      numberOfTravelers,
      paymentInfo,
      specialRequests
    } = req.body;

    // Verify package exists and is available
    const package = await Package.findById(packageId);
    if (!package) {
      return res.status(404).json({ message: 'Package not found' });
    }

    if (!package.availability) {
      return res.status(400).json({ message: 'Package is not available' });
    }

    // Check if package has capacity
    if (package.currentBookings + numberOfTravelers > package.maxCapacity) {
      return res.status(400).json({ message: 'Package capacity exceeded' });
    }

    // Calculate total amount (including any discounts)
    let totalAmount = package.price * numberOfTravelers;
    if (package.discount && package.discount.percentage > 0 && 
        (!package.discount.validUntil || new Date() <= new Date(package.discount.validUntil))) {
      totalAmount = totalAmount * (1 - package.discount.percentage / 100);
    }

    const booking = new Booking({
      user: req.user.id,
      package: packageId,
      travelers,
      contactInfo,
      travelDates,
      numberOfTravelers,
      totalAmount,
      paymentInfo,
      specialRequests
    });

    const savedBooking = await booking.save();

    // Update package booking count
    package.currentBookings += numberOfTravelers;
    await package.save();

    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate('user', 'name email')
      .populate('package', 'title location duration price');

    // Emit real-time booking update
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${req.user.id}`).emit('booking-status-changed', {
        userId: req.user.id,
        booking: populatedBooking,
        status: 'created'
      });
    }

    res.status(201).json(populatedBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors 
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Booking with this ID already exists' 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to create booking', 
      error: error.message 
    });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getUserBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { user: req.user.id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const bookings = await Booking.find(filter)
      .populate('package', 'title location duration price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBookings: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings
// @access  Private (Admin only)
const getAllBookings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.packageId) filter.package = req.query.packageId;

    const bookings = await Booking.find(filter)
      .populate('user', 'name email phone')
      .populate('package', 'title location duration price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(filter);

    res.json({
      bookings,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalBookings: total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('package', 'title location duration price images features inclusions exclusions hotel');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking or is admin
    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Admin only)
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;

    if (status === 'Confirmed') {
      booking.confirmation.confirmedAt = Date.now();
      booking.confirmation.confirmedBy = req.user.id;
      booking.generateConfirmationNumber();
    }

    if (status === 'Cancelled') {
      booking.cancellation.cancelledAt = Date.now();
      booking.cancellation.cancelledBy = req.user.id;
      
      // Update package booking count
      const package = await Package.findById(booking.package);
      if (package) {
        package.currentBookings = Math.max(0, package.currentBookings - booking.numberOfTravelers);
        await package.save();
      }
    }

    await booking.save();

    const updatedBooking = await Booking.findById(req.params.id)
      .populate('user', 'name email')
      .populate('package', 'title location');

    // Emit real-time booking status update
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${booking.user}`).emit('booking-status-changed', {
        userId: booking.user,
        booking: updatedBooking,
        status: status.toLowerCase()
      });
    }

    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res) => {
  try {
    const { reason } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if user owns this booking
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled' });
    }

    if (booking.status === 'Completed') {
      return res.status(400).json({ message: 'Cannot cancel completed booking' });
    }

    booking.status = 'Cancelled';
    booking.cancellation.reason = reason;
    booking.cancellation.cancelledAt = Date.now();
    booking.cancellation.cancelledBy = req.user.id;

    // Determine refund eligibility based on cancellation time
    const daysDifference = Math.ceil((new Date(booking.travelDates.startDate) - new Date()) / (1000 * 60 * 60 * 24));
    booking.cancellation.refundEligible = daysDifference > 7; // 7 days cancellation policy

    await booking.save();

    // Update package booking count
    const package = await Package.findById(booking.package);
    if (package) {
      package.currentBookings = Math.max(0, package.currentBookings - booking.numberOfTravelers);
      await package.save();
    }

    // Emit real-time booking cancellation update
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${req.user.id}`).emit('booking-status-changed', {
        userId: req.user.id,
        booking,
        status: 'cancelled'
      });
    }

    res.json({ message: 'Booking cancelled successfully', booking });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add note to booking
// @route   POST /api/bookings/:id/notes
// @access  Private (Admin only)
const addBookingNote = async (req, res) => {
  try {
    const { text } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.notes.push({
      text,
      addedBy: req.user.id
    });

    await booking.save();

    const updatedBooking = await Booking.findById(req.params.id)
      .populate('notes.addedBy', 'name');

    res.json(updatedBooking);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  addBookingNote
};
