const jwt = require('jsonwebtoken'); 
const User = require('../models/User'); 
 
// Protect routes - Verify JWT token 
const protect = async (req, res, next) => { 
  try { 
    let token; 
 
    // Check for token in headers 
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) { 
      token = req.headers.authorization.split(' ')[1]; 
    } 
 
    if (!token) { 
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
      }); 
    } 
 
    try { 
      // Verify token 
      const decoded = jwt.verify(token, process.env.JWT_SECRET); 
       
      // Get user from token 
      req.user = await User.findById(decoded.id).select('-password'); 
       
      if (!req.user) { 
        return res.status(401).json({ 
          success: false, 
          message: 'User not found' 
        }); 
      } 
 
      next(); 
    } catch (error) { 
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized to access this route' 
      }); 
    } 
  } catch (error) { 
    return res.status(500).json({ 
      success: false, 
      message: 'Server Error' 
    }); 
  } 
}; 
 
// Grant access to specific roles 
const authorize = (...roles) => { 
  return (req, res, next) => { 
    if (!roles.includes(req.user.role)) { 
      return res.status(403).json({ 
        success: false, 
        message: `User role ${req.user.role} is not authorized to access this route` 
      }); 
    } 
    next(); 
  }; 
}; 
 
// Check if user owns the resource 
const checkOwnership = (model) => { 
  return async (req, res, next) => { 
    try { 
      const resource = await model.findById(req.params.id); 
       
      if (!resource) { 
        return res.status(404).json({ 
          success: false, 
          message: 'Resource not found' 
        }); 
      } 
 
      // Check if user owns the resource or is admin 
      if (resource.user.toString() !== req.user.id && req.user.role !== 'admin') { 
        return res.status(403).json({ 
          success: false, 
          message: 'Not authorized to access this resource' 
        }); 
      } 
 
      req.resource = resource; 
      next(); 
    } catch (error) { 
      return res.status(500).json({ 
        success: false, 
        message: 'Server Error' 
      }); 
    } 
  }; 
}; 
 
module.exports = { 
  protect, 
  authorize, 
  checkOwnership 
};