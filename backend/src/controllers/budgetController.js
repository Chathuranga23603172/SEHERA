const { validationResult } = require('express-validator'); 
const Budget = require('../models/Budget'); 
const Menswear = require('../models/Menswear'); 
const Womenswear = require('../models/Womenswear'); 
const Kidswear = require('../models/Kidswear'); 
const StyleCombo = require('../models/StyleCombo'); 
// @desc    Get user budget 
// @route   GET /api/budget 
// @access  Private 
const getBudget = async (req, res) => { 
try { 
const userId = req.user.userId; 
const { year } = req.query; 
let filter = { user: userId }; 
if (year) filter.year = parseInt(year); 
const budget = await Budget.findOne(filter).sort({ createdAt: -1 }); 
 
    if (!budget) { 
      return res.status(404).json({ 
        success: false, 
        message: 'Budget not found' 
      }); 
    } 
 
    res.status(200).json({ 
      success: true, 
      data: budget 
    }); 
 
  } catch (error) { 
    console.error('Get budget error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Create or update annual budget 
// @route   POST /api/budget 
// @access  Private 
const createBudget = async (req, res) => { 
  try { 
    const errors = validationResult(req); 
    if (!errors.isEmpty()) { 
      return res.status(400).json({ 
        success: false, 
        message: 'Validation errors', 
        errors: errors.array() 
      }); 
    } 
 
    const userId = req.user.userId; 
    const { 
      year, 
      totalBudget, 
      categoryBudgets, 
      alertThreshold = 80 
    } = req.body; 
 
    // Check if budget already exists for this year 
    const existingBudget = await Budget.findOne({ user: userId, year }); 
 
    if (existingBudget) { 
      // Update existing budget 
      existingBudget.totalBudget = totalBudget; 
      existingBudget.categoryBudgets = categoryBudgets; 
      existingBudget.alertThreshold = alertThreshold; 
      existingBudget.updatedAt = new Date(); 
 
      await existingBudget.save(); 
 
      return res.status(200).json({ 
        success: true, 
        message: 'Budget updated successfully', 
        data: existingBudget 
      }); 
    } 
 
    // Create new budget 
    const budget = new Budget({ 
      user: userId, 
      year, 
      totalBudget, 
      categoryBudgets, 
      alertThreshold 
    }); 
 
    await budget.save(); 
 
    res.status(201).json({ 
      success: true, 
      message: 'Budget created successfully', 
      data: budget 
    }); 
 
  } catch (error) { 
    console.error('Create budget error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Get spending summary 
// @route   GET /api/budget/spending 
// @access  Private 
const getSpendingSummary = async (req, res) => { 
  try { 
    const userId = req.user.userId; 
    const { year = new Date().getFullYear(), month } = req.query; 
 
    // Build date filter 
    let dateFilter = { 
      $expr: { $eq: [{ $year: '$purchaseDate' }, parseInt(year)] } 
    }; 
 
    if (month) { 
      dateFilter.$expr = { 
        $and: [ 
          { $eq: [{ $year: '$purchaseDate' }, parseInt(year)] }, 
          { $eq: [{ $month: '$purchaseDate' }, parseInt(month)] } 
        ] 
      }; 
    } 
 
    // Get spending from all categories 
    const menswearSpending = await Menswear.aggregate([ 
      { $match: { user: userId, ...dateFilter } }, 
      { 
        $group: { 
          _id: '$category', 
          totalSpent: { $sum: '$finalPrice' }, 
          itemCount: { $sum: 1 }, 
          averagePrice: { $avg: '$finalPrice' } 
        } 
      } 
    ]); 
 
    const womenswearSpending = await Womenswear.aggregate([ 
      { $match: { user: userId, ...dateFilter } }, 
      { 
        $group: { 
          _id: '$category', 
          totalSpent: { $sum: '$finalPrice' }, 
          itemCount: { $sum: 1 }, 
          averagePrice: { $avg: '$finalPrice' } 
        } 
      } 
    ]); 
 
    const kidswearSpending = await Kidswear.aggregate([ 
      { $match: { user: userId, ...dateFilter } }, 
      { 
        $group: { 
          _id: '$ageGroup', 
          totalSpent: { $sum: '$finalPrice' }, 
          itemCount: { $sum: 1 }, 
          averagePrice: { $avg: '$finalPrice' } 
        } 
      } 
    ]); 
 
    // Calculate total spending 
    const totalSpending = [ 
      ...menswearSpending, 
      ...womenswearSpending, 
      ...kidswearSpending 
    ].reduce((sum, category) => sum + category.totalSpent, 0); 
 
    // Get budget for comparison 
    const budget = await Budget.findOne({ user: userId, year: parseInt(year) }); 
 
    let budgetComparison = { 
      hasBudget: !!budget, 
      totalBudget: budget?.totalBudget || 0, 
      remainingBudget: budget ? budget.totalBudget - totalSpending : 0, 
      spentPercentage: budget ? ((totalSpending / budget.totalBudget) * 100).toFixed(2) : 0, 
      isOverBudget: budget ? totalSpending > budget.totalBudget : false 
    }; 
 
    // Check for budget alerts 
    const alerts = []; 
    if (budget && budgetComparison.spentPercentage >= budget.alertThreshold) { 
      alerts.push({ 
        type: 'warning', 
        message: `You've spent ${budgetComparison.spentPercentage}% of your annual 
budget`, 
        threshold: budget.alertThreshold 
      }); 
    } 
 
    if (budgetComparison.isOverBudget) { 
      alerts.push({ 
        type: 'danger', 
        message: `Budget exceeded by 
$${Math.abs(budgetComparison.remainingBudget).toFixed(2)}`, 
        overAmount: Math.abs(budgetComparison.remainingBudget) 
      }); 
    } 
 
    res.status(200).json({ 
      success: true, 
      data: { 
        period: { year: parseInt(year), month: month ? parseInt(month) : null }, 
        totalSpending: totalSpending.toFixed(2), 
        spendingByCategory: { 
          menswear: menswearSpending, 
          womenswear: womenswearSpending, 
          kidswear: kidswearSpending 
        }, 
        budgetComparison, 
        alerts 
      } 
    }); 
 
  } catch (error) { 
    console.error('Get spending summary error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Generate spending report by category 
// @route   GET /api/budget/reports 
// @access  Private 
const generateSpendingReport = async (req, res) => { 
  try { 
    const userId = req.user.userId; 
    const { year = new Date().getFullYear(), category, brand, event, format = 'json' } = 
req.query; 
 
    // Build base filter 
    const baseFilter = { 
      user: userId, 
      $expr: { $eq: [{ $year: '$purchaseDate' }, parseInt(year)] } 
    }; 
 
    let reportData = { 
      year: parseInt(year), 
      generatedAt: new Date(), 
      summary: {}, 
      detailed: {} 
    }; 
 
    // Get detailed spending by brand 
    if (brand) { 
      const brandFilter = { ...baseFilter, brand: new RegExp(brand, 'i') }; 
       
      const menswearByBrand = await Menswear.find(brandFilter) 
        .select('name brand finalPrice category purchaseDate'); 
      const womenswearByBrand = await Womenswear.find(brandFilter) 
        .select('name brand finalPrice category purchaseDate'); 
      const kidswearByBrand = await Kidswear.find(brandFilter) 
        .select('name brand finalPrice ageGroup purchaseDate'); 
 
      reportData.detailed.brand = { 
        brandName: brand, 
        items: [...menswearByBrand, ...womenswearByBrand, ...kidswearByBrand], 
        totalSpent: [...menswearByBrand, ...womenswearByBrand, ...kidswearByBrand] 
          .reduce((sum, item) => sum + item.finalPrice, 0) 
      }; 
    } 
 
    // Get spending by event (from style combos) 
    if (event) { 
      const eventCombos = await StyleCombo.find({ 
        user: userId, 
        eventTag: new RegExp(event, 'i'), 
        createdAt: { 
          $gte: new Date(year, 0, 1), 
          $lte: new Date(year, 11, 31) 
        } 
      }).populate([ 
        { path: 'items.menswear', select: 'name finalPrice' }, 
        { path: 'items.womenswear', select: 'name finalPrice' }, 
        { path: 'items.kidswear', select: 'name finalPrice' } 
      ]); 
 
      reportData.detailed.event = { 
        eventName: event, 
        combos: eventCombos, 
        totalSpent: eventCombos.reduce((sum, combo) => sum + combo.totalPrice, 0) 
      }; 
    } 
 
    // Monthly breakdown 
    const monthlySpending = await Promise.all([ 
      Menswear.aggregate([ 
        { $match: baseFilter }, 
        { 
          $group: { 
            _id: { $month: '$purchaseDate' }, 
            total: { $sum: '$finalPrice' }, 
            count: { $sum: 1 } 
          } 
        } 
      ]), 
      Womenswear.aggregate([ 
        { $match: baseFilter }, 
        { 
          $group: { 
            _id: { $month: '$purchaseDate' }, 
            total: { $sum: '$finalPrice' }, 
            count: { $sum: 1 } 
          } 
        } 
      ]), 
      Kidswear.aggregate([ 
        { $match: baseFilter }, 
        { 
          $group: { 
            _id: { $month: '$purchaseDate' }, 
            total: { $sum: '$finalPrice' }, 
            count: { $sum: 1 } 
          } 
        } 
      ]) 
    ]); 
 
    // Combine monthly data 
    const monthlyTotals = {}; 
    [...monthlySpending[0], ...monthlySpending[1], ...monthlySpending[2]].forEach(item => { 
      if (!monthlyTotals[item._id]) { 
        monthlyTotals[item._id] = { total: 0, count: 0 }; 
      } 
      monthlyTotals[item._id].total += item.total; 
      monthlyTotals[item._id].count += item.count; 
    }); 
 
    reportData.summary.monthlyBreakdown = Object.keys(monthlyTotals) 
      .sort() 
      .map(month => ({ 
        month: parseInt(month), 
        monthName: new Date(2000, month - 1).toLocaleString('default', { month: 'long' }), 
        total: monthlyTotals[month].total.toFixed(2), 
        itemCount: monthlyTotals[month].count 
      })); 
 
    // Overall summary 
    const totalYearSpending = Object.values(monthlyTotals).reduce((sum, month) => sum + 
month.total, 0); 
    const totalItems = Object.values(monthlyTotals).reduce((sum, month) => sum + 
month.count, 0); 
 
    reportData.summary.overview = { 
      totalSpending: totalYearSpending.toFixed(2), 
      totalItems, 
      averagePerItem: totalItems > 0 ? (totalYearSpending / totalItems).toFixed(2) : 0, 
      averagePerMonth: (totalYearSpending / 12).toFixed(2) 
    }; 
 
    res.status(200).json({ 
      success: true, 
      data: reportData 
    }); 
 
  } catch (error) { 
    console.error('Generate spending report error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Plan future shopping budget 
// @route   POST /api/budget/plan 
// @access  Private 
const planFutureBudget = async (req, res) => { 
  try { 
    const errors = validationResult(req); 
    if (!errors.isEmpty()) { 
      return res.status(400).json({ 
        success: false, 
        message: 'Validation errors', 
        errors: errors.array() 
      }); 
    } 
 
    const userId = req.user.userId; 
    const { event, estimatedBudget, targetDate, items } = req.body; 
 
    // Get current budget 
    const currentYear = new Date().getFullYear(); 
    const budget = await Budget.findOne({ user: userId, year: currentYear }); 
 
    if (!budget) { 
      return res.status(404).json({ 
        success: false, 
        message: 'No active budget found. Please create an annual budget first.' 
      }); 
    } 
 
    // Calculate current spending 
    const currentSpending = await Promise.all([ 
      Menswear.aggregate([ 
        { 
          $match: { 
            user: userId, 
            $expr: { $eq: [{ $year: '$purchaseDate' }, currentYear] } 
          } 
        }, 
        { $group: { _id: null, total: { $sum: '$finalPrice' } } } 
      ]), 
      Womenswear.aggregate([ 
        { 
          $match: { 
            user: userId, 
            $expr: { $eq: [{ $year: '$purchaseDate' }, currentYear] } 
          } 
        }, 
        { $group: { _id: null, total: { $sum: '$finalPrice' } } } 
      ]), 
      Kidswear.aggregate([ 
        { 
          $match: { 
            user: userId, 
            $expr: { $eq: [{ $year: '$purchaseDate' }, currentYear] } 
          } 
        }, 
        { $group: { _id: null, total: { $sum: '$finalPrice' } } } 
      ]) 
    ]); 
 
    const totalCurrentSpending = currentSpending.reduce((sum, category) => { 
      return sum + (category[0]?.total || 0); 
    }, 0); 
 
    const remainingBudget = budget.totalBudget - totalCurrentSpending; 
 
    // Create shopping plan 
    const shoppingPlan = { 
      user: userId, 
      event, 
      estimatedBudget, 
      targetDate, 
      items: items || [], 
      currentBudgetStatus: { 
        totalBudget: budget.totalBudget, 
        currentSpending: totalCurrentSpending, 
        remainingBudget, 
        canAfford: remainingBudget >= estimatedBudget 
      }, 
      recommendations: [] 
    }; 
 
    // Add recommendations 
    if (!shoppingPlan.currentBudgetStatus.canAfford) { 
      shoppingPlan.recommendations.push({ 
        type: 'warning', 
        message: `Budget shortfall of $${(estimatedBudget - remainingBudget).toFixed(2)}`, 
        suggestion: 'Consider reducing the budget or postponing some purchases' 
      }); 
    } 
 
    if (estimatedBudget > (remainingBudget * 0.5)) { 
      shoppingPlan.recommendations.push({ 
        type: 'caution', 
        message: 'This purchase will use more than 50% of your remaining budget', 
        suggestion: 'Consider spreading purchases over multiple months' 
      }); 
    } 
 
    // Save the plan (you might want to create a separate model for this) 
    // For now, we'll just return the plan 
 
    res.status(200).json({ 
      success: true, 
      message: 'Future shopping budget planned successfully', 
      data: shoppingPlan 
    }); 
 
  } catch (error) { 
    console.error('Plan future budget error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
// @desc    Get budget analytics 
// @route   GET /api/budget/analytics 
// @access  Private 
const getBudgetAnalytics = async (req, res) => { 
  try { 
    const userId = req.user.userId; 
    const currentYear = new Date().getFullYear(); 
 
    // Get budget and spending data 
    const budget = await Budget.findOne({ user: userId, year: currentYear }); 
     
    const analytics = { 
      budgetEfficiency: {}, 
      spendingTrends: {}, 
      categoryAnalysis: {}, 
      recommendations: [] 
    }; 
 
    if (budget) { 
      // Calculate budget efficiency 
      const currentSpending = await Promise.all([ 
        Menswear.aggregate([ 
          { 
            $match: { 
              user: userId, 
              $expr: { $eq: [{ $year: '$purchaseDate' }, currentYear] } 
            } 
          }, 
          { $group: { _id: null, total: { $sum: '$finalPrice' } } } 
        ]), 
        Womenswear.aggregate([ 
          { 
            $match: { 
              user: userId, 
              $expr: { $eq: [{ $year: '$purchaseDate' }, currentYear] } 
            } 
          }, 
          { $group: { _id: null, total: { $sum: '$finalPrice' } } } 
        ]), 
        Kidswear.aggregate([ 
          { 
            $match: { 
              user: userId, 
              $expr: { $eq: [{ $year: '$purchaseDate' }, currentYear] } 
            } 
          }, 
          { $group: { _id: null, total: { $sum: '$finalPrice' } } } 
        ]) 
      ]); 
 
      const totalSpending = currentSpending.reduce((sum, category) => { 
        return sum + (category[0]?.total || 0); 
      }, 0); 
 
      analytics.budgetEfficiency = { 
        totalBudget: budget.totalBudget, 
        totalSpent: totalSpending, 
        remainingBudget: budget.totalBudget - totalSpending, 
        utilizationRate: ((totalSpending / budget.totalBudget) * 100).toFixed(2), 
        projectedYearEndSpending: (totalSpending / (new Date().getMonth() + 1)) * 12 
      }; 
 
      // Generate recommendations 
      if (analytics.budgetEfficiency.utilizationRate > 90) { 
        analytics.recommendations.push({ 
          type: 'warning', 
          message: 'Budget utilization is over 90%. Consider reducing spending for the rest of the year.' 
        }); 
      } 
 
      if (analytics.budgetEfficiency.projectedYearEndSpending > budget.totalBudget) { 
        analytics.recommendations.push({ 
          type: 'alert', 
          message: `Based on current spending patterns, you may exceed your budget by 
${(analytics.budgetEfficiency.projectedYearEndSpending - 
budget.totalBudget).toFixed(2)}` 
        }); 
      } 
    } 
 
    res.status(200).json({ 
      success: true, 
      data: analytics 
    }); 
 
  } catch (error) { 
    console.error('Get budget analytics error:', error); 
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    }); 
  } 
}; 
 
module.exports = { 
  getBudget, 
  createBudget, 
  getSpendingSummary, 
  generateSpendingReport, 
  planFutureBudget, 
getBudgetAnalytics 
};