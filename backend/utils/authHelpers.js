const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Generate access token (short-lived)
exports.generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

// Generate refresh token (long-lived)
exports.generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Generate OTP (6 digits)
exports.generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Generate secure reset token
exports.generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Hash token for storage
exports.hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Extract device info from request
exports.getDeviceInfo = (req) => {
  const userAgent = req.headers['user-agent'] || '';
  
  return {
    deviceId: crypto.createHash('md5').update(userAgent + req.ip).digest('hex'),
    browser: extractBrowser(userAgent),
    os: extractOS(userAgent),
    ip: req.ip || req.connection.remoteAddress,
    deviceName: `${extractBrowser(userAgent)} on ${extractOS(userAgent)}`
  };
};

// Extract browser from user agent
const extractBrowser = (userAgent) => {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown Browser';
};

// Extract OS from user agent
const extractOS = (userAgent) => {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown OS';
};

// Check if login is suspicious
exports.isSuspiciousLogin = async (user, req) => {
  const LoginAttempt = require('../models/LoginAttempt');
  const deviceInfo = exports.getDeviceInfo(req);
  
  // Check for multiple failed attempts from this IP
  const recentFailures = await LoginAttempt.countDocuments({
    email: user.email,
    ip: deviceInfo.ip,
    success: false,
    createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
  });
  
  if (recentFailures >= 3) return true;
  
  // Check for login from new location (simplified)
  const recentSuccessful = await LoginAttempt.findOne({
    email: user.email,
    success: true,
    createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
  }).sort({ createdAt: -1 });
  
  if (recentSuccessful && recentSuccessful.ip !== deviceInfo.ip) {
    return true; // Different IP than usual
  }
  
  return false;
};

// Send OTP email
exports.sendOTPEmail = async (email, otp, type) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const subjects = {
    'email_verification': 'Verify Your Email - Travel Blog',
    '2fa_login': 'Your Login Code - Travel Blog',
    'password_reset': 'Password Reset Code - Travel Blog',
    'account_recovery': 'Account Recovery Code - Travel Blog'
  };

  const messages = {
    'email_verification': `Your verification code is: <strong>${otp}</strong><br>This code expires in 15 minutes.`,
    '2fa_login': `Your two-factor authentication code is: <strong>${otp}</strong><br>This code expires in 15 minutes.`,
    'password_reset': `Your password reset code is: <strong>${otp}</strong><br>This code expires in 15 minutes.`,
    'account_recovery': `Your account recovery code is: <strong>${otp}</strong><br>This code expires in 15 minutes.`
  };

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: subjects[type] || 'Verification Code - Travel Blog',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1976d2;">Travel Blog</h2>
        <p>${messages[type]}</p>
        <p style="color: #666;">If you didn't request this code, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #999; font-size: 12px;">This is an automated email. Please do not reply.</p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};

// Validate password strength
exports.validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters long`);
  }
  if (!hasUpperCase) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!hasLowerCase) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!hasNumbers) {
    errors.push('Password must contain at least one number');
  }
  if (!hasSpecialChar) {
    errors.push('Password must contain at least one special character');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  };
};

const calculatePasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
  if (/\d/.test(password)) strength++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
  
  if (strength <= 2) return 'weak';
  if (strength <= 3) return 'medium';
  if (strength <= 4) return 'strong';
  return 'very_strong';
};
