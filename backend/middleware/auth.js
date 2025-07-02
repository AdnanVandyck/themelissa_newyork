const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to verify JWT token
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Attach user to request object
    req.user = user;
    console.log('Auth middleware: User authenticated -', user.username, 'Role:', user.role);
    next();
    
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user is admin
const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    console.log('Admin access denied for user:', req.user.username);
    return res.status(403).json({ 
      message: 'Access denied. Admin privileges required.' 
    });
  }
  
  console.log('Admin access granted for user:', req.user.username);
  next();
};

module.exports = { authMiddleware, adminMiddleware };