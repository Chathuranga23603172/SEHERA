import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { toast } from 'react-hot-toast';
import { useWardrobe } from '../../hooks/useWardrobe';
import { useStyleCombo } from '../../hooks/useStyleCombo';

const OutfitBuilder = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [outfitName, setOutfitName] = useState('');
  const [selectedItems, setSelectedItems] = useState({
    top: null,
    bottom: null,
    shoes: null,
    accessories: []
  });
  const [wardrobeItems, setWardrobeItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { getMenswear, getWomenswear, getKidswear } = useWardrobe();
  const { createOutfit, saveOutfit } = useStyleCombo();

  useEffect(() => {
    loadWardrobeItems();
  }, [selectedCategory]);

  const loadWardrobeItems = async () => {
    setIsLoading(true);
    try {
      let items = [];
      if (selectedCategory === 'all' || selectedCategory === 'menswear') {
        const menItems = await getMenswear();
        items = [...items, ...menItems.map(item => ({ ...item, category: 'menswear' }))];
      }
      if (selectedCategory === 'all' || selectedCategory === 'womenswear') {
        const womenItems = await getWomenswear();
        items = [...items, ...womenItems.map(item => ({ ...item, category: 'womenswear' }))];
      }
      if (selectedCategory === 'all' || selectedCategory === 'kidswear') {
        const kidsItems = await getKidswear();
        items = [...items, ...kidsItems.map(item => ({ ...item, category: 'kidswear' }))];
      }
      setWardrobeItems(items);
    } catch (error) {
      toast.error('Failed to load wardrobe items');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const itemId = result.draggableId;
    const item = wardrobeItems.find(item => item._id === itemId);

    if (destination.droppableId === 'accessories') {
      setSelectedItems(prev => ({
        ...prev,
        accessories: [...prev.accessories, item]
      }));
    } else {
      setSelectedItems(prev => ({
        ...prev,
        [destination.droppableId]: item
      }));
    }
  };

  const removeFromOutfit = (slot, itemId = null) => {
    if (slot === 'accessories') {
      setSelectedItems(prev => ({
        ...prev,
        accessories: prev.accessories.filter(item => item._id !== itemId)
      }));
    } else {
      setSelectedItems(prev => ({
        ...prev,
        [slot]: null
      }));
    }
  };

  const calculateOutfitPrice = () => {
    let total = 0;
    Object.values(selectedItems).forEach(item => {
      if (Array.isArray(item)) {
        item.forEach(accessory => total += accessory.price || 0);
      } else if (item) {
        total += item.price || 0;
      }
    });
    return total.toFixed(2);
  };

  const handleSaveOutfit = async () => {
    if (!outfitName.trim()) {
      toast.error('Please enter an outfit name');
      return;
    }

    const hasItems = selectedItems.top || selectedItems.bottom || 
                    selectedItems.shoes || selectedItems.accessories.length > 0;
    
    if (!hasItems) {
      toast.error('Please select at least one item for the outfit');
      return;
    }

    try {
      const outfitData = {
        name: outfitName,
        items: selectedItems,
        totalPrice: parseFloat(calculateOutfitPrice()),
        createdAt: new Date()
      };

      await saveOutfit(outfitData);
      toast.success('Outfit saved successfully!');
      
      // Reset form
      setOutfitName('');
      setSelectedItems({
        top: null,
        bottom: null,
        shoes: null,
        accessories: []
      });
    } catch (error) {
      toast.error('Failed to save outfit');
    }
  };

  const clearOutfit = () => {
    setSelectedItems({
      top: null,
      bottom: null,
      shoes: null,
      accessories: []
    });
    setOutfitName('');
  };

  const filterItemsByType = (type) => {
    return wardrobeItems.filter(item => {
      const itemType = item.type?.toLowerCase();
      switch (type) {
        case 'top':
          return ['shirt', 'blouse', 't-shirt', 'sweater', 'jacket', 'top'].includes(itemType);
        case 'bottom':
          return ['pants', 'jeans', 'skirt', 'shorts', 'trousers', 'bottom'].includes(itemType);
        case 'shoes':
          return ['shoes', 'sneakers', 'boots', 'sandals', 'heels', 'footwear'].includes(itemType);
        case 'accessories':
          return ['accessories', 'belt', 'bag', 'jewelry', 'hat', 'scarf', 'watch'].includes(itemType);
        default:
          return true;
      }
    });
  };

  return (
    <div className="outfit-builder p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Outfit Builder</h2>
        <div className="flex gap-2">
          <button
            onClick={clearOutfit}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
          >
            Clear
          </button>
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wardrobe Items */}
          <div className="lg:col-span-2">
            <div className="mb-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="menswear">Menswear</option>
                <option value="womenswear">Womenswear</option>
                <option value="kidswear">Kidswear</option>
              </select>
            </div>

            <Droppable droppableId="wardrobe" direction="horizontal">
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 min-h-[200px] p-4 border-2 border-dashed border-gray-300 rounded-lg"
                >
                  {isLoading ? (
                    <div className="col-span-full flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : (
                    wardrobeItems.map((item, index) => (
                      <Draggable key={item._id} draggableId={item._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-white border rounded-lg p-3 cursor-grab shadow-sm hover:shadow-md transition ${
                              snapshot.isDragging ? 'opacity-50' : ''
                            }`}
                          >
                            {item.imageUrl && (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-20 object-cover rounded mb-2"
                              />
                            )}
                            <h4 className="text-sm font-medium text-gray-800 truncate">{item.name}</h4>
                            <p className="text-xs text-gray-600">{item.brand}</p>
                            <p className="text-sm font-bold text-blue-600">${item.price}</p>
                          </div>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>

          {/* Outfit Preview */}
          <div className="space-y-4">
            <input
              type="text"
              value={outfitName}
              onChange={(e) => setOutfitName(e.target.value)}
              placeholder="Enter outfit name"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            />

            {/* Top */}
            <Droppable droppableId="top">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 border-2 border-dashed rounded-lg min-h-[100px] ${
                    snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Top</h3>
                  {selectedItems.top ? (
                    <div className="bg-white border rounded-lg p-2 relative">
                      <button
                        onClick={() => removeFromOutfit('top')}
                        className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                      {selectedItems.top.imageUrl && (
                        <img
                          src={selectedItems.top.imageUrl}
                          alt={selectedItems.top.name}
                          className="w-full h-16 object-cover rounded mb-1"
                        />
                      )}
                      <p className="text-xs font-medium">{selectedItems.top.name}</p>
                      <p className="text-xs text-blue-600">${selectedItems.top.price}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Drag a top here</p>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Bottom */}
            <Droppable droppableId="bottom">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 border-2 border-dashed rounded-lg min-h-[100px] ${
                    snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Bottom</h3>
                  {selectedItems.bottom ? (
                    <div className="bg-white border rounded-lg p-2 relative">
                      <button
                        onClick={() => removeFromOutfit('bottom')}
                        className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                      {selectedItems.bottom.imageUrl && (
                        <img
                          src={selectedItems.bottom.imageUrl}
                          alt={selectedItems.bottom.name}
                          className="w-full h-16 object-cover rounded mb-1"
                        />
                      )}
                      <p className="text-xs font-medium">{selectedItems.bottom.name}</p>
                      <p className="text-xs text-blue-600">${selectedItems.bottom.price}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Drag bottoms here</p>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Shoes */}
            <Droppable droppableId="shoes">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 border-2 border-dashed rounded-lg min-h-[100px] ${
                    snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Shoes</h3>
                  {selectedItems.shoes ? (
                    <div className="bg-white border rounded-lg p-2 relative">
                      <button
                        onClick={() => removeFromOutfit('shoes')}
                        className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                      {selectedItems.shoes.imageUrl && (
                        <img
                          src={selectedItems.shoes.imageUrl}
                          alt={selectedItems.shoes.name}
                          className="w-full h-16 object-cover rounded mb-1"
                        />
                      )}
                      <p className="text-xs font-medium">{selectedItems.shoes.name}</p>
                      <p className="text-xs text-blue-600">${selectedItems.shoes.price}</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Drag shoes here</p>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Accessories */}
            <Droppable droppableId="accessories">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`p-4 border-2 border-dashed rounded-lg min-h-[100px] ${
                    snapshot.isDraggingOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Accessories</h3>
                  {selectedItems.accessories.length > 0 ? (
                    <div className="space-y-2">
                      {selectedItems.accessories.map((accessory, index) => (
                        <div key={`${accessory._id}-${index}`} className="bg-white border rounded-lg p-2 relative">
                          <button
                            onClick={() => removeFromOutfit('accessories', accessory._id)}
                            className="absolute top-1 right-1 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                          <p className="text-xs font-medium">{accessory.name}</p>
                          <p className="text-xs text-blue-600">${accessory.price}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">Drag accessories here</p>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Total Price */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800">Total Price: ${calculateOutfitPrice()}</h3>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveOutfit}
              className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition font-medium"
            >
              Save Outfit
            </button>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
};

export default OutfitBuilder;