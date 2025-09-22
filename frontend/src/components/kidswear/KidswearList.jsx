import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiEye, FiHeart, FiShoppingCart, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const KidswearList = ({ 
  items = [], 
  onEdit, 
  onDelete, 
  onView, 
  onAddToCart,
  loading = false,
  filters = {},
  searchTerm = ''
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [viewMode, setViewMode] = useState('grid');

  // Filter and sort items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filters.category || item.category === filters.category;
    const matchesBrand = !filters.brand || item.brand === filters.brand;
    const matchesColor = !filters.color || item.color === filters.color;
    const matchesAge = !filters.ageGroup || item.ageGroup === filters.ageGroup;
    const matchesSize = !filters.size || item.size === filters.size;
    const matchesDurability = !filters.durability || item.durability === filters.durability;
    
    const matchesPriceRange = (!filters.minPrice || item.price >= filters.minPrice) &&
                             (!filters.maxPrice || item.price <= filters.maxPrice);

    return matchesSearch && matchesCategory && matchesBrand && 
           matchesColor && matchesAge && matchesSize && matchesDurability && matchesPriceRange;
  }).sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSelectItem = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map(item => item._id));
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedItems.length} items?`)) {
      try {
        await Promise.all(
          selectedItems.map(id => 
            axios.delete(`${process.env.REACT_APP_API_URL}/kidswear/${id}`)
          )
        );
        toast.success('Items deleted successfully');
        setSelectedItems([]);
        window.location.reload();
      } catch (error) {
        toast.error('Failed to delete items');
      }
    }
  };

  const handleAddToCart = (item) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => cartItem._id === item._id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem._id === item._id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prev, { ...item, quantity: 1 }];
      }
    });
    onAddToCart && onAddToCart(item);
    toast.success(`${item.name} added to cart`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getAgeGroupColor = (ageGroup) => {
    const colors = {
      'Baby (0-36 months)': 'bg-pink-100 text-pink-800',
      'Kids (2-12 years)': 'bg-blue-100 text-blue-800',
      'Teens (13-16 years)': 'bg-purple-100 text-purple-800'
    };
    return colors[ageGroup] || 'bg-gray-100 text-gray-800';
  };

  const getDurabilityColor = (durability) => {
    const colors = {
      'High': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-red-100 text-red-800'
    };
    return colors[durability] || 'bg-gray-100 text-gray-800';
  };

  const needsSizeUpgrade = (item) => {
    // Check if item needs size upgrade based on growth tracking
    return item.growthStage && item.lastWorn && 
           new Date() - new Date(item.lastWorn) > 90 * 24 * 60 * 60 * 1000; // 3 months
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Kids' Wardrobe ({filteredItems.length})
          </h2>
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete Selected ({selectedItems.length})
            </button>
          )}
          {cartItems.length > 0 && (
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              Cart: {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Sort Controls */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="name">Name</option>
            <option value="brand">Brand</option>
            <option value="price">Price</option>
            <option value="ageGroup">Age Group</option>
            <option value="createdAt">Date Added</option>
            <option value="usageCount">Usage Count</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-600'}`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {filteredItems.length > 0 && (
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={selectedItems.length === filteredItems.length}
              onChange={handleSelectAll}
              className="mr-2"
            />
            Select All
          </label>
        </div>
      )}

      {/* Items Display */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <FiShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or add some kids' clothing items.
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className={`
                bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow
                ${viewMode === 'list' ? 'flex items-center p-4' : ''}
                ${needsSizeUpgrade(item) ? 'border-2 border-orange-300' : ''}
              `}
            >
              {/* Size Upgrade Alert */</div>