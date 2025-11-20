const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const OTPVerification = require('../models/OTPVerification');
const LoginAttempt = require('../models/LoginAttempt');
const jwt = require('jsonwebtoken');
const {
  generateAccessToken,
  generateRefreshToken,
  generateOTP,
  generateResetToken,
  hashToken,
  getDeviceInfo,
  isSuspiciousLogin,
  sendOTPEmail,
  validatePasswordStrength
} = require('../utils/authHelpers');

// Register new user
exports.register = async (req, res) => {
  const { name, email, password, phone, country, city } = req.body;
  
  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors,
        strength: passwordValidation.strength
      });
    }

    // Create user
    user = new User({
      name,
      email,
      password,
      phone,
      country,
      city
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken();
    const deviceInfo = getDeviceInfo(req);

    // Save refresh token
    await new RefreshToken({
      user: user._id,
      token: hashToken(refreshToken),
      deviceInfo,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }).save();

    res.status(201).json({
      message: 'Account created successfully!',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: err.message || 'Server error during registration' });
  }
};

// Verify email with OTP
exports.verifyEmail = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTPVerification.findOne({
      email,
      otp,
      type: 'email_verification',
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      return res.status(429).json({ message: 'Too many attempts. Please request a new code.' });
    }

    // Mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Update user
    const user = await User.findByIdAndUpdate(
      otpRecord.user,
      { isVerified: true },
      { new: true }
    );

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken();
    const deviceInfo = getDeviceInfo(req);

    // Save refresh token
    await new RefreshToken({
      user: user._id,
      token: hashToken(refreshToken),
      deviceInfo,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    }).save();

    res.json({
      message: 'Email verified successfully!',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      }
    });

  } catch (err) {
    console.error('Verification error:', err);
    res.status(500).json({ message: 'Server error during verification' });
  }
};

// Login with enhanced security
exports.login = async (req, res) => {
  const { email, password, trustDevice = false } = req.body;

  try {
    const user = await User.findOne({ email });
    const deviceInfo = getDeviceInfo(req);

    // Log attempt
    const logAttempt = async (success, reason) => {
      await new LoginAttempt({
        email,
        ip: deviceInfo.ip,
        success,
        reason,
        deviceInfo: {
          browser: deviceInfo.browser,
          os: deviceInfo.os
        }
      }).save();
    };

    if (!user) {
      await logAttempt(false, 'invalid_credentials');
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is locked
    if (user.security?.accountLocked) {
      if (user.security.lockUntil && user.security.lockUntil > new Date()) {
        await logAttempt(false, 'account_locked');
        const minutesLeft = Math.ceil((user.security.lockUntil - new Date()) / (60 * 1000));
        return res.status(423).json({
          message: `Account is locked due to multiple failed login attempts. Try again in ${minutesLeft} minutes.`,
          locked: true,
          lockUntil: user.security.lockUntil
        });
      } else {
        // Unlock account
        user.security.accountLocked = false;
        user.security.lockUntil = null;
        user.security.failedLoginAttempts = 0;
      }
    }

    // Check if account is active
    if (!user.isActive) {
      await logAttempt(false, 'account_inactive');
      return res.status(403).json({ message: 'Account is deactivated. Please contact support.' });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      // Increment failed attempts
      user.security = user.security || {};
      user.security.failedLoginAttempts = (user.security.failedLoginAttempts || 0) + 1;

      // Lock account after 5 failed attempts
      if (user.security.failedLoginAttempts >= 5) {
        user.security.accountLocked = true;
        user.security.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        await user.save();
        await logAttempt(false, 'account_locked');
        return res.status(423).json({
          message: 'Account locked due to multiple failed login attempts. Try again in 30 minutes.',
          locked: true
        });
      }

      await user.save();
      await logAttempt(false, 'invalid_credentials');
      return res.status(401).json({
        message: 'Invalid email or password',
        attemptsLeft: 5 - user.security.failedLoginAttempts
      });
    }

    // Check if 2FA is enabled
    if (user.twoFactorAuth?.enabled) {
      // Check if device is trusted
      const isTrusted = user.security?.trustedDevices?.some(
        d => d.deviceId === deviceInfo.deviceId
      );

      if (!isTrusted) {
        // Generate and send OTP
        const otp = generateOTP();
        await new OTPVerification({
          user: user._id,
          email: user.email,
          otp,
          type: '2fa_login',
          expiresAt: new Date(Date.now() + 15 * 60 * 1000)
        }).save();

        await sendOTPEmail(email, otp, '2fa_login');

        await logAttempt(false, '2fa_required');
        return res.status(200).json({
          message: '2FA code sent to your email',
          requires2FA: true,
          userId: user._id,
          method: user.twoFactorAuth.method
        });
      }
    }

    // Check for suspicious activity
    const suspicious = await isSuspiciousLogin(user, req);
    if (suspicious && !trustDevice) {
      const otp = generateOTP();
      await new OTPVerification({
        user: user._id,
        email: user.email,
        otp,
        type: '2fa_login',
        expiresAt: new Date(Date.now() + 15 * 60 * 1000)
      }).save();

      await sendOTPEmail(email, otp, '2fa_login');

      return res.status(200).json({
        message: 'Unusual activity detected. Verification code sent to your email.',
        requires2FA: true,
        userId: user._id,
        suspicious: true
      });
    }

    // Reset failed attempts
    user.security = user.security || {};
    user.security.failedLoginAttempts = 0;
    user.lastLogin = new Date();

    // Add trusted device if requested
    if (trustDevice) {
      user.security.trustedDevices = user.security.trustedDevices || [];
      const deviceExists = user.security.trustedDevices.find(
        d => d.deviceId === deviceInfo.deviceId
      );
      
      if (!deviceExists) {
        user.security.trustedDevices.push({
          deviceId: deviceInfo.deviceId,
          deviceName: deviceInfo.deviceName,
          lastUsed: new Date()
        });
      }
    }

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken();

    // Save refresh token
    await new RefreshToken({
      user: user._id,
      token: hashToken(refreshToken),
      deviceInfo,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }).save();

    await logAttempt(true, 'success');

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        twoFactorEnabled: user.twoFactorAuth?.enabled || false
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Verify 2FA code
exports.verify2FA = async (req, res) => {
  const { userId, otp, trustDevice = false } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const otpRecord = await OTPVerification.findOne({
      user: userId,
      otp,
      type: '2fa_login',
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      // Increment attempts
      await OTPVerification.updateOne(
        { user: userId, type: '2fa_login', verified: false },
        { $inc: { attempts: 1 } }
      );
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    // Check attempts
    if (otpRecord.attempts >= 5) {
      return res.status(429).json({ message: 'Too many attempts. Please login again.' });
    }

    // Mark as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Update user
    user.security = user.security || {};
    user.security.failedLoginAttempts = 0;
    user.lastLogin = new Date();

    const deviceInfo = getDeviceInfo(req);

    // Add trusted device if requested
    if (trustDevice) {
      user.security.trustedDevices = user.security.trustedDevices || [];
      user.security.trustedDevices.push({
        deviceId: deviceInfo.deviceId,
        deviceName: deviceInfo.deviceName,
        lastUsed: new Date()
      });
    }

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken();

    // Save refresh token
    await new RefreshToken({
      user: user._id,
      token: hashToken(refreshToken),
      deviceInfo,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }).save();

    // Log successful login
    await new LoginAttempt({
      email: user.email,
      ip: deviceInfo.ip,
      success: true,
      reason: 'success',
      deviceInfo: {
        browser: deviceInfo.browser,
        os: deviceInfo.os
      }
    }).save();

    res.json({
      message: '2FA verification successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified
      }
    });

  } catch (err) {
    console.error('2FA verification error:', err);
    res.status(500).json({ message: 'Server error during 2FA verification' });
  }
};

// Refresh access token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token required' });
    }

    const hashedToken = hashToken(refreshToken);
    const tokenRecord = await RefreshToken.findOne({
      token: hashedToken,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('user');

    if (!tokenRecord) {
      return res.status(401).json({ message: 'Invalid or expired refresh token' });
    }

    // Generate new access token
    const accessToken = generateAccessToken(tokenRecord.user._id);

    // Update last used
    tokenRecord.lastUsed = new Date();
    await tokenRecord.save();

    res.json({
      accessToken,
      user: {
        id: tokenRecord.user._id,
        name: tokenRecord.user.name,
        email: tokenRecord.user.email,
        role: tokenRecord.user.role
      }
    });

  } catch (err) {
    console.error('Refresh token error:', err);
    res.status(500).json({ message: 'Server error during token refresh' });
  }
};

// Logout (invalidate refresh token)
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;

  try {
    if (refreshToken) {
      const hashedToken = hashToken(refreshToken);
      await RefreshToken.updateOne(
        { token: hashedToken },
        { isActive: false }
      );
    }

    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

// Logout from all devices
exports.logoutAll = async (req, res) => {
  try {
    await RefreshToken.updateMany(
      { user: req.user.id, isActive: true },
      { isActive: false }
    );

    res.json({ message: 'Logged out from all devices successfully' });
  } catch (err) {
    console.error('Logout all error:', err);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

// Get active sessions
exports.getActiveSessions = async (req, res) => {
  try {
    const sessions = await RefreshToken.find({
      user: req.user.id,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).select('deviceInfo createdAt lastUsed').sort({ lastUsed: -1 });

    res.json({
      sessions: sessions.map(s => ({
        id: s._id,
        deviceName: s.deviceInfo?.deviceName || 'Unknown Device',
        browser: s.deviceInfo?.browser,
        os: s.deviceInfo?.os,
        ip: s.deviceInfo?.ip,
        location: s.deviceInfo?.location,
        createdAt: s.createdAt,
        lastUsed: s.lastUsed
      })),
      totalSessions: sessions.length
    });
  } catch (err) {
    console.error('Get sessions error:', err);
    res.status(500).json({ message: 'Server error fetching sessions' });
  }
};

// Revoke specific session
exports.revokeSession = async (req, res) => {
  const { sessionId } = req.params;

  try {
    const session = await RefreshToken.findOne({
      _id: sessionId,
      user: req.user.id
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    session.isActive = false;
    await session.save();

    res.json({ message: 'Session revoked successfully' });
  } catch (err) {
    console.error('Revoke session error:', err);
    res.status(500).json({ message: 'Server error revoking session' });
  }
};

// Enable 2FA
exports.enable2FA = async (req, res) => {
  const { method = 'email' } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (user.twoFactorAuth?.enabled) {
      return res.status(400).json({ message: '2FA is already enabled' });
    }

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 10).toUpperCase()
    );

    user.twoFactorAuth = {
      enabled: true,
      method,
      backupCodes
    };

    await user.save();

    res.json({
      message: '2FA enabled successfully',
      method,
      backupCodes,
      warning: 'Save these backup codes in a safe place. You will need them if you lose access to your authentication method.'
    });

  } catch (err) {
    console.error('Enable 2FA error:', err);
    res.status(500).json({ message: 'Server error enabling 2FA' });
  }
};

// Disable 2FA
exports.disable2FA = async (req, res) => {
  const { password } = req.body;

  try {
    const user = await User.findById(req.user.id);

    if (!user.twoFactorAuth?.enabled) {
      return res.status(400).json({ message: '2FA is not enabled' });
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    user.twoFactorAuth.enabled = false;
    user.twoFactorAuth.backupCodes = [];
    await user.save();

    res.json({ message: '2FA disabled successfully' });

  } catch (err) {
    console.error('Disable 2FA error:', err);
    res.status(500).json({ message: 'Server error disabling 2FA' });
  }
};

// Request password reset
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return res.json({
        message: 'If an account exists with this email, you will receive a password reset code.'
      });
    }

    // Generate OTP
    const otp = generateOTP();
    await new OTPVerification({
      user: user._id,
      email: user.email,
      otp,
      type: 'password_reset',
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    }).save();

    // Send email
    await sendOTPEmail(email, otp, 'password_reset');

    res.json({
      message: 'If an account exists with this email, you will receive a password reset code.'
    });

  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({ message: 'Server error processing request' });
  }
};

// Reset password with OTP
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const otpRecord = await OTPVerification.findOne({
      email,
      otp,
      type: 'password_reset',
      verified: false,
      expiresAt: { $gt: new Date() }
    });

    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    // Validate new password
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors
      });
    }

    // Update password
    const user = await User.findById(otpRecord.user);
    user.password = newPassword;
    user.security = user.security || {};
    user.security.passwordChangedAt = new Date();
    user.security.failedLoginAttempts = 0;
    user.security.accountLocked = false;
    await user.save();

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Invalidate all refresh tokens for security
    await RefreshToken.updateMany(
      { user: user._id },
      { isActive: false }
    );

    res.json({ message: 'Password reset successfully. Please login with your new password.' });

  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ message: 'Server error resetting password' });
  }
};

// Change password (authenticated)
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Validate new password
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        message: 'Password does not meet security requirements',
        errors: passwordValidation.errors
      });
    }

    // Update password
    user.password = newPassword;
    user.security = user.security || {};
    user.security.passwordChangedAt = new Date();
    await user.save();

    res.json({ message: 'Password changed successfully' });

  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ message: 'Server error changing password' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -twoFactorAuth.secret -twoFactorAuth.backupCodes -security.passwordResetToken');
    res.json(user);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error fetching profile' });
  }
};

// Update profile
exports.updateProfile = async (req, res) => {
  const updates = req.body;
  
  try {
    // Don't allow updating sensitive fields
    delete updates.password;
    delete updates.email;
    delete updates.role;
    delete updates.twoFactorAuth;
    delete updates.security;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user
    });

  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Server error updating profile' });
  }
};

// Google OAuth - Enhanced with new token system
exports.googleAuth = (req, res, next) => {
  const passport = require('passport');
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
};

exports.googleCallback = async (req, res, next) => {
  const passport = require('passport');
  const { generateAccessToken, generateRefreshToken, hashToken, getDeviceInfo } = require('../utils/authHelpers');
  const RefreshToken = require('../models/RefreshToken');
  
  passport.authenticate('google', { session: false }, async (err, user, info) => {
    if (err || !user) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=google_auth_failed`);
    }

    try {
      // Mark user as verified since Google verified their email
      if (!user.isVerified) {
        user.isVerified = true;
        await user.save();
      }

      // Generate tokens
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken();
      const deviceInfo = getDeviceInfo(req);

      // Save refresh token
      await new RefreshToken({
        user: user._id,
        token: hashToken(refreshToken),
        deviceInfo,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }).save();

      // Redirect to frontend with tokens
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}&userId=${user._id}`;
      res.redirect(redirectUrl);
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=auth_failed`);
    }
  })(req, res, next);
};
