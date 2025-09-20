import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiAlertTriangle, FiTarget, FiCalendar, FiShoppingBag, FiPieChart } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { useBudget } from '../../hooks/useBudget';
import { useWardrobe } from '../../hooks/useWardrobe';
import { toast } from 'react-hot-toast';

const BudgetDashboard = () => {
  const [timeframe, setTimeframe] = useState('monthly');
  const [budgetData, setBudgetData] = useState(null);
  const [spendingData, setSpendingData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);

  const { getBudgetSummary, getSpendingHistory, getCategoryBreakdown } = useBudget();
  const { getAllItems } = useWardrobe();

  useEffect(() => {
    loadDashboardData();
  }, [timeframe]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [budget, spending, categories] = await Promise.all([
        getBudgetSummary(timeframe),
        getSpendingHistory(timeframe),
        getCategoryBreakdown(timeframe)
      ]);

      setBudgetData(budget);
      setSpendingData(spending);
      setCategoryData(categories);
      
      // Generate alerts based on spending patterns
      generateAlerts(budget, spending);
    } catch (error) {
      toast.error('Failed to load budget data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAlerts = (budget, spending) => {
    const newAlerts = [];
    
    if (budget) {
      // Budget exceeded alert
      if (budget.spent > budget.limit) {
        newAlerts.push({
          type: 'danger',
          message: `Budget exceeded by $${(budget.spent - budget.limit).toFixed(2)}`,
          icon: FiAlertTriangle
        });
      }
      
      // Warning when approaching budget limit
      else if (budget.spent > budget.limit * 0.8) {
        newAlerts.push({
          type: 'warning',
          message: `80% of budget used. $${(budget.limit - budget.spent).toFixed(2)} remaining`,
          icon: FiAlertTriangle
        });
      }

      // Spending trend alert
      if (spending.length >= 2) {
        const recentSpending = spending.slice(-2);
        const increase = ((recentSpending[1].amount - recentSpending[0].amount) / recentSpending[0].amount) * 100;
        
        if (increase > 50) {
          newAlerts.push({
            type: 'warning',
            message: `Spending increased by ${increase.toFixed(1)}% from last period`,
            icon: FiTrendingUp
          });
        }
      }
    }

    setAlerts(newAlerts);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getBudgetProgress = () => {
    if (!budgetData) return 0;
    return Math.min((budgetData.spent / budgetData.limit) * 100, 100);
  };

  const getProgressColor = () => {
    const progress = getBudgetProgress();
    if (progress >= 100) return 'bg-red-500';
    if (progress >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  const calculateSavings = () => {
    if (!budgetData) return 0;
    return Math.max(budgetData.limit - budgetData.spent, 0);
  };

  const getSpendingTrend = () => {
    if (spendingData.length < 2) return null;
    
    const recent = spendingData.slice(-2);
    const change = recent[1].amount - recent[0].amount;
    const percentage = ((change / recent[0].amount) * 100).toFixed(1);
    
    return {
      change,
      percentage,
      isIncrease: change > 0
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const spendingTrend = getSpendingTrend();

  return (
    <div className="budget-dashboard space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Dashboard</h1>
          <p className="text-gray-600">Track your fashion spending and budget progress</p>
        </div>
        <div className="mt-4 md:mt-0">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="weekly">This Week</option>
            <option value="monthly">This Month</option>
            <option value="quarterly">This Quarter</option>
            <option value="yearly">This Year</option>
          </select>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                alert.type === 'danger' 
                  ? 'bg-red-50 border-red-400 text-red-700'
                  : 'bg-yellow-50 border-yellow-400 text-yellow-700'
              }`}
            >
              <div className="flex items-center">
                <alert.icon className="w-5 h-5 mr-2" />
                <span>{alert.message}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Budget */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budget</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(budgetData?.limit || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FiTarget className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(budgetData?.spent || 0)}
              </p>
              {spendingTrend && (
                <div className={`flex items-center text-sm ${
                  spendingTrend.isIncrease ? 'text-red-600' : 'text-green-600'
                }`}>
                  {spendingTrend.isIncrease ? <FiTrendingUp /> : <FiTrendingDown />}
                  <span className="ml-1">{spendingTrend.percentage}%</span>
                </div>
              )}
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FiDollarSign className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        {/* Remaining Budget */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(calculateSavings())}
              </p>
              <p className="text-sm text-gray-500">
                {getBudgetProgress().toFixed(1)}% of budget used
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FiShoppingBag className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Budget Progress */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Progress</p>
              <p className="text-lg font-bold text-gray-900">{getBudgetProgress().toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <FiPieChart className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${getBudgetProgress()}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Trend Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={spendingData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6' }}
              />
              <Line 
                type="monotone" 
                dataKey="budget" 
                stroke="#EF4444" 
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={{ fill: '#EF4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Details */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Category Breakdown</h3>
          <div className="space-y-4">
            {categoryData.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">
                    {formatCurrency(category.value)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {budgetData && ((category.value / budgetData.spent) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Comparison</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={spendingData.slice(-6)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
              <Bar dataKey="amount" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {budgetData?.totalItems || 0}
            </div>
            <div className="text-sm text-gray-600">Items Purchased</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(budgetData?.avgItemCost || 0)}
            </div>
            <div className="text-sm text-gray-600">Avg. Item Cost</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {budgetData?.daysRemaining || 0}
            </div>
            <div className="text-sm text-gray-600">Days Remaining</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(budgetData?.dailyBudget || 0)}
            </div>
            <div className="text-sm text-gray-600">Daily Budget</div>
          </div>
        </div>
      </div>

      {/* Budget Recommendations */}
      {budgetData && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
          <h3 className="text-lg font-medium text-blue-900 mb-4 flex items-center">
            <FiTarget className="w-5 h-5 mr-2" />
            Budget Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">Spending Insights:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                {getBudgetProgress() > 90 && (
                  <li>• Consider pausing non-essential purchases this period</li>
                )}
                {spendingTrend && spendingTrend.isIncrease && (
                  <li>• Your spending has increased {spendingTrend.percentage}% - review recent purchases</li>
                )}
                {calculateSavings() > 0 && (
                  <li>• Great job! You have {formatCurrency(calculateSavings())} left in your budget</li>
                )}
                <li>• Your highest spending category needs attention</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-800">Next Steps:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Set up spending alerts to stay on track</li>
                <li>• Review your cost-per-wear on existing items</li>
                <li>• Consider creating sub-budgets for each category</li>
                <li>• Plan your purchases around sales and discounts</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetDashboard;