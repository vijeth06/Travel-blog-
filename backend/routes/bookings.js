const express = require('express');
const router = express.Router();
const {
  createBooking,
  getUserBookings,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  addBookingNote
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// User routes
router.post('/', createBooking);
router.get('/my-bookings', getUserBookings);
router.get('/:id', getBookingById);
router.put('/:id/cancel', cancelBooking);

// Admin routes
router.get('/', admin, getAllBookings);
router.put('/:id/status', admin, updateBookingStatus);
router.post('/:id/notes', admin, addBookingNote);

module.exports = router;
