import React, { useState, useEffect } from 'react';
import { FiFilter, FiX, FiRefreshCw } from 'react-icons/fi';

const CategoryFilter = ({ 
  onFiltersChange, 
  availableFilters = {},
  initialFilters = {},
  showAdvanced = false 
}) => {
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    color: '',
    size: '',
    season: '',
    occasion: '',
    priceRange: { min: '', max: '' },
    tags: [],
    sortBy: 'name',
    sortOrder: 'asc',
    ...initialFilters
  });

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(showAdvanced);
  const [selectedTags, setSelectedTags] = useState(initialFilters.tags || []);

  // Default filter options
  const defaultOptions = {
    categories: ['tops', 'bottoms', 'dresses', 'outerwear', 'footwear', 'accessories', 'underwear'],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    seasons: ['spring', 'summer', 'fall', 'winter', 'all-season'],
    occasions: ['casual', 'work', 'formal', 'party', 'sports', 'vacation', 'date', 'wedding'],
    colors: ['black', 'white', 'gray', 'brown', 'beige', 'red', 'blue', 'green', 'yellow', 'pink', 'purple', 'orange'],
    sortOptions: [
      { value: 'name', label: 'Name' },
      { value: 'price', label: 'Price' },
      { value: 'brand', label: 'Brand' },
      { value: 'usageCount', label: 'Usage Count' },
      { value: 'createdAt', label: 'Date Added' },
      { value: 'lastWorn', label: 'Last Worn' }
    ]
  };

  // Merge with available filters from props
  const filterOptions = {
    categories: availableFilters.categories || defaultOptions.categories,
    brands: availableFilters.brands || [],
    sizes: availableFilters.sizes || defaultOptions.sizes,
    seasons: availableFilters.seasons || defaultOptions.seasons,
    occasions: availableFilters.occasions || defaultOptions.occasions,
    colors: availableFilters.colors || defaultOptions.colors,
    tags: availableFilters.tags || [],
    sortOptions: defaultOptions.sortOptions
  };

  useEffect(() => {
    onFiltersChange({ ...filters, tags: selectedTags });
  }, [filters, selectedTags]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePriceRangeChange = (type, value) => {
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: value
      }
    }));
  };

  const handleTagToggle = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      category: '',
      brand: '',
      color: '',
      size: '',
      season: '',
      occasion: '',
      priceRange: { min: '', max: '' },
      tags: [],
      sortBy: 'name',
      sortOrder: 'asc'
    };
    setFilters(clearedFilters);
    setSelectedTags([]);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (filters.color) count++;
    if (filters.size) count++;
    if (filters.season) count++;
    if (filters.occasion) count++;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (selectedTags.length > 0) count++;
    return count;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-600" size={20} />
          <h3 className="font-medium text-gray-900">Filters</h3>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            {isAdvancedOpen ? 'Simple' : 'Advanced'}
          </button>
          
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <FiRefreshCw size={14} />
            Clear
          </button>
        </div>
      </div>

      {/* Filter Content */}
      <div className="p-4 space-y-4">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Categories</option>
              {filterOptions.categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand
            </label>
            <select
              value={filters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Brands</option>
              {filterOptions.brands.map(brand => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Size
            </label>
            <select
              value={filters.size}
              onChange={(e) => handleFilterChange('size', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Sizes</option>
              {filterOptions.sizes.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Color
            </label>
            <select
              value={filters.color}
              onChange={(e) => handleFilterChange('color', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">All Colors</option>
              {filterOptions.colors.map(color => (
                <option key={color} value={color}>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        {isAdvancedOpen && (
          <div className="space-y-4 pt-4 border-t border-gray-200">
            {/* Season and Occasion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Season
                </label>
                <select
                  value={filters.season}
                  onChange={(e) => handleFilterChange('season', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Seasons</option>
                  {filterOptions.seasons.map(season => (
                    <option key={season} value={season}>
                      {season.charAt(0).toUpperCase() + season.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Occasion
                </label>
                <select
                  value={filters.occasion}
                  onChange={(e) => handleFilterChange('occasion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">All Occasions</option>
                  {filterOptions.occasions.map(occasion => (
                    <option key={occasion} value={occasion}>
                      {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range ($)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Tags */}
            {filterOptions.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.tags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sort Options */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-200">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              {filterOptions.sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order
            </label>
            <select
              value={filters.sortOrder}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {getActiveFiltersCount() > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Active Filters:</span>
              <button
                onClick={clearAllFilters}
                className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
              >
                <FiX size={14} />
                Clear All
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {filters.category && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  Category: {filters.category}
                  <button onClick={() => handleFilterChange('category', '')}>
                    <FiX size={12} />
                  </button>
                </span>
              )}
              {filters.brand && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  Brand: {filters.brand}
                  <button onClick={() => handleFilterChange('brand', '')}>
                    <FiX size={12} />
                  </button>
                </span>
              )}
              {filters.size && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  Size: {filters.size}
                  <button onClick={() => handleFilterChange('size', '')}>
                    <FiX size={12} />
                  </button>
                </span>
              )}
              {filters.color && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  Color: {filters.color}
                  <button onClick={() => handleFilterChange('color', '')}>
                    <FiX size={12} />
                  </button>
                </span>
              )}
              {selectedTags.length > 0 && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  Tags: {selectedTags.length}
                  <button onClick={() => setSelectedTags([])}>
                    <FiX size={12} />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryFilter;