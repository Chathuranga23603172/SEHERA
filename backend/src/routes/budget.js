const express = require('express'); 
const router = express.Router(); 
const { body, param, query } = require('express-validator'); 
const budgetController = require('../controllers/budgetController'); 
const auth = require('../middleware/auth'); 
// @route   GET /api/budget 
// @desc    Get user's budget information 
// @access  Private 
router.get('/', auth, budgetController.getBudget); 
// @route   POST /api/budget 
// @desc    Create or update annual budget 
// @access  Private 
router.post( 
'/', 
[ 
auth, 
body('annualBudget') 
.isFloat({ min: 0 }) 
.withMessage('Annual budget must be a positive number'), 
body('monthlyBudget') 
.optional() 
.isFloat({ min: 0 }) 
.withMessage('Monthly budget must be a positive number'), 
body('categories') 
.optional() 
.isObject() 
.withMessage('Categories must be an object'), 
    body('categories.menswear') 
      .optional() 
      .isFloat({ min: 0 }) 
      .withMessage('Menswear budget must be positive'), 
    body('categories.womenswear') 
      .optional() 
      .isFloat({ min: 0 }) 
      .withMessage('Womenswear budget must be positive'), 
    body('categories.kidswear') 
      .optional() 
      .isFloat({ min: 0 }) 
      .withMessage('Kidswear budget must be positive'), 
    body('categories.accessories') 
      .optional() 
      .isFloat({ min: 0 }) 
      .withMessage('Accessories budget must be positive'), 
    body('categories.shoes') 
      .optional() 
      .isFloat({ min: 0 }) 
      .withMessage('Shoes budget must be positive'), 
    body('alertThreshold') 
      .optional() 
      .isFloat({ min: 0, max: 100 }) 
      .withMessage('Alert threshold must be between 0 and 100 percent'), 
    body('budgetPeriod') 
      .optional() 
      .isIn(['monthly', 'quarterly', 'yearly']) 
      .withMessage('Invalid budget period') 
  ], 
  budgetController.createOrUpdateBudget 
); 
 
// @route   GET /api/budget/expenses 
// @desc    Get all expenses with filtering options 
// @access  Private 
router.get( 
  '/expenses', 
  [ 
    auth, 
    query('startDate') 
      .optional() 
      .isISO8601() 
      .withMessage('Invalid start date format'), 
    query('endDate') 
      .optional() 
      .isISO8601() 
      .withMessage('Invalid end date format'), 
    query('category') 
      .optional() 
      .isIn(['menswear', 'womenswear', 'kidswear', 'accessories', 'shoes']) 
      .withMessage('Invalid category'), 
    query('itemType') 
      .optional() 
      .isIn(['menswear', 'womenswear', 'kidswear']) 
      .withMessage('Invalid item type'), 
    query('minAmount') 
      .optional() 
      .isFloat({ min: 0 }) 
      .withMessage('Min amount must be positive'), 
    query('maxAmount') 
      .optional() 
      .isFloat({ min: 0 }) 
      .withMessage('Max amount must be positive') 
  ], 
  budgetController.getExpenses 
); 
 
// @route   POST /api/budget/expense 
// @desc    Add new expense entry 
// @access  Private 
router.post( 
  '/expense', 
  [ 
    auth, 
    body('itemId') 
      .isMongoId() 
      .withMessage('Valid item ID required'), 
    body('itemType') 
      .isIn(['menswear', 'womenswear', 'kidswear']) 
      .withMessage('Invalid item type'), 
    body('amount') 
      .isFloat({ min: 0 }) 
      .withMessage('Amount must be positive'), 
    body('category') 
      .isIn(['menswear', 'womenswear', 'kidswear', 'accessories', 'shoes']) 
      .withMessage('Invalid category'), 
    body('description') 
      .optional() 
      .trim() 
      .isLength({ max: 200 }) 
      .withMessage('Description must be max 200 characters'), 
    body('purchaseDate') 
      .optional() 
      .isISO8601() 
      .withMessage('Invalid purchase date format'), 
    body('store') 
      .optional() 
      .trim() 
      .isLength({ max: 100 }) 
      .withMessage('Store name must be max 100 characters'), 
    body('paymentMethod') 
      .optional() 
      .isIn(['cash', 'credit-card', 'debit-card', 'online', 'bank-transfer']) 
      .withMessage('Invalid payment method') 
  ], 
  budgetController.addExpense 
); 
 
// @route   PUT /api/budget/expense/:id 
// @desc    Update expense entry 
// @access  Private 
router.put( 
  '/expense/:id', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid expense ID'), 
    body('amount') 
      .optional() 
      .isFloat({ min: 0 }) 
      .withMessage('Amount must be positive'), 
    body('category') 
      .optional() 
      .isIn(['menswear', 'womenswear', 'kidswear', 'accessories', 'shoes']) 
      .withMessage('Invalid category'), 
    body('description') 
      .optional() 
      .trim() 
      .isLength({ max: 200 }) 
      .withMessage('Description must be max 200 characters'), 
    body('purchaseDate') 
      .optional() 
      .isISO8601() 
      .withMessage('Invalid purchase date format'), 
    body('store') 
      .optional() 
      .trim() 
      .isLength({ max: 100 }) 
      .withMessage('Store name must be max 100 characters') 
  ], 
  budgetController.updateExpense 
); 
 
// @route   DELETE /api/budget/expense/:id 
// @desc    Delete expense entry 
// @access  Private 
router.delete( 
  '/expense/:id', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid expense ID') 
  ], 
  budgetController.deleteExpense 
); 
 
// @route   GET /api/budget/reports/spending 
// @desc    Generate spending reports by category 
// @access  Private 
router.get( 
  '/reports/spending', 
  [ 
    auth, 
    query('period') 
      .optional() 
      .isIn(['week', 'month', 'quarter', 'year']) 
      .withMessage('Invalid period'), 
    query('groupBy') 
      .optional() 
      .isIn(['category', 'brand', 'type', 'month', 'week']) 
      .withMessage('Invalid groupBy parameter'), 
    query('startDate') 
      .optional() 
      .isISO8601() 
      .withMessage('Invalid start date format'), 
    query('endDate') 
      .optional() 
      .isISO8601() 
      .withMessage('Invalid end date format'), 
    query('format') 
      .optional() 
      .isIn(['json', 'pdf', 'excel']) 
      .withMessage('Invalid report format') 
  ], 
  budgetController.generateSpendingReport 
); 
 
// @route   GET /api/budget/reports/budget-analysis 
// @desc    Get budget vs actual spending analysis 
// @access  Private 
router.get( 
  '/reports/budget-analysis', 
  [ 
    auth, 
    query('period') 
      .optional() 
      .isIn(['current-month', 'last-month', 'quarter', 'year']) 
      .withMessage('Invalid period'), 
    query('category') 
      .optional() 
      .isIn(['menswear', 'womenswear', 'kidswear', 'accessories', 'shoes', 'all']) 
      .withMessage('Invalid category') 
  ], 
  budgetController.getBudgetAnalysis 
); 
 
// @route   POST /api/budget/future-planning 
// @desc    Plan future shopping budgets based on events 
// @access  Private 
router.post( 
  '/future-planning', 
  [ 
    auth, 
    body('events') 
      .isArray({ min: 1, max: 10 }) 
      .withMessage('Events must be an array with 1-10 items'), 
    body('events.*.name') 
      .trim() 
      .isLength({ min: 1, max: 100 }) 
      .withMessage('Event name must be between 1 and 100 characters'), 
    body('events.*.date') 
      .isISO8601() 
      .withMessage('Invalid event date format'), 
    body('events.*.type') 
      .isIn(['wedding', 'interview', 'vacation', 'work', 'party', 'formal', 'casual']) 
      .withMessage('Invalid event type'), 
    body('events.*.estimatedBudget') 
      .optional() 
      .isFloat({ min: 0 }) 
      .withMessage('Estimated budget must be positive'), 
    body('events.*.priority') 
      .optional() 
      .isIn(['low', 'medium', 'high', 'critical']) 
      .withMessage('Invalid priority level'), 
    body('events.*.categories') 
      .optional() 
      .isArray({ max: 5 }) 
      .withMessage('Categories must be an array with max 5 items') 
  ], 
  budgetController.planFutureShopping 
); 
 
// @route   GET /api/budget/future-planning 
// @desc    Get saved future shopping plans 
// @access  Private 
router.get('/future-planning', auth, budgetController.getFutureShoppingPlans); 
 
// @route   PUT /api/budget/future-planning/:id 
// @desc    Update future shopping plan 
// @access  Private 
router.put( 
  '/future-planning/:id', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid plan ID'), 
    body('estimatedBudget') 
      .optional() 
      .isFloat({ min: 0 }) 
      .withMessage('Estimated budget must be positive'), 
    body('actualSpent') 
      .optional() 
      .isFloat({ min: 0 }) 
.withMessage('Actual spent must be positive'), 
body('status') 
.optional() 
.isIn(['planned', 'in-progress', 'completed', 'cancelled']) 
.withMessage('Invalid status'), 
body('notes') 
.optional() 
.trim() 
.isLength({ max: 500 }) 
.withMessage('Notes must be max 500 characters') 
], 
budgetController.updateFutureShoppingPlan 
); 
// @route   DELETE /api/budget/future-planning/:id 
// @desc    Delete future shopping plan 
// @access  Private 
router.delete( 
'/future-planning/:id', 
[ 
auth, 
param('id') 
.isMongoId() 
.withMessage('Invalid plan ID') 
], 
budgetController.deleteFutureShoppingPlan 
); 
// @route   GET /api/budget/alerts 
// @desc    Get budget alerts and notifications 
// @access  Private 
router.get('/alerts', auth, budgetController.getBudgetAlerts); 
// @route   POST /api/budget/alerts/:id/dismiss 
// @desc    Dismiss budget alert 
// @access  Private 
router.post( 
'/alerts/:id/dismiss', 
[ 
auth, 
param('id') 
.isMongoId() 
.withMessage('Invalid alert ID') 
], 
budgetController.dismissBudgetAlert 
); 
// @route   GET /api/budget/dashboard 
// @desc    Get budget dashboard data 
// @access  Private 
router.get('/dashboard', auth, budgetController.getBudgetDashboard); 
// @route   GET /api/budget/trends 
// @desc    Get spending trends and patterns 
// @access  Private 
router.get( 
'/trends', 
[ 
auth, 
query('period') 
.optional() 
.isIn(['3months', '6months', '1year', '2years']) 
.withMessage('Invalid period'), 
query('category') 
.optional() 
.isIn(['menswear', 'womenswear', 'kidswear', 'accessories', 'shoes']) 
.withMessage('Invalid category') 
], 
budgetController.getSpendingTrends 
); 
// @route   POST /api/budget/goal 
// @desc    Set budget goal 
// @access  Private 
router.post( 
'/goal', 
  [ 
    auth, 
    body('type') 
      .isIn(['save', 'limit', 'target']) 
      .withMessage('Invalid goal type'), 
    body('amount') 
      .isFloat({ min: 0 }) 
      .withMessage('Amount must be positive'), 
    body('category') 
      .optional() 
      .isIn(['menswear', 'womenswear', 'kidswear', 'accessories', 'shoes', 'total']) 
      .withMessage('Invalid category'), 
    body('deadline') 
      .optional() 
      .isISO8601() 
      .withMessage('Invalid deadline format'), 
    body('description') 
      .optional() 
      .trim() 
      .isLength({ max: 200 }) 
      .withMessage('Description must be max 200 characters') 
  ], 
  budgetController.setBudgetGoal 
); 
 
// @route   GET /api/budget/goals 
// @desc    Get budget goals and progress 
// @access  Private 
router.get('/goals', auth, budgetController.getBudgetGoals); 
 
// @route   PUT /api/budget/goal/:id 
// @desc    Update budget goal 
// @access  Private 
router.put( 
  '/goal/:id', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid goal ID'), 
    body('amount') 
      .optional() 
      .isFloat({ min: 0 }) 
      .withMessage('Amount must be positive'), 
    body('deadline') 
      .optional() 
      .isISO8601() 
      .withMessage('Invalid deadline format'), 
    body('status') 
      .optional() 
      .isIn(['active', 'achieved', 'paused', 'cancelled']) 
      .withMessage('Invalid status') 
  ], 
  budgetController.updateBudgetGoal 
); 
 
// @route   DELETE /api/budget/goal/:id 
// @desc    Delete budget goal 
// @access  Private 
router.delete( 
  '/goal/:id', 
  [ 
    auth, 
    param('id') 
      .isMongoId() 
      .withMessage('Invalid goal ID') 
  ], 
  budgetController.deleteBudgetGoal 
); 
 
// @route   POST /api/budget/forecast 
// @desc    Generate budget forecast 
// @access  Private 
router.post( 
  '/forecast', 
  [ 
    auth, 
    body('period') 
      .isIn(['3months', '6months', '1year']) 
      .withMessage('Invalid forecast period'), 
    body('baselineMonths') 
      .optional() 
      .isInt({ min: 1, max: 12 }) 
      .withMessage('Baseline months must be between 1 and 12'), 
    body('adjustments') 
      .optional() 
      .isObject() 
      .withMessage('Adjustments must be an object'), 
    body('includeSeasonality') 
      .optional() 
      .isBoolean() 
      .withMessage('Include seasonality must be boolean'), 
    body('includeInflation') 
      .optional() 
      .isBoolean() 
      .withMessage('Include inflation must be boolean') 
  ], 
  budgetController.generateBudgetForecast 
); 
 
module.exports = router;