// const jwt = require('jsonwebtoken');
// const User = require('../models/User');

// // Middleware to verify JWT token
// const authMiddleware = async (req, res, next) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');
    
//     if (!token) {
//       return res.status(401).json({ 
//         success: false, // Added for consistency
//         message: 'Access denied. No token provided.' 
//       });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.userId).select('-password');

//     if (!user) {
//       return res.status(404).json({ 
//         success: false,
//         message: 'User not found' 
//       });
//     }

//     // NEW: Check if user is active
//     if (!user.isActive) {
//       return res.status(401).json({ 
//         success: false,
//         message: 'Account has been deactivated' 
//       });
//     }

//     // Attach user to request object
//     req.user = user;
//     console.log('Auth middleware: User authenticated -', user.username, 'Role:', user.role);
//     next();
    
//   } catch (error) {
//     console.error('Auth middleware error:', error.message);
    
//     // Enhanced error handling
//     if (error.name === 'JsonWebTokenError') {
//       return res.status(401).json({ 
//         success: false,
//         message: 'Invalid token' 
//       });
//     }
    
//     if (error.name === 'TokenExpiredError') {
//       return res.status(401).json({ 
//         success: false,
//         message: 'Token expired' 
//       });
//     }
    
//     res.status(401).json({ 
//       success: false,
//       message: 'Authentication failed' 
//     });
//   }
// };

// // Middleware to check if user is admin
// const adminMiddleware = (req, res, next) => {
//   if (req.user.role !== 'admin') {
//     console.log('Admin access denied for user:', req.user.username);
//     return res.status(403).json({ 
//       success: false,
//       message: 'Access denied. Admin privileges required.' 
//     });
//   }
  
//   console.log('Admin access granted for user:', req.user.username);
//   next();
// };

// // NEW: Enhanced admin middleware that also allows managers for some operations
// const adminOrManagerMiddleware = (req, res, next) => {
//   if (req.user.role !== 'admin' && req.user.role !== 'manager') {
//     console.log('Admin/Manager access denied for user:', req.user.username, 'Role:', req.user.role);
//     return res.status(403).json({ 
//       success: false,
//       message: 'Access denied. Admin or Manager privileges required.' 
//     });
//   }
  
//   console.log('Admin/Manager access granted for user:', req.user.username, 'Role:', req.user.role);
//   next();
// };

// // NEW: Permission-based middleware factory
// const permissionMiddleware = (resource, action) => {
//   return (req, res, next) => {
//     try {
//       if (!req.user) {
//         return res.status(401).json({
//           success: false,
//           message: 'Authentication required'
//         });
//       }

//       // Admins have all permissions
//       const adminRoles = ['admin', 'super_admin']
//       if (!adminRoles.includes(req.user.role)) {
//         console.log('Permission granted for admin:', req.user.username);
//         return next();
//       }

//       // Check specific permission
//       const hasPermission = req.user.permissions?.[resource]?.[action];
      
//       if (!hasPermission) {
//         console.log(`Permission denied for user: ${req.user.username}, Resource: ${resource}, Action: ${action}`);
//         return res.status(403).json({
//           success: false,
//           message: `Insufficient permissions for ${action} on ${resource}`
//         });
//       }

//       console.log(`Permission granted for user: ${req.user.username}, Resource: ${resource}, Action: ${action}`);
//       next();

//     } catch (error) {
//       console.error('Permission middleware error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Server error checking permissions'
//       });
//     }
//   };
// };

// module.exports = { 
//   authMiddleware, 
//   adminMiddleware,
//   adminOrManagerMiddleware, // NEW
//   permissionMiddleware       // NEW
// };

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

// FIXED: Middleware to check if user is admin or super_admin
const adminMiddleware = (req, res, next) => {
  const adminRoles = ['admin', 'super_admin'];
  
  if (!adminRoles.includes(req.user.role)) {
    console.log('Admin access denied for user:', req.user.username, 'Role:', req.user.role);
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin privileges required.' 
    });
  }
  
  console.log('Admin access granted for user:', req.user.username, 'Role:', req.user.role);
  next();
};

// FIXED: Enhanced admin middleware that also allows managers for some operations
const adminOrManagerMiddleware = (req, res, next) => {
  const allowedRoles = ['admin', 'super_admin', 'manager'];
  
  if (!allowedRoles.includes(req.user.role)) {
    console.log('Admin/Manager access denied for user:', req.user.username, 'Role:', req.user.role);
    return res.status(403).json({ 
      success: false,
      message: 'Access denied. Admin or Manager privileges required.' 
    });
  }
  
  console.log('Admin/Manager access granted for user:', req.user.username, 'Role:', req.user.role);
  next();
};

// FIXED: Permission-based middleware factory
const permissionMiddleware = (resource, action) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Admins and super_admins have all permissions
      const adminRoles = ['admin', 'super_admin'];
      if (adminRoles.includes(req.user.role)) {  // FIXED: Was backwards before
        console.log('Permission granted for admin/super_admin:', req.user.username, 'Role:', req.user.role);
        return next();
      }

      // Check specific permission for non-admin users
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

// NEW: Convenience middleware for common permission checks
const requireUnitsAccess = (action) => permissionMiddleware('units', action);
const requireUsersAccess = (action) => permissionMiddleware('users', action);
const requireContactsAccess = (action) => permissionMiddleware('contacts', action);
const requireGalleryAccess = (action) => permissionMiddleware('gallery', action);

// NEW: Role-based middleware factory
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      console.log(`Role access denied for user: ${req.user.username}, Required: [${allowedRoles.join(', ')}], Current: ${req.user.role}`);
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
      });
    }

    console.log(`Role access granted for user: ${req.user.username}, Role: ${req.user.role}`);
    next();
  };
};

module.exports = { 
  authMiddleware, 
  adminMiddleware,              // FIXED: Now includes super_admin
  adminOrManagerMiddleware,     // FIXED: Now includes super_admin
  permissionMiddleware,         // FIXED: Logic corrected
  requireUnitsAccess,           // NEW: Convenience functions
  requireUsersAccess,
  requireContactsAccess, 
  requireGalleryAccess,
  requireRole                   // NEW: Flexible role checking
};