const mongoose = require('mongoose');

const GroupBookingSchema = new mongoose.Schema({
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  title: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    maxlength: 1000
  },
  
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  
  groupDetails: {
    maxParticipants: { type: Number, required: true, min: 2 },
    currentParticipants: { type: Number, default: 1 },
    minParticipants: { type: Number, default: 2 },
    registrationDeadline: { type: Date, required: true },
    depositRequired: { type: Boolean, default: true },
    depositAmount: { type: Number },
    depositPercentage: { type: Number, default: 20 }
  },
  
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    joinedAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'paid', 'cancelled'],
      default: 'pending'
    },
    depositPaid: { type: Boolean, default: false },
    finalPaymentPaid: { type: Boolean, default: false },
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String }
    },
    specialRequests: { type: String },
    dietaryRestrictions: [{ type: String }],
    medicalConditions: { type: String }
  }],
  
  pricing: {
    originalPrice: { type: Number, required: true },
    groupDiscount: {
      percentage: { type: Number, default: 0 },
      amount: { type: Number, default: 0 }
    },
    finalPricePerPerson: { type: Number, required: true },
    totalGroupPrice: { type: Number },
    currency: { type: String, default: 'USD' }
  },
  
  communication: {
    chatEnabled: { type: Boolean, default: true },
    messages: [{
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
      type: { type: String, enum: ['message', 'announcement', 'system'], default: 'message' }
    }],
    announcements: [{
      title: { type: String },
      content: { type: String },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      createdAt: { type: Date, default: Date.now },
      important: { type: Boolean, default: false }
    }]
  },
  
  itinerary: {
    customized: { type: Boolean, default: false },
    modifications: [{
      day: { type: Number },
      changes: { type: String },
      reason: { type: String },
      approvedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }]
  },
  
  status: {
    type: String,
    enum: ['forming', 'confirmed', 'full', 'cancelled', 'completed'],
    default: 'forming'
  },
  
  bookingStatus: {
    allDepositsCollected: { type: Boolean, default: false },
    finalPaymentsCollected: { type: Boolean, default: false },
    travelDocumentsSubmitted: { type: Boolean, default: false },
    readyToTravel: { type: Boolean, default: false }
  },
  
  policies: {
    cancellationPolicy: { type: String },
    refundPolicy: { type: String },
    groupRules: [{ type: String }],
    ageRestrictions: {
      minAge: { type: Number },
      maxAge: { type: Number }
    }
  },
  
  sharing: {
    isPublic: { type: Boolean, default: false },
    inviteCode: { type: String, unique: true, sparse: true },
    socialMediaSharing: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Index for efficient querying
GroupBookingSchema.index({ organizer: 1, createdAt: -1 });
GroupBookingSchema.index({ package: 1 });
GroupBookingSchema.index({ status: 1 });
GroupBookingSchema.index({ inviteCode: 1 });
GroupBookingSchema.index({ 'groupDetails.registrationDeadline': 1 });

// Pre-save middleware to generate invite code
GroupBookingSchema.pre('save', function(next) {
  if (this.sharing.isPublic && !this.sharing.inviteCode) {
    this.sharing.inviteCode = Math.random().toString(36).substring(2, 15).toUpperCase();
  }
  
  // Update current participants count
  this.groupDetails.currentParticipants = this.participants.filter(p => 
    ['confirmed', 'paid'].includes(p.status)
  ).length + 1; // +1 for organizer
  
  // Update total group price
  this.pricing.totalGroupPrice = this.pricing.finalPricePerPerson * this.groupDetails.currentParticipants;
  
  // Update status based on participants
  if (this.groupDetails.currentParticipants >= this.groupDetails.maxParticipants) {
    this.status = 'full';
  } else if (this.groupDetails.currentParticipants >= this.groupDetails.minParticipants) {
    this.status = 'confirmed';
  }
  
  next();
});

module.exports = mongoose.model('GroupBooking', GroupBookingSchema);