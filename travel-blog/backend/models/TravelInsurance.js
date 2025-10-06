const mongoose = require('mongoose');

const TravelInsuranceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  
  groupBooking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupBooking'
  },
  
  policyDetails: {
    provider: {
      name: { type: String, required: true },
      logo: { type: String },
      contactInfo: {
        phone: { type: String },
        email: { type: String },
        website: { type: String }
      }
    },
    policyNumber: { type: String, unique: true },
    policyType: {
      type: String,
      enum: ['basic', 'comprehensive', 'premium', 'adventure', 'senior', 'family'],
      required: true
    }
  },
  
  coverage: {
    medical: {
      covered: { type: Boolean, default: true },
      limit: { type: Number }, // in USD
      emergencyEvacuation: { type: Boolean, default: true },
      preExistingConditions: { type: Boolean, default: false }
    },
    tripCancellation: {
      covered: { type: Boolean, default: true },
      limit: { type: Number },
      reasons: [{ type: String }] // ['illness', 'death', 'job_loss', 'weather', 'terrorism']
    },
    tripInterruption: {
      covered: { type: Boolean, default: true },
      limit: { type: Number }
    },
    baggage: {
      covered: { type: Boolean, default: true },
      limit: { type: Number },
      delayCompensation: { type: Number }
    },
    flightDelay: {
      covered: { type: Boolean, default: true },
      minimumDelay: { type: Number, default: 6 }, // hours
      compensation: { type: Number }
    },
    adventure: {
      covered: { type: Boolean, default: false },
      activities: [{ type: String }], // ['skiing', 'diving', 'climbing']
      additionalPremium: { type: Number }
    }
  },
  
  travelDetails: {
    destination: {
      countries: [{ type: String }],
      riskLevel: { type: String, enum: ['low', 'medium', 'high'] }
    },
    travelDates: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      duration: { type: Number } // in days
    },
    travelPurpose: {
      type: String,
      enum: ['leisure', 'business', 'study', 'volunteer', 'adventure']
    },
    travelers: [{
      name: { type: String, required: true },
      age: { type: Number, required: true },
      relationship: { type: String }, // 'self', 'spouse', 'child', 'parent'
      preExistingConditions: [{ type: String }]
    }]
  },
  
  pricing: {
    basePremium: { type: Number, required: true },
    additionalCoverage: { type: Number, default: 0 },
    discounts: [{
      type: { type: String }, // 'group', 'loyalty', 'early_bird'
      amount: { type: Number },
      percentage: { type: Number }
    }],
    taxes: { type: Number, default: 0 },
    totalPremium: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    paymentSchedule: {
      type: String,
      enum: ['full', 'monthly', 'quarterly'],
      default: 'full'
    }
  },
  
  status: {
    type: String,
    enum: ['quoted', 'pending_payment', 'active', 'expired', 'cancelled', 'claimed'],
    default: 'quoted'
  },
  
  payment: {
    method: { type: String, enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer'] },
    transactionId: { type: String },
    paidAt: { type: Date },
    nextPaymentDue: { type: Date }
  },
  
  documents: {
    policyDocument: { type: String }, // URL to policy PDF
    certificate: { type: String }, // URL to certificate
    claimForms: [{ type: String }]
  },
  
  claims: [{
    claimNumber: { type: String, unique: true, sparse: true },
    type: { type: String, enum: ['medical', 'cancellation', 'baggage', 'delay'] },
    incidentDate: { type: Date },
    reportedDate: { type: Date, default: Date.now },
    amount: { type: Number },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'approved', 'denied', 'paid'],
      default: 'submitted'
    },
    description: { type: String },
    supportingDocuments: [{ type: String }],
    adjusterNotes: { type: String },
    settlementAmount: { type: Number },
    settlementDate: { type: Date }
  }],
  
  emergencyContacts: {
    provider24h: {
      phone: { type: String },
      email: { type: String }
    },
    localAssistance: [{
      country: { type: String },
      phone: { type: String },
      address: { type: String }
    }]
  }
}, {
  timestamps: true
});

// Index for efficient querying
TravelInsuranceSchema.index({ user: 1, createdAt: -1 });
TravelInsuranceSchema.index({ policyNumber: 1 });
TravelInsuranceSchema.index({ status: 1 });
TravelInsuranceSchema.index({ 'travelDetails.travelDates.startDate': 1 });

// Pre-save middleware
TravelInsuranceSchema.pre('save', function(next) {
  // Calculate duration
  if (this.travelDetails.travelDates.startDate && this.travelDetails.travelDates.endDate) {
    const diffTime = Math.abs(this.travelDetails.travelDates.endDate - this.travelDetails.travelDates.startDate);
    this.travelDetails.duration = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // Generate policy number if not exists
  if (!this.policyDetails.policyNumber) {
    this.policyDetails.policyNumber = 'TI' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  
  next();
});

module.exports = mongoose.model('TravelInsurance', TravelInsuranceSchema);