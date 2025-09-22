import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiAlertCircle, FiInfo, FiX, FiBell, FiSettings, FiTarget, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useBudget } from '../../hooks/useBudget';

const BudgetAlert = ({ onClose, alerts: initialAlerts }) => {
  const [alerts, setAlerts] = useState(initialAlerts || []);
  const [alertSettings, setAlertSettings] = useState({
    budgetThreshold: 80,
    dailySpendingLimit: 50,
    weeklySpendingLimit: 200,
    monthlySpendingLimit: 800,
    enableEmailAlerts: true,
    enablePushAlerts: true,
    enableSMSAlerts: false
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { getBudgetAlerts, updateAlertSettings, dismissAlert, getAlertSettings } = useBudget();

  useEffect(() => {
    loadAlerts();
    loadAlertSettings();
  }, []);

  const loadAlerts = async () => {
    try {
      const data = await getBudgetAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  const loadAlertSettings = async () => {
    try {
      const settings = await getAlertSettings();
      setAlertSettings(settings);
    } catch (error) {
      console.error('Failed to load alert settings:', error);
    }
  };

  const handleDismissAlert = async (alertId) => {
    try {
      await dismissAlert(alertId);
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      toast.success('Alert dismissed');
    } catch (error) {
      toast.error('Failed to dismiss alert');
    }
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await updateAlertSettings(alertSettings);
      toast.success('Alert settings updated successfully!');
      setShowSettings(false);
    } catch (error) {
      toast.error('Failed to update alert settings');
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'danger':
        return <FiAlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <FiAlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <FiInfo className="w-5 h-5 text-blue-500" />;
      case 'success':
        return <FiTarget className="w-5 h-5 text-green-500" />;
      default:
        return <FiBell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'danger':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const generateSampleAlerts = () => [
    {
      id: 1,
      type: 'danger',
      title: 'Budget Exceeded',
      message: 'You have exceeded your monthly budget by $127.50. Consider reviewing your recent purchases.',
      amount: 127.50,
      category: 'Monthly Budget',
      timestamp: new Date().toISOString(),
      isRead: false
    },
    {
      id: 2,
      type: 'warning',
      title: 'Approaching Budget Limit',
      message: 'You have used 85% of your monthly budget. $150 remaining until limit.',
      amount: 150,
      category: 'Monthly Budget',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isRead: false
    },
    {
      id: 3,
      type: 'info',
      title: 'Category Spending Update',
      message: 'Your spending on Accessories has increased by 30% this month compared to last month.',
      category: 'Accessories',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      isRead: true
    },
    {
      id: 4,
      type: 'success',
      title: 'Budget Goal Achieved',
      message: 'Congratulations! You stayed within your budget this week and saved $75.',
      amount: 75,
      category: 'Weekly Budget',
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      isRead: true
    }
  ];

  // Use sample alerts if no alerts are provided
  const displayAlerts = alerts.length > 0 ? alerts : generateSampleAlerts();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FiBell className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Budget Alerts</h2>
              <p className="text-sm text-gray-600">
                {displayAlerts.filter(alert => !alert.isRead).length} unread alerts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            >
              <FiSettings className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Alert Settings */}
        {showSettings && (
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Alert Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Alert Threshold (%)
                </label>
                <input
                  type="number"
                  value={alertSettings.budgetThreshold}
                  onChange={(e) => setAlertSettings(prev => ({
                    ...prev,
                    budgetThreshold: parseInt(e.target.value)
                  }))}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Spending Limit
                </label>
                <input
                  type="number"
                  value={alertSettings.dailySpendingLimit}
                  onChange={(e) => setAlertSettings(prev => ({
                    ...prev,
                    dailySpendingLimit: parseFloat(e.target.value)
                  }))}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weekly Spending Limit
                </label>
                <input
                  type="number"
                  value={alertSettings.weeklySpendingLimit}
                  onChange={(e) => setAlertSettings(prev => ({
                    ...prev,
                    weeklySpendingLimit: parseFloat(e.target.value)
                  }))}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Spending Limit
                </label>
                <input
                  type="number"
                  value={alertSettings.monthlySpendingLimit}
                  onChange={(e) => setAlertSettings(prev => ({
                    ...prev,
                    monthlySpendingLimit: parseFloat(e.target.value)
                  }))}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-medium text-gray-700">Notification Preferences</h4>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={alertSettings.enableEmailAlerts}
                  onChange={(e) => setAlertSettings(prev => ({
                    ...prev,
                    enableEmailAlerts: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Email Alerts</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={alertSettings.enablePushAlerts}
                  onChange={(e) => setAlertSettings(prev => ({
                    ...prev,
                    enablePushAlerts: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Push Notifications</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={alertSettings.enableSMSAlerts}
                  onChange={(e) => setAlertSettings(prev => ({
                    ...prev,
                    enableSMSAlerts: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">SMS Alerts</span>
              </label>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {isLoading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        )}

        {/* Alerts List */}
        <div className="p-6">
          {displayAlerts.length === 0 ? (
            <div className="text-center py-8">
              <FiBell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Alerts</h3>
              <p className="text-gray-600">You're all caught up! No budget alerts at this time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 rounded-lg border-l-4 ${getAlertColor(alert.type)} ${
                    !alert.isRead ? 'shadow-md' : 'opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getAlertIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-medium">{alert.title}</h4>
                          {!alert.isRead && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-sm">{alert.message}</p>
                        
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-4 text-xs">
                            <span className="flex items-center">
                              <FiTarget className="w-3 h-3 mr-1" />
                              {alert.category}
                            </span>
                            {alert.amount && (
                              <span className="flex items-center">
                                <FiTrendingUp className="w-3 h-3 mr-1" />
                                {formatCurrency(alert.amount)}
                              </span>
                            )}
                            <span>{formatDate(alert.timestamp)}</span>
                          </div>
                          
                          <button
                            onClick={() => handleDismissAlert(alert.id)}
                            className="text-xs text-gray-500 hover:text-gray-700 transition"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button className="p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50 transition">
                <div className="flex items-center">
                  <FiTarget className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-sm text-gray-700">Review Budget</span>
                </div>
              </button>
              
              <button className="p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50 transition">
                <div className="flex items-center">
                  <FiTrendingUp className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-sm text-gray-700">View Spending</span>
                </div>
              </button>
              
              <button className="p-3 text-left border border-gray-200 rounded-md hover:bg-gray-50 transition">
                <div className="flex items-center">
                  <FiSettings className="w-4 h-4 text-purple-600 mr-2" />
                  <span className="text-sm text-gray-700">Adjust Limits</span>
                </div>
              </button>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Alert Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600">
                  {displayAlerts.filter(a => a.type === 'danger').length}
                </div>
                <div className="text-xs text-red-600">Critical</div>
              </div>
              
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="text-lg font-bold text-yellow-600">
                  {displayAlerts.filter(a => a.type === 'warning').length}
                </div>
                <div className="text-xs text-yellow-600">Warning</div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {displayAlerts.filter(a => a.type === 'info').length}
                </div>
                <div className="text-xs text-blue-600">Info</div>
              </div>
              
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {displayAlerts.filter(a => a.type === 'success').length}
                </div>
                <div className="text-xs text-green-600">Success</div>
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Budget Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Set realistic budget limits based on your income and expenses</li>
              <li>• Review your spending patterns regularly to identify trends</li>
              <li>• Use category budgets to control spending in specific areas</li>
              <li>• Enable alerts to catch overspending before it becomes a problem</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetAlert;