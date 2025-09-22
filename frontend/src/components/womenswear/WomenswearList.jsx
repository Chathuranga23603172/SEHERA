import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiEye, FiHeart, FiShoppingBag } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const WomenswearList = ({ 
  items = [], 
  onEdit, 
  onDelete, 
  onView, 
  loading = false,
  filters = {},
  searchTerm = ''
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
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
    const matchesSeason = !filters.season || item.season === filters.season;
    const matchesPurpose = !filters.purpose || item.purpose === filters.purpose;
    
    const matchesPriceRange = (!filters.minPrice || item.price >= filters.minPrice) &&
                             (!filters.maxPrice || item.price <= filters.maxPrice);

    return matchesSearch && matchesCategory && matchesBrand && 
           matchesColor && matchesSeason && matchesPurpose && matchesPriceRange;
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
            axios.delete(`${process.env.REACT_APP_API_URL}/womenswear/${id}`)
          )
        );
        toast.success('Items deleted successfully');
        setSelectedItems([]);
        window.location.reload(); // Refresh the list
      } catch (error) {
        toast.error('Failed to delete items');
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getPurposeColor = (purpose) => {
    const colors = {
      party: 'bg-purple-100 text-purple-800',
      office: 'bg-blue-100 text-blue-800',
      casual: 'bg-green-100 text-green-800',
      formal: 'bg-gray-100 text-gray-800',
      sports: 'bg-orange-100 text-orange-800'
    };
    return colors[purpose] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Womenswear Collection ({filteredItems.length})
          </h2>
          {selectedItems.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete Selected ({selectedItems.length})
            </button>
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
              className={`px-3 py-2 ${viewMode === 'grid' ? 'bg-pink-500 text-white' : 'text-gray-600'}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 ${viewMode === 'list' ? 'bg-pink-500 text-white' : 'text-gray-600'}`}
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
          <FiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No items found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your filters or add some womenswear items.
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
              `}
            >
              {/* Checkbox */}
              <div className={`${viewMode === 'list' ? 'mr-4' : 'absolute top-2 left-2'} z-10`}>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item._id)}
                  onChange={() => handleSelectItem(item._id)}
                  className="rounded"
                />
              </div>

              {/* Image */}
              <div className={`relative ${viewMode === 'list' ? 'w-20 h-20 mr-4' : 'h-48'}`}>
                <img
                  src={item.images?.[0] || '/placeholder-image.jpg'}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {item.discountPercentage > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                    -{item.discountPercentage}%
                  </span>
                )}
              </div>

              {/* Content */}
              <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                <div className={`${viewMode === 'list' ? 'flex justify-between items-start' : ''}`}>
                  <div className={viewMode === 'list' ? 'flex-1' : ''}>
                    <h3 className="font-semibold text-gray-900 truncate">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.brand}</p>
                    
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${getPurposeColor(item.purpose)}`}>
                        {item.purpose}
                      </span>
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                        {item.category}
                      </span>
                    </div>

                    <div className="mt-2 text-sm text-gray-600">
                      <p>Color: {item.color}</p>
                      <p>Size: {item.size}</p>
                      <p>Season: {item.season}</p>
                    </div>

                    <div className="mt-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatPrice(item.discountedPrice || item.price)}
                      </span>
                      {item.discountedPrice && (
                        <span className="ml-2 text-sm text-gray-500 line-through">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </div>

                    {item.usageCount > 0 && (
                      <p className="text-sm text-gray-500 mt-1">
                        Worn {item.usageCount} times
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className={`
                    ${viewMode === 'list' ? 'flex items-center space-x-2 ml-4' : 'flex justify-between items-center mt-4'}
                  `}>
                    <button
                      onClick={() => onView(item)}
                      className="text-blue-600 hover:text-blue-800 p-2"
                      title="View Details"
                    >
                      <FiEye size={18} />
                    </button>
                    
                    <button
                      onClick={() => onEdit(item)}
                      className="text-green-600 hover:text-green-800 p-2"
                      title="Edit Item"
                    >
                      <FiEdit size={18} />
                    </button>
                    
                    <button
                      onClick={() => onDelete(item._id)}
                      className="text-red-600 hover:text-red-800 p-2"
                      title="Delete Item"
                    >
                      <FiTrash2 size={18} />
                    </button>

                    <button
                      className="text-pink-600 hover:text-pink-800 p-2"
                      title="Add to Favorites"
                    >
                      <FiHeart size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WomenswearList;