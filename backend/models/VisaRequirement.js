const mongoose = require('mongoose');

const VisaRequirementSchema = new mongoose.Schema({
  fromCountry: {
    type: String,
    required: true,
    uppercase: true,
    length: 2 // ISO 2-letter country code
  },
  
  toCountry: {
    type: String,
    required: true,
    uppercase: true,
    length: 2 // ISO 2-letter country code
  },
  
  requirement: {
    type: String,
    enum: ['visa_free', 'visa_on_arrival', 'evisa', 'visa_required', 'entry_refused'],
    required: true
  },
  
  maxStayDays: {
    type: Number, // null for visa required or entry refused
    min: 0
  },
  
  conditions: [{ type: String }], // ['passport_validity_6_months', 'return_ticket', 'proof_of_funds']
  
  fees: {
    amount: { type: Number, min: 0 },
    currency: { type: String, default: 'USD' },
    paymentMethods: [{ type: String }] // ['online', 'cash', 'card']
  },
  
  processingTime: {
    min: { type: Number }, // in days
    max: { type: Number }, // in days
    expedited: { type: Number }, // expedited processing time
    expeditedFee: { type: Number }
  },
  
  documentation: {
    required: [{ type: String }], // ['passport', 'photo', 'form', 'bank_statement']
    optional: [{ type: String }],
    specifications: {
      passportValidity: { type: Number, default: 6 }, // months
      photoRequirements: { type: String },
      additionalForms: [{ type: String }]
    }
  },
  
  applicationProcess: {
    onlineApplication: { type: Boolean, default: false },
    applicationUrl: { type: String },
    embassyRequired: { type: Boolean, default: false },
    biometricsRequired: { type: Boolean, default: false },
    interviewRequired: { type: Boolean, default: false }
  },
  
  restrictions: {
    purposeRestrictions: [{ type: String }], // ['tourism_only', 'no_work', 'no_study']
    ageRestrictions: {
      minAge: { type: Number },
      maxAge: { type: Number },
      specialConditions: { type: String }
    },
    healthRequirements: [{ type: String }], // ['yellow_fever_vaccination', 'covid_negative_test']
    criminalRecordCheck: { type: Boolean, default: false }
  },
  
  embassy: {
    name: { type: String },
    address: { type: String },
    phone: { type: String },
    email: { type: String },
    website: { type: String },
    workingHours: { type: String },
    appointmentRequired: { type: Boolean, default: false }
  },
  
  updates: {
    lastUpdated: { type: Date, default: Date.now },
    source: { type: String }, // 'government_website', 'embassy', 'third_party'
    reliability: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
    changeHistory: [{
      date: { type: Date },
      change: { type: String },
      previousValue: { type: String },
      newValue: { type: String }
    }]
  },
  
  additionalInfo: {
    notes: { type: String },
    exceptions: [{ type: String }],
    reciprocity: { type: Boolean, default: false }, // if the reverse is also true
    diplomaticRelations: { type: String, enum: ['normal', 'strained', 'no_relations'] }
  }
}, {
  timestamps: true
});

// Compound index for quick lookups
VisaRequirementSchema.index({ fromCountry: 1, toCountry: 1 }, { unique: true });
VisaRequirementSchema.index({ requirement: 1 });
VisaRequirementSchema.index({ 'updates.lastUpdated': -1 });

// User-specific visa application tracking
const UserVisaApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  visaRequirement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VisaRequirement',
    required: true
  },
  
  travelDetails: {
    purpose: { type: String, required: true },
    plannedArrival: { type: Date, required: true },
    plannedDeparture: { type: Date, required: true },
    duration: { type: Number }, // calculated in days
    accommodation: { type: String },
    sponsor: { type: String }
  },
  
  applicationStatus: {
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'submitted', 'under_review', 'approved', 'denied', 'expired'],
      default: 'not_started'
    },
    applicationNumber: { type: String },
    submittedDate: { type: Date },
    expectedDecision: { type: Date },
    actualDecision: { type: Date },
    expiryDate: { type: Date }
  },
  
  documents: {
    submitted: [{
      type: { type: String },
      filename: { type: String },
      uploadDate: { type: Date, default: Date.now },
      status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
    }],
    required: [{ type: String }],
    missing: [{ type: String }]
  },
  
  payment: {
    feesPaid: { type: Number, default: 0 },
    totalFees: { type: Number },
    paymentDate: { type: Date },
    paymentMethod: { type: String },
    receiptNumber: { type: String }
  },
  
  appointments: [{
    type: { type: String }, // 'submission', 'interview', 'biometrics'
    date: { type: Date },
    time: { type: String },
    location: { type: String },
    status: { type: String, enum: ['scheduled', 'completed', 'missed', 'rescheduled'] },
    notes: { type: String }
  }],
  
  notifications: {
    emailUpdates: { type: Boolean, default: true },
    smsUpdates: { type: Boolean, default: false },
    remindersSent: [{ type: Date }]
  },
  
  result: {
    decision: { type: String, enum: ['approved', 'denied'] },
    validFrom: { type: Date },
    validUntil: { type: Date },
    entries: { type: String, enum: ['single', 'multiple'] },
    denialReason: { type: String },
    appealDeadline: { type: Date }
  }
}, {
  timestamps: true
});

// Index for user visa applications
UserVisaApplicationSchema.index({ user: 1, createdAt: -1 });
UserVisaApplicationSchema.index({ 'applicationStatus.status': 1 });
UserVisaApplicationSchema.index({ 'travelDetails.plannedArrival': 1 });

const VisaRequirement = mongoose.model('VisaRequirement', VisaRequirementSchema);
const UserVisaApplication = mongoose.model('UserVisaApplication', UserVisaApplicationSchema);

module.exports = { VisaRequirement, UserVisaApplication };