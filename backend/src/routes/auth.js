const express = require('express'); 
const router = express.Router(); 
const { body } = require('express-validator'); 
const authController = require('../controllers/authController'); 
const auth = require('../middleware/auth'); 
 
// @route   POST /api/auth/register 
// @desc    Register user 
// @access  Public 
router.post( 
  '/register', 
  [ 
    body('name') 
      .trim() 
      .isLength({ min: 2, max: 50 }) 
      .withMessage('Name must be between 2 and 50 characters'), 
    body('email') 
      .isEmail() 
      .normalizeEmail() 
      .withMessage('Please enter a valid email'), 
    body('password') 
      .isLength({ min: 6 }) 
      .withMessage('Password must be at least 6 characters'), 
    body('phone') 
      .isMobilePhone() 
      .withMessage('Please enter a valid phone number') 
  ], 
  authController.register 
); 
 
// @route   POST /api/auth/login 
// @desc    Login user 
// @access  Public 
router.post( 
  '/login', 
  [ 
    body('email') 
      .isEmail() 
      .normalizeEmail() 
      .withMessage('Please enter a valid email'), 
    body('password') 
      .exists() 
      .withMessage('Password is required') 
], 
authController.login 
); 
// @route   POST /api/auth/forgot-password 
// @desc    Send password reset email 
// @access  Public 
router.post( 
'/forgot-password', 
[ 
body('email') 
.isEmail() 
.normalizeEmail() 
.withMessage('Please enter a valid email') 
], 
authController.forgotPassword 
); 
// @route   POST /api/auth/reset-password 
// @desc    Reset password with token 
// @access  Public 
router.post( 
'/reset-password', 
[ 
body('token') 
.notEmpty() 
.withMessage('Reset token is required'), 
body('password') 
.isLength({ min: 6 }) 
.withMessage('Password must be at least 6 characters') 
], 
authController.resetPassword 
); 
// @route   GET /api/auth/profile 
// @desc    Get user profile 
// @access  Private 
router.get('/profile', auth, authController.getProfile); 
 
// @route   PUT /api/auth/profile 
// @desc    Update user profile 
// @access  Private 
router.put( 
  '/profile', 
  [ 
    auth, 
    body('name') 
      .optional() 
      .trim() 
      .isLength({ min: 2, max: 50 }) 
      .withMessage('Name must be between 2 and 50 characters'), 
    body('phone') 
      .optional() 
      .isMobilePhone() 
      .withMessage('Please enter a valid phone number') 
  ], 
  authController.updateProfile 
); 
 
// @route   POST /api/auth/change-password 
// @desc    Change user password 
// @access  Private 
router.post( 
  '/change-password', 
  [ 
    auth, 
    body('currentPassword') 
      .notEmpty() 
      .withMessage('Current password is required'), 
    body('newPassword') 
      .isLength({ min: 6 }) 
      .withMessage('New password must be at least 6 characters') 
  ], 
  authController.changePassword 
); 
 
// @route   POST /api/auth/logout 
// @desc    Logout user 
// @access  Private 
router.post('/logout', auth, authController.logout); 
// @route   GET /api/auth/verify-token 
// @desc    Verify JWT token 
// @access  Private 
router.get('/verify-token', auth, authController.verifyToken); 
module.exports = router;