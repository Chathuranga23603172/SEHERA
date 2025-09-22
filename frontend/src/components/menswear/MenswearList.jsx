import React, { useState, useEffect } from 'react';
import { FiPlus, FiGrid, FiList, FiSearch, FiFilter } from 'react-icons/fi';
import ItemCard from '../wardrobe/ItemCard';
import CategoryFilter from '../wardrobe/CategoryFilter';
import MenswearFilters from './MenswearFilters';
import { motion, AnimatePresence } from 'framer-motion';

const MenswearList = ({ 
  items = [], 
  loading = false,
  onAddItem,
  onEditItem,
  onDeleteItem,
  onToggleFavorite,
  onAddToOutfit,
  onViewItem
}) => {
  const [filteredItems, setFilteredItems] = useState(items);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    categories: {},
    brands: {},
    totalValue: 0,
    mostWorn: null,
    leastWorn: null
  });

  // Menswear specific categories
  const menswearCategories = [
    'suits', 'blazers', 'dress-shirts', 'casual-shirts', 'polo-shirts',
    'dress-pants', 'jeans', 'chinos', 'shorts', 'ties', 'belts',
    'dress-shoes', 'casual-shoes', 'sneakers', 'accessories'
  ];

  useEffect(() => {
    let filtered = [...items];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filters
    if (activeFilters.category) {
      filtered = filtered.filter(item => item.category === activeFilters.category);
    }

    if (activeFilters.brand) {
      filtered = filtered.filter(item => item.brand === activeFilters.brand);
    }

    if (activeFilters.size) {
      filtered = filtered.filter(item => item.size === activeFilters.size);
    }

    if (activeFilters.color) {
      filtered = filtered.filter(item => item.color === activeFilters.color);
    }

    if (activeFilters.occasion) {
      filtered = filtered.filter(item => item.occasion === activeFilters.occasion);
    }

    if (activeFilters.season) {
      filtered = filtered.filter(item => item.season === activeFilters.season);
    }

    // Apply price range filter
    if (activeFilters.priceRange?.min || activeFilters.priceRange?.max) {
      filtered = filtered.filter(item => {
        const price = item.price || 0;
        const min = parseFloat(activeFilters.priceRange.min) || 0;
        const max = parseFloat(activeFilters.priceRange.max) || Infinity;
        return price >= min && price <= max;
      });
    }

    // Apply tags filter
    if (activeFilters.tags?.length > 0) {
      filtered = filtered.filter(item =>
        activeFilters.tags.some(tag => item.tags?.includes(tag))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const { sortBy = 'name', sortOrder = 'asc' } = activeFilters;
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle special cases
      if (sortBy === 'price') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      } else if (sortBy === 'usageCount') {
        aValue = aValue || 0;
        bValue = bValue || 0;
      } else if (sortBy === 'createdAt' || sortBy === 'lastWorn') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      } else {
        aValue = (aValue || '').toString().toLowerCase();
        bValue = (bValue || '').toString().toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredItems(filtered);
  }, [items, searchTerm, activeFilters]);

  // Calculate statistics
  useEffect(() => {
    const newStats = {
      total: items.length,
      categories: {},
      brands: {},
      totalValue: 0,
      mostWorn: null,
      leastWorn: null
    };

    items.forEach(item => {
      // Categories
      if (item.category) {
        newStats.categories[item.category] = (newStats.categories[item.category] || 0) + 1;
      }

      // Brands
      if (item.brand) {
        newStats.brands[item.brand] = (newStats.brands[item.brand] || 0) + 1;
      }

      // Total value
      newStats.totalValue += item.price || 0;

      // Most/least worn
      const usageCount = item.usageCount || 0;
      if (!newStats.mostWorn || usageCount > (newStats.mostWorn.usageCount || 0)) {
        newStats.mostWorn = item;
      }
      if (!newStats.leastWorn || usageCount < (newStats.leastWorn.usageCount || 0)) {
        newStats.leastWorn = item;
      }
    });

    setStats(newStats);
  }, [items]);

  const handleFiltersChange = (filters) => {
    setActiveFilters(filters);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menswear Collection</h1>
          <p className="text-gray-600 mt-1">
            {filteredItems.length} of {items.length} items
            {stats.totalValue > 0 && (
              <span className="ml-2">• Total Value: {formatCurrency(stats.totalValue)}</span>
            )}
          </p>
        </div>

        <button
          onClick={onAddItem}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <FiPlus size={20} />
          Add Item
        </button>
      </div>

      {/* Statistics Cards */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</div>
            <div className="text-sm text-gray-600">Total Value</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(stats.categories).length}
            </div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(stats.brands).length}
            </div>
            <div className="text-sm text-gray-600">Brands</div>
          </div>
        </div>
      )}

      {/* Search and Controls */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search menswear items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <FiFilter size={16} />
            Filters
          </button>

          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FiList size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <MenswearFilters
              onFiltersChange={handleFiltersChange}
              availableFilters={{
                categories: menswearCategories,
                brands: Object.keys(stats.brands),
                sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42'],
                colors: [...new Set(items.map(item => item.color).filter(Boolean))],
                tags: [...new Set(items.flatMap(item => item.tags || []))],
                occasions: ['business', 'casual', 'formal', 'date', 'interview', 'wedding'],
                seasons: ['spring', 'summer', 'fall', 'winter', 'all-season']
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Items Display */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-20">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiPlus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || Object.keys(activeFilters).length > 0
              ? 'No items found'
              : 'No menswear items yet'
            }
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || Object.keys(activeFilters).length > 0
              ? 'Try adjusting your search or filters'
              : 'Start building your wardrobe by adding your first item'
            }
          </p>
          {(!searchTerm && Object.keys(activeFilters).length === 0) && (
            <button
              onClick={onAddItem}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <FiPlus size={16} />
              Add Your First Item
            </button>
          )}
        </div>
      ) : (
        <div className={`
          ${viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' 
            : 'space-y-4'
          }
        `}>
          <AnimatePresence>
            {filteredItems.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={viewMode === 'list' ? 'border border-gray-200 rounded-lg' : ''}
              >
                <ItemCard
                  item={item}
                  onEdit={onEditItem}
                  onDelete={onDeleteItem}
                  onView={onViewItem}
                  onToggleFavorite={onToggleFavorite}
                  onAddToOutfit={onAddToOutfit}
                  className={viewMode === 'list' ? 'border-0 shadow-none' : ''}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Quick Stats */}
      {filteredItems.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-3">Quick Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Most worn item:</span>
              <div className="font-medium text-gray-900">
                {stats.mostWorn ? `${stats.mostWorn.name} (${stats.mostWorn.usageCount || 0}x)` : 'None'}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Average item value:</span>
              <div className="font-medium text-gray-900">
                {formatCurrency(stats.totalValue / Math.max(stats.total, 1))}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Top category:</span>
              <div className="font-medium text-gray-900">
                {Object.keys(stats.categories).length > 0 
                  ? Object.entries(stats.categories).sort(([,a], [,b]) => b - a)[0][0]
                  : 'None'
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenswearList;