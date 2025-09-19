const multer = require('multer'); 
const path = require('path'); 
const fs = require('fs'); 
 
// Ensure upload directories exist 
const ensureDirectoryExists = (dirPath) => { 
if (!fs.existsSync(dirPath)) { 
fs.mkdirSync(dirPath, { recursive: true }); 
} 
}; 
// Configure storage 
const storage = multer.diskStorage({ 
destination: (req, file, cb) => { 
let uploadPath = 'uploads/'; 
// Determine upload path based on route 
if (req.baseUrl.includes('menswear')) { 
uploadPath += 'menswear/'; 
} else if (req.baseUrl.includes('womenswear')) { 
uploadPath += 'womenswear/'; 
} else if (req.baseUrl.includes('kidswear')) { 
uploadPath += 'kidswear/'; 
} else if (req.baseUrl.includes('style-combo')) { 
uploadPath += 'outfits/'; 
} else { 
uploadPath += 'general/'; 
} 
ensureDirectoryExists(uploadPath); 
cb(null, uploadPath); 
}, 
filename: (req, file, cb) => { 
// Create unique filename 
const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); 
const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname); 
cb(null, filename); 
} 
}); 
// File filter for images 
const fileFilter = (req, file, cb) => { 
// Check file type 
const allowedTypes = /jpeg|jpg|png|gif|webp/; 
const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase()); 
const mimetype = allowedTypes.test(file.mimetype); 
if (mimetype && extname) { 
return cb(null, true); 
} else { 
cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'), false); 
} 
}; 
// Configure multer 
const upload = multer({ 
storage: storage, 
limits: { 
fileSize: 5 * 1024 * 1024, // 5MB limit 
files: 5 // Maximum 5 files 
}, 
fileFilter: fileFilter 
}); 
// Single file upload 
const uploadSingle = (fieldName = 'image') => { 
return upload.single(fieldName); 
}; 
// Multiple files upload 
const uploadMultiple = (fieldName = 'images', maxCount = 5) => { 
return upload.array(fieldName, maxCount); 
}; 
// Handle upload errors 
const handleUploadError = (error, req, res, next) => { 
if (error instanceof multer.MulterError) { 
if (error.code === 'LIMIT_FILE_SIZE') { 
return res.status(400).json({ 
success: false, 
message: 'File size too large. Maximum size is 5MB' 
}); 
    } 
    if (error.code === 'LIMIT_FILE_COUNT') { 
      return res.status(400).json({ 
        success: false, 
        message: 'Too many files. Maximum is 5 files' 
      }); 
    } 
    if (error.code === 'LIMIT_UNEXPECTED_FILE') { 
      return res.status(400).json({ 
        success: false, 
        message: 'Unexpected file field' 
      }); 
    } 
  } 
   
  if (error.message.includes('Only image files are allowed')) { 
    return res.status(400).json({ 
      success: false, 
      message: error.message 
    }); 
  } 
 
  next(error); 
}; 
 
// Clean up uploaded files on error 
const cleanupFiles = (req, res, next) => { 
  res.on('finish', () => { 
    if (res.statusCode >= 400 && req.files) { 
      // Delete uploaded files if request failed 
      const files = Array.isArray(req.files) ? req.files : [req.file]; 
      files.forEach(file => { 
        if (file && file.path) { 
          fs.unlink(file.path, (err) => { 
            if (err) console.error('Error deleting file:', err); 
          }); 
        } 
      }); 
    } 
  }); 
  next(); 
}; 
 
module.exports = { 
  uploadSingle, 
  uploadMultiple, 
  handleUploadError, 
  cleanupFiles 
};