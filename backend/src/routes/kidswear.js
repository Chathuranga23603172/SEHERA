const express = require('express'); 
const router = express.Router(); 
const { body, param, query } = require('express-validator'); 
const kidswearController = require('../controllers/kidswearController'); 
const auth = require('../middleware/auth'); 
const upload = require('../middleware/upload'); 
 
// @route   GET /api/kidswear 
// @desc    Get all kidswear items for user 
// @access  Private 
router.get( 
  '/', 
  [ 
    auth, 
    query('page') 
      .optional() 
      .isInt({ min: 1 }) 
      .withMessage('Page must be a positive integer'), 
    query('limit') 
      .optional() 
      .isInt({ min: 1, max: 100 }) 
      .withMessage('Limit must be between 1 and 100'), 
    query('category') 
      .optional() 
      .isIn(['uniforms', 'playwear', 'shoes', 'accessories', 'outerwear', 'underwear', 'sleepwear']) 
      .withMessage('Invalid category'), 
    query('ageGroup') 
      .optional() 
      .isIn(['baby', 'toddler', 'kids', 'teens']) 
      .withMessage('Invalid age group'), 
    query('growthStage') 
      .optional() 
      .isIn(['0-36months', '2-12years', '13-16years']) 
      .withMessage('Invalid growth stage'), 
    query('brand') 
      .optional() 
      .trim() 
      .isLength({ max: 50 }) 
      .withMessage('Brand name too long'), 
    query('durability') 
      .optional() 
      .isIn(['low', 'medium', 'high']) 
      .withMessage('Invalid durability rating') 
  ], 
  kidswearController.getKidswearItems 
); 
 
// @route   GET /api/kidswear/:id 
// @desc    Get specific kidswear item 
// @access  Private 
router.get( 
  '/:id', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid item ID') 
  ], 
  kidswearController.getKidswearItem 
); 
 
// @route   POST /api/kidswear 
// @desc    Create new kidswear item 
// @access  Private 
router.post( 
  '/', 
  [ 
    auth, 
    upload.single('image'), 
    body('name') 
      .trim() 
      .isLength({ min: 1, max: 100 }) 
      .withMessage('Name must be between 1 and 100 characters'), 
    body('type') 
      .trim() 
      .isLength({ min: 1, max: 50 }) 
      .withMessage('Type is required and must be max 50 characters'), 
    body('brand') 
      .trim() 
      .isLength({ min: 1, max: 50 }) 
      .withMessage('Brand is required and must be max 50 characters'), 
    body('price') 
      .isNumeric() 
      .isFloat({ min: 0 }) 
      .withMessage('Price must be a positive number'), 
    body('size') 
      .trim() 
      .isLength({ min: 1, max: 20 }) 
      .withMessage('Size is required'), 
    body('color') 
      .trim() 
      .isLength({ min: 1, max: 30 }) 
      .withMessage('Color is required'), 
    body('category') 
      .isIn(['uniforms', 'playwear', 'shoes', 'accessories', 'outerwear', 'underwear', 'sleepwear']) 
      .withMessage('Invalid category'), 
    body('ageGroup') 
      .isIn(['baby', 'toddler', 'kids', 'teens']) 
      .withMessage('Invalid age group'), 
    body('growthStage') 
      .isIn(['0-36months', '2-12years', '13-16years']) 
      .withMessage('Invalid growth stage'), 
    body('durability') 
      .optional() 
      .isIn(['low', 'medium', 'high']) 
      .withMessage('Invalid durability rating'), 
    body('discount') 
      .optional() 
      .isFloat({ min: 0, max: 100 }) 
      .withMessage('Discount must be between 0 and 100'), 
    body('childAge') 
      .optional() 
      .isInt({ min: 0, max: 18 }) 
      .withMessage('Child age must be between 0 and 18'), 
    body('childName') 
      .optional() 
      .trim() 
      .isLength({ max: 50 }) 
      .withMessage('Child name must be max 50 characters') 
  ], 
  kidswearController.createKidswearItem 
); 
 
// @route   PUT /api/kidswear/:id 
// @desc    Update kidswear item 
// @access  Private 
router.put( 
  '/:id', 
  [ 
    auth, 
    upload.single('image'), 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid item ID'), 
    body('name') 
      .optional() 
      .trim() 
      .isLength({ min: 1, max: 100 }) 
      .withMessage('Name must be between 1 and 100 characters'), 
    body('type') 
      .optional() 
      .trim() 
      .isLength({ min: 1, max: 50 }) 
      .withMessage('Type must be max 50 characters'), 
    body('brand') 
      .optional() 
      .trim() 
      .isLength({ min: 1, max: 50 }) 
      .withMessage('Brand must be max 50 characters'), 
    body('price') 
      .optional() 
      .isNumeric() 
      .isFloat({ min: 0 }) 
      .withMessage('Price must be a positive number'), 
    body('size') 
      .optional() 
      .trim() 
      .isLength({ min: 1, max: 20 }) 
      .withMessage('Size is required'), 
    body('color') 
      .optional() 
      .trim() 
      .isLength({ min: 1, max: 30 }) 
      .withMessage('Color is required'), 
    body('category') 
      .optional() 
      .isIn(['uniforms', 'playwear', 'shoes', 'accessories', 'outerwear', 'underwear', 'sleepwear']) 
      .withMessage('Invalid category'), 
    body('ageGroup') 
      .optional() 
      .isIn(['baby', 'toddler', 'kids', 'teens']) 
      .withMessage('Invalid age group'), 
    body('growthStage') 
      .optional() 
      .isIn(['0-36months', '2-12years', '13-16years']) 
      .withMessage('Invalid growth stage'), 
    body('durability') 
      .optional() 
      .isIn(['low', 'medium', 'high']) 
      .withMessage('Invalid durability rating'), 
    body('discount') 
      .optional() 
      .isFloat({ min: 0, max: 100 }) 
      .withMessage('Discount must be between 0 and 100'), 
    body('childAge') 
      .optional() 
      .isInt({ min: 0, max: 18 }) 
      .withMessage('Child age must be between 0 and 18'), 
    body('childName') 
      .optional() 
      .trim() 
      .isLength({ max: 50 }) 
      .withMessage('Child name must be max 50 characters') 
  ], 
  kidswearController.updateKidswearItem 
); 
 
// @route   DELETE /api/kidswear/:id 
// @desc    Delete kidswear item 
// @access  Private 
router.delete( 
  '/:id', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid item ID') 
  ], 
  kidswearController.deleteKidswearItem 
); 
 
// @route   POST /api/kidswear/:id/cart 
// @desc    Add item to cart 
// @access  Private 
router.post( 
  '/:id/cart', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid item ID'), 
    body('quantity') 
      .optional() 
      .isInt({ min: 1, max: 10 }) 
      .withMessage('Quantity must be between 1 and 10'), 
body('size') 
.optional() 
.trim() 
.isLength({ min: 1, max: 20 }) 
.withMessage('Size must be specified'), 
body('notes') 
.optional() 
.trim() 
.isLength({ max: 200 }) 
.withMessage('Notes must be max 200 characters') 
], 
kidswearController.addToCart 
); 
// @route   DELETE /api/kidswear/:id/cart 
// @desc    Remove item from cart 
// @access  Private 
router.delete( 
'/:id/cart', 
[ 
auth, 
param('id') 
.isMongoId() 
.withMessage('Invalid item ID') 
], 
kidswearController.removeFromCart 
); 
// @route   GET /api/kidswear/cart 
// @desc    Get cart items 
// @access  Private 
router.get('/cart', auth, kidswearController.getCartItems); 
// @route   GET /api/kidswear/cart/total 
// @desc    Get cart total cost 
// @access  Private 
router.get('/cart/total', auth, kidswearController.getCartTotal); 
// @route   POST /api/kidswear/:id/growth-notes 
// @desc    Add growth stage notes 
// @access  Private 
router.post( 
  '/:id/growth-notes', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid item ID'), 
    body('notes') 
      .trim() 
      .isLength({ min: 1, max: 500 }) 
      .withMessage('Notes must be between 1 and 500 characters'), 
    body('fitRating') 
      .optional() 
      .isIn(['too-small', 'perfect', 'too-large']) 
      .withMessage('Fit rating must be too-small, perfect, or too-large'), 
    body('durabilityNotes') 
      .optional() 
      .trim() 
      .isLength({ max: 300 }) 
      .withMessage('Durability notes must be max 300 characters'), 
    body('growthPrediction') 
      .optional() 
      .isIn(['outgrow-soon', 'fits-well', 'room-to-grow']) 
      .withMessage('Invalid growth prediction') 
  ], 
  kidswearController.addGrowthNotes 
); 
 
// @route   GET /api/kidswear/size-alerts 
// @desc    Get size upgrade alerts 
// @access  Private 
router.get('/size-alerts', auth, kidswearController.getSizeAlerts); 
 
// @route   POST /api/kidswear/size-alerts/:id/dismiss 
// @desc    Dismiss size alert 
// @access  Private 
router.post( 
  '/size-alerts/:id/dismiss', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid alert ID') 
  ], 
  kidswearController.dismissSizeAlert 
); 
 
// @route   GET /api/kidswear/growth-tracker 
// @desc    Get growth tracking data for child 
// @access  Private 
router.get( 
  '/growth-tracker', 
  [ 
    auth, 
    query('childName') 
      .optional() 
      .trim() 
      .isLength({ max: 50 }) 
      .withMessage('Child name must be max 50 characters'), 
    query('startDate') 
      .optional() 
      .isISO8601() 
      .withMessage('Invalid start date format'), 
    query('endDate') 
      .optional() 
      .isISO8601() 
      .withMessage('Invalid end date format') 
  ], 
  kidswearController.getGrowthTracker 
); 
 
// @route   POST /api/kidswear/discount-calculation 
// @desc    Apply automatic discount calculation 
// @access  Private 
router.post( 
  '/discount-calculation', 
  [ 
    auth, 
    body('items') 
      .isArray({ min: 1 }) 
      .withMessage('Items array is required'), 
    body('items.*.id') 
      .isMongoId() 
      .withMessage('Each item must have valid ID'), 
    body('discountCode') 
      .optional() 
      .trim() 
      .isLength({ min: 3, max: 20 }) 
      .withMessage('Discount code must be between 3 and 20 characters'), 
    body('bulkDiscount') 
      .optional() 
      .isBoolean() 
      .withMessage('Bulk discount must be boolean') 
  ], 
  kidswearController.calculateDiscount 
); 
 
// @route   GET /api/kidswear/budget-filter 
// @desc    Filter items by budget constraints 
// @access  Private 
router.get( 
  '/budget-filter', 
  [ 
    auth, 
    query('maxBudget') 
      .optional() 
      .isFloat({ min: 0 }) 
      .withMessage('Max budget must be positive'), 
    query('category') 
      .optional() 
      .isIn(['uniforms', 'playwear', 'shoes', 'accessories', 'outerwear', 'underwear', 'sleepwear']) 
.withMessage('Invalid category'), 
query('priority') 
.optional() 
.isIn(['essential', 'nice-to-have', 'luxury']) 
.withMessage('Invalid priority level') 
], 
kidswearController.filterByBudget 
); 
// @route   POST /api/kidswear/wishlist/:id 
// @desc    Add item to wishlist 
// @access  Private 
router.post( 
'/wishlist/:id', 
[ 
auth, 
param('id') 
.isMongoId() 
.withMessage('Invalid item ID'), 
body('priority') 
.optional() 
.isIn(['low', 'medium', 'high']) 
.withMessage('Invalid priority level'), 
body('targetDate') 
.optional() 
.isISO8601() 
.withMessage('Invalid target date format') 
], 
kidswearController.addToWishlist 
); 
// @route   GET /api/kidswear/wishlist 
// @desc    Get wishlist items 
// @access  Private 
router.get('/wishlist', auth, kidswearController.getWishlistItems); 
// @route   DELETE /api/kidswear/wishlist/:id 
// @desc    Remove item from wishlist 
// @access  Private 
router.delete( 
  '/wishlist/:id', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid item ID') 
  ], 
  kidswearController.removeFromWishlist 
); 
 
// @route   GET /api/kidswear/stats/purchase-history 
// @desc    Get purchase history and cost tracking 
// @access  Private 
router.get('/stats/purchase-history', auth, kidswearController.getPurchaseHistory); 
 
// @route   POST /api/kidswear/size-recommendation 
// @desc    Get size recommendations based on growth patterns 
// @access  Private 
router.post( 
  '/size-recommendation', 
  [ 
    auth, 
    body('childAge') 
      .isInt({ min: 0, max: 18 }) 
      .withMessage('Child age must be between 0 and 18'), 
    body('currentSize') 
      .trim() 
      .isLength({ min: 1, max: 20 }) 
      .withMessage('Current size is required'), 
    body('itemType') 
      .isIn(['tops', 'bottoms', 'shoes', 'outerwear']) 
      .withMessage('Invalid item type'), 
    body('growthRate') 
      .optional() 
      .isIn(['slow', 'average', 'fast']) 
      .withMessage('Invalid growth rate') 
], 
kidswearController.getSizeRecommendation 
); 
module.exports = router;