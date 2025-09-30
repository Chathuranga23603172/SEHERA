import React, { useState, useEffect } from 'react';
import { FiFilter, FiX, FiSearch, FiRefreshCw } from 'react-icons/fi';

const WomenswearFilters = ({ 
  onFiltersChange, 
  onSearchChange, 
  initialFilters = {},
  itemCounts = {} 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    color: '',
    season: '',
    purpose: '',
    minPrice: '',
    maxPrice: '',
    size: '',
    hasDiscount: false,
    usageRange: '',
    ...initialFilters
  });

  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 1000
  });

  const categories = [
    'Dresses', 'Tops & Blouses', 'Bottoms', 'Outerwear', 'Activewear',
    'Lingerie & Sleepwear', 'Shoes', 'Accessories', 'Bags', 'Jewelry'
  ];

  const brands = [
    'Zara', 'H&M', 'Forever 21', 'Nike', 'Adidas', 'Gucci', 'Prada', 'Chanel',
    'Louis Vuitton', 'Coach', 'Kate Spade', 'Michael Kors', 'Levi\'s', 'Gap',
    'Uniqlo', 'Mango', 'Massimo Dutti', 'COS'
  ];

  const colors = [
    'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple',
    'Orange', 'Brown', 'Gray', 'Navy', 'Beige', 'Maroon', 'Turquoise'
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2', '4', '6', '8', '10', '12', '14', '16'];
  const seasons = ['Spring', 'Summer', 'Fall', 'Winter', 'All Season'];
  const purposes = ['Casual', 'Office', 'Party', 'Formal', 'Sports', 'Travel', 'Beach'];
  
  const usageRanges = [
    { label: 'Never worn', value: 'never', min: 0, max: 0 },
    { label: '1-5 times', value: 'low', min: 1, max: 5 },
    { label: '6-15 times', value: 'medium', min: 6, max: 15 },
    { label: '16+ times', value: 'high', min: 16, max: 999 }
  ];

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  useEffect(() => {
    onSearchChange(searchTerm);
  }, [searchTerm, onSearchChange]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handlePriceRangeChange = (type, value) => {
    const numValue = value === '' ? '' : parseFloat(value);
    setPriceRange(prev => ({ ...prev, [type]: numValue }));
    
    if (type === 'min') {
      handleFilterChange('minPrice', numValue);
    } else {
      handleFilterChange('maxPrice', numValue);
    }
  };
p
  const clearAllFilters = () => {
    const clearedFilters = {
      category: '',
      brand: '',
      color: '',
      season: '',
      purpose: '',
      minPrice: '',
      maxPrice: '',
      size: '',
      hasDiscount: false,
      usageRange: ''
    };
    setFilters(clearedFilters);
    setSearchTerm('');
    setPriceRange({ min: 0, max: 1000 });
  };

  const clearSingleFilter = (filterKey) => {
    if (filterKey === 'priceRange') {
      handleFilterChange('minPrice', '');
      handleFilterChange('maxPrice', '');
      setPriceRange({ min: 0, max: 1000 });
    } else {
      handleFilterChange(filterKey, filterKey === 'hasDiscount' ? false : '');
    }
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== '' && value !== false && value !== null
    ).length;
  };

  const getActiveFiltersList = () => {
    const activeFilters = [];
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '' && value !== false) {
        let label = key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
        let displayValue = value;
        
        if (key === 'minPrice' || key === 'maxPrice') {
          if (filters.minPrice || filters.maxPrice) {
            const min = filters.minPrice || 0;
            const max = filters.maxPrice || '∞';
            activeFilters.push({
              key: 'priceRange',
              label: 'Price Range',
              value: `$${min} - $${max}`
            });
          }
          return;
        }
        
        if (key === 'hasDiscount') {
          displayValue = 'Has Discount';
        }
        
        if (key === 'usageRange') {
          const range = usageRanges.find(r => r.value === value);
          displayValue = range ? range.label : value;
        }
        
        activeFilters.push({ key, label, value: displayValue });
      }
    });
    
    return activeFilters.filter((filter, index, self) => 
      index === self.findIndex(f => f.key === filter.key)
    );
  };

  return (
    <div className="bg-white border-b border-gray-200">
      {/* Search Bar */}
      <div className="p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search womenswear by name, brand, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filter Toggle Button */}
      <div className="px-4 pb-4 flex justify-between items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <FiFilter size={16} />
          <span>Filters</span>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-pink-500 text-white rounded-full px-2 py-1 text-xs">
              {getActiveFiltersCount()}
            </span>
          )}
        </button>

        {getActiveFiltersCount() > 0 && (
          <button
            onClick={clearAllFilters}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <FiRefreshCw size={16} />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {getActiveFiltersList().length > 0 && (
        <div className="px-4 pb-4">
          <div className="flex flex-wrap gap-2">
            {getActiveFiltersList().map((filter) => (
              <div
                key={filter.key}
                className="flex items-center bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm"
              >
                <span>{filter.label}: {filter.value}</span>
                <button
                  onClick={() => clearSingleFilter(filter.key)}
                  className="ml-2 hover:text-pink-600"
                >
                  <FiX size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {isOpen && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category} {itemCounts.categories?.[category] ? `(${itemCounts.categories[category]})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand
              </label>
              <select
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>
                    {brand} {itemCounts.brands?.[brand] ? `(${itemCounts.brands[brand]})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <select
                value={filters.color}
                onChange={(e) => handleFilterChange('color', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">All Colors</option>
                {colors.map(color => (
                  <option key={color} value={color}>
                    {color} {itemCounts.colors?.[color] ? `(${itemCounts.colors[color]})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Size Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <select
                value={filters.size}
                onChange={(e) => handleFilterChange('size', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">All Sizes</option>
                {sizes.map(size => (
                  <option key={size} value={size}>
                    {size} {itemCounts.sizes?.[size] ? `(${itemCounts.sizes[size]})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Season Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Season
              </label>
              <select
                value={filters.season}
                onChange={(e) => handleFilterChange('season', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">All Seasons</option>
                {seasons.map(season => (
                  <option key={season} value={season}>
                    {season} {itemCounts.seasons?.[season] ? `(${itemCounts.seasons[season]})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Purpose Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose
              </label>
              <select
                value={filters.purpose}
                onChange={(e) => handleFilterChange('purpose', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">All Purposes</option>
                {purposes.map(purpose => (
                  <option key={purpose} value={purpose}>
                    {purpose} {itemCounts.purposes?.[purpose] ? `(${itemCounts.purposes[purpose]})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Usage Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Usage Frequency
              </label>
              <select
                value={filters.usageRange}
                onChange={(e) => handleFilterChange('usageRange', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="">All Usage Levels</option>
                {usageRanges.map(range => (
                  <option key={range.value} value={range.value}>
                    {range.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Has Discount Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discounts
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.hasDiscount}
                  onChange={(e) => handleFilterChange('hasDiscount', e.target.checked)}
                  className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
                />
                <span className="ml-2 text-sm text-gray-700">Items with discounts only</span>
              </label>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price Range
            </label>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Min Price</label>
                <input
                  type="number"
                  placeholder="0"
                  value={priceRange.min === 0 ? '' : priceRange.min}
                  onChange={(e) => handlePriceRangeChange('min', e.target.value)}
                  className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <span className="text-gray-500 mt-5">-</span>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Max Price</label>
                <input
                  type="number"
                  placeholder="1000"
                  value={priceRange.max === 1000 ? '' : priceRange.max}
                  onChange={(e) => handlePriceRangeChange('max', e.target.value)}
                  className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WomenswearFilters;