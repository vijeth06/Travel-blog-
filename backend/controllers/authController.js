const User = require('../models/User');
const jwt = require('jsonwebtoken');
const passport = require('passport');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register with OTP verification
exports.register = async (req, res) => {
  const { name, email, password, phone, country, city, role, providerInfo } = req.body;
  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    // Validate package provider registration
    if (role === 'package_provider') {
      if (!providerInfo || !providerInfo.companyName || !providerInfo.businessLicense) {
        return res.status(400).json({ 
          msg: 'Package providers must provide company name and business license' 
        });
      }

      // Create package provider account
      user = new User({
        name,
        email,
        password,
        phone,
        country,
        city,
        role: 'package_provider',
        providerInfo: {
          companyName: providerInfo.companyName,
          businessLicense: providerInfo.businessLicense,
          description: providerInfo.description || '',
          contactNumber: providerInfo.contactNumber || phone,
          address: providerInfo.address || '',
          website: providerInfo.website || '',
          verified: false,  // Requires admin verification
          rating: 0,
          totalPackages: 0
        }
      });

      await user.save();

      const token = generateToken(user._id);
      return res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          country: user.country,
          city: user.city,
          providerInfo: user.providerInfo
        },
        message: 'Package provider account created successfully. Awaiting admin verification to create packages.'
      });
    }

    // Regular user registration (visitor/author)
    const allowedRoles = ['visitor', 'author'];
    const userRole = role && allowedRoles.includes(role) ? role : 'visitor';

    user = new User({
      name,
      email,
      password,
      phone,
      country,
      city,
      role: userRole
    });
    await user.save();

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        country: user.country,
        city: user.city
      },
      message: `Account created successfully as ${userRole}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    if (!user.isActive) return res.status(400).json({ msg: 'Account is deactivated' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    
    // Base user info
    const userInfo = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      country: user.country,
      city: user.city,
      avatar: user.avatar,
      isVerified: user.isVerified
    };

    // Add provider info if package provider
    if (user.role === 'package_provider') {
      userInfo.providerInfo = user.providerInfo;
      
      // Check verification status
      if (!user.providerInfo?.verified) {
        return res.json({
          token,
          user: userInfo,
          warning: 'Your package provider account is pending admin verification. You cannot create packages yet.'
        });
      }
    }

    res.json({
      token,
      user: userInfo,
      message: `Welcome back, ${user.name}!`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.logout = async (req, res) => {
  try {
    // For JWT, we just send success response
    // Token invalidation would be handled on frontend
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Google OAuth routes
exports.googleAuth = (req, res, next) => {
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res, next);
};

exports.googleCallback = (req, res, next) => {
  // Determine frontend URL dynamically
  const getFrontendUrl = () => {
    if (process.env.FRONTEND_URL) {
      return process.env.FRONTEND_URL;
    }
    // Check if request is from Render production
    const host = req.get('host');
    if (host && host.includes('onrender.com')) {
      return `https://${host}`;
    }
    return 'http://localhost:3000';
  };
  
  const frontendURL = getFrontendUrl();
  
  passport.authenticate('google', { session: false }, async (err, user) => {
    try {
      if (err || !user) {
        return res.redirect(`${frontendURL}/auth/error`);
      }

      const token = generateToken(user._id);

      // Redirect to frontend with token
      res.redirect(`${frontendURL}/auth/success?token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      res.redirect(`${frontendURL}/auth/error`);
    }
  })(req, res, next);
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    console.log('Updating profile for user:', req.user.id);
    console.log('Update data:', req.body);
    
    const { name, bio, website, phone, country, city, travelPreferences, avatar } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Current user data:', {
      name: user.name,
      bio: user.bio,
      website: user.website,
      phone: user.phone,
      country: user.country,
      city: user.city
    });

    // Update fields (allow empty strings to clear fields)
    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (website !== undefined) user.website = website;
    if (phone !== undefined) user.phone = phone;
    if (country !== undefined) user.country = country;
    if (city !== undefined) user.city = city;
    if (avatar !== undefined) user.avatar = avatar;
    if (travelPreferences) {
      user.travelPreferences = { ...user.travelPreferences, ...travelPreferences };
    }

    user.updatedAt = new Date();
    await user.save();

    console.log('Profile updated successfully');

    const updatedUser = await User.findById(req.user.id).select('-password');
    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has a password (not Google OAuth user)
    if (!user.password) {
      return res.status(400).json({ message: 'Cannot change password for social login accounts' });
    }

    // Verify current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Change user role (Admin only)
exports.changeUserRole = async (req, res) => {
  try {
    const { userId, role } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    res.json({ message: 'User role updated successfully', user: { id: user._id, name: user.name, role: user.role } });
  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
