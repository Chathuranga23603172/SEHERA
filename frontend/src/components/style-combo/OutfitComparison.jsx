import React, { useState, useEffect } from 'react';
import { FiX, FiRefreshCw, FiBarChart2, FiDollarSign, FiCalendar } from 'react-icons/fi';
import { useStyleCombo } from '../../hooks/useStyleCombo';
import { toast } from 'react-hot-toast';

const OutfitComparison = ({ outfits: initialOutfits, onClose }) => {
  const [comparisonSlots, setComparisonSlots] = useState([null, null, null]);
  const [availableOutfits, setAvailableOutfits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { getAllOutfits } = useStyleCombo();

  useEffect(() => {
    if (initialOutfits && initialOutfits.length > 0) {
      const slotsToFill = initialOutfits.slice(0, 3);
      setComparisonSlots([
        slotsToFill[0] || null,
        slotsToFill[1] || null,
        slotsToFill[2] || null
      ]);
    }
    loadAvailableOutfits();
  }, [initialOutfits]);

  const loadAvailableOutfits = async () => {
    setIsLoading(true);
    try {
      const outfits = await getAllOutfits();
      setAvailableOutfits(outfits);
    } catch (error) {
      toast.error('Failed to load outfits');
    } finally {
      setIsLoading(false);
    }
  };

  const selectOutfitForSlot = (slotIndex, outfit) => {
    const newSlots = [...comparisonSlots];
    newSlots[slotIndex] = outfit;
    setComparisonSlots(newSlots);
  };

  const clearSlot = (slotIndex) => {
    const newSlots = [...comparisonSlots];
    newSlots[slotIndex] = null;
    setComparisonSlots(newSlots);
  };

  const getComparisonMetrics = () => {
    const filledSlots = comparisonSlots.filter(slot => slot !== null);
    if (filledSlots.length === 0) return null;

    const prices = filledSlots.map(outfit => outfit.totalPrice || 0);
    const usageCounts = filledSlots.map(outfit => outfit.usageCount || 0);
    const costPerWear = filledSlots.map(outfit => {
      const usage = outfit.usageCount || 0;
      return usage > 0 ? (outfit.totalPrice || 0) / usage : 0;
    });

    return {
      highestPrice: Math.max(...prices),
      lowestPrice: Math.min(...prices),
      avgPrice: prices.reduce((sum, price) => sum + price, 0) / prices.length,
      mostWorn: Math.max(...usageCounts),
      leastWorn: Math.min(...usageCounts),
      avgUsage: usageCounts.reduce((sum, count) => sum + count, 0) / usageCounts.length,
      bestValue: Math.min(...costPerWear.filter(cost => cost > 0)),
      worstValue: Math.max(...costPerWear)
    };
  };

  const metrics = getComparisonMetrics();

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCostPerWear = (outfit) => {
    const usage = outfit.usageCount || 0;
    if (usage === 0) return 'N/A';
    return ((outfit.totalPrice || 0) / usage).toFixed(2);
  };

  const getItemCount = (outfit) => {
    let count = 0;
    if (outfit.items.top) count++;
    if (outfit.items.bottom) count++;
    if (outfit.items.shoes) count++;
    if (outfit.items.accessories) count += outfit.items.accessories.length;
    return count;
  };

  const getValueRating = (outfit) => {
    const costPerWear = getCostPerWear(outfit);
    if (costPerWear === 'N/A') return 'Not worn';
    
    const cost = parseFloat(costPerWear);
    if (cost < 5) return 'Excellent';
    if (cost < 15) return 'Good';
    if (cost < 30) return 'Fair';
    return 'Poor';
  };

  const getValueColor = (rating) => {
    switch (rating) {
      case 'Excellent': return 'text-green-600';
      case 'Good': return 'text-blue-600';
      case 'Fair': return 'text-yellow-600';
      case 'Poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Outfit Comparison</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Comparison Grid */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {comparisonSlots.map((outfit, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-800">Slot {index + 1}</h3>
                  {outfit && (
                    <button
                      onClick={() => clearSlot(index)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {outfit ? (
                  <div className="space-y-4">
                    {/* Outfit Preview */}
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-800 mb-2">{outfit.name}</h4>
                      <div className="grid grid-cols-2 gap-2">
                        {outfit.items.top && (
                          <div className="text-center">
                            <div className="text-xs text-gray-600 mb-1">Top</div>
                            {outfit.items.top.imageUrl ? (
                              <img
                                src={outfit.items.top.imageUrl}
                                alt={outfit.items.top.name}
                                className="w-full h-12 object-cover rounded mb-1"
                              />
                            ) : (
                              <div className="w-full h-12 bg-gray-200 rounded mb-1"></div>
                            )}
                            <div className="text-xs truncate">{outfit.items.top.name}</div>
                          </div>
                        )}
                        {outfit.items.bottom && (
                          <div className="text-center">
                            <div className="text-xs text-gray-600 mb-1">Bottom</div>
                            {outfit.items.bottom.imageUrl ? (
                              <img
                                src={outfit.items.bottom.imageUrl}
                                alt={outfit.items.bottom.name}
                                className="w-full h-12 object-cover rounded mb-1"
                              />
                            ) : (
                              <div className="w-full h-12 bg-gray-200 rounded mb-1"></div>
                            )}
                            <div className="text-xs truncate">{outfit.items.bottom.name}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Total Price:</span>
                        <span className="font-medium text-blue-600">${(outfit.totalPrice || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Times Worn:</span>
                        <span className="font-medium">{outfit.usageCount || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Cost per Wear:</span>
                        <span className="font-medium">${getCostPerWear(outfit)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Items Count:</span>
                        <span className="font-medium">{getItemCount(outfit)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Value Rating:</span>
                        <span className={`font-medium ${getValueColor(getValueRating(outfit))}`}>
                          {getValueRating(outfit)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Created:</span>
                        <span className="text-sm">{formatDate(outfit.createdAt)}</span>
                      </div>
                    </div>

                    {/* Event Tags */}
                    {outfit.eventTags && outfit.eventTags.length > 0 && (
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Events:</div>
                        <div className="flex flex-wrap gap-1">
                          {outfit.eventTags.map((tag, tagIndex) => (
                            <span
                              key={tagIndex}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center py-8 text-gray-500">
                      <FiBarChart2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Select an outfit to compare</p>
                    </div>
                    <select
                      onChange={(e) => {
                        const outfitId = e.target.value;
                        if (outfitId) {
                          const selectedOutfit = availableOutfits.find(o => o._id === outfitId);
                          selectOutfitForSlot(index, selectedOutfit);
                        }
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose outfit...</option>
                      {availableOutfits
                        .filter(outfit => !comparisonSlots.some(slot => slot && slot._id === outfit._id))
                        .map(outfit => (
                          <option key={outfit._id} value={outfit._id}>
                            {outfit.name} - ${(outfit.totalPrice || 0).toFixed(2)}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Comparison Summary */}
          {metrics && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center gap-2">
                <FiBarChart2 className="w-5 h-5" />
                Comparison Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Price Range</div>
                  <div className="font-medium">
                    ${metrics.lowestPrice.toFixed(2)} - ${metrics.highestPrice.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Avg: ${metrics.avgPrice.toFixed(2)}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Usage Range</div>
                  <div className="font-medium">
                    {metrics.leastWorn} - {metrics.mostWorn} times
                  </div>
                  <div className="text-xs text-gray-500">
                    Avg: {metrics.avgUsage.toFixed(1)} times
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Best Value</div>
                  <div className="font-medium text-green-600">
                    ${metrics.bestValue > 0 ? metrics.bestValue.toFixed(2) : 'N/A'} per wear
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">Worst Value</div>
                  <div className="font-medium text-red-600">
                    ${metrics.worstValue > 0 ? metrics.worstValue.toFixed(2) : 'N/A'} per wear
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Recommendations:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  {metrics.worstValue > metrics.bestValue * 3 && (
                    <li>• Consider wearing your most expensive outfits more frequently to improve value</li>
                  )}
                  {metrics.highestPrice > metrics.avgPrice * 2 && (
                    <li>• Your priciest outfit could benefit from more occasions to wear</li>
                  )}
                  {metrics.leastWorn === 0 && (
                    <li>• Some outfits haven't been worn yet - try them out!</li>
                  )}
                  <li>• Your best value outfit shows how to maximize cost-per-wear efficiency</li>
                </ul>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-6">
            <button
              onClick={loadAvailableOutfits}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={() => setComparisonSlots([null, null, null])}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutfitComparison;