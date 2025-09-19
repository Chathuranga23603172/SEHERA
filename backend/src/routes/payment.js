const express = require('express'); 
const router = express.Router(); 
const { body, param, query } = require('express-validator'); 
const paymentController = require('../controllers/paymentController'); 
const auth = require('../middleware/auth'); 
 
// @route   POST /api/payment/create-payment-intent 
// @desc    Create Stripe payment intent for purchase 
// @access  Private 
router.post( 
  '/create-payment-intent', 
  [ 
    auth, 
    body('amount') 
      .isFloat({ min: 0.50 }) 
      .withMessage('Amount must be at least $0.50'), 
    body('currency') 
      .optional() 
      .isIn(['usd', 'eur', 'gbp', 'cad', 'aud']) 
      .withMessage('Invalid currency'), 
    body('items') 
      .isArray({ min: 1, max: 50 }) 
      .withMessage('Items array must contain 1-50 items'), 
    body('items.*.itemId') 
      .isMongoId() 
      .withMessage('Each item must have valid ID'), 
    body('items.*.itemType') 
      .isIn(['menswear', 'womenswear', 'kidswear']) 
      .withMessage('Invalid item type'), 
    body('items.*.quantity') 
      .optional() 
      .isInt({ min: 1, max: 10 }) 
      .withMessage('Quantity must be between 1 and 10'), 
    body('items.*.price') 
      .isFloat({ min: 0 }) 
      .withMessage('Price must be positive'), 
    body('shippingAddress') 
      .optional() 
      .isObject() 
      .withMessage('Shipping address must be an object'), 
    body('discountCode') 
      .optional() 
      .trim() 
      .isLength({ min: 3, max: 20 }) 
      .withMessage('Discount code must be between 3 and 20 characters'), 
    body('savePaymentMethod') 
      .optional() 
      .isBoolean() 
      .withMessage('Save payment method must be boolean') 
  ], 
  paymentController.createPaymentIntent 
); 
 
// @route   POST /api/payment/confirm-payment 
// @desc    Confirm payment and complete purchase 
// @access  Private 
router.post( 
  '/confirm-payment', 
  [ 
    auth, 
    body('paymentIntentId') 
      .notEmpty() 
      .withMessage('Payment intent ID is required'), 
    body('items') 
      .isArray({ min: 1 }) 
      .withMessage('Items array is required'), 
    body('shippingAddress') 
      .optional() 
      .isObject() 
      .withMessage('Shipping address must be an object'), 
    body('billingAddress') 
      .optional() 
      .isObject() 
      .withMessage('Billing address must be an object') 
  ], 
  paymentController.confirmPayment 
); 
 
// @route   GET /api/payment/methods 
// @desc    Get user's saved payment methods 
// @access  Private 
router.get('/methods', auth, paymentController.getPaymentMethods); 
// @route   POST /api/payment/methods 
// @desc    Add new payment method 
// @access  Private 
router.post( 
'/methods', 
[ 
auth, 
body('paymentMethodId') 
.notEmpty() 
.withMessage('Payment method ID is required'), 
body('isDefault') 
.optional() 
.isBoolean() 
.withMessage('isDefault must be boolean'), 
body('nickname') 
.optional() 
.trim() 
.isLength({ max: 50 }) 
.withMessage('Nickname must be max 50 characters') 
], 
paymentController.addPaymentMethod 
); 
// @route   DELETE /api/payment/methods/:id 
// @desc    Remove payment method 
// @access  Private 
router.delete( 
'/methods/:id', 
[ 
auth, 
param('id') 
.notEmpty() 
.withMessage('Payment method ID is required') 
], 
paymentController.removePaymentMethod 
); 
 
// @route   PUT /api/payment/methods/:id/default 
// @desc    Set payment method as default 
// @access  Private 
router.put( 
  '/methods/:id/default', 
  [ 
    auth, 
    param('id') 
      .notEmpty() 
      .withMessage('Payment method ID is required') 
  ], 
  paymentController.setDefaultPaymentMethod 
); 
 
// @route   GET /api/payment/history 
// @desc    Get payment history 
// @access  Private 
router.get( 
  '/history', 
  [ 
    auth, 
    query('page') 
      .optional() 
      .isInt({ min: 1 }) 
      .withMessage('Page must be positive integer'), 
    query('limit') 
      .optional() 
      .isInt({ min: 1, max: 100 }) 
      .withMessage('Limit must be between 1 and 100'), 
    query('startDate') 
      .optional() 
      .isISO8601() 
      .withMessage('Invalid start date format'), 
    query('endDate') 
      .optional() 
      .isISO8601() 
      .withMessage('Invalid end date format'), 
    query('status') 
      .optional() 
      .isIn(['pending', 'completed', 'failed', 'refunded']) 
      .withMessage('Invalid status'), 
    query('minAmount') 
      .optional() 
      .isFloat({ min: 0 }) 
      .withMessage('Min amount must be positive'), 
    query('maxAmount') 
      .optional() 
      .isFloat({ min: 0 }) 
      .withMessage('Max amount must be positive') 
  ], 
  paymentController.getPaymentHistory 
); 
 
// @route   GET /api/payment/history/:id 
// @desc    Get specific payment details 
// @access  Private 
router.get( 
  '/history/:id', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid payment ID') 
  ], 
  paymentController.getPaymentDetails 
); 
 
// @route   POST /api/payment/refund 
// @desc    Request refund for payment 
// @access  Private 
router.post( 
  '/refund', 
  [ 
    auth, 
    body('paymentId') 
      .isMongoId() 
      .withMessage('Valid payment ID required'), 
    body('amount') 
      .optional() 
      .isFloat({ min: 0.50 }) 
      .withMessage('Refund amount must be at least $0.50'), 
    body('reason') 
      .isIn(['duplicate', 'fraudulent', 'requested_by_customer', 'defective_product']) 
      .withMessage('Invalid refund reason'), 
    body('description') 
      .optional() 
      .trim() 
      .isLength({ max: 500 }) 
      .withMessage('Description must be max 500 characters') 
  ], 
  paymentController.requestRefund 
); 
 
// @route   GET /api/payment/refunds 
// @desc    Get refund history 
// @access  Private 
router.get('/refunds', auth, paymentController.getRefundHistory); 
 
// @route   POST /api/payment/discount/apply 
// @desc    Apply discount code to cart 
// @access  Private 
router.post( 
  '/discount/apply', 
  [ 
    auth, 
    body('discountCode') 
      .trim() 
      .isLength({ min: 3, max: 20 }) 
      .withMessage('Discount code must be between 3 and 20 characters'), 
    body('cartItems') 
      .isArray({ min: 1 }) 
      .withMessage('Cart items array is required'), 
    body('cartItems.*.itemId') 
      .isMongoId() 
      .withMessage('Each item must have valid ID'), 
    body('cartItems.*.price') 
      .isFloat({ min: 0 }) 
      .withMessage('Price must be positive') 
  ], 
  paymentController.applyDiscount 
); 
 
// @route   POST /api/payment/discount/validate 
// @desc    Validate discount code 
// @access  Private 
router.post( 
  '/discount/validate', 
  [ 
    auth, 
    body('discountCode') 
      .trim() 
      .isLength({ min: 3, max: 20 }) 
      .withMessage('Discount code must be between 3 and 20 characters'), 
    body('totalAmount') 
      .optional() 
      .isFloat({ min: 0 }) 
      .withMessage('Total amount must be positive') 
  ], 
  paymentController.validateDiscountCode 
); 
 
// @route   GET /api/payment/invoices 
// @desc    Get user invoices 
// @access  Private 
router.get( 
  '/invoices', 
  [ 
    auth, 
    query('page') 
      .optional() 
      .isInt({ min: 1 }) 
      .withMessage('Page must be positive integer'), 
    query('limit') 
      .optional() 
      .isInt({ min: 1, max: 50 }) 
      .withMessage('Limit must be between 1 and 50'), 
    query('status') 
      .optional() 
      .isIn(['draft', 'open', 'paid', 'uncollectible', 'void']) 
      .withMessage('Invalid invoice status') 
  ], 
  paymentController.getInvoices 
); 
 
// @route   GET /api/payment/invoices/:id/download 
// @desc    Download invoice as PDF 
// @access  Private 
router.get( 
  '/invoices/:id/download', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid invoice ID') 
  ], 
  paymentController.downloadInvoice 
); 
 
// @route   POST /api/payment/subscription 
// @desc    Create subscription for premium features 
// @access  Private 
router.post( 
  '/subscription', 
  [ 
    auth, 
    body('planId') 
      .isIn(['basic', 'premium', 'pro']) 
      .withMessage('Invalid subscription plan'), 
body('paymentMethodId') 
.notEmpty() 
.withMessage('Payment method ID is required'), 
body('billingCycle') 
.optional() 
.isIn(['monthly', 'yearly']) 
.withMessage('Invalid billing cycle') 
], 
paymentController.createSubscription 
); 
// @route   GET /api/payment/subscription 
// @desc    Get user's subscription details 
// @access  Private 
router.get('/subscription', auth, paymentController.getSubscription); 
// @route   PUT /api/payment/subscription 
// @desc    Update subscription 
// @access  Private 
router.put( 
'/subscription', 
[ 
auth, 
body('planId') 
.optional() 
.isIn(['basic', 'premium', 'pro']) 
.withMessage('Invalid subscription plan'), 
body('billingCycle') 
.optional() 
.isIn(['monthly', 'yearly']) 
.withMessage('Invalid billing cycle') 
], 
paymentController.updateSubscription 
); 
// @route   DELETE /api/payment/subscription 
// @desc    Cancel subscription 
// @access  Private 
router.delete( 
  '/subscription', 
  [ 
    auth, 
    body('reason') 
      .optional() 
      .trim() 
      .isLength({ max: 500 }) 
      .withMessage('Cancellation reason must be max 500 characters'), 
    body('feedback') 
      .optional() 
      .trim() 
      .isLength({ max: 1000 }) 
      .withMessage('Feedback must be max 1000 characters') 
  ], 
  paymentController.cancelSubscription 
); 
 
// @route   POST /api/payment/webhook 
// @desc    Handle Stripe webhooks 
// @access  Public (with Stripe signature verification) 
router.post('/webhook', paymentController.handleStripeWebhook); 
 
// @route   GET /api/payment/analytics/spending 
// @desc    Get payment analytics and spending insights 
// @access  Private 
router.get( 
  '/analytics/spending', 
  [ 
    auth, 
    query('period') 
      .optional() 
      .isIn(['week', 'month', 'quarter', 'year']) 
      .withMessage('Invalid period'), 
    query('groupBy') 
      .optional() 
      .isIn(['day', 'week', 'month', 'category']) 
      .withMessage('Invalid groupBy parameter') 
  ], 
  paymentController.getSpendingAnalytics 
); 
 
// @route   POST /api/payment/split-payment 
// @desc    Create split payment for group purchases 
// @access  Private 
router.post( 
  '/split-payment', 
  [ 
    auth, 
    body('totalAmount') 
      .isFloat({ min: 1.00 }) 
      .withMessage('Total amount must be at least $1.00'), 
    body('participants') 
      .isArray({ min: 2, max: 10 }) 
      .withMessage('Must have 2-10 participants'), 
    body('participants.*.email') 
      .isEmail() 
      .withMessage('Each participant must have valid email'), 
    body('participants.*.amount') 
      .isFloat({ min: 0.50 }) 
      .withMessage('Each participant amount must be at least $0.50'), 
    body('participants.*.name') 
      .trim() 
      .isLength({ min: 1, max: 100 }) 
      .withMessage('Each participant must have a name'), 
    body('description') 
      .optional() 
      .trim() 
      .isLength({ max: 200 }) 
      .withMessage('Description must be max 200 characters') 
  ], 
  paymentController.createSplitPayment 
); 
 
// @route   GET /api/payment/split-payment/:id 
// @desc    Get split payment details 
// @access  Private 
router.get( 
  '/split-payment/:id', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid split payment ID') 
  ], 
  paymentController.getSplitPaymentDetails 
); 
 
// @route   POST /api/payment/budget-alert 
// @desc    Set up payment budget alerts 
// @access  Private 
router.post( 
  '/budget-alert', 
  [ 
    auth, 
    body('monthlyLimit') 
      .isFloat({ min: 0 }) 
      .withMessage('Monthly limit must be positive'), 
    body('alertThreshold') 
      .isFloat({ min: 0, max: 100 }) 
      .withMessage('Alert threshold must be between 0 and 100 percent'), 
    body('categories') 
      .optional() 
      .isArray() 
      .withMessage('Categories must be an array'), 
    body('notificationMethod') 
      .optional() 
      .isIn(['email', 'sms', 'push']) 
      .withMessage('Invalid notification method') 
  ], 
  paymentController.setBudgetAlert 
); 
 
module.exports = router;