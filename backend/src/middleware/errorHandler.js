const mongoose = require('mongoose'); 
// Global error handler 
const errorHandler = (err, req, res, next) => { 
let error = { ...err }; 
error.message = err.message; 
// Log error 
console.error('Error:', err); 
// Mongoose bad ObjectId 
if (err.name === 'CastError') { 
const message = 'Resource not found'; 
error = { 
statusCode: 404, 
message 
}; 
} 
// Mongoose duplicate key 
  if (err.code === 11000) { 
    let message = 'Duplicate field value entered'; 
    const field = Object.keys(err.keyValue)[0]; 
    const value = err.keyValue[field]; 
     
    if (field === 'email') { 
      message = 'Email already exists'; 
    } else { 
      message = `${field} '${value}' already exists`; 
    } 
     
    error = { 
      statusCode: 400, 
      message 
    }; 
  } 
 
  // Mongoose validation error 
  if (err.name === 'ValidationError') { 
    const message = Object.values(err.errors).map(val => val.message).join(', '); 
    error = { 
      statusCode: 400, 
      message: `Validation Error: ${message}` 
    }; 
  } 
 
  // JWT errors 
  if (err.name === 'JsonWebTokenError') { 
    const message = 'Invalid token'; 
    error = { 
      statusCode: 401, 
      message 
    }; 
  } 
 
  if (err.name === 'TokenExpiredError') { 
    const message = 'Token expired'; 
    error = { 
      statusCode: 401, 
      message 
    }; 
  } 
 
  // Multer errors (handled in upload middleware but fallback) 
  if (err.code === 'LIMIT_FILE_SIZE') { 
    error = { 
      statusCode: 400, 
      message: 'File size too large' 
    }; 
  } 
 
  // Stripe errors 
  if (err.type === 'StripeCardError') { 
    error = { 
      statusCode: 400, 
      message: err.message || 'Payment failed' 
    }; 
  } 
 
  if (err.type === 'StripeInvalidRequestError') { 
    error = { 
      statusCode: 400, 
      message: 'Invalid payment request' 
    }; 
  } 
 
  res.status(error.statusCode || 500).json({ 
    success: false, 
    message: error.message || 'Server Error', 
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) 
  }); 
}; 
 
// 404 handler for undefined routes 
const notFound = (req, res, next) => { 
  const error = new Error(`Not found - ${req.originalUrl}`); 
res.status(404); 
next(error); 
}; 
// Async handler to catch async errors 
const asyncHandler = (fn) => (req, res, next) => { 
Promise.resolve(fn(req, res, next)).catch(next); 
}; 
// Rate limiting error handler 
const rateLimitHandler = (req, res) => { 
res.status(429).json({ 
success: false, 
message: 'Too many requests, please try again later' 
}); 
}; 
module.exports = { 
errorHandler, 
notFound, 
asyncHandler, 
rateLimitHandler 
};