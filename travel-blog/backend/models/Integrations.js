const mongoose = require('mongoose');

// Calendar Integration Schema
const calendarIntegrationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    provider: {
        type: String,
        enum: ['google', 'outlook', 'apple', 'caldav'],
        required: true
    },
    accessToken: {
        type: String,
        required: true
    },
    refreshToken: String,
    expiresAt: Date,
    calendarId: String,
    settings: {
        syncTripEvents: { type: Boolean, default: true },
        syncFlights: { type: Boolean, default: true },
        syncHotels: { type: Boolean, default: true },
        syncActivities: { type: Boolean, default: true },
        reminderMinutes: { type: Number, default: 60 },
        eventColor: { type: String, default: '#4285F4' },
        timezone: { type: String, default: 'UTC' }
    },
    lastSync: Date,
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Social Media Integration Schema
const socialMediaIntegrationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    platform: {
        type: String,
        enum: ['facebook', 'instagram', 'twitter', 'pinterest', 'linkedin', 'tiktok'],
        required: true
    },
    accessToken: {
        type: String,
        required: true
    },
    refreshToken: String,
    expiresAt: Date,
    platformUserId: String,
    username: String,
    settings: {
        autoPost: { type: Boolean, default: false },
        postOnBlogPublish: { type: Boolean, default: false },
        postOnTripComplete: { type: Boolean, default: false },
        includeHashtags: { type: Boolean, default: true },
        defaultHashtags: [String],
        postTemplate: String,
        imageSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' }
    },
    lastPost: Date,
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Weather Integration Schema
const weatherIntegrationSchema = new mongoose.Schema({
    location: {
        city: { type: String, required: true },
        country: { type: String, required: true },
        coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
        }
    },
    provider: {
        type: String,
        enum: ['openweather', 'weatherapi', 'accuweather'],
        default: 'openweather'
    },
    current: {
        temperature: Number,
        feelsLike: Number,
        humidity: Number,
        windSpeed: Number,
        windDirection: Number,
        visibility: Number,
        uvIndex: Number,
        condition: String,
        icon: String,
        pressure: Number,
        cloudCover: Number
    },
    forecast: [{
        date: Date,
        tempHigh: Number,
        tempLow: Number,
        condition: String,
        icon: String,
        chanceOfRain: Number,
        windSpeed: Number,
        humidity: Number
    }],
    alerts: [{
        type: String,
        title: String,
        description: String,
        severity: { type: String, enum: ['minor', 'moderate', 'severe', 'extreme'] },
        startTime: Date,
        endTime: Date
    }],
    lastUpdated: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 10 * 60 * 1000) } // 10 minutes
}, {
    timestamps: true
});

// Flight API Integration Schema
const flightApiSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    searchId: { type: String, unique: true },
    origin: {
        code: String, // Airport code
        city: String,
        country: String
    },
    destination: {
        code: String,
        city: String,
        country: String
    },
    departureDate: Date,
    returnDate: Date,
    passengers: {
        adults: { type: Number, default: 1 },
        children: { type: Number, default: 0 },
        infants: { type: Number, default: 0 }
    },
    class: { type: String, enum: ['economy', 'premium', 'business', 'first'], default: 'economy' },
    results: [{
        airline: String,
        flightNumber: String,
        aircraft: String,
        departure: {
            time: Date,
            airport: String,
            terminal: String,
            gate: String
        },
        arrival: {
            time: Date,
            airport: String,
            terminal: String,
            gate: String
        },
        duration: Number, // in minutes
        stops: Number,
        layovers: [{
            airport: String,
            duration: Number // in minutes
        }],
        price: {
            amount: Number,
            currency: String,
            taxes: Number,
            fees: Number
        },
        baggage: {
            carry: { weight: Number, pieces: Number },
            checked: { weight: Number, pieces: Number }
        },
        amenities: [String],
        bookingUrl: String,
        provider: String
    }],
    searchDate: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) } // 24 hours
}, {
    timestamps: true
});

// Hotel API Integration Schema
const hotelApiSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    searchId: { type: String, unique: true },
    location: {
        city: String,
        coordinates: {
            lat: Number,
            lng: Number
        },
        radius: { type: Number, default: 10 } // km
    },
    checkIn: Date,
    checkOut: Date,
    guests: {
        adults: { type: Number, default: 2 },
        children: { type: Number, default: 0 },
        rooms: { type: Number, default: 1 }
    },
    filters: {
        minPrice: Number,
        maxPrice: Number,
        starRating: [Number],
        amenities: [String],
        hotelChain: [String],
        propertyType: [String]
    },
    results: [{
        hotelId: String,
        name: String,
        starRating: Number,
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        },
        images: [String],
        description: String,
        amenities: [String],
        rooms: [{
            type: String,
            description: String,
            maxOccupancy: Number,
            price: {
                amount: Number,
                currency: String,
                perNight: Boolean
            },
            amenities: [String],
            images: [String]
        }],
        price: {
            amount: Number,
            currency: String,
            totalNights: Number,
            taxes: Number,
            fees: Number
        },
        rating: {
            score: Number,
            reviewCount: Number,
            source: String
        },
        distance: Number, // from search center
        bookingUrl: String,
        provider: String,
        cancellation: {
            freeCancellation: Boolean,
            deadline: Date,
            penalty: Number
        }
    }],
    searchDate: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) } // 24 hours
}, {
    timestamps: true
});

// Payment Integration Schema
const paymentIntegrationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    provider: {
        type: String,
        enum: ['stripe', 'paypal', 'square', 'razorpay', 'braintree'],
        required: true
    },
    customerId: String, // Customer ID in payment provider
    defaultPaymentMethod: String,
    paymentMethods: [{
        id: String,
        type: { type: String, enum: ['card', 'bank', 'wallet', 'crypto'] },
        last4: String,
        brand: String,
        expiryMonth: Number,
        expiryYear: Number,
        isDefault: Boolean,
        billingAddress: {
            line1: String,
            line2: String,
            city: String,
            state: String,
            postalCode: String,
            country: String
        }
    }],
    transactions: [{
        id: String,
        amount: Number,
        currency: String,
        status: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'] },
        description: String,
        metadata: {
            blogId: mongoose.Schema.Types.ObjectId,
            bookingId: String,
            subscriptionId: String,
            productId: String
        },
        paymentMethod: String,
        fees: Number,
        refundAmount: Number,
        refundReason: String,
        createdAt: { type: Date, default: Date.now }
    }],
    webhookEndpoints: [{
        url: String,
        events: [String],
        secret: String,
        isActive: Boolean
    }],
    settings: {
        currency: { type: String, default: 'USD' },
        autoCapture: { type: Boolean, default: true },
        savePaymentMethods: { type: Boolean, default: true },
        sendReceipts: { type: Boolean, default: true }
    },
    isSetup: { type: Boolean, default: false }
}, {
    timestamps: true
});

// External API Keys Schema
const apiKeysSchema = new mongoose.Schema({
    service: {
        type: String,
        required: true,
        unique: true
    },
    keys: {
        primary: String,
        secondary: String,
        webhook: String
    },
    config: {
        baseUrl: String,
        version: String,
        timeout: { type: Number, default: 30000 },
        retryAttempts: { type: Number, default: 3 },
        rateLimits: {
            requests: Number,
            window: Number // in seconds
        }
    },
    usage: {
        requestCount: { type: Number, default: 0 },
        lastRequest: Date,
        errorCount: { type: Number, default: 0 },
        lastError: Date
    },
    isActive: { type: Boolean, default: true },
    expiresAt: Date
}, {
    timestamps: true
});

// Webhook Configuration Schema
const webhookConfigSchema = new mongoose.Schema({
    service: String,
    endpoint: String,
    events: [String],
    secret: String,
    headers: {
        type: Map,
        of: String
    },
    retryConfig: {
        attempts: { type: Number, default: 3 },
        delay: { type: Number, default: 1000 }, // ms
        backoff: { type: String, enum: ['linear', 'exponential'], default: 'exponential' }
    },
    security: {
        verifySignature: { type: Boolean, default: true },
        allowedIPs: [String],
        requireHttps: { type: Boolean, default: true }
    },
    logs: [{
        timestamp: { type: Date, default: Date.now },
        event: String,
        status: { type: String, enum: ['success', 'failed', 'retry'] },
        response: String,
        attempt: Number,
        error: String
    }],
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true
});

// Create indexes for performance
calendarIntegrationSchema.index({ user: 1, provider: 1 });
socialMediaIntegrationSchema.index({ user: 1, platform: 1 });
weatherIntegrationSchema.index({ 'location.coordinates': '2dsphere' });
weatherIntegrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
flightApiSchema.index({ user: 1, searchDate: -1 });
flightApiSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
hotelApiSchema.index({ user: 1, searchDate: -1 });
hotelApiSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
paymentIntegrationSchema.index({ user: 1, provider: 1 });
apiKeysSchema.index({ service: 1 });
webhookConfigSchema.index({ service: 1, isActive: 1 });

module.exports = {
    CalendarIntegration: mongoose.model('CalendarIntegration', calendarIntegrationSchema),
    SocialMediaIntegration: mongoose.model('SocialMediaIntegration', socialMediaIntegrationSchema),
    WeatherIntegration: mongoose.model('WeatherIntegration', weatherIntegrationSchema),
    FlightApi: mongoose.model('FlightApi', flightApiSchema),
    HotelApi: mongoose.model('HotelApi', hotelApiSchema),
    PaymentIntegration: mongoose.model('PaymentIntegration', paymentIntegrationSchema),
    ApiKeys: mongoose.model('ApiKeys', apiKeysSchema),
    WebhookConfig: mongoose.model('WebhookConfig', webhookConfigSchema)
};