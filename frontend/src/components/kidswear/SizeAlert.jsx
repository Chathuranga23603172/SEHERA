import React, { useState, useEffect } from 'react';
import { FiAlertTriangle, FiClock, FiTrendingUp, FiX, FiCheck, FiShoppingCart, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const SizeAlert = ({ 
  alerts = [], 
  onDismissAlert, 
  onMarkAsChecked, 
  onAddToShoppingList,
  onScheduleReminder,
  children = []
}) => {
  const [filteredAlerts, setFilteredAlerts] = useState(alerts);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('severity');
  const [showDismissed, setShowDismissed] = useState(false);
  const [selectedAlerts, setSelectedAlerts] = useState([]);

  useEffect(() => {
    filterAndSortAlerts();
  }, [alerts, filter, sortBy, showDismissed]);

  const filterAndSortAlerts = () => {
    let filtered = [...alerts];

    // Filter by type
    if (filter !== 'all') {
      filtered = filtered.filter(alert => alert.type === filter);
    }

    // Show/hide dismissed alerts
    if (!showDismissed) {
      filtered = filtered.filter(alert => !alert.dismissed);
    }

    // Sort alerts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'severity':
          const severityOrder = { high: 3, medium: 2, low: 1 };
          return (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0);
        case 'date':
          return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
        case 'child':
          return (a.childName || '').localeCompare(b.childName || '');
        case 'item':
          return (a.item || '').localeCompare(b.item || '');
        default:
          return 0;
      }
    });

    setFilteredAlerts(filtered);
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'size_check':
        return <FiTrendingUp className="text-orange-500" size={20} />;
      case 'rapid_growth':
        return <FiAlertTriangle className="text-red-500" size={20} />;
      case 'seasonal_reminder':
        return <FiCalendar className="text-blue-500" size={20} />;
      case 'unused_item':
        return <FiClock className="text-gray-500" size={20} />;
      default:
        return <FiAlertTriangle className="text-yellow-500" size={20} />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-orange-200 bg-orange-50';
      case 'low':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getAlertTypeLabel = (type) => {
    switch (type) {
      case 'size_check':
        return 'Size Check Required';
      case 'rapid_growth':
        return 'Rapid Growth Alert';
      case 'seasonal_reminder':
        return 'Seasonal Reminder';
      case 'unused_item':
        return 'Unused Item';
      default:
        return 'General Alert';
    }
  };

  const handleDismiss = (alertId) => {
    onDismissAlert(alertId);
    toast.success('Alert dismissed');
  };

  const handleMarkChecked = (alertId) => {
    onMarkAsChecked(alertId);
    toast.success('Marked as checked');
  };

  const handleBulkAction = (action) => {
    if (selectedAlerts.length === 0) {
      toast.error('Please select alerts first');
      return;
    }

    switch (action) {
      case 'dismiss':
        selectedAlerts.forEach(id => onDismissAlert(id));
        toast.success(`${selectedAlerts.length} alerts dismissed`);
        break;
      case 'check':
        selectedAlerts.forEach(id => onMarkAsChecked(id));
        toast.success(`${selectedAlerts.length} alerts marked as checked`);
        break;
      case 'shopping':
        selectedAlerts.forEach(id => {
          const alert = alerts.find(a => a.id === id);
          if (alert) onAddToShoppingList(alert);
        });
        toast.success(`${selectedAlerts.length} items added to shopping list`);
        break;
    }
    
    setSelectedAlerts([]);
  };

  const toggleSelectAlert = (alertId) => {
    setSelectedAlerts(prev => 
      prev.includes(alertId)
        ? prev.filter(id => id !== alertId)
        : [...prev, alertId]
    );
  };

  const selectAllAlerts = () => {
    if (selectedAlerts.length === filteredAlerts.length) {
      setSelectedAlerts([]);
    } else {
      setSelectedAlerts(filteredAlerts.map(alert => alert.id));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FiAlertTriangle className="mr-2 text-orange-500" />
          Size Alerts ({filteredAlerts.length})
        </h2>
        
        <div className="flex items-center space-x-4">
          {/* Filter Controls */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="all">All Alerts</option>
            <option value="size_check">Size Check</option>
            <option value="rapid_growth">Rapid Growth</option>
            <option value="seasonal_reminder">Seasonal</option>
            <option value="unused_item">Unused Items</option>
          </select>
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="severity">Sort by Severity</option>
            <option value="date">Sort by Date</option>
            <option value="child">Sort by Child</option>
            <option value="item">Sort by Item</option>
          </select>
          
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={showDismissed}
              onChange={(e) => setShowDismissed(e.target.checked)}
              className="mr-2"
            />
            Show Dismissed
          </label>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedAlerts.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-blue-800">
              {selectedAlerts.length} alert(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => handleBulkAction('check')}
                className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
              >
                Mark as Checked
              </button>
              <button
                onClick={() => handleBulkAction('shopping')}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Add to Shopping List
              </button>
              <button
                onClick={() => handleBulkAction('dismiss')}
                className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
              >
                Dismiss All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select All */}
      {filteredAlerts.length > 0 && (
        <div className="mb-4">
          <label className="flex items-center text-sm text-gray-600">
            <input
              type="checkbox"
              checked={selectedAlerts.length === filteredAlerts.length}
              onChange={selectAllAlerts}
              className="mr-2"
            />
            Select All Alerts
          </label>
        </div>
      )}

      {/* Alert List */}
      {filteredAlerts.length === 0 ? (
        <div className="text-center py-12">
          <FiCheck className="mx-auto h-12 w-12 text-green-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all' 
              ? 'All size alerts have been addressed!'
              : 'No alerts match your current filter.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`border rounded-lg p-4 ${getSeverityColor(alert.severity)} ${
                alert.dismissed ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedAlerts.includes(alert.id)}
                  onChange={() => toggleSelectAlert(alert.id)}
                  className="mt-1"
                />

                {/* Alert Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getAlertIcon(alert.type)}
                </div>

                {/* Alert Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {alert.item}
                        {alert.dismissed && (
                          <span className="ml-2 text-xs text-gray-500">(Dismissed)</span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                      
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          {getAlertTypeLabel(alert.type)}
                        </span>
                        
                        {alert.childName && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                            {alert.childName}
                          </span>
                        )}
                        
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                          alert.severity === 'medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alert.severity} priority
                        </span>
                        
                        {alert.createdAt && (
                          <span className="text-xs text-gray-500">
                            {new Date(alert.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Additional Info */}
                      {alert.lastWorn && (
                        <p className="text-xs text-gray-500 mt-2">
                          Last worn: {new Date(alert.lastWorn).toLocaleDateString()}
                        </p>
                      )}
                      
                      {alert.recommendedAction && (
                        <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                          <p className="text-xs font-medium text-gray-700">Recommended Action:</p>
                          <p className="text-xs text-gray-600">{alert.recommendedAction}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2 ml-4">
                      {!alert.dismissed && (
                        <>
                          <button
                            onClick={() => handleMarkChecked(alert.id)}
                            className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                            title="Mark as Checked"
                          >
                            <FiCheck size={16} />
                          </button>
                          
                          <button
                            onClick={() => onAddToShoppingList(alert)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                            title="Add to Shopping List"
                          >
                            <FiShoppingCart size={16} />
                          </button>
                          
                          <button
                            onClick={() => onScheduleReminder && onScheduleReminder(alert)}
                            className="p-2 text-purple-600 hover:text-purple-800 hover:bg-purple-100 rounded"
                            title="Schedule Reminder"
                          >
                            <FiCalendar size={16} />
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => handleDismiss(alert.id)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
                        title="Dismiss Alert"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {alerts.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">
                {alerts.filter(a => a.severity === 'high').length}
              </p>
              <p className="text-sm text-gray-600">High Priority</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {alerts.filter(a => a.severity === 'medium').length}
              </p>
              <p className="text-sm text-gray-600">Medium Priority</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {alerts.filter(a => a.severity === 'low').length}
              </p>
              <p className="text-sm text-gray-600">Low Priority</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">
                {alerts.filter(a => a.dismissed).length}
              </p>
              <p className="text-sm text-gray-600">Dismissed</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Panel */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>Next check recommended in 30 days</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
              Export Report
            </button>
            <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">
              Schedule Bulk Check
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeAlert;