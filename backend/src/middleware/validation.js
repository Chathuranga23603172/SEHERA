const { validationResult, body, param, query } = require('express-validator'); 
 
// Handle validation errors 
const handleValidationErrors = (req, res, next) => { 
  const errors = validationResult(req); 
   
  if (!errors.isEmpty()) { 
    return res.status(400).json({ 
      success: false, 
      message: 'Validation errors', 
      errors: errors.array().map(error => ({ 
        field: error.path, 
        message: error.msg, 
        value: error.value 
      })) 
    }); 
  } 
   
  next(); 
}; 
 
// Auth validation rules 
const validateRegister = [ 
body('name') 
.trim() 
.isLength({ min: 2, max: 50 }) 
.withMessage('Name must be between 2 and 50 characters'), 
body('email') 
.isEmail() 
.normalizeEmail() 
.withMessage('Please provide a valid email'), 
body('password') 
.isLength({ min: 6 }) 
.withMessage('Password must be at least 6 characters long') 
.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/) 
.withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'), 
handleValidationErrors 
]; 
const validateLogin = [ 
body('email') 
.isEmail() 
.normalizeEmail() 
.withMessage('Please provide a valid email'), 
body('password') 
.notEmpty() 
.withMessage('Password is required'), 
handleValidationErrors 
]; 
// Clothing item validation 
const validateClothingItem = [ 
body('name') 
.trim() 
.isLength({ min: 1, max: 100 }) 
.withMessage('Item name is required and must be less than 100 characters'), 
body('brand') 
.optional() 
.trim() 
.isLength({ max: 50 }) 
.withMessage('Brand name must be less than 50 characters'), 
body('category') 
.notEmpty() 
.withMessage('Category is required') 
.isIn(['dress', 'shirt', 'pants', 'shoes', 'accessories', 'outerwear', 'underwear', 'sportswear']) 
.withMessage('Invalid category'), 
body('size') 
.optional() 
.trim() 
.isLength({ max: 10 }) 
.withMessage('Size must be less than 10 characters'), 
body('color') 
.optional() 
.trim() 
.isLength({ max: 30 }) 
.withMessage('Color must be less than 30 characters'), 
body('price') 
.isFloat({ min: 0 }) 
.withMessage('Price must be a positive number'), 
body('purchaseDate') 
.optional() 
.isISO8601() 
.withMessage('Purchase date must be a valid date'), 
body('occasion') 
.optional() 
.isIn(['casual', 'formal', 'business', 'party', 'sports', 'beach', 'wedding']) 
.withMessage('Invalid occasion'), 
body('season') 
.optional() 
.isIn(['spring', 'summer', 'fall', 'winter', 'all']) 
.withMessage('Invalid season'), 
handleValidationErrors 
]; 
// Kids wear specific validation 
const validateKidsWear = [ 
...validateClothingItem, 
body('ageGroup') 
.notEmpty() 
.withMessage('Age group is required') 
.isIn(['baby', 'toddler', 'child', 'teen']) 
.withMessage('Invalid age group'), 
body('growthStage') 
.optional() 
.isIn(['0-36months', '2-12years', '13-16years']) 
.withMessage('Invalid growth stage'), 
handleValidationErrors 
]; 
// Style combo validation 
const validateStyleCombo = [ 
body('name') 
.trim() 
.isLength({ min: 1, max: 100 }) 
.withMessage('Outfit name is required and must be less than 100 characters'), 
body('items') 
.isArray({ min: 1 }) 
.withMessage('At least one clothing item is required'), 
body('items.*') 
.isMongoId() 
.withMessage('Each item must be a valid item ID'), 
body('event') 
.optional() 
.isIn(['casual', 'formal', 'business', 'party', 'wedding', 'sports', 'date', 'interview']) 
.withMessage('Invalid event type'), 
body('tags') 
.optional() 
.isArray() 
.withMessage('Tags must be an array'), 
body('tags.*') 
.trim() 
.isLength({ max: 30 }) 
.withMessage('Each tag must be less than 30 characters'), 
handleValidationErrors 
]; 
// Budget validation 
const validateBudget = [ 
body('name') 
.trim() 
.isLength({ min: 1, max: 100 }) 
.withMessage('Budget name is required and must be less than 100 characters'), 
body('amount') 
.isFloat({ min: 0 }) 
.withMessage('Budget amount must be a positive number'), 
body('period') 
.isIn(['monthly', 'yearly']) 
.withMessage('Period must be either monthly or yearly'), 
body('category') 
.optional() 
.isIn(['menswear', 'womenswear', 'kidswear', 'accessories', 'shoes', 'general']) 
.withMessage('Invalid budget category'), 
body('startDate') 
.isISO8601() 
.withMessage('Start date must be a valid date'), 
body('endDate') 
.optional() 
.isISO8601() 
.withMessage('End date must be a valid date'), 
handleValidationErrors 
]; 
// ID parameter validation 
const validateObjectId = [ 
param('id') 
.isMongoId() 
.withMessage('Invalid ID format'), 
handleValidationErrors 
]; 
// Pagination validation 
const validatePagination = [ 
query('page') 
.optional() 
.isInt({ min: 1 }) 
.withMessage('Page must be a positive integer'), 
query('limit') 
.optional() 
.isInt({ min: 1, max: 50 }) 
.withMessage('Limit must be between 1 and 50'), 
handleValidationErrors 
]; 
module.exports = { 
handleValidationErrors, 
validateRegister, 
validateLogin, 
validateClothingItem, 
validateKidsWear, 
validateStyleCombo, 
validateBudget, 
validateObjectId, 
validatePagination 
};