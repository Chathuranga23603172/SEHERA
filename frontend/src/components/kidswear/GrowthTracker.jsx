import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiUser, FiCalendar, FiBarChart3, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const GrowthTracker = ({ 
  kidswearItems = [],
  childProfile = null,
  onUpdateProfile,
  onSizeAlert
}) => {
  const [selectedChild, setSelectedChild] = useState(childProfile?.id || '');
  const [timeRange, setTimeRange] = useState('6months');
  const [growthData, setGrowthData] = useState([]);
  const [sizeAlerts, setSizeAlerts] = useState([]);

  // Mock child profiles - in real app this would come from props or API
  const childProfiles = [
    { id: '1', name: 'Emma', birthDate: '2018-05-15', currentAge: '5 years' },
    { id: '2', name: 'Jake', birthDate: '2020-08-22', currentAge: '3 years' },
    { id: '3', name: 'Sophie', birthDate: '2015-03-10', currentAge: '8 years' }
  ];

  useEffect(() => {
    generateGrowthData();
    checkSizeAlerts();
  }, [selectedChild, kidswearItems, timeRange]);

  const generateGrowthData = () => {
    // Generate mock growth tracking data
    const months = timeRange === '6months' ? 6 : timeRange === '1year' ? 12 : 24;
    const data = [];
    
    for (let i = months; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      // Calculate size progression (mock data)
      const baseSize = 6; // Starting size
      const growth = (months - i) * 0.3; // Growth rate
      
      data.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        size: baseSize + growth,
        items: Math.floor(Math.random() * 5) + 2, // Number of items purchased
        outgrown: Math.floor(Math.random() * 3) // Items outgrown
      });
    }
    
    setGrowthData(data);
  };

  const checkSizeAlerts = () => {
    const alerts = [];
    const currentDate = new Date();
    
    kidswearItems.forEach(item => {
      // Check if item hasn't been worn in 3+ months
      if (item.lastWorn) {
        const lastWornDate = new Date(item.lastWorn);
        const daysSinceWorn = (currentDate - lastWornDate) / (1000 * 60 * 60 * 24);
        
        if (daysSinceWorn > 90) {
          alerts.push({
            id: item._id,
            type: 'size_check',
            item: item.name,
            message: `${item.name} hasn't been worn in ${Math.floor(daysSinceWorn)} days. Size check recommended.`,
            severity: 'warning',
            ageGroup: item.ageGroup
          });
        }
      }
      
      // Check for rapid growth periods (baby/toddler items)
      if (item.ageGroup === 'Baby (0-36 months)' && item.purchaseDate) {
        const purchaseDate = new Date(item.purchaseDate);
        const monthsSincePurchase = (currentDate - purchaseDate) / (1000 * 60 * 60 * 24 * 30);
        
        if (monthsSincePurchase > 3 && item.usageCount < 5) {
          alerts.push({
            id: item._id,
            type: 'rapid_growth',
            item: item.name,
            message: `${item.name} may be outgrown due to rapid growth phase.`,
            severity: 'high',
            ageGroup: item.ageGroup
          });
        }
      }
    });
    
    setSizeAlerts(alerts);
    if (onSizeAlert) {
      onSizeAlert(alerts);
    }
  };

  const getSizeDistribution = () => {
    const sizeCount = {};
    kidswearItems.forEach(item => {
      sizeCount[item.size] = (sizeCount[item.size] || 0) + 1;
    });
    
    return Object.entries(sizeCount).map(([size, count]) => ({
      size,
      count
    }));
  };

  const getUsageAnalytics = () => {
    const totalItems = kidswearItems.length;
    const wornItems = kidswearItems.filter(item => item.usageCount > 0).length;
    const averageUsage = kidswearItems.reduce((sum, item) => sum + item.usageCount, 0) / totalItems;
    const underutilized = kidswearItems.filter(item => item.usageCount < 3).length;
    
    return {
      totalItems,
      wornItems,
      averageUsage: averageUsage.toFixed(1),
      underutilized,
      utilizationRate: ((wornItems / totalItems) * 100).toFixed(1)
    };
  };

  const analytics = getUsageAnalytics();
  const sizeDistribution = getSizeDistribution();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <FiTrendingUp className="mr-2" />
          Growth Tracker
        </h2>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="">Select Child</option>
            {childProfiles.map(child => (
              <option key={child.id} value={child.id}>
                {child.name} ({child.currentAge})
              </option>
            ))}
          </select>
          
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
            <option value="2years">Last 2 Years</option>
          </select>
        </div>
      </div>

      {/* Size Alerts */}
      {sizeAlerts.length > 0 && (
        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
            <FiAlertTriangle className="mr-2" />
            Size Alerts ({sizeAlerts.length})
          </h3>
          <div className="space-y-2">
            {sizeAlerts.map(alert => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-white rounded border">
                <FiAlertTriangle 
                  className={`mt-1 ${alert.severity === 'high' ? 'text-red-500' : 'text-orange-500'}`} 
                  size={16} 
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{alert.item}</p>
                  <p className="text-sm text-gray-600">{alert.message}</p>
                  <span className="inline-block mt-1 px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                    {alert.ageGroup}
                  </span>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm">
                  Check Size
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600">Total Items</p>
              <p className="text-2xl font-bold text-blue-900">{analytics.totalItems}</p>
            </div>
            <FiUser className="text-blue-500" size={24} />
          </div>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Utilization Rate</p>
              <p className="text-2xl font-bold text-green-900">{analytics.utilizationRate}%</p>
            </div>
            <FiCheckCircle className="text-green-500" size={24} />
          </div>
        </div>
        
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600">Underutilized</p>
              <p className="text-2xl font-bold text-orange-900">{analytics.underutilized}</p>
            </div>
            <FiAlertTriangle className="text-orange-500" size={24} />
          </div>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600">Avg. Usage</p>
              <p className="text-2xl font-bold text-purple-900">{analytics.averageUsage}</p>
            </div>
            <FiBarChart3 className="text-purple-500" size={24} />
          </div>
        </div>
      </div>

      {/* Growth Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Progression</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="size" 
                stroke="#3B82F6" 
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Size Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Size Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sizeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="size" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Tips */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Growth Tips</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900">Regular Size Checks</h4>
              <p className="text-sm text-blue-700">Check clothing fit every 2-3 months for growing children.</p>
            </div>
            
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900">Buy Smart</h4>
              <p className="text-sm text-green-700">Consider buying slightly larger sizes for rapid growth periods.</p>
            </div>
            
            <div className="p-3 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900">Track Usage</h4>
              <p className="text-sm text-purple-700">Monitor which items are worn frequently vs. rarely used.</p>
            </div>
            
            <div className="p-3 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-900">Seasonal Planning</h4>
              <p className="text-sm text-orange-700">Plan ahead for seasonal clothing needs and growth spurts.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex justify-end space-x-4">
        <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          Export Report
        </button>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Schedule Size Check
        </button>
      </div>
    </div>
  );
};

export default GrowthTracker;