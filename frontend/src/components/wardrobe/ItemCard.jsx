import React, { useState } from 'react';
import { FiHeart, FiEdit2, FiTrash2, FiEye, FiShoppingBag } from 'react-icons/fi';
import { motion } from 'framer-motion';

const ItemCard = ({ 
  item, 
  onEdit, 
  onDelete, 
  onView, 
  onToggleFavorite,
  onAddToOutfit,
  showActions = true,
  className = ""
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getBrandInitials = (brand) => {
    return brand ? brand.split(' ').map(word => word[0]).join('').toUpperCase() : '?';
  };

  const getUsageColor = (count) => {
    if (count >= 10) return 'text-green-600';
    if (count >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${className}`}
    >
      {/* Image Section */}
      <div className="relative h-48 bg-gray-100">
        {imageLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {!imageError ? (
          <img
            src={item.imageUrl || '/placeholder-image.jpg'}
            alt={item.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-2">
                <span className="text-xl font-bold text-gray-600">
                  {getBrandInitials(item.brand)}
                </span>
              </div>
              <p className="text-sm text-gray-500">No Image</p>
            </div>
          </div>
        )}

        {/* Favorite Button */}
        {showActions && (
          <button
            onClick={() => onToggleFavorite?.(item._id)}
            className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${
              item.isFavorite 
                ? 'bg-red-500 text-white' 
                : 'bg-white/80 text-gray-600 hover:bg-white'
            }`}
          >
            <FiHeart className={item.isFavorite ? 'fill-current' : ''} size={16} />
          </button>
        )}

        {/* Discount Badge */}
        {item.discountPercentage > 0 && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
            -{item.discountPercentage}%
          </div>
        )}

        {/* Usage Count */}
        <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md text-xs">
          Worn {item.usageCount || 0}x
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Brand and Category */}
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            {item.brand}
          </span>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
            {item.category}
          </span>
        </div>

        {/* Item Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
          {item.name}
        </h3>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {item.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {item.tags.length > 3 && (
              <span className="text-xs text-gray-500">
                +{item.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Price Section */}
        <div className="flex items-center justify-between mb-3">
          <div>
            {item.discountPercentage > 0 ? (
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-green-600">
                  {formatPrice(item.price * (1 - item.discountPercentage / 100))}
                </span>
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(item.price)}
                </span>
              </div>
            ) : (
              <span className="font-bold text-lg text-gray-900">
                {formatPrice(item.price)}
              </span>
            )}
          </div>
          
          {/* Size */}
          <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
            {item.size}
          </span>
        </div>

        {/* Occasion and Season */}
        <div className="flex justify-between text-xs text-gray-500 mb-3">
          <span>Occasion: {item.occasion || 'Any'}</span>
          <span>Season: {item.season || 'All'}</span>
        </div>

        {/* Usage Analytics */}
        <div className="flex justify-between text-xs mb-4">
          <span className={`font-medium ${getUsageColor(item.usageCount || 0)}`}>
            Cost per wear: {formatPrice((item.price || 0) / Math.max(item.usageCount || 1, 1))}
          </span>
          <span className="text-gray-500">
            Last worn: {item.lastWorn ? new Date(item.lastWorn).toLocaleDateString() : 'Never'}
          </span>
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2">
            <button
              onClick={() => onView?.(item)}
              className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-sm"
            >
              <FiEye size={14} />
              View
            </button>
            
            <button
              onClick={() => onAddToOutfit?.(item)}
              className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm"
            >
              <FiShoppingBag size={14} />
              Add to Outfit
            </button>
            
            <button
              onClick={() => onEdit?.(item)}
              className="p-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-md transition-colors"
            >
              <FiEdit2 size={14} />
            </button>
            
            <button
              onClick={() => onDelete?.(item._id)}
              className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ItemCard;