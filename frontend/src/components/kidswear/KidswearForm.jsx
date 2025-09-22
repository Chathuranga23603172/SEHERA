import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiUpload, FiX, FiDollarSign, FiUser, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const KidswearForm = ({ 
  item = null, 
  onSubmit, 
  onCancel, 
  isEditing = false 
}) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    defaultValues: item || {
      name: '',
      brand: '',
      category: '',
      color: '',
      size: '',
      ageGroup: '',
      durability: '',
      price: '',
      discountPercentage: 0,
      purchaseDate: '',
      description: '',
      usageCount: 0,
      growthNotes: '',
      lastWorn: ''
    }
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [previewImages, setPreviewImages] = useState(item?.images || []);
  const [isUploading, setIsUploading] = useState(false);

  const watchPrice = watch('price');
  const watchDiscount = watch('discountPercentage');
  const watchAgeGroup = watch('ageGroup');

  // Calculate discounted price
  const discountedPrice = watchPrice && watchDiscount 
    ? (parseFloat(watchPrice) * (1 - parseFloat(watchDiscount) / 100)).toFixed(2)
    : watchPrice;

  const categories = [
    'School Uniforms', 'Casual Wear', 'Formal Wear', 'Sportswear', 'Sleepwear',
    'Outerwear', 'Undergarments', 'Shoes', 'Accessories', 'Party Wear'
  ];

  const colors = [
    'Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Pink', 'Purple',
    'Orange', 'Brown', 'Gray', 'Navy', 'Light Blue', 'Multicolor'
  ];

  const ageGroups = [
    'Baby (0-36 months)',
    'Kids (2-12 years)',
    'Teens (13-16 years)'
  ];

  const getSizesForAgeGroup = (ageGroup) => {
    switch (ageGroup) {
      case 'Baby (0-36 months)':
        return ['0-3M', '3-6M', '6-9M', '9-12M', '12-18M', '18-24M', '2T', '3T'];
      case 'Kids (2-12 years)':
        return ['2T', '3T', '4T', '5T', '6', '7', '8', '10', '12', 'XS', 'S', 'M'];
      case 'Teens (13-16 years)':
        return ['S', 'M', 'L', 'XL', '0', '2', '4', '6', '8', '10', '12', '14'];
      default:
        return ['XS', 'S', 'M', 'L', 'XL'];
    }
  };

  const durabilityLevels = ['High', 'Medium', 'Low'];

  const brands = [
    'Carter\'s', 'OshKosh B\'gosh', 'Nike Kids', 'Adidas Kids', 'H&M Kids',
    'Zara Kids', 'Gap Kids', 'Old Navy Kids', 'Target Kids', 'Walmart Kids',
    'Disney', 'Other'
  ];

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + previewImages.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages(prev => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
    if (index < selectedImages.length) {
      setSelectedImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const uploadImages = async () => {
    if (selectedImages.length === 0) return [];

    setIsUploading(true);
    const uploadedUrls = [];

    try {
      for (const image of selectedImages) {
        const formData = new FormData();
        formData.append('image', image);
        formData.append('folder', 'kidswear');

        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/upload`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' }
          }
        );

        uploadedUrls.push(response.data.url);
      }
    } catch (error) {
      toast.error('Failed to upload images');
      throw error;
    } finally {
      setIsUploading(false);
    }

    return uploadedUrls;
  };

  const onFormSubmit = async (data) => {
    try {
      let imageUrls = item?.images || [];
      
      if (selectedImages.length > 0) {
        const uploadedUrls = await uploadImages();
        imageUrls = [...imageUrls, ...uploadedUrls];
      }

      const formData = {
        ...data,
        images: imageUrls,
        discountedPrice: discountedPrice,
        price: parseFloat(data.price),
        discountPercentage: parseFloat(data.discountPercentage) || 0,
        usageCount: parseInt(data.usageCount) || 0
      };

      await onSubmit(formData);
      toast.success(isEditing ? 'Item updated successfully' : 'Item added successfully');
    } catch (error) {
      toast.error('Failed to save item');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Kids\' Item' : 'Add New Kids\' Item'}
        </h2>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700"
        >
          <FiX size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Name *
            </label>
            <input
              {...register('name', { required: 'Item name is required' })}
              type="text"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., School Uniform Shirt"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brand *
            </label>
            <select
              {...register('brand', { required: 'Brand is required' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Brand</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
            {errors.brand && (
              <p className="text-red-500 text-sm mt-1">{errors.brand.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              {...register('category', { required: 'Category is required' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color *
            </label>
            <select
              {...register('color', { required: 'Color is required' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Color</option>
              {colors.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
            {errors.color && (
              <p className="text-red-500 text-sm mt-1">{errors.color.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age Group *
            </label>
            <select
              {...register('ageGroup', { required: 'Age group is required' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Age Group</option>
              {ageGroups.map(group => (
                <option key={group} value={group}>{group}</option>
              ))}
            </select>
            {errors.ageGroup && (
              <p className="text-red-500 text-sm mt-1">{errors.ageGroup.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size *
            </label>
            <select
              {...register('size', { required: 'Size is required' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Size</option>
              {getSizesForAgeGroup(watchAgeGroup).map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            {errors.size && (
              <p className="text-red-500 text-sm mt-1">{errors.size.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Durability *
            </label>
            <select
              {...register('durability', { required: 'Durability is required' })}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Durability</option>
              {durabilityLevels.map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
            {errors.durability && (
              <p className="text-red-500 text-sm mt-1">{errors.durability.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Purchase Date
            </label>
            <input
              {...register('purchaseDate')}
              type="date"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Pricing Information */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiDollarSign className="mr-2" />
            Pricing Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purchase Price *
              </label>
              <input
                {...register('price', { 
                  required: 'Price is required',
                  min: { value: 0, message: 'Price must be positive' }
                })}
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Discount Percentage
              </label>
              <input
                {...register('discountPercentage', {
                  min: { value: 0, message: 'Discount cannot be negative' },
                  max: { value: 100, message: 'Discount cannot exceed 100%' }
                })}
                type="number"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.discountPercentage && (
                <p className="text-red-500 text-sm mt-1">{errors.discountPercentage.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Final Price
              </label>
              <input
                type="text"
                value={discountedPrice ? `$${discountedPrice}` : ''}
                disabled
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Growth Tracking */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiUser className="mr-2" />
            Growth Tracking
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Growth Notes
              </label>
              <textarea
                {...register('growthNotes')}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notes about fit, comfort, room to grow..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Worn Date
              </label>
              <input
                {...register('lastWorn')}
                type="date"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for size upgrade alerts
              </p>
            </div>
          </div>
        </div>

        {/* Usage Tracking */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiTrendingUp className="mr-2" />
            Usage Tracking
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Times Worn
            </label>
            <input
              {...register('usageCount', {
                min: { value: 0, message: 'Usage count cannot be negative' }
              })}
              type="number"
              className="w-full md:w-48 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        {/* Image Upload */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FiUpload className="mr-2" />
            Images
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FiUpload className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5 images)</p>
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* Image Previews */}
            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {previewImages.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="border-t pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add any additional notes about this item..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting || isUploading 
              ? 'Saving...' 
              : isEditing 
                ? 'Update Item' 
                : 'Add Item'
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default KidswearForm;