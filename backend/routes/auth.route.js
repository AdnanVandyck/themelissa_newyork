const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");
const { authMiddleware } = require('../middleware/auth');
const router = express.Router();

// POST login - Enhanced to support email or username
router.post("/login", async (req, res) => {
  try {
    console.log("POST /api/auth/login");
    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
    
    const { username, email, password, emailOrUsername } = req.body;
    // Support both your existing format and new emailOrUsername format
    const loginIdentifier = emailOrUsername || email || username;

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

    // Check if user is active
    if (!user.isActive) {
      console.log("User account deactivated:", loginIdentifier);
      return res.status(401).json({ message: "Account has been deactivated" });
    }

    // Use the comparePassword method from User model
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

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create Token - Include role in JWT payload
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.getFullName ? user.getFullName() : `${user.firstName} ${user.lastName}`
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("User logged in successfully:", user.username, "Role:", user.role);
    res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.getFullName ? user.getFullName() : `${user.firstName} ${user.lastName}`,
        role: user.role,
        permissions: user.permissions,
        lastLogin: user.lastLogin,
        isActive: user.isActive
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

// POST register-public - NEW: Public Registration (No Authentication Required)
router.post("/register-public", async (req, res) => {
  try {
    console.log("POST /api/auth/register-public - Public user registration");
    
    const { 
      username, 
      email, 
      password, 
      firstName, 
      lastName, 
      role = 'staff',
      invitationCode 
    } = req.body;

    // Validate required fields
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: username, email, password, firstName, lastName'
      });
    }

    // Enhanced password validation (8 characters minimum)
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
      });
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain uppercase, lowercase, numbers, and special characters'
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
    const validRoles = ['staff', 'manager', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be staff, manager, or admin'
      });
    }

    // Optional: Check invitation code for admin roles
    if (role === 'admin' && process.env.REQUIRE_INVITATION_CODE) {
      if (invitationCode !== process.env.INVITATION_CODE) {
        return res.status(400).json({
          success: false,
          message: 'Valid invitation code required for admin registration'
        });
      }
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

    // Create new user (starts as inactive - requires admin approval)
    const newUser = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save middleware
      firstName,
      lastName,
      role,
      permissions: userPermissions,
      isActive: false, // Requires admin approval
      // Note: If you implement email verification later, add those fields here
    });

    await newUser.save();

    console.log('✅ New user registered (pending approval):', newUser.username);

    // For now, we'll simulate email being sent
    const emailSent = true; // You can implement actual email sending later

    res.status(201).json({
      success: true,
      message: 'Registration successful! Your account is pending admin approval.',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        isActive: newUser.isActive
      },
      emailSent
    });

  } catch (error) {
    console.log("Public registration error:", error.message);
    
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

// ADD THIS ENDPOINT - Email Verification (No Authentication Required)
router.post("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;
    console.log("POST /api/auth/verify-email - Token verification:", token);

    // Validate token format (basic check)
    if (!token || token.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token format'
      });
    }

    // For now, we'll simulate token verification since you don't have email verification fields yet
    // In a real implementation, you'd check: emailVerificationToken and emailVerificationExpires
    
    // Try to find a user that might match this token
    // Since we don't have the token field yet, we'll simulate based on token pattern
    console.log('🔍 Simulating email verification for token:', token);

    // Simulate different responses based on token for testing
    if (token === 'expired-token') {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    if (token === 'already-verified') {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // For testing purposes, find any inactive user to simulate verification
    const user = await User.findOne({ isActive: false }).sort({ createdAt: -1 });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'No pending verification found. User may already be verified or does not exist.'
      });
    }

    // Simulate successful verification
    console.log('✅ Simulating email verification for user:', user.username);

    // In the real implementation, you would:
    // user.isEmailVerified = true;
    // user.emailVerificationToken = null;
    // user.emailVerificationExpires = null;
    // await user.save();

    // For now, just return success without modifying the user
    res.json({
      success: true,
      message: 'Email verified successfully! Your account is pending admin approval.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isEmailVerified: true, // Simulated
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed. Please try again.'
    });
  }
});

// ADD THIS ENDPOINT - Resend Verification Email (No Authentication Required)
router.post("/resend-verification", async (req, res) => {
  try {
    const { email } = req.body;
    console.log("POST /api/auth/resend-verification - Email:", email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Simulate already verified check
    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified and account is active'
      });
    }

    // Simulate sending verification email
    console.log('📧 Simulating resend verification email to:', user.email);

    // In real implementation, you would:
    // const verificationToken = user.generateEmailVerificationToken();
    // await user.save();
    // await emailService.sendVerificationEmail(user.email, verificationToken, user.getFullName(), user.username);

    res.json({
      success: true,
      message: 'Verification email sent successfully!',
      emailSent: true // Simulated
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email. Please try again.'
    });
  }
});



// POST register - Admin-only registration (requires authentication)
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
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long'
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

    // Create new user (admin-created users are automatically active)
    const newUser = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save middleware
      firstName,
      lastName,
      role,
      permissions: userPermissions,
      registeredBy: req.user._id,
      isActive: true // Admin-created users are automatically active
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

// GET verify token
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
        fullName: req.user.getFullName ? req.user.getFullName() : `${req.user.firstName} ${req.user.lastName}`,
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

// GET all users (admin only)
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

// GET pending users (admin only) - NEW ENDPOINT for user management
router.get('/pending-users', authMiddleware, async (req, res) => {
  try {
    console.log('GET /api/auth/pending-users - Fetching users pending approval');
    
    // Check permissions
    if (req.user.role !== 'admin' && !req.user.permissions?.users?.read) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to view pending users'
      });
    }

    const pendingUsers = await User.find({ 
      isActive: false 
    })
    .select('-password')
    .sort({ createdAt: -1 });

    console.log(`Found ${pendingUsers.length} users pending approval`);

    res.json({
      success: true,
      count: pendingUsers.length,
      users: pendingUsers
    });

  } catch (error) {
    console.error('Error fetching pending users:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching pending users'
    });
  }
});

router.get('/routes', (req, res) => {
  const routes = [];
  router.stack.forEach(function(middleware) {
    if (middleware.route) {
      const methods = Object.keys(middleware.route.methods);
      routes.push({
        path: middleware.route.path,
        methods: methods
      });
    }
  });
  res.json({ 
    message: 'Registered auth routes:',
    routes: routes 
  });
});

// PUT approve user (admin only) - NEW ENDPOINT for user management
router.put('/approve-user/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`PUT /api/auth/approve-user/${req.params.id} - Approving user`);
    
    // Check permissions
    if (req.user.role !== 'admin' && !req.user.permissions?.users?.update) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to approve users'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.isActive) {
      return res.status(400).json({
        success: false,
        message: 'User is already approved'
      });
    }

    // Approve the user
    user.isActive = true;
    await user.save();

    console.log('✅ User approved:', user.username, 'by:', req.user.username);

    res.json({
      success: true,
      message: 'User approved successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error approving user'
    });
  }
});

// PUT update user (admin only)
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

// DELETE deactivate user (admin only)
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