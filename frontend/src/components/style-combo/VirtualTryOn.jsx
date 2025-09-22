import React, { useState, useRef, useEffect } from 'react';
import { FiCamera, FiUpload, FiUser, FiSettings, FiRotateCw, FiDownload, FiX } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const VirtualTryOn = ({ outfit, onClose }) => {
  const [selectedModel, setSelectedModel] = useState('female-1');
  const [modelSettings, setModelSettings] = useState({
    bodyType: 'average',
    skinTone: 'medium',
    height: 'average',
    age: 'adult'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const [previewMode, setPreviewMode] = useState('model'); // 'model' or 'uploaded'
  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);

  // Predefined avatar models
  const avatarModels = {
    'female-1': {
      name: 'Female Model 1',
      image: '/avatars/female-model-1.jpg',
      gender: 'female'
    },
    'female-2': {
      name: 'Female Model 2',
      image: '/avatars/female-model-2.jpg',
      gender: 'female'
    },
    'male-1': {
      name: 'Male Model 1',
      image: '/avatars/male-model-1.jpg',
      gender: 'male'
    },
    'male-2': {
      name: 'Male Model 2',
      image: '/avatars/male-model-2.jpg',
      gender: 'male'
    },
    'child-1': {
      name: 'Child Model 1',
      image: '/avatars/child-model-1.jpg',
      gender: 'unisex'
    }
  };

  useEffect(() => {
    // Initialize canvas for virtual try-on rendering
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      canvas.width = 400;
      canvas.height = 600;
      
      // Clear canvas
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add placeholder text
      ctx.fillStyle = '#6b7280';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Virtual Try-On Preview', canvas.width / 2, canvas.height / 2);
    }
  }, []);

  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedPhoto(e.target.result);
        setPreviewMode('uploaded');
        toast.success('Photo uploaded successfully!');
      };
      reader.readAsDataURL(file);
    }
  };

  const processVirtualTryOn = async () => {
    setIsLoading(true);
    try {
      // Simulate AI processing for virtual try-on
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // In a real implementation, this would call an AI service
      // to overlay the outfit onto the model/uploaded photo
      renderVirtualTryOn();
      
      toast.success('Virtual try-on completed!');
    } catch (error) {
      toast.error('Failed to process virtual try-on');
    } finally {
      setIsLoading(false);
    }
  };

  const renderVirtualTryOn = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw model silhouette (placeholder)
    ctx.fillStyle = '#e5e7eb';
    ctx.fillRect(150, 50, 100, 200); // Body
    ctx.fillRect(175, 20, 50, 50);   // Head
    ctx.fillRect(125, 80, 150, 60);  // Arms
    ctx.fillRect(160, 250, 80, 200); // Legs
    
    // Overlay outfit items (placeholder visualization)
    if (outfit.items.top) {
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(140, 70, 120, 80);
      ctx.fillStyle = 'white';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(outfit.items.top.name, 200, 115);
    }
    
    if (outfit.items.bottom) {
      ctx.fillStyle = '#10b981';
      ctx.fillRect(150, 150, 100, 100);
      ctx.fillStyle = 'white';
      ctx.fillText(outfit.items.bottom.name, 200, 205);
    }
    
    if (outfit.items.shoes) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(160, 430, 80, 40);
      ctx.fillStyle = 'white';
      ctx.fillText(outfit.items.shoes.name, 200, 455);
    }
    
    // Add outfit name
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 16px Arial';
    ctx.fillText(outfit.name, canvas.width / 2, 500);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `virtual-tryno-${outfit.name}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast.success('Image downloaded!');
  };

  const resetView = () => {
    setUploadedPhoto(null);
    setPreviewMode('model');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FiUser className="w-6 h-6 text-purple-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">Virtual Try-On</h2>
              <p className="text-sm text-gray-600">Preview "{outfit?.name}" outfit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Controls Panel */}
            <div className="space-y-6">
              {/* Photo Upload */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <FiCamera className="w-4 h-4" />
                  Photo Upload
                </h3>
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <FiUpload className="w-4 h-4" />
                    Upload Your Photo
                  </button>
                  {uploadedPhoto && (
                    <div className="relative">
                      <img
                        src={uploadedPhoto}
                        alt="Uploaded"
                        className="w-full h-32 object-cover rounded-md"
                      />
                      <button
                        onClick={resetView}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Model Selection */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <FiUser className="w-4 h-4" />
                  Select Model
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(avatarModels).map(([key, model]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedModel(key)}
                      className={`p-2 rounded-md border-2 transition ${
                        selectedModel === key
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-full h-20 bg-gray-200 rounded mb-1 flex items-center justify-center">
                        <FiUser className="w-8 h-8 text-gray-400" />
                      </div>
                      <div className="text-xs text-center">{model.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model Settings */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
                  <FiSettings className="w-4 h-4" />
                  Model Settings
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Body Type</label>
                    <select
                      value={modelSettings.bodyType}
                      onChange={(e) => setModelSettings(prev => ({ ...prev, bodyType: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="slim">Slim</option>
                      <option value="average">Average</option>
                      <option value="athletic">Athletic</option>
                      <option value="curvy">Curvy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Height</label>
                    <select
                      value={modelSettings.height}
                      onChange={(e) => setModelSettings(prev => ({ ...prev, height: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="short">Short (5'0" - 5'4")</option>
                      <option value="average">Average (5'4" - 5'8")</option>
                      <option value="tall">Tall (5'8" - 6'2")</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Age Group</label>
                    <select
                      value={modelSettings.age}
                      onChange={(e) => setModelSettings(prev => ({ ...prev, age: e.target.value }))}
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="teen">Teen (13-19)</option>
                      <option value="adult">Adult (20-50)</option>
                      <option value="senior">Senior (50+)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Outfit Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Current Outfit</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>Name: {outfit.name}</div>
                  <div>Total Price: ${(outfit.totalPrice || 0).toFixed(2)}</div>
                  <div>Items: {Object.values(outfit.items || {}).filter(Boolean).length}</div>
                </div>
              </div>
            </div>

            {/* Virtual Try-On Preview */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-medium text-gray-800">Preview</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={processVirtualTryOn}
                      disabled={isLoading}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition flex items-center gap-2"
                    >
                      <FiRotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                      {isLoading ? 'Processing...' : 'Try On'}
                    </button>
                    <button
                      onClick={downloadImage}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition flex items-center gap-2"
                    >
                      <FiDownload className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>

                {/* Canvas for virtual try-on */}
                <div className="flex justify-center">
                  <div className="relative">
                    <canvas
                      ref={canvasRef}
                      className="border border-gray-300 rounded-lg shadow-sm"
                      style={{ maxWidth: '100%', height: 'auto' }}
                    />
                    {isLoading && (
                      <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center rounded-lg">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-2"></div>
                          <p className="text-gray-600">AI is processing your virtual try-on...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tips */}
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">Tips for best results:</h4>
                  <ul className="text-xs text-yellow-700 space-y-1">
                    <li>• Upload a clear, front-facing photo with good lighting</li>
                    <li>• Ensure you're wearing form-fitting clothes for accurate sizing</li>
                    <li>• Stand straight with arms slightly away from your body</li>
                    <li>• Use a plain background for better processing</li>
                  </ul>
                </div>
              </div>

              {/* Outfit Details */}
              <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3">Outfit Components</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {outfit.items.top && (
                    <div className="text-center">
                      <div className="w-full h-16 bg-blue-100 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-xs">TOP</span>
                      </div>
                      <div className="text-xs">
                        <div className="font-medium">{outfit.items.top.name}</div>
                        <div className="text-gray-600">${outfit.items.top.price}</div>
                      </div>
                    </div>
                  )}
                  {outfit.items.bottom && (
                    <div className="text-center">
                      <div className="w-full h-16 bg-green-100 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-green-600 font-medium text-xs">BOTTOM</span>
                      </div>
                      <div className="text-xs">
                        <div className="font-medium">{outfit.items.bottom.name}</div>
                        <div className="text-gray-600">${outfit.items.bottom.price}</div>
                      </div>
                    </div>
                  )}
                  {outfit.items.shoes && (
                    <div className="text-center">
                      <div className="w-full h-16 bg-yellow-100 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-yellow-600 font-medium text-xs">SHOES</span>
                      </div>
                      <div className="text-xs">
                        <div className="font-medium">{outfit.items.shoes.name}</div>
                        <div className="text-gray-600">${outfit.items.shoes.price}</div>
                      </div>
                    </div>
                  )}
                  {outfit.items.accessories && outfit.items.accessories.length > 0 && (
                    <div className="text-center">
                      <div className="w-full h-16 bg-purple-100 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-purple-600 font-medium text-xs">
                          ACCESSORIES ({outfit.items.accessories.length})
                        </span>
                      </div>
                      <div className="text-xs">
                        <div className="font-medium">Multiple Items</div>
                        <div className="text-gray-600">
                          ${outfit.items.accessories.reduce((sum, acc) => sum + (acc.price || 0), 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;