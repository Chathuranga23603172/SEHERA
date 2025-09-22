const cloudinary = require('cloudinary').v2; 
const multer = require('multer'); 
const { CloudinaryStorage } = require('multer-storage-cloudinary'); 
const path = require('path'); 
// Configure Cloudinary 
cloudinary.config({ 
cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
api_key: process.env.CLOUDINARY_API_KEY, 
api_secret: process.env.CLOUDINARY_API_SECRET, 
}); 
// Configure Cloudinary storage for multer 
const storage = new CloudinaryStorage({ 
cloudinary: cloudinary, 
params: { 
folder: 'fashion-app', 
allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'], 
transformation: [ 
{ width: 1000, height: 1000, crop: 'limit' }, 
{ quality: 'auto' } 
] 
}, 
}); 
// Multer configuration 
const upload = multer({ 
storage: storage, 
limits: { 
fileSize: 5 * 1024 * 1024, // 5MB limit 
}, 
fileFilter: (req, file, cb) => { 
const allowedTypes = /jpeg|jpg|png|gif|webp/; 
const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase()); 
const mimetype = allowedTypes.test(file.mimetype); 
if (mimetype && extname) { 
return cb(null, true); 
} else { 
cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)')); 
} 
}, 
}); 
// Upload single image 
const uploadSingle = (fieldName) => { 
return upload.single(fieldName); 
}; 
// Upload multiple images 
const uploadMultiple = (fieldName, maxCount = 5) => { 
return upload.array(fieldName, maxCount); 
}; 
// Delete image from Cloudinary 
const deleteImage = async (publicId) => { 
try { 
const result = await cloudinary.uploader.destroy(publicId); 
return result; 
} catch (error) { 
throw new Error(`Failed to delete image: ${error.message}`); 
} 
}; 
// Upload image to specific folder based on category 
const uploadToCategory = (category) => { 
const categoryStorage = new CloudinaryStorage({ 
cloudinary: cloudinary, 
params: { 
folder: `fashion-app/${category}`, 
allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'], 
transformation: [ 
{ width: 1000, height: 1000, crop: 'limit' }, 
{ quality: 'auto' } 
      ] 
    }, 
  }); 
 
  return multer({ 
    storage: categoryStorage, 
    limits: { fileSize: 5 * 1024 * 1024 }, 
    fileFilter: (req, file, cb) => { 
      const allowedTypes = /jpeg|jpg|png|gif|webp/; 
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase()); 
      const mimetype = allowedTypes.test(file.mimetype); 
 
      if (mimetype && extname) { 
        return cb(null, true); 
      } else { 
        cb(new Error('Only image files are allowed')); 
      } 
    }, 
  }); 
}; 
 
// Extract public ID from Cloudinary URL 
const extractPublicId = (url) => { 
  const parts = url.split('/'); 
  const filename = parts[parts.length - 1]; 
  return filename.split('.')[0]; 
}; 
// Generate optimized image URL 
const getOptimizedImageUrl = (publicId, options = {}) => { 
const { 
width = 300, 
height = 300, 
crop = 'fill', 
quality = 'auto', 
format = 'auto' 
} = options; 
return cloudinary.url(publicId, { 
width, 
height, 
crop, 
quality, 
format, 
}); 
}; 
module.exports = { 
cloudinary, 
uploadSingle, 
uploadMultiple, 
uploadToCategory, 
deleteImage, 
extractPublicId, 
getOptimizedImageUrl, 
};