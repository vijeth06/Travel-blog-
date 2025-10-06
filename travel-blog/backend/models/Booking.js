const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingId: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package', required: true },
  travelers: [{
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    passport: { type: String },
    nationality: { type: String }
  }],
  contactInfo: {
    phone: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String }
    }
  },
  travelDates: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  numberOfTravelers: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  paymentInfo: {
    method: { type: String, enum: ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer'], required: true },
    status: { type: String, enum: ['Pending', 'Paid', 'Failed', 'Refunded'], default: 'Pending' },
    transactionId: { type: String },
    paidAt: { type: Date },
    refundedAt: { type: Date },
    refundAmount: { type: Number }
  },
  specialRequests: { type: String },
  status: { 
    type: String, 
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed', 'In Progress'], 
    default: 'Pending' 
  },
  cancellation: {
    reason: { type: String },
    cancelledAt: { type: Date },
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    refundEligible: { type: Boolean, default: false }
  },
  confirmation: {
    confirmedAt: { type: Date },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    confirmationNumber: { type: String }
  },
  notes: [{ 
    text: { type: String },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    addedAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Generate unique booking ID
BookingSchema.pre('save', async function(next) {
  if (this.isNew && !this.bookingId) {
    try {
      const count = await mongoose.model('Booking').countDocuments();
      this.bookingId = `TB${Date.now()}${(count + 1).toString().padStart(4, '0')}`;
    } catch (error) {
      return next(error);
    }
  }
  this.updatedAt = Date.now();
  next();
});

// Generate confirmation number when booking is confirmed
BookingSchema.methods.generateConfirmationNumber = function() {
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  this.confirmation.confirmationNumber = `CONF-${this.bookingId}-${random}`;
};

module.exports = mongoose.model('Booking', BookingSchema);
