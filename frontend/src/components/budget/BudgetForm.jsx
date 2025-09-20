import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiCalendar, FiTarget, FiSave, FiX, FiPlus, FiMinus } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useBudget } from '../../hooks/useBudget';

const BudgetForm = ({ budget, onSave, onCancel, mode = 'create' }) => {
  const [formData, setFormData] = useState({
    name: '',
    totalAmount: '',
    period: 'monthly',
    startDate: '',
    endDate: '',
    categories: [
      { name: 'Menswear', amount: '', percentage: 0 },
      { name: 'Womenswear', amount: '', percentage: 0 },
      { name: 'Kidswear', amount: '', percentage: 0 },
      { name: 'Accessories', amount: '', percentage: 0 },
      { name: 'Shoes', amount: '', percentage: 0 }
    ],
    autoAllocate: true,
    alertThreshold: 80,
    description: ''
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { createBudget, updateBudget } = useBudget();

  useEffect(() => {
    if (budget && mode === 'edit') {
      setFormData({
        ...budget,
        startDate: budget.startDate ? new Date(budget.startDate).toISOString().split('T')[0] : '',
        endDate: budget.endDate ? new Date(budget.endDate).toISOString().split('T')[0] : '',
        totalAmount: budget.totalAmount?.toString() || '',
        categories: budget.categories || formData.categories
      });
    } else {
      // Set default dates for new budget
      const today = new Date();
      const startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      
      setFormData(prev => ({
        ...prev,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      }));
    }
  }, [budget, mode]);

  useEffect(() => {
    if (formData.autoAllocate && formData.totalAmount) {
      autoAllocateCategories();
    }
  }, [formData.totalAmount, formData.autoAllocate]);

  const autoAllocateCategories = () => {
    const total = parseFloat(formData.totalAmount) || 0;
    if (total <= 0) return;

    // Default allocation percentages
    const defaultPercentages = {
      'Menswear': 25,
      'Womenswear': 35,
      'Kidswear': 15,
      'Accessories': 15,
      'Shoes': 10
    };

    const updatedCategories = formData.categories.map(category => ({
      ...category,
      percentage: defaultPercentages[category.name] || 0,
      amount: ((total * (defaultPercentages[category.name] || 0)) / 100).toFixed(2)
    }));

    setFormData(prev => ({
      ...prev,
      categories: updatedCategories
    }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryChange = (index, field, value) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      [field]: value
    };

    // If amount is changed, calculate percentage
    if (field === 'amount' && formData.totalAmount) {
      const percentage = ((parseFloat(value) || 0) / parseFloat(formData.totalAmount)) * 100;
      updatedCategories[index].percentage = Math.round(percentage * 100) / 100;
    }

    // If percentage is changed, calculate amount
    if (field === 'percentage' && formData.totalAmount) {
      const amount = ((parseFloat(value) || 0) * parseFloat(formData.totalAmount)) / 100;
      updatedCategories[index].amount = amount.toFixed(2);
    }

    setFormData(prev => ({
      ...prev,
      categories: updatedCategories
    }));
  };

  const addCategory = () => {
    setFormData(prev => ({
      ...prev,
      categories: [
        ...prev.categories,
        { name: '', amount: '', percentage: 0 }
      ]
    }));
  };

  const removeCategory = (index) => {
    if (formData.categories.length <= 1) {
      toast.error('At least one category is required');
      return;
    }

    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Budget name is required';
    }

    if (!formData.totalAmount || parseFloat(formData.totalAmount) <= 0) {
      newErrors.totalAmount = 'Total amount must be greater than 0';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    // Validate categories
    const totalCategoryAmount = formData.categories.reduce((sum, cat) => {
      return sum + (parseFloat(cat.amount) || 0);
    }, 0);

    const totalBudget = parseFloat(formData.totalAmount) || 0;
    if (Math.abs(totalCategoryAmount - totalBudget) > 0.01) {
      newErrors.categories = `Category amounts (${totalCategoryAmount.toFixed(2)}) don't match total budget (${totalBudget.toFixed(2)})`;
    }

    // Check for empty category names
    const hasEmptyCategory = formData.categories.some(cat => !cat.name.trim());
    if (hasEmptyCategory) {
      newErrors.categories = 'All categories must have names';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setIsLoading(true);
    try {
      const budgetData = {
        ...formData,
        totalAmount: parseFloat(formData.totalAmount),
        categories: formData.categories.map(cat => ({
          ...cat,
          amount: parseFloat(cat.amount) || 0
        }))
      };

      if (mode === 'edit') {
        await updateBudget(budget._id, budgetData);
        toast.success('Budget updated successfully!');
      } else {
        await createBudget(budgetData);
        toast.success('Budget created successfully!');
      }

      onSave(budgetData);
    } catch (error) {
      toast.error(`Failed to ${mode === 'edit' ? 'update' : 'create'} budget`);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalCategoryAmount = () => {
    return formData.categories.reduce((sum, cat) => sum + (parseFloat(cat.amount) || 0), 0);
  };

  const getTotalPercentage = () => {
    return formData.categories.reduce((sum, cat) => sum + (parseFloat(cat.percentage) || 0), 0);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FiTarget className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {mode === 'edit' ? 'Edit Budget' : 'Create New Budget'}
              </h2>
              <p className="text-sm text-gray-600">
                Set up your fashion spending budget and allocate funds to categories
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Monthly Fashion Budget"
                className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount *
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.totalAmount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.totalAmount && <p className="text-red-500 text-sm mt-1">{errors.totalAmount}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Period
              </label>
              <select
                name="period"
                value={formData.period}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alert Threshold (%)
              </label>
              <input
                type="number"
                name="alertThreshold"
                value={formData.alertThreshold}
                onChange={handleInputChange}
                min="0"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get notified when you reach this percentage of your budget
              </p>
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <div className="relative">
                <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Auto Allocate Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="autoAllocate"
              name="autoAllocate"
              checked={formData.autoAllocate}
              onChange={handleInputChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="autoAllocate" className="text-sm font-medium text-gray-700">
              Auto-allocate budget across categories
            </label>
          </div>

          {/* Category Allocation */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Category Allocation</h3>
              <button
                type="button"
                onClick={addCategory}
                className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm"
              >
                <FiPlus className="w-4 h-4" />
                Add Category
              </button>
            </div>

            {errors.categories && (
              <p className="text-red-500 text-sm mb-4">{errors.categories}</p>
            )}

            <div className="space-y-3">
              {formData.categories.map((category, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 items-center bg-gray-50 p-3 rounded-lg">
                  <div className="col-span-4">
                    <input
                      type="text"
                      value={category.name}
                      onChange={(e) => handleCategoryChange(index, 'name', e.target.value)}
                      placeholder="Category name"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="col-span-3">
                    <div className="relative">
                      <FiDollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                      <input
                        type="number"
                        value={category.amount}
                        onChange={(e) => handleCategoryChange(index, 'amount', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        className="w-full pl-6 pr-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="col-span-3">
                    <div className="flex items-center">
                      <input
                        type="number"
                        value={category.percentage}
                        onChange={(e) => handleCategoryChange(index, 'percentage', e.target.value)}
                        placeholder="0"
                        min="0"
                        max="100"
                        step="0.1"
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      />
                      <span className="ml-1 text-sm text-gray-500">%</span>
                    </div>
                  </div>
                  
                  <div className="col-span-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeCategory(index)}
                      className="p-1 text-red-500 hover:text-red-700 transition"
                      disabled={formData.categories.length <= 1}
                    >
                      <FiMinus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Allocated:</span>
                  <span className="ml-2 font-medium">${getTotalCategoryAmount().toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-gray-600">Total Percentage:</span>
                  <span className="ml-2 font-medium">{getTotalPercentage().toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Remaining:</span>
                  <span className="ml-2 font-medium">
                    ${Math.max(0, (parseFloat(formData.totalAmount) || 0) - getTotalCategoryAmount()).toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className={`ml-2 font-medium ${
                    Math.abs(getTotalCategoryAmount() - (parseFloat(formData.totalAmount) || 0)) < 0.01
                      ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {Math.abs(getTotalCategoryAmount() - (parseFloat(formData.totalAmount) || 0)) < 0.01
                      ? 'Balanced' : 'Unbalanced'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Add notes about this budget..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              <FiSave className="w-4 h-4" />
              {isLoading ? 'Saving...' : (mode === 'edit' ? 'Update Budget' : 'Create Budget')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetForm;