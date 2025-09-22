const express = require('express'); 
const router = express.Router(); 
const { body, param, query } = require('express-validator'); 
const styleComboController = require('../controllers/styleComboController'); 
const auth = require('../middleware/auth'); 
const upload = require('../middleware/upload'); 
// @route   GET /api/style-combo 
// @desc    Get all style combinations for user 
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
.isInt({ min: 1, max: 50 }) 
.withMessage('Limit must be between 1 and 50'), 
query('eventTag') 
.optional() 
.trim() 
      .isLength({ max: 50 }) 
      .withMessage('Event tag must be max 50 characters'), 
    query('styleName') 
      .optional() 
      .trim() 
      .isLength({ max: 100 }) 
      .withMessage('Style name must be max 100 characters'), 
    query('season') 
      .optional() 
      .isIn(['spring', 'summer', 'autumn', 'winter']) 
      .withMessage('Invalid season') 
  ], 
  styleComboController.getStyleCombinations 
); 
 
// @route   GET /api/style-combo/:id 
// @desc    Get specific style combination 
// @access  Private 
router.get( 
  '/:id', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid style combo ID') 
  ], 
  styleComboController.getStyleCombination 
); 
 
// @route   POST /api/style-combo 
// @desc    Create new style combination 
// @access  Private 
router.post( 
  '/', 
  [ 
    auth, 
    upload.single('outfitImage'), 
    body('name') 
      .trim() 
      .isLength({ min: 1, max: 100 }) 
      .withMessage('Name must be between 1 and 100 characters'), 
    body('description') 
      .optional() 
      .trim() 
      .isLength({ max: 500 }) 
      .withMessage('Description must be max 500 characters'), 
    body('items') 
      .isArray({ min: 1, max: 15 }) 
      .withMessage('Items array must contain 1-15 items'), 
    body('items.*.itemId') 
      .isMongoId() 
      .withMessage('Each item must have a valid ID'), 
    body('items.*.itemType') 
      .isIn(['menswear', 'womenswear', 'kidswear']) 
      .withMessage('Invalid item type'), 
    body('items.*.category') 
      .optional() 
      .trim() 
      .isLength({ max: 50 }) 
      .withMessage('Category must be max 50 characters'), 
    body('eventTags') 
      .optional() 
      .isArray({ max: 10 }) 
      .withMessage('Event tags must be an array with max 10 items'), 
    body('eventTags.*') 
      .optional() 
      .trim() 
      .isLength({ min: 1, max: 50 }) 
      .withMessage('Each event tag must be between 1 and 50 characters'), 
    body('styleTags') 
      .optional() 
      .isArray({ max: 10 }) 
      .withMessage('Style tags must be an array with max 10 items'), 
    body('styleTags.*') 
      .optional() 
      .isIn(['smart-casual', 'formal', 'streetwear', 'business', 'party', 'casual', 'sporty']) 
      .withMessage('Invalid style tag'), 
    body('season') 
      .optional() 
      .isIn(['spring', 'summer', 'autumn', 'winter', 'all-seasons']) 
      .withMessage('Invalid season'), 
    body('occasion') 
      .optional() 
      .isIn(['wedding', 'interview', 'date', 'work', 'party', 'casual', 'travel', 'sports']) 
      .withMessage('Invalid occasion') 
  ], 
  styleComboController.createStyleCombination 
); 
 
// @route   PUT /api/style-combo/:id 
// @desc    Update style combination 
// @access  Private 
router.put( 
  '/:id', 
  [ 
    auth, 
    upload.single('outfitImage'), 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid style combo ID'), 
    body('name') 
      .optional() 
      .trim() 
      .isLength({ min: 1, max: 100 }) 
      .withMessage('Name must be between 1 and 100 characters'), 
    body('description') 
      .optional() 
      .trim() 
      .isLength({ max: 500 }) 
      .withMessage('Description must be max 500 characters'), 
    body('items') 
      .optional() 
      .isArray({ min: 1, max: 15 }) 
      .withMessage('Items array must contain 1-15 items'), 
    body('items.*.itemId') 
      .optional() 
      .isMongoId() 
      .withMessage('Each item must have a valid ID'), 
    body('items.*.itemType') 
      .optional() 
      .isIn(['menswear', 'womenswear', 'kidswear']) 
      .withMessage('Invalid item type'), 
    body('eventTags') 
      .optional() 
      .isArray({ max: 10 }) 
      .withMessage('Event tags must be an array with max 10 items'), 
    body('styleTags') 
      .optional() 
      .isArray({ max: 10 }) 
      .withMessage('Style tags must be an array with max 10 items') 
  ], 
  styleComboController.updateStyleCombination 
); 
 
// @route   DELETE /api/style-combo/:id 
// @desc    Delete style combination 
// @access  Private 
router.delete( 
  '/:id', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid style combo ID') 
  ], 
  styleComboController.deleteStyleCombination 
); 
 
// @route   POST /api/style-combo/:id/event-tag 
// @desc    Add event tag to style combination 
// @access  Private 
router.post( 
  '/:id/event-tag', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid style combo ID'), 
    body('eventTag') 
      .trim() 
      .isLength({ min: 1, max: 50 }) 
      .withMessage('Event tag must be between 1 and 50 characters'), 
    body('eventType') 
      .optional() 
      .isIn(['wedding', 'interview', 'date', 'work', 'party', 'casual', 'travel', 'sports']) 
      .withMessage('Invalid event type'), 
    body('eventDate') 
      .optional() 
      .isISO8601() 
      .withMessage('Invalid event date format') 
  ], 
  styleComboController.addEventTag 
); 
 
// @route   DELETE /api/style-combo/:id/event-tag/:tagId 
// @desc    Remove event tag from style combination 
// @access  Private 
router.delete( 
  '/:id/event-tag/:tagId', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid style combo ID'), 
    param('tagId') 
      .isMongoId() 
      .withMessage('Invalid tag ID') 
  ], 
  styleComboController.removeEventTag 
); 
 
// @route   POST /api/style-combo/save-named-style 
// @desc    Save named style combination 
// @access  Private 
router.post( 
  '/save-named-style', 
  [ 
    auth, 
    body('styleComboId') 
      .isMongoId() 
      .withMessage('Valid style combo ID required'), 
    body('styleName') 
      .trim() 
      .isLength({ min: 1, max: 100 }) 
      .withMessage('Style name must be between 1 and 100 characters'), 
    body('styleCategory') 
      .isIn(['smart-casual', 'formal', 'streetwear', 'business', 'party', 'casual', 'sporty']) 
      .withMessage('Invalid style category'), 
    body('isPublic') 
      .optional() 
      .isBoolean() 
      .withMessage('isPublic must be boolean'), 
    body('tags') 
      .optional() 
      .isArray({ max: 10 }) 
      .withMessage('Tags must be an array with max 10 items') 
  ], 
  styleComboController.saveNamedStyle 
); 
 
// @route   GET /api/style-combo/named-styles 
// @desc    Get saved named styles 
// @access  Private 
router.get('/named-styles', auth, styleComboController.getNamedStyles); 
 
// @route   POST /api/style-combo/:id/share 
// @desc    Share style combination 
// @access  Private 
router.post( 
  '/:id/share', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid style combo ID'), 
    body('shareType') 
      .isIn(['link', 'social', 'email']) 
      .withMessage('Invalid share type'), 
    body('platform') 
      .optional() 
      .isIn(['facebook', 'instagram', 'twitter', 'pinterest']) 
      .withMessage('Invalid social platform'), 
    body('recipients') 
      .optional() 
      .isArray({ max: 10 }) 
      .withMessage('Recipients must be an array with max 10 items'), 
    body('message') 
      .optional() 
      .trim() 
      .isLength({ max: 500 }) 
      .withMessage('Message must be max 500 characters') 
  ], 
  styleComboController.shareStyleCombination 
); 
 
// @route   GET /api/style-combo/compare 
// @desc    Get up to 3 style combinations for side-by-side comparison 
// @access  Private 
router.get( 
  '/compare', 
  [ 
    auth, 
    query('combo1') 
      .isMongoId() 
      .withMessage('First combo ID must be valid'), 
    query('combo2') 
      .optional() 
      .isMongoId() 
      .withMessage('Second combo ID must be valid'), 
    query('combo3') 
      .optional() 
      .isMongoId() 
      .withMessage('Third combo ID must be valid') 
  ], 
  styleComboController.compareStyleCombinations 
); 
 
// @route   POST /api/style-combo/:id/virtual-try-on 
// @desc    Generate virtual try-on for style combination 
// @access  Private 
router.post( 
  '/:id/virtual-try-on', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid style combo ID'), 
    body('avatarSettings') 
      .optional() 
      .isObject() 
      .withMessage('Avatar settings must be an object'), 
    body('avatarSettings.bodyType') 
      .optional() 
      .isIn(['slim', 'regular', 'plus-size']) 
      .withMessage('Invalid body type'), 
    body('avatarSettings.height') 
      .optional() 
      .isInt({ min: 100, max: 250 }) 
      .withMessage('Height must be between 100 and 250 cm'), 
    body('avatarSettings.age') 
      .optional() 
      .isInt({ min: 1, max: 100 }) 
      .withMessage('Age must be between 1 and 100'), 
    body('avatarSettings.gender') 
      .optional() 
      .isIn(['male', 'female', 'unisex']) 
      .withMessage('Invalid gender'), 
    body('avatarSettings.skinTone') 
      .optional() 
      .isIn(['light', 'medium', 'dark']) 
      .withMessage('Invalid skin tone') 
  ], 
  styleComboController.generateVirtualTryOn 
); 
 
// @route   POST /api/style-combo/:id/usage 
// @desc    Track usage of style combination 
// @access  Private 
router.post( 
  '/:id/usage', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid style combo ID'), 
    body('occasion') 
      .optional() 
      .trim() 
      .isLength({ max: 100 }) 
      .withMessage('Occasion must be max 100 characters'), 
    body('date') 
      .optional() 
      .isISO8601() 
      .withMessage('Invalid date format'), 
    body('rating') 
      .optional() 
      .isInt({ min: 1, max: 5 }) 
      .withMessage('Rating must be between 1 and 5'), 
    body('notes') 
      .optional() 
      .trim() 
      .isLength({ max: 300 }) 
      .withMessage('Notes must be max 300 characters') 
  ], 
  styleComboController.trackUsage 
); 
 
// @route   GET /api/style-combo/stats/usage 
// @desc    Get usage statistics for style combinations 
// @access  Private 
router.get('/stats/usage', auth, styleComboController.getUsageStats); 
 
// @route   GET /api/style-combo/recommendations 
// @desc    Get style combination recommendations 
// @access  Private 
router.get( 
  '/recommendations', 
  [ 
    auth, 
    query('occasion') 
      .optional() 
      .isIn(['wedding', 'interview', 'date', 'work', 'party', 'casual', 'travel', 'sports']) 
      .withMessage('Invalid occasion'), 
    query('season') 
      .optional() 
      .isIn(['spring', 'summer', 'autumn', 'winter']) 
      .withMessage('Invalid season'), 
    query('budget') 
      .optional() 
      .isFloat({ min: 0 }) 
      .withMessage('Budget must be positive'), 
    query('style') 
      .optional() 
      .isIn(['smart-casual', 'formal', 'streetwear', 'business', 'party', 'casual', 'sporty']) 
      .withMessage('Invalid style') 
  ], 
  styleComboController.getRecommendations 
); 
 
// @route   POST /api/style-combo/:id/favorite 
// @desc    Toggle favorite status of style combination 
// @access  Private 
router.post( 
  '/:id/favorite', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid style combo ID') 
  ], 
  styleComboController.toggleFavorite 
); 
 
// @route   GET /api/style-combo/search 
// @desc    Search style combinations 
// @access  Private 
router.get( 
  '/search', 
  [ 
    auth, 
    query('q') 
      .optional() 
      .trim() 
      .isLength({ min: 1, max: 100 }) 
      .withMessage('Search query must be between 1 and 100 characters'), 
    query('type') 
      .optional() 
      .isIn(['name', 'event', 'style', 'item']) 
      .withMessage('Invalid search type'), 
    query('color') 
      .optional() 
      .trim() 
      .isLength({ max: 30 }) 
      .withMessage('Color search must be max 30 characters') 
  ], 
  styleComboController.searchStyleCombinations 
); 
 
module.exports = router;