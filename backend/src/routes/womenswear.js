const express = require('express'); 
const router = express.Router(); 
const { body, param, query } = require('express-validator'); 
const womenswearController = require('../controllers/womenswearController'); 
const auth = require('../middleware/auth'); 
const upload = require('../middleware/upload'); 
// @route   GET /api/womenswear 
// @desc    Get all womenswear items for user 
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
      .isIn(['dresses', 'blouses', 'skirts', 'pants', 'shoes', 'accessories', 'bags', 'jewelry']) 
      .withMessage('Invalid category'), 
    query('brand') 
      .optional() 
      .trim() 
      .isLength({ max: 50 }) 
      .withMessage('Brand name too long'), 
    query('season') 
      .optional() 
      .isIn(['spring', 'summer', 'autumn', 'winter']) 
      .withMessage('Invalid season'), 
    query('purpose') 
      .optional() 
      .isIn(['party', 'office', 'casual', 'formal', 'wedding', 'travel']) 
      .withMessage('Invalid purpose') 
  ], 
  womenswearController.getWomenswearItems 
); 
 
// @route   GET /api/womenswear/:id 
// @desc    Get specific womenswear item 
// @access  Private 
router.get( 
  '/:id', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid item ID') 
  ], 
  womenswearController.getWomenswearItem 
); 
 
// @route   POST /api/womenswear 
// @desc    Create new womenswear item 
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
      .isIn(['dresses', 'blouses', 'skirts', 'pants', 'shoes', 'accessories', 'bags', 'jewelry']) 
      .withMessage('Invalid category'), 
    body('season') 
      .optional() 
      .isIn(['spring', 'summer', 'autumn', 'winter']) 
      .withMessage('Invalid season'), 
    body('purpose') 
      .optional() 
      .isIn(['party', 'office', 'casual', 'formal', 'wedding', 'travel']) 
      .withMessage('Invalid purpose'), 
    body('discount') 
      .optional() 
      .isFloat({ min: 0, max: 100 }) 
      .withMessage('Discount must be between 0 and 100') 
  ], 
  womenswearController.createWomenswearItem 
); 
 
// @route   PUT /api/womenswear/:id 
// @desc    Update womenswear item 
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
      .isIn(['dresses', 'blouses', 'skirts', 'pants', 'shoes', 'accessories', 'bags', 'jewelry']) 
      .withMessage('Invalid category'), 
    body('season') 
      .optional() 
      .isIn(['spring', 'summer', 'autumn', 'winter']) 
      .withMessage('Invalid season'), 
    body('purpose') 
      .optional() 
      .isIn(['party', 'office', 'casual', 'formal', 'wedding', 'travel']) 
      .withMessage('Invalid purpose'), 
    body('discount') 
      .optional() 
      .isFloat({ min: 0, max: 100 }) 
      .withMessage('Discount must be between 0 and 100') 
  ], 
  womenswearController.updateWomenswearItem 
); 
 
// @route   DELETE /api/womenswear/:id 
// @desc    Delete womenswear item 
// @access  Private 
router.delete( 
  '/:id', 
  [ 
auth, 
param('id') 
.isMongoId() 
.withMessage('Invalid item ID') 
], 
womenswearController.deleteWomenswearItem 
); 
// @route   POST /api/womenswear/:id/usage 
// @desc    Track usage of womenswear item 
// @access  Private 
router.post( 
'/:id/usage', 
[ 
auth, 
param('id') 
.isMongoId() 
.withMessage('Invalid item ID'), 
body('date') 
.optional() 
.isISO8601() 
.withMessage('Invalid date format'), 
body('occasion') 
.optional() 
.trim() 
.isLength({ max: 100 }) 
.withMessage('Occasion description too long') 
], 
womenswearController.trackUsage 
); 
// @route   GET /api/womenswear/sustainability/analysis 
// @desc    Get sustainability analysis for womenswear 
// @access  Private 
router.get('/sustainability/analysis', auth, 
womenswearController.getSustainabilityAnalysis); 
// @route   GET /api/womenswear/filter/budget 
// @desc    Filter womenswear items by budget 
// @access  Private 
router.get( 
  '/filter/budget', 
  [ 
    auth, 
    query('minPrice') 
      .optional() 
      .isFloat({ min: 0 }) 
      .withMessage('Min price must be positive'), 
    query('maxPrice') 
      .optional() 
      .isFloat({ min: 0 }) 
      .withMessage('Max price must be positive'), 
    query('budgetCategory') 
      .optional() 
      .isIn(['low', 'medium', 'high', 'luxury']) 
      .withMessage('Invalid budget category') 
  ], 
  womenswearController.filterByBudget 
); 
 
// @route   POST /api/womenswear/:id/favorite 
// @desc    Toggle favorite status of womenswear item 
// @access  Private 
router.post( 
  '/:id/favorite', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid item ID') 
  ], 
  womenswearController.toggleFavorite 
); 
 
// @route   GET /api/womenswear/stats/cost-per-wear 
// @desc    Get cost per wear statistics 
// @access  Private 
router.get('/stats/cost-per-wear', auth, womenswearController.getCostPerWearStats); 
 
// @route   POST /api/womenswear/bulk-upload 
// @desc    Bulk upload womenswear items 
// @access  Private 
router.post( 
  '/bulk-upload', 
  [ 
    auth, 
    upload.array('images', 10), 
    body('items') 
      .isArray({ min: 1, max: 10 }) 
      .withMessage('Items must be an array with 1-10 items'), 
    body('items.*.name') 
      .trim() 
      .isLength({ min: 1, max: 100 }) 
      .withMessage('Each item name must be between 1 and 100 characters'), 
    body('items.*.type') 
      .trim() 
      .isLength({ min: 1, max: 50 }) 
      .withMessage('Each item type is required'), 
    body('items.*.brand') 
      .trim() 
      .isLength({ min: 1, max: 50 }) 
      .withMessage('Each item brand is required'), 
    body('items.*.price') 
      .isNumeric() 
      .isFloat({ min: 0 }) 
      .withMessage('Each item price must be positive') 
  ], 
  womenswearController.bulkUpload 
); 
 
// @route   GET /api/womenswear/recommendations 
// @desc    Get personalized recommendations based on usage patterns 
// @access  Private 
router.get('/recommendations', auth, womenswearController.getRecommendations); 
 
// @route   POST /api/womenswear/:id/review 
// @desc    Add review/rating to womenswear item 
// @access  Private 
router.post( 
  '/:id/review', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid item ID'), 
    body('rating') 
      .isInt({ min: 1, max: 5 }) 
      .withMessage('Rating must be between 1 and 5'), 
    body('review') 
      .optional() 
      .trim() 
      .isLength({ max: 500 }) 
      .withMessage('Review must be max 500 characters'), 
    body('comfort') 
      .optional() 
      .isInt({ min: 1, max: 5 }) 
      .withMessage('Comfort rating must be between 1 and 5'), 
    body('durability') 
      .optional() 
      .isInt({ min: 1, max: 5 }) 
      .withMessage('Durability rating must be between 1 and 5') 
  ], 
  womenswearController.addReview 
); 
 
module.exports = router;