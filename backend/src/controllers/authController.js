const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const { validationResult } = require('express-validator'); 
const User = require('../models/User'); 
// Generate JWT Token 
const generateToken = (userId) => { 
return jwt.sign({ userId }, process.env.JWT_SECRET, { 
expiresIn: process.env.JWT_EXPIRE || '30d' 
}); 
}; 
// @desc    Register user 
// @route   POST /api/auth/register 
// @access  Public 
const register = async (req, res) => { 
try { 
const errors = validationResult(req); 
if (!errors.isEmpty()) { 
return res.status(400).json({ 
success: false, 
message: 'Validation errors', 
errors: errors.array() 
}); 
} 
 
    const { name, email, password } = req.body; 
 
    // Check if user already exists 
    const existingUser = await User.findOne({ email }); 
    if (existingUser) { 
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      }); 
    } 
 
    // Hash password 
    const saltRounds = 12; 
    const hashedPassword = await bcrypt.hash(password, saltRounds); 
 
    // Create user 
    const user = new User({ 
      name, 
      email, 
      password: hashedPassword 
    }); 
 
    await user.save(); 
 
    // Generate token 
    const token = generateToken(user._id); 
 
    res.status(201).json({ 
      success: true, 
      message: 'User registered successfully', 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        createdAt: user.createdAt 
      } 
    }); 
 
  } catch (error) { 
    console.error('Register error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Login user 
// @route   POST /api/auth/login 
// @access  Public 
const login = async (req, res) => { 
  try { 
    const errors = validationResult(req); 
    if (!errors.isEmpty()) { 
      return res.status(400).json({ 
        success: false, 
        message: 'Validation errors', 
        errors: errors.array() 
      }); 
    } 
 
    const { email, password } = req.body; 
 
    // Find user by email 
    const user = await User.findOne({ email }).select('+password'); 
    if (!user) { 
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      }); 
    } 
 
    // Check password 
    const isPasswordValid = await bcrypt.compare(password, user.password); 
    if (!isPasswordValid) { 
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      }); 
    } 
 
    // Update last login 
    user.lastLogin = new Date(); 
    await user.save(); 
 
    // Generate token 
    const token = generateToken(user._id); 
 
    res.status(200).json({ 
      success: true, 
      message: 'Login successful', 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        lastLogin: user.lastLogin 
      } 
    }); 
 
  } catch (error) { 
    console.error('Login error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Get current user 
// @route   GET /api/auth/me 
// @access  Private 
const getMe = async (req, res) => { 
  try { 
    const user = await User.findById(req.user.userId); 
    if (!user) { 
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      }); 
    } 
 
    res.status(200).json({ 
      success: true, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        profile: user.profile, 
        preferences: user.preferences, 
        createdAt: user.createdAt, 
        lastLogin: user.lastLogin 
      } 
    }); 
 
  } catch (error) { 
    console.error('Get user error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Update user profile 
// @route   PUT /api/auth/profile 
// @access  Private 
const updateProfile = async (req, res) => { 
  try { 
    const errors = validationResult(req); 
    if (!errors.isEmpty()) { 
      return res.status(400).json({ 
        success: false, 
        message: 'Validation errors', 
        errors: errors.array() 
      }); 
    } 
 
    const { name, profile, preferences } = req.body; 
    const userId = req.user.userId; 
 
    const user = await User.findById(userId); 
    if (!user) { 
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      }); 
    } 
 
    // Update fields 
    if (name) user.name = name; 
    if (profile) user.profile = { ...user.profile, ...profile }; 
    if (preferences) user.preferences = { ...user.preferences, ...preferences }; 
 
    await user.save(); 
 
    res.status(200).json({ 
      success: true, 
      message: 'Profile updated successfully', 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        profile: user.profile, 
        preferences: user.preferences 
      } 
    }); 
 
  } catch (error) { 
    console.error('Update profile error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Change password 
// @route   PUT /api/auth/change-password 
// @access  Private 
const changePassword = async (req, res) => { 
  try { 
    const errors = validationResult(req); 
    if (!errors.isEmpty()) { 
      return res.status(400).json({ 
        success: false, 
        message: 'Validation errors', 
        errors: errors.array() 
      }); 
    } 
 
    const { currentPassword, newPassword } = req.body; 
    const userId = req.user.userId; 
 
    const user = await User.findById(userId).select('+password'); 
    if (!user) { 
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      }); 
    } 
 
    // Verify current password 
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, 
user.password); 
    if (!isCurrentPasswordValid) { 
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      }); 
    } 
 
// Hash new password 
const saltRounds = 12; 
const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds); 
user.password = hashedNewPassword; 
await user.save(); 
res.status(200).json({ 
success: true, 
message: 'Password changed successfully' 
}); 
} catch (error) { 
console.error('Change password error:', error); 
res.status(500).json({ 
success: false, 
message: 'Internal server error' 
}); 
} 
}; 
// @desc    Logout user 
// @route   POST /api/auth/logout 
// @access  Private 
const logout = async (req, res) => { 
try { 
// In a JWT-based auth system, logout is typically handled client-side 
// by removing the token from storage. Here we can log the logout event. 
res.status(200).json({ 
success: true, 
message: 'Logout successful' 
}); 
} catch (error) { 
console.error('Logout error:', error); 
res.status(500).json({ 
success: false, 
message: 'Internal server error' 
}); 
} 
}; 
module.exports = { 
register, 
login, 
getMe, 
updateProfile, 
changePassword, 
logout 
};