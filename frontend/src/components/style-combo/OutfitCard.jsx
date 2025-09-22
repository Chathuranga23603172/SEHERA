import React, { useState } from 'react';
import { FiEdit2, FiTrash2, FiShare2, FiHeart, FiCalendar, FiDollarSign } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import { useStyleCombo } from '../../hooks/useStyleCombo';

const OutfitCard = ({ outfit, onEdit, onDelete, onShare, isSelected, onSelect }) => {
  const [isLiked, setIsLiked] = useState(outfit.isLiked || false);
  const [usageCount, setUsageCount] = useState(outfit.usageCount || 0);
  const [showDetails, setShowDetails] = useState(false);

  const { updateOutfitUsage, toggleOutfitLike } = useStyleCombo();

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      await toggleOutfitLike(outfit._id);
      setIsLiked(!isLiked);
      toast.success(isLiked ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorite status');
    }
  };

  const handleWear = async (e) => {
    e.stopPropagation();
    try {
      await updateOutfitUsage(outfit._id);
      setUsageCount(prev => prev + 1);
      toast.success('Outfit marked as worn!');
    } catch (error) {
      toast.error('Failed to update usage');
    }
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(outfit);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this outfit?')) {
      onDelete(outfit._id);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    onShare(outfit);
  };

  const getOutfitItems = () => {
    const items = [];
    if (outfit.items.top) items.push(outfit.items.top);
    if (outfit.items.bottom) items.push(outfit.items.bottom);
    if (outfit.items.shoes) items.push(outfit.items.shoes);
    if (outfit.items.accessories) items.push(...outfit.items.accessories);
    return items;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCostPerWear = () => {
    if (usageCount === 0) return 'N/A';
    return (outfit.totalPrice / usageCount).toFixed(2);
  };

  return (
    <div 
      className={`outfit-card bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => onSelect && onSelect(outfit)}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800 truncate">{outfit.name}</h3>
          <div className="flex space-x-2">
            <button
              onClick={handleLike}
              className={`p-1 rounded-full transition ${
                isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-red-500'
              }`}
            >
              <FiHeart className={isLiked ? 'fill-current' : ''} />
            </button>
            <button
              onClick={handleEdit}
              className="p-1 text-gray-400 hover:text-blue-500 transition"
            >
              <FiEdit2 />
            </button>
            <button
              onClick={handleShare}
              className="p-1 text-gray-400 hover:text-green-500 transition"
            >
              <FiShare2 />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-500 transition"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <FiDollarSign className="w-4 h-4" />
            <span>${outfit.totalPrice?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex items-center gap-1">
            <FiCalendar className="w-4 h-4" />
            <span>{formatDate(outfit.createdAt)}</span>
          </div>
        </div>

        {outfit.eventTags && outfit.eventTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {outfit.eventTags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Outfit Preview */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-2 mb-4">
          {/* Top */}
          {outfit.items.top && (
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-600 mb-1">Top</div>
              {outfit.items.top.imageUrl ? (
                <img
                  src={outfit.items.top.imageUrl}
                  alt={outfit.items.top.name}
                  className="w-full h-16 object-cover rounded mb-1"
                />
              ) : (
                <div className="w-full h-16 bg-gray-200 rounded mb-1 flex items-center justify-center">
                  <span className="text-xs text-gray-500">No Image</span>
                </div>
              )}
              <div className="text-xs font-medium truncate">{outfit.items.top.name}</div>
              <div className="text-xs text-blue-600">${outfit.items.top.price}</div>
            </div>
          )}

          {/* Bottom */}
          {outfit.items.bottom && (
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-600 mb-1">Bottom</div>
              {outfit.items.bottom.imageUrl ? (
                <img
                  src={outfit.items.bottom.imageUrl}
                  alt={outfit.items.bottom.name}
                  className="w-full h-16 object-cover rounded mb-1"
                />
              ) : (
                <div className="w-full h-16 bg-gray-200 rounded mb-1 flex items-center justify-center">
                  <span className="text-xs text-gray-500">No Image</span>
                </div>
              )}
              <div className="text-xs font-medium truncate">{outfit.items.bottom.name}</div>
              <div className="text-xs text-blue-600">${outfit.items.bottom.price}</div>
            </div>
          )}

          {/* Shoes */}
          {outfit.items.shoes && (
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-600 mb-1">Shoes</div>
              {outfit.items.shoes.imageUrl ? (
                <img
                  src={outfit.items.shoes.imageUrl}
                  alt={outfit.items.shoes.name}
                  className="w-full h-16 object-cover rounded mb-1"
                />
              ) : (
                <div className="w-full h-16 bg-gray-200 rounded mb-1 flex items-center justify-center">
                  <span className="text-xs text-gray-500">No Image</span>
                </div>
              )}
              <div className="text-xs font-medium truncate">{outfit.items.shoes.name}</div>
              <div className="text-xs text-blue-600">${outfit.items.shoes.price}</div>
            </div>
          )}

          {/* Accessories */}
          {outfit.items.accessories && outfit.items.accessories.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-2">
              <div className="text-xs text-gray-600 mb-1">
                Accessories ({outfit.items.accessories.length})
              </div>
              <div className="space-y-1">
                {outfit.items.accessories.slice(0, 2).map((accessory, index) => (
                  <div key={index} className="text-xs">
                    <div className="font-medium truncate">{accessory.name}</div>
                    <div className="text-blue-600">${accessory.price}</div>
                  </div>
                ))}
                {outfit.items.accessories.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{outfit.items.accessories.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Usage Stats */}
        <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
          <span>Worn: {usageCount} times</span>
          <span>Cost per wear: ${getCostPerWear()}</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleWear}
            className="flex-1 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition"
          >
            Mark as Worn
          </button>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex-1 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {/* Detailed View */}
        {showDetails && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
            <div>
              <h4 className="text-sm font-medium text-gray-800 mb-2">Complete Item List:</h4>
              <div className="space-y-2">
                {getOutfitItems().map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{item.name} ({item.brand})</span>
                    <span className="text-blue-600 font-medium">${item.price}</span>
                  </div>
                ))}
              </div>
            </div>

            {outfit.description && (
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-1">Description:</h4>
                <p className="text-sm text-gray-600">{outfit.description}</p>
              </div>
            )}

            {outfit.occasions && outfit.occasions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-800 mb-1">Suitable for:</h4>
                <div className="flex flex-wrap gap-1">
                  {outfit.occasions.map((occasion, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full"
                    >
                      {occasion}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500">
              Last worn: {outfit.lastWorn ? formatDate(outfit.lastWorn) : 'Never'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutfitCard;