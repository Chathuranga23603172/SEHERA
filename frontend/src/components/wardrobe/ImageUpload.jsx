import React, { useState, useRef, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiX, FiCamera, FiImage, FiTrash2 } from 'react-icons/fi';

const ImageUpload = ({ 
  onImageUpload, 
  initialImage = '', 
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedFormats = ['image/jpeg', 'image/png', 'image/webp'],
  className = '',
  multiple = false,
  showPreview = true
}) => {
  const [uploadedImages, setUploadedImages] = useState(
    initialImage ? [{ url: initialImage, file: null }] : []
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errorMessages = rejectedFiles.map(({ file, errors }) => {
        return errors.map(error => {
          switch (error.code) {
            case 'file-too-large':
              return `${file.name} is too large. Max size is ${maxSize / 1024 / 1024}MB`;
            case 'file-invalid-type':
              return `${file.name} is not a supported format`;
            default:
              return `${file.name}: ${error.message}`;
          }
        }).join(', ');
      });
      setError(errorMessages.join('; '));
      return;
    }

    if (acceptedFiles.length === 0) return;

    setError('');
    setUploading(true);
    setUploadProgress(0);

    try {
      const newImages = [];
      
      for (let i = 0; i < acceptedFiles.length; i++) {
        const file = acceptedFiles[i];
        
        // Simulate upload progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => {
            const newProgress = prev + 10;
            if (newProgress >= 90) {
              clearInterval(progressInterval);
            }
            return newProgress;
          });
        }, 100);

        // Create preview URL
        const previewUrl = URL.createObjectURL(file);
        
        // Simulate upload to cloud storage (replace with actual upload logic)
        const uploadedUrl = await simulateImageUpload(file);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        newImages.push({
          url: uploadedUrl,
          file: file,
          preview: previewUrl
        });
      }

      if (multiple) {
        setUploadedImages(prev => [...prev, ...newImages]);
        onImageUpload?.(uploadedImages.concat(newImages).map(img => img.url));
      } else {
        setUploadedImages(newImages);
        onImageUpload?.(newImages[0]?.url || '');
      }
      
    } catch (error) {
      setError('Upload failed. Please try again.');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [maxSize, multiple, onImageUpload, uploadedImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFormats.reduce((acc, format) => {
      acc[format] = [];
      return acc;
    }, {}),
    maxSize,
    multiple,
    disabled: uploading
  });

  // Simulate image upload (replace with actual implementation)
  const simulateImageUpload = async (file) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // In real implementation, upload to Cloudinary or similar service
        resolve(URL.createObjectURL(file));
      }, 1500);
    });
  };

  const removeImage = (index) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    
    if (multiple) {
      onImageUpload?.(newImages.map(img => img.url));
    } else {
      onImageUpload?.('');
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${uploading ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        {uploading ? (
          <div className="space-y-2">
            <div className="animate-spin mx-auto w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="text-sm text-gray-600">Uploading...</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-center">
              <div className="p-3 bg-gray-100 rounded-full">
                <FiUpload className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isDragActive ? 'Drop files here' : 'Upload images'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Drag & drop or click to select
              </p>
            </div>
            
            <div className="flex justify-center gap-4 text-xs text-gray-400">
              <span>Max: {formatFileSize(maxSize)}</span>
              <span>•</span>
              <span>{acceptedFormats.map(f => f.split('/')[1]).join(', ')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Alternative Upload Buttons */}
      <div className="flex gap-2 justify-center">
        <button
          type="button"
          onClick={handleFileInputClick}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors disabled:opacity-50"
        >
          <FiImage size={16} />
          Choose File
        </button>
        
        {/* Camera option for mobile */}
        <button
          type="button"
          onClick={() => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.capture = 'environment';
            input.onchange = (e) => {
              const files = Array.from(e.target.files);
              if (files.length > 0) {
                onDrop(files, []);
              }
            };
            input.click();
          }}
          disabled={uploading}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors disabled:opacity-50"
        >
          <FiCamera size={16} />
          Camera
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Image Previews */}
      {showPreview && uploadedImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            {multiple ? 'Uploaded Images' : 'Preview'}
          </h4>
          <div className={`grid gap-4 ${multiple ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-1'}`}>
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={image.preview || image.url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Image Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <button
                    onClick={() => removeImage(index)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
                    title="Remove image"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
                
                {/* File Info */}
                {image.file && (
                  <div className="mt-2 text-xs text-gray-500">
                    <p className="truncate">{image.file.name}</p>
                    <p>{formatFileSize(image.file.size)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>Guidelines:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Use high-quality images for better visualization</li>
          <li>Ensure good lighting and clear view of the item</li>
          <li>Avoid blurry or heavily filtered photos</li>
          {multiple && <li>You can upload multiple images to show different angles</li>}
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;