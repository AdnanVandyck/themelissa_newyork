// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// // Middleware to verify JWT token
// const authMiddleware = async (req, res, next) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');
    
//     if (!token) {
//       return res.status(401).json({ 
//         message: 'Access denied. No token provided.' 
//       });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.userId).select('-password');

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Attach user to request object
//     req.user = user;
//     console.log('Auth middleware: User authenticated -', user.username, 'Role:', user.role);
//     next();
    
//   } catch (error) {
//     console.error('Auth middleware error:', error.message);
//     res.status(401).json({ message: 'Invalid token' });
//   }
// };

// // Middleware to check if user is admin
// const adminMiddleware = (req, res, next) => {
//   if (req.user.role !== 'admin') {
//     console.log('Admin access denied for user:', req.user.username);
//     return res.status(403).json({ 
//       message: 'Access denied. Admin privileges required.' 
//     });
//   }
  
//   console.log('Admin access granted for user:', req.user.username);
//   next();
// };

// module.exports = { authMiddleware, adminMiddleware };

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, // Added for consistency
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    // NEW: Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        message: 'Account has been deactivated' 
      });
    }

    // Attach user to request object
    req.user = user;
    console.log('Auth middleware: User authenticated -', user.username, 'Role:', user.role);
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    // Enhanced error handling
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: 'Token expired' 
      });
    }
    
    res.status(401).json({ 
      success: false,
      message: 'Authentication failed' 
    });
  }
};

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    console.log('Admin access denied for user:', req.user.username);
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin privileges required.' 
    });
  }
  
  console.log('Admin access granted for user:', req.user.username);
  next();
};

// NEW: Enhanced admin middleware that also allows managers for some operations
const adminOrManagerMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'manager') {
    console.log('Admin/Manager access denied for user:', req.user.username, 'Role:', req.user.role);
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin or Manager privileges required.' 
    });
  }
  
  console.log('Admin/Manager access granted for user:', req.user.username, 'Role:', req.user.role);
  next();
};

// NEW: Permission-based middleware factory
const permissionMiddleware = (resource, action) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Admins have all permissions
      if (req.user.role === 'admin') {
        console.log('Permission granted for admin:', req.user.username);
        return next();
      }

      // Check specific permission
      const hasPermission = req.user.permissions?.[resource]?.[action];
      
      if (!hasPermission) {
        console.log(`Permission denied for user: ${req.user.username}, Resource: ${resource}, Action: ${action}`);
        return res.status(403).json({
          success: false,
          message: `Insufficient permissions for ${action} on ${resource}`
        });
      }

      console.log(`Permission granted for user: ${req.user.username}, Resource: ${resource}, Action: ${action}`);
      next();

    } catch (error) {
      console.error('Permission middleware error:', error);
      res.status(500).json({
        success: false,
        message: 'Server error checking permissions'
      });
    }
  };
};

module.exports = { 
  authMiddleware, 
  adminMiddleware,
  adminOrManagerMiddleware, // NEW
  permissionMiddleware       // NEW
};