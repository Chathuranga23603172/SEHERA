import React, { useState, useEffect } from 'react';
import { FiDownload, FiFilter, FiBarChart2, FiTrendingUp, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useBudget } from '../../hooks/useBudget';
import { toast } from 'react-hot-toast';

const SpendingReport = () => {
  const [reportData, setReportData] = useState({
    summary: null,
    trends: [],
    categoryBreakdown: [],
    itemDetails: [],
    comparisons: []
  });
  const [filters, setFilters] = useState({
    dateRange: 'last30days',
    category: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const { getSpendingReport, exportReport } = useBudget();

  useEffect(() => {
    loadReportData();
  }, [filters]);

  const loadReportData = async () => {
    setIsLoading(true);
    try {
      const data = await getSpendingReport(filters);
      setReportData(data);
    } catch (error) {
      toast.error('Failed to load spending report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const exportToPDF = async () => {
    try {
      const blob = await exportReport(filters, 'pdf');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `spending-report-${Date.now()}.pdf`;
      link.click();
      toast.success('Report exported to PDF successfully!');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

  const exportToExcel = async () => {
    try {
      const blob = await exportReport(filters, 'excel');
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `spending-report-${Date.now()}.xlsx`;
      link.click();
      toast.success('Report exported to Excel successfully!');
    } catch (error) {
      toast.error('Failed to export report');
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
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="spending-report space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Spending Report</h1>
          <p className="text-gray-600">Detailed analysis of your fashion spending patterns</p>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
          >
            <FiDownload className="w-4 h-4" />
            Export PDF
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
          >
            <FiDownload className="w-4 h-4" />
            Export Excel
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="w-5 h-5 text-gray-600" />
          <h3 className="font-medium text-gray-800">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="last7days">Last 7 Days</option>
              <option value="last30days">Last 30 Days</option>
              <option value="last3months">Last 3 Months</option>
              <option value="last6months">Last 6 Months</option>
              <option value="lastyear">Last Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="menswear">Menswear</option>
              <option value="womenswear">Womenswear</option>
              <option value="kidswear">Kidswear</option>
              <option value="accessories">Accessories</option>
              <option value="shoes">Shoes</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
              <option value="category">Category</option>
              <option value="brand">Brand</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Order</label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {reportData.summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(reportData.summary.totalSpent)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FiDollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {reportData.summary.spentChange > 0 ? '+' : ''}{reportData.summary.spentChange.toFixed(1)}% from previous period
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalTransactions}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <FiBarChart2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Avg: {formatCurrency(reportData.summary.avgTransactionAmount)}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Top Category</p>
                <p className="text-xl font-bold text-gray-900">{reportData.summary.topCategory.name}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <FiTrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              {formatCurrency(reportData.summary.topCategory.amount)} ({reportData.summary.topCategory.percentage}%)
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Monthly</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(reportData.summary.avgMonthlySpending)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <FiCalendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Based on current period
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'overview', name: 'Overview', icon: FiBarChart2 },
              { id: 'trends', name: 'Trends', icon: FiTrendingUp },
              { id: 'categories', name: 'Categories', icon: FiDollarSign },
              { id: 'details', name: 'Transaction Details', icon: FiCalendar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spending Trend */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Spending Trend</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Distribution */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Category Distribution</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData.categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportData.categoryBreakdown.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Trends Tab */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Spending Trends</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={reportData.trends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Amount']} />
                    <Legend />
                    <Bar dataKey="amount" fill="#3B82F6" />
                    <Bar dataKey="budget" fill="#EF4444" fillOpacity={0.6} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Trend Analysis */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-800 mb-2">Trend Analysis</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Highest Month:</span>
                    <div className="font-medium">
                      {reportData.trends.reduce((max, month) => month.amount > max.amount ? month : max, reportData.trends[0])?.period}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Lowest Month:</span>
                    <div className="font-medium">
                      {reportData.trends.reduce((min, month) => month.amount < min.amount ? month : min, reportData.trends[0])?.period}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Average Growth:</span>
                    <div className="font-medium">
                      {reportData.summary?.avgGrowthRate ? `${reportData.summary.avgGrowthRate.toFixed(1)}%` : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Category Analysis</h3>
                <div className="space-y-4">
                  {reportData.categoryBreakdown.map((category, index) => (
                    <div key={category.name} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div
                            className="w-4 h-4 rounded-full mr-3"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <h4 className="font-medium text-gray-800">{category.name}</h4>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">
                            {formatCurrency(category.value)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {category.percentage?.toFixed(1)}% of total
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Items:</span>
                          <div className="font-medium">{category.itemCount || 0}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Avg Price:</span>
                          <div className="font-medium">
                            {formatCurrency(category.avgPrice || 0)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Growth:</span>
                          <div className={`font-medium ${
                            (category.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {(category.growth || 0) >= 0 ? '+' : ''}{(category.growth || 0).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Transaction Details</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Brand
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.itemDetails.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(item.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.brand}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {reportData.itemDetails.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No transactions found for the selected filters.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpendingReport;