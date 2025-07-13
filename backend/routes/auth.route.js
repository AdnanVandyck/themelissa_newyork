// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const User = require("../models/User.js");
// const router = express.Router();

// // POST login - Enhanced to support email or username
// router.post("/login", async (req, res) => {
//   try {
//     console.log("POST /api/auth/login");
//     console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
    
//     const { username, email, password } = req.body;
//     const loginIdentifier = email || username; // Support both email and username

//     // Validate input
//     if (!loginIdentifier || !password) {
//       return res
//         .status(400)
//         .json({ message: "Email/Username and password are required" });
//     }

//     // Find User by email or username
//     const user = await User.findOne({
//       $or: [
//         { email: loginIdentifier },
//         { username: loginIdentifier }
//       ]
//     });

//     if (!user) {
//       console.log("User not found:", loginIdentifier);
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // Use the new comparePassword method from User model
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       console.log("Invalid password for user:", loginIdentifier);
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // Check if JWT_Secret exists before creating token
//     if (!process.env.JWT_SECRET) {
//       console.log('JWT_SECRET is missing from environment variables');
//       return res.status(500).json({ message: 'Server configuration error'});
//     }

//     // Create Token - Include role in JWT payload
//     const token = jwt.sign(
//       { 
//         userId: user._id, 
//         username: user.username,
//         role: user.role // Added role to token payload
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "24h" }
//     );

//     console.log("User logged in successfully:", user.username, "Role:", user.role);
//     res.json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         role: user.role,
//       },
//     });
//   } catch (error) {
//     console.log("Login error:", error.message);
//     res.status(500).json({
//       message: "Login error",
//       error: error.message,
//     });
//   }
// });

// // POST register - Enhanced to include email
// router.post("/register", async (req, res) => {
//   try {
//     console.log("POST /api/auth/register");
//     const { username, email, password, role } = req.body;

//     // Validate input
//     if (!username || !email || !password) {
//       return res
//         .status(400)
//         .json({ message: "Username, email, and password are required" });
//     }

//     // Check if user exists (by username or email)
//     const existingUser = await User.findOne({
//       $or: [
//         { username: username },
//         { email: email }
//       ]
//     });

//     if (existingUser) {
//       const field = existingUser.username === username ? 'Username' : 'Email';
//       return res.status(400).json({ 
//         message: `${field} already exists` 
//       });
//     }

//     // Create user (password will be hashed automatically by the pre('save') middleware)
//     const user = new User({ 
//       username, 
//       email, 
//       password,
//       role: role || 'admin' // Default to admin as per your schema
//     });
    
//     await user.save();

//     console.log("User registered successfully:", username, "Email:", email);
//     res.status(201).json({
//       message: "User created successfully",
//       user: { 
//         id: user._id, 
//         username: user.username, 
//         email: user.email,
//         role: user.role 
//       },
//     });
//   } catch (error) {
//     console.log("Registration error:", error.message);
    
//     // Handle mongoose validation errors nicely
//     if (error.name === 'ValidationError') {
//       const validationErrors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({
//         message: "Validation error",
//         errors: validationErrors
//       });
//     }

//     res.status(400).json({
//       message: "Registration error",
//       error: error.message,
//     });
//   }
// });

// // GET verify token - NEW ENDPOINT
// router.get("/verify", async (req, res) => {
//   try {
//     const token = req.header('Authorization')?.replace('Bearer ', '');
    
//     if (!token) {
//       return res.status(401).json({ message: 'No token provided' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.userId).select('-password');

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     console.log("Token verified for user:", user.username);
//     res.json({
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         role: user.role
//       }
//     });

//   } catch (error) {
//     console.error('Token verification error:', error.message);
//     res.status(401).json({ message: 'Invalid token' });
//   }
// });

// module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const { authMiddleware } = require('../middleware/auth'); // Add this import
const router = express.Router();

// POST login - Enhanced to support email or username (KEEPING YOUR EXISTING LOGIC)
router.post("/login", async (req, res) => {
  try {
    console.log("POST /api/auth/login");
    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
    
    const { username, email, password } = req.body;
    const loginIdentifier = email || username; // Support both email and username

    // Validate input
    if (!loginIdentifier || !password) {
      return res
        .status(400)
        .json({ message: "Email/Username and password are required" });
    }

    // Find User by email or username
    const user = await User.findOne({
      $or: [
        { email: loginIdentifier },
        { username: loginIdentifier }
      ]
    });

    if (!user) {
      console.log("User not found:", loginIdentifier);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if user is active (NEW: Add this check)
    if (!user.isActive) {
      console.log("User account deactivated:", loginIdentifier);
      return res.status(401).json({ message: "Account has been deactivated" });
    }

    // Use the new comparePassword method from User model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("Invalid password for user:", loginIdentifier);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if JWT_Secret exists before creating token
    if (!process.env.JWT_SECRET) {
      console.log('JWT_SECRET is missing from environment variables');
      return res.status(500).json({ message: 'Server configuration error'});
    }

    // Update last login (NEW: Track login activity)
    user.lastLogin = new Date();
    await user.save();

    // Create Token - Include role in JWT payload
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        role: user.role // Added role to token payload
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" } // Changed to 7 days for better UX
    );

    console.log("User logged in successfully:", user.username, "Role:", user.role);
    res.json({
      success: true, // NEW: Add success flag
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName, // NEW: Add these fields
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions, // NEW: Include permissions
        lastLogin: user.lastLogin
      },
    });
  } catch (error) {
    console.log("Login error:", error.message);
    res.status(500).json({
      success: false,
      message: "Login error",
      error: error.message,
    });
  }
});

// POST register - NOW REQUIRES ADMIN AUTHENTICATION (UPDATED)
router.post("/register", authMiddleware, async (req, res) => {
  try {
    console.log("POST /api/auth/register - Admin registering new user");
    console.log("Registering admin:", req.user.username);

    // Check if current user has permission to create users
    if (req.user.role !== 'admin' && !req.user.permissions?.users?.create) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to register new users'
      });
    }

    const { 
      username, 
      email, 
      password, 
      firstName, 
      lastName, 
      role = 'staff',
      permissions 
    } = req.body;

    // Validate required fields
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: username, email, password, firstName, lastName'
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if username already exists
    const existingUsername = await User.findOne({ 
      username: username.toLowerCase() 
    });
    if (existingUsername) {
      return res.status(409).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ 
      email: email.toLowerCase() 
    });
    if (existingEmail) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Validate role
    const validRoles = ['admin', 'manager', 'staff'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be admin, manager, or staff'
      });
    }

    // Only admins can create other admins
    if (role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can create other admin accounts'
      });
    }

    // Set default permissions based on role
    let userPermissions = {
      units: {
        create: role === 'admin' || role === 'manager',
        read: true,
        update: role === 'admin' || role === 'manager',
        delete: role === 'admin'
      },
      contacts: {
        read: true,
        update: role === 'admin' || role === 'manager',
        delete: role === 'admin'
      },
      gallery: {
        create: role === 'admin' || role === 'manager',
        read: true,
        update: role === 'admin' || role === 'manager',
        delete: role === 'admin'
      },
      users: {
        create: role === 'admin',
        read: role === 'admin',
        update: role === 'admin',
        delete: role === 'admin'
      }
    };

    // Override with custom permissions if provided
    if (permissions) {
      userPermissions = { ...userPermissions, ...permissions };
    }

    // Create new user
    const newUser = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save middleware
      firstName,
      lastName,
      role,
      permissions: userPermissions,
      registeredBy: req.user._id
    });

    await newUser.save();

    console.log('✅ New user registered by admin:', req.user.username, '- New user:', newUser.username);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        permissions: newUser.permissions,
        isActive: newUser.isActive
      }
    });

  } catch (error) {
    console.log("Registration error:", error.message);
    
    // Handle mongoose validation errors nicely
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationErrors
      });
    }

    res.status(500).json({
      success: false,
      message: "Registration error",
      error: error.message,
    });
  }
});

// GET verify token - ENHANCED (IMPROVED)
router.get("/verify", authMiddleware, async (req, res) => {
  try {
    console.log('GET /api/auth/verify - Token verification for:', req.user.username);
    
    res.json({
      success: true,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        role: req.user.role,
        permissions: req.user.permissions,
        lastLogin: req.user.lastLogin,
        isActive: req.user.isActive
      }
    });

  } catch (error) {
    console.error('Token verification error:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Server error during token verification' 
    });
  }
});

// GET all users - NEW ENDPOINT (admin only)
router.get('/users', authMiddleware, async (req, res) => {
  try {
    console.log('GET /api/auth/users - Admin fetching all users');
    console.log('Requesting admin:', req.user.username);

    // Check permissions
    if (req.user.role !== 'admin' && !req.user.permissions?.users?.read) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view users'
      });
    }

    const users = await User.find()
      .select('-password')
      .populate('registeredBy', 'username firstName lastName')
      .sort({ createdAt: -1 });

    console.log(`Found ${users.length} users`);

    res.json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
});

// PUT update user - NEW ENDPOINT (admin only)
router.put('/users/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`PUT /api/auth/users/${req.params.id} - Admin updating user`);
    console.log('Updating admin:', req.user.username);

    // Check permissions
    if (req.user.role !== 'admin' && !req.user.permissions?.users?.update) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update users'
      });
    }

    const { firstName, lastName, email, role, isActive, permissions } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email.toLowerCase();
    if (role) user.role = role;
    if (isActive !== undefined) user.isActive = isActive;
    if (permissions) user.permissions = { ...user.permissions, ...permissions };

    await user.save();

    console.log('✅ User updated:', user.username);

    res.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        permissions: user.permissions,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user'
    });
  }
});

// DELETE deactivate user - NEW ENDPOINT (admin only)
router.delete('/users/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`DELETE /api/auth/users/${req.params.id} - Admin deactivating user`);
    console.log('Deactivating admin:', req.user.username);

    // Check permissions
    if (req.user.role !== 'admin' && !req.user.permissions?.users?.delete) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to deactivate users'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate your own account'
      });
    }

    // Deactivate instead of delete
    user.isActive = false;
    await user.save();

    console.log('✅ User deactivated:', user.username);

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });

  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deactivating user'
    });
  }
});

module.exports = router;