import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiX, FiPlus, FiMinus, FiInfo } from 'react-icons/fi';
import ImageUpload from '../wardrobe/ImageUpload';

const MenswearForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  loading = false 
}) => {
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [measurements, setMeasurements] = useState({
    chest: '',
    waist: '',
    inseam: '',
    sleeves: '',
    neck: ''
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm();

  // Watch price and discount to calculate final price
  const watchedPrice = watch('price');
  const watchedDiscount = watch('discountPercentage');

  // Menswear specific categories
  const menswearCategories = [
    { value: 'suits', label: 'Suits' },
    { value: 'blazers', label: 'Blazers & Sport Coats' },
    { value: 'dress-shirts', label: 'Dress Shirts' },
    { value: 'casual-shirts', label: 'Casual Shirts' },
    { value: 'polo-shirts', label: 'Polo Shirts' },
    { value: 'dress-pants', label: 'Dress Pants' },
    { value: 'jeans', label: 'Jeans' },
    { value: 'chinos', label: 'Chinos' },
    { value: 'shorts', label: 'Shorts' },
    { value: 'ties', label: 'Ties' },
    { value: 'belts', label: 'Belts' },
    { value: 'dress-shoes', label: 'Dress Shoes' },
    { value: 'casual-shoes', label: 'Casual Shoes' },
    { value: 'sneakers', label: 'Sneakers' },
    { value: 'accessories', label: 'Accessories' }
  ];

  const sizeOptions = {
    'suits': ['34S', '34R', '34L', '36S', '36R', '36L', '38S', '38R', '38L', '40S', '40R', '40L', '42S', '42R', '42L', '44S', '44R', '44L'],
    'dress-shirts': ['14', '14.5', '15', '15.5', '16', '16.5', '17', '17.5', '18'],
    'dress-pants': ['28', '30', '32', '34', '36', '38', '40', '42'],
    'jeans': ['28', '30', '32', '34', '36', '38', '40', '42'],
    'chinos': ['28', '30', '32', '34', '36', '38', '40', '42'],
    'shorts': ['28', '30', '32', '34', '36', '38', '40', '42'],
    'default': ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  };

  const shoeSizes = ['7', '7.5', '8', '8.5', '9', '9.5', '10', '10.5', '11', '11.5', '12', '12.5', '13'];

  useEffect(() => {
    if (initialData) {
      Object.keys(initialData).forEach(key => {
        setValue(key, initialData[key]);
      });
      setTags(initialData.tags || []);
      setImageUrl(initialData.imageUrl || '');
      setMeasurements(initialData.measurements || {
        chest: '',
        waist: '',
        inseam: '',
        sleeves: '',
        neck: ''
      });
    } else {
      reset();
      setTags([]);
      setImageUrl('');
      setMeasurements({
        chest: '',
        waist: '',
        inseam: '',
        sleeves: '',
        neck: ''
      });
    }
  }, [initialData, setValue, reset]);

  const handleFormSubmit = (data) => {
    const formData = {
      ...data,
      tags,
      imageUrl,
      measurements,
      finalPrice: calculateFinalPrice(data.price, data.discountPercentage),
      itemType: 'menswear'
    };
    onSubmit(formData);
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const calculateFinalPrice = (price, discount) => {
    const numPrice = parseFloat(price) || 0;
    const numDiscount = parseFloat(discount) || 0;
    return numPrice * (1 - numDiscount / 100);
  };

  const handleMeasurementChange = (field, value) => {
    setMeasurements(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectedCategory = watch('category');
  const getCurrentSizeOptions = () => {
    if (selectedCategory === 'dress-shoes' || selectedCategory === 'casual-shoes' || selectedCategory === 'sneakers') {
      return shoeSizes;
    }
    return sizeOptions[selectedCategory] || sizeOptions.default;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {initialData ? 'Edit Menswear Item' : 'Add New Menswear Item'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Image
                </label>
                <ImageUpload
                  onImageUpload={setImageUrl}
                  initialImage={imageUrl}
                  className="w-full"
                />
              </div>

              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    {...register('name', { required: 'Item name is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Navy Blue Suit, White Dress Shirt"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    {...register('brand')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Hugo Boss, Ralph Lauren"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category *
                    </label>
                    <select
                      {...register('category', { required: 'Category is required' })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Category</option>
                      {menswearCategories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Size
                    </label>
                    <select
                      {...register('size')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Size</option>
                      {getCurrentSizeOptions().map(size => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color
                    </label>
                    <input
                      type="text"
                      {...register('color')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Navy Blue, Charcoal"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Material
                    </label>
                    <input
                      type="text"
                      {...register('material')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Wool, Cotton, Silk"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Occasion and Season */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Style & Usage</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Occasion
                    </label>
                    <select
                      {...register('occasion')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Occasion</option>
                      <option value="business">Business</option>
                      <option value="formal">Formal</option>
                      <option value="casual">Casual</option>
                      <option value="date">Date Night</option>
                      <option value="interview">Interview</option>
                      <option value="wedding">Wedding</option>
                      <option value="party">Party</option>
                      <option value="travel">Travel</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Season
                    </label>
                    <select
                      {...register('season')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Season</option>
                      <option value="spring">Spring</option>
                      <option value="summer">Summer</option>
                      <option value="fall">Fall</option>
                      <option value="winter">Winter</option>
                      <option value="all-season">All Season</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Measurements */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium text-gray-900">Measurements</h3>
                  <div className="group relative">
                    <FiInfo className="text-gray-400 cursor-help" size={16} />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48">
                      All measurements in inches. Optional but helpful for fit tracking.
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chest (in)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={measurements.chest}
                      onChange={(e) => handleMeasurementChange('chest', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="40"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Waist (in)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={measurements.waist}
                      onChange={(e) => handleMeasurementChange('waist', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="32"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Inseam (in)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={measurements.inseam}
                      onChange={(e) => handleMeasurementChange('inseam', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="32"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sleeve (in)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={measurements.sleeves}
                      onChange={(e) => handleMeasurementChange('sleeves', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="34"
                    />
                  </div>
                </div>

                {(selectedCategory === 'dress-shirts' || selectedCategory === 'casual-shirts') && (
                  <div className="w-1/2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Neck (in)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={measurements.neck}
                      onChange={(e) => handleMeasurementChange('neck', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="15.5"
                    />
                  </div>
                )}
              </div>

              {/* Price and Discount */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Pricing</h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      {...register('price', { 
                        required: 'Price is required',
                        min: { value: 0, message: 'Price must be positive' }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Discount (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      {...register('discountPercentage')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Final Price
                    </label>
                    <input
                      type="text"
                      value={`$${calculateFinalPrice(watchedPrice, watchedDiscount).toFixed(2)}`}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:bg-blue-200 rounded-full p-1"
                  >
                    <FiMinus size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add a tag (e.g., business-casual, wedding-attire)"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
              >
                <FiPlus size={16} />
                Add
              </button>
            </div>
          </div>

          {/* Care Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Care Instructions
            </label>
            <textarea
              {...register('careInstructions')}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Dry clean only, Machine wash cold, Iron low heat"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Add any additional notes about fit, styling, or occasions..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : (initialData ? 'Update Item' : 'Add Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MenswearForm;