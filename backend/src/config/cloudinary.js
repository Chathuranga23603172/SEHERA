const cloudinary = require('cloudinary').v2; 
const { CloudinaryStorage } = require('multer-storage-cloudinary'); 
const multer = require('multer'); 
// Configure Cloudinary 
cloudinary.config({ 
cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
api_key: process.env.CLOUDINARY_API_KEY, 
api_secret: process.env.CLOUDINARY_API_SECRET, 
}); 
// Test Cloudinary connection 
const testCloudinaryConnection = async () => { 
try { 
const result = await cloudinary.api.ping(); 
console.log('Cloudinary connection successful:', result); 
} catch (error) { 
    console.error('Cloudinary connection failed:', error.message); 
  } 
}; 
 
// Storage configurations for different clothing categories 
const createStorage = (folder) => { 
  return new CloudinaryStorage({ 
    cloudinary: cloudinary, 
    params: { 
      folder: `fashion-app/${folder}`, 
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'], 
      transformation: [ 
        { width: 800, height: 800, crop: 'limit' }, 
        { quality: 'auto', fetch_format: 'auto' } 
      ], 
      public_id: (req, file) => { 
        const timestamp = Date.now(); 
        const originalName = file.originalname.split('.')[0]; 
        return `${originalName}-${timestamp}`; 
      }, 
    }, 
  }); 
}; 
 
// Multer configurations for different clothing categories 
const menswearStorage = createStorage('menswear'); 
const womenswearStorage = createStorage('womenswear'); 
const kidswearStorage = createStorage('kidswear'); 
const styleComboStorage = createStorage('style-combos'); 
// File filter function 
const fileFilter = (req, file, cb) => { 
// Check file type 
if (file.mimetype.startsWith('image/')) { 
cb(null, true); 
} else { 
cb(new Error('Only image files are allowed'), false); 
} 
}; 
// Upload middleware configurations 
const uploadConfig = { 
fileFilter, 
limits: { 
fileSize: 5 * 1024 * 1024, // 5MB limit 
files: 5, // Maximum 5 files per request 
}, 
}; 
// Create upload middleware for different categories 
const uploadMiddleware = { 
menswear: multer({  
    storage: menswearStorage,  
    ...uploadConfig  
  }), 
  womenswear: multer({  
    storage: womenswearStorage,  
    ...uploadConfig  
  }), 
  kidswear: multer({  
    storage: kidswearStorage,  
    ...uploadConfig  
  }), 
  styleCombo: multer({  
    storage: styleComboStorage,  
    ...uploadConfig  
  }), 
}; 
 
// Helper functions for Cloudinary operations 
const cloudinaryHelpers = { 
  // Upload single image 
  uploadImage: async (filePath, folder = 'general') => { 
    try { 
      const result = await cloudinary.uploader.upload(filePath, { 
        folder: `fashion-app/${folder}`, 
        transformation: [ 
          { width: 800, height: 800, crop: 'limit' }, 
          { quality: 'auto', fetch_format: 'auto' } 
        ], 
      }); 
      return { 
        public_id: result.public_id, 
        url: result.secure_url, 
        width: result.width, 
        height: result.height, 
      }; 
    } catch (error) { 
      console.error('Error uploading image to Cloudinary:', error); 
      throw error; 
    } 
  }, 
 
  // Upload multiple images 
  uploadMultipleImages: async (filePaths, folder = 'general') => { 
    try { 
      const uploadPromises = filePaths.map(filePath =>  
        cloudinaryHelpers.uploadImage(filePath, folder) 
      ); 
      const results = await Promise.all(uploadPromises); 
      return results; 
    } catch (error) { 
      console.error('Error uploading multiple images:', error); 
      throw error; 
    } 
  }, 
 
  // Delete image 
  deleteImage: async (publicId) => { 
    try { 
      const result = await cloudinary.uploader.destroy(publicId); 
      return result; 
    } catch (error) { 
      console.error('Error deleting image from Cloudinary:', error); 
      throw error; 
    } 
  }, 
 
  // Delete multiple images 
  deleteMultipleImages: async (publicIds) => { 
    try { 
      const result = await cloudinary.api.delete_resources(publicIds); 
      return result; 
    } catch (error) { 
      console.error('Error deleting multiple images:', error); 
      throw error; 
    } 
  }, 
 
  // Get image details 
  getImageDetails: async (publicId) => { 
    try { 
      const result = await cloudinary.api.resource(publicId); 
      return result; 
    } catch (error) { 
      console.error('Error getting image details:', error); 
      throw error; 
    } 
  }, 
 
  // Generate thumbnail URL 
  generateThumbnail: (publicId, width = 200, height = 200) => { 
    return cloudinary.url(publicId, { 
      transformation: [ 
        { width, height, crop: 'fill' }, 
        { quality: 'auto', fetch_format: 'auto' } 
      ] 
    }); 
  }, 
 
  // Generate optimized URL 
  generateOptimizedUrl: (publicId, options = {}) => { 
    const defaultOptions = { 
      quality: 'auto', 
      fetch_format: 'auto', 
      crop: 'limit', 
width: 800, 
height: 800, 
}; 
return cloudinary.url(publicId, { 
transformation: [{ ...defaultOptions, ...options }] 
}); 
}, 
}; 
// Initialize connection test 
if (process.env.NODE_ENV !== 'test') { 
testCloudinaryConnection(); 
} 
module.exports = { 
cloudinary, 
uploadMiddleware, 
cloudinaryHelpers, 
testCloudinaryConnection, 
};