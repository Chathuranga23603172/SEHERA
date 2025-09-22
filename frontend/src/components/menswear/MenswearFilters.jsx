import React, { useState, useEffect } from 'react';
import { FiFilter, FiX, FiRefreshCw, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const MenswearFilters = ({ 
  onFiltersChange, 
  availableFilters = {},
  initialFilters = {} 
}) => {
  const [filters, setFilters] = useState({
    category: '',
    brand: '',
    color: '',
    size: '',
    season: '',
    occasion: '',
    material: '',
    priceRange: { min: '', max: '' },
    tags: [],
    formalityLevel: '',
    fitType: '',
    sortBy: 'name',
    sortOrder: 'asc',
    ...initialFilters
  });

  const [selectedTags, setSelectedTags] = useState(initialFilters.tags || []);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    style: false,
    measurements: false,
    advanced: false
  });

  // Menswear specific filter options
  const menswearOptions = {
    categories: availableFilters.categories || [
      'suits', 'blazers', 'dress-shirts', 'casual-shirts', 'polo-shirts',
      'dress-pants', 'jeans', 'chinos', 'shorts', 'ties', 'belts',
      'dress-shoes', 'casual-shoes', 'sneakers', 'accessories'
    ],
    brands: availableFilters.brands || [],
    sizes: availableFilters.sizes || ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42'],
    seasons: availableFilters.seasons || ['spring', 'summer', 'fall', 'winter', 'all-season'],
    occasions: availableFilters.occasions || ['business', 'casual', 'formal', 'date', 'interview', 'wedding', 'party', 'travel'],
    colors: availableFilters.colors || ['black', 'white', 'gray', 'navy', 'brown', 'beige', 'red', 'blue', 'green'],
    materials: availableFilters.materials || ['wool', 'cotton', 'silk', 'linen', 'polyester', 'leather', 'denim', 'cashmere'],
    formalityLevels: ['very-formal', 'formal', 'business-casual', 'casual', 'very-casual'],
    fitTypes: ['slim', 'regular', 'relaxed', 'tailored', 'oversized'],
    tags: availableFilters.tags || [],
    sortOptions: [
      { value: 'name', label: 'Name' },
      { value: 'price', label: 'Price' },
      { value: 'brand', label: 'Brand' },
      { value: 'usageCount', label: 'Usage Count' },
      { value: 'createdAt', label: 'Date Added' },
      { value: 'lastWorn', label: 'Last Worn' },
      { value: 'formalityLevel', label: 'Formality Level' }
    ]
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
      material: '',
      priceRange: { min: '', max: '' },
      tags: [],
      formalityLevel: '',
      fitType: '',
      sortBy: 'name',
      sortOrder: 'asc'
    };
    setFilters(clearedFilters);
    setSelectedTags([]);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.brand) count++;
    if (filters.color) count++;
    if (filters.size) count++;
    if (filters.season) count++;
    if (filters.occasion) count++;
    if (filters.material) count++;
    if (filters.formalityLevel) count++;
    if (filters.fitType) count++;
    if (filters.priceRange.min || filters.priceRange.max) count++;
    if (selectedTags.length > 0) count++;
    return count;
  };

  const FilterSection = ({ title, isExpanded, onToggle, children }) => (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium text-gray-900">{title}</span>
        {isExpanded ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
      </button>
      {isExpanded && (
        <div className="p-4 bg-white">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <FiFilter className="text-gray-600" size={20} />
          <h3 className="font-medium text-gray-900">Menswear Filters</h3>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </div>
        
        <button
          onClick={clearAllFilters}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
        >
          <FiRefreshCw size={14} />
          Clear All
        </button>
      </div>

      {/* Filter Content */}
      <div className="p-4 space-y-4">
        {/* Basic Filters */}
        <FilterSection
          title="Basic Filters"
          isExpanded={expandedSections.basic}
          onToggle={() => toggleSection('basic')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                {menswearOptions.categories.map(category => (
                  <option key={category} value={category}>
                    {category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
                {menswearOptions.brands.map(brand => (
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
                {menswearOptions.sizes.map(size => (
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
                {menswearOptions.colors.map(color => (
                  <option key={color} value={color}>
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Material */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Material
              </label>
              <select
                value={filters.material}
                onChange={(e) => handleFilterChange('material', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Materials</option>
                {menswearOptions.materials.map(material => (
                  <option key={material} value={material}>
                    {material.charAt(0).toUpperCase() + material.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </FilterSection>

        {/* Style Filters */}
        <FilterSection
          title="Style & Occasion"
          isExpanded={expandedSections.style}
          onToggle={() => toggleSection('style')}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                {menswearOptions.occasions.map(occasion => (
                  <option key={occasion} value={occasion}>
                    {occasion.charAt(0).toUpperCase() + occasion.slice(1)}
                  </option>
                ))}
              </select>
            </div>

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
                {menswearOptions.seasons.map(season => (
                  <option key={season} value={season}>
                    {season.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Formality Level
              </label>
              <select
                value={filters.formalityLevel}
                onChange={(e) => handleFilterChange('formalityLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Levels</option>
                {menswearOptions.formalityLevels.map(level => (
                  <option key={level} value={level}>
                    {level.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fit Type
              </label>
              <select
                value={filters.fitType}
                onChange={(e) => handleFilterChange('fitType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">All Fits</option>
                {menswearOptions.fitTypes.map(fit => (
                  <option key={fit} value={fit}>
                    {fit.charAt(0).toUpperCase() + fit.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </FilterSection>

        {/* Advanced Filters */}
        <FilterSection
          title="Advanced Filters"
          isExpanded={expandedSections.advanced}
          onToggle={() => toggleSection('advanced')}
        >
          <div className="space-y-4">
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
            {menswearOptions.tags.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {menswearOptions.tags.map(tag => (
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
        </FilterSection>

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
              {menswearOptions.sortOptions.map(option => (
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
              {Object.entries(filters).map(([key, value]) => {
                if (!value || key === 'sortBy' || key === 'sortOrder' || key === 'priceRange') return null;
                return (
                  <span key={key} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {key}: {value}
                    <button onClick={() => handleFilterChange(key, '')}>
                      <FiX size={12} />
                    </button>
                  </span>
                );
              })}
              {(filters.priceRange.min || filters.priceRange.max) && (
                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                  Price: ${filters.priceRange.min || '0'} - ${filters.priceRange.max || '∞'}
                  <button onClick={() => handleFilterChange('priceRange', { min: '', max: '' })}>
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

export default MenswearFilters;