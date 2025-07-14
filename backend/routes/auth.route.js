const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // REQUIRED for token generation
const User = require("../models/User.js");
const { authMiddleware } = require('../middleware/auth');
const emailService = require('../config/emailService'); // MUST be in config folder
const router = express.Router();

// Helper function to generate verification token
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// POST login - Enhanced to support email or username with email verification check
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

    // Use the comparePassword method from User model
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("Invalid password for user:", loginIdentifier);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check if email is verified (NEW)
    if (!user.emailVerified) {
      console.log("Email not verified for user:", loginIdentifier);
      return res.status(401).json({ 
        message: "Please verify your email before logging in",
        emailNotVerified: true,
        email: user.email
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log("User account deactivated:", loginIdentifier);
      return res.status(401).json({ 
        message: "Your account is pending approval. Please contact an administrator.",
        pendingApproval: true
      });
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
        isActive: user.isActive,
        emailVerified: user.emailVerified // NEW
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

// POST register-public - Enhanced with real email verification
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

    // Generate verification token (NEW)
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user (starts as inactive and unverified)
    const newUser = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save middleware
      firstName,
      lastName,
      role,
      permissions: userPermissions,
      isActive: false, // Requires admin approval
      emailVerified: false, // NEW - Requires email verification
      emailVerificationToken: verificationToken, // NEW
      emailVerificationExpires: verificationExpires, // NEW
      verificationAttempts: 0 // NEW
    });

    await newUser.save();

    console.log('✅ New user registered (pending verification):', newUser.username);

    // Send verification email (NEW)
    try {
      const emailResult = await emailService.sendVerificationEmail(newUser, verificationToken);
      
      if (emailResult.success) {
        console.log('📧 Verification email sent successfully to:', newUser.email);
        res.status(201).json({
          success: true,
          message: 'Registration successful! Please check your email to verify your account.',
          user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role,
            isActive: newUser.isActive,
            emailVerified: newUser.emailVerified
          },
          emailSent: true
        });
      } else if (emailResult.simulated) {
        console.log('⚠️ Email service not configured - registration successful but no email sent');
        res.status(201).json({
          success: true,
          message: 'Registration successful! Email service not configured - please contact administrator for manual verification.',
          user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role,
            isActive: newUser.isActive,
            emailVerified: newUser.emailVerified
          },
          emailSent: false
        });
      } else {
        console.log('❌ Email sending failed:', emailResult.error);
        res.status(201).json({
          success: true,
          message: 'Registration successful! However, there was an issue sending the verification email. Please use the resend option.',
          user: {
            id: newUser._id,
            username: newUser.username,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role,
            isActive: newUser.isActive,
            emailVerified: newUser.emailVerified
          },
          emailSent: false
        });
      }
    } catch (emailError) {
      console.error('❌ Email sending failed with exception:', emailError);
      res.status(201).json({
        success: true,
        message: 'Registration successful! However, there was an issue sending the verification email. Please use the resend option.',
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          role: newUser.role,
          isActive: newUser.isActive,
          emailVerified: newUser.emailVerified
        },
        emailSent: false
      });
    }

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

// POST verify-email - Real email verification implementation
router.post("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;
    console.log("POST /api/auth/verify-email - Token verification:", token);

    // Validate token format
    if (!token || token.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token format'
      });
    }

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('❌ Invalid or expired token:', token);
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
        expired: true
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Update user verification status
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.verificationAttempts = 0;
    user.updatedAt = new Date();

    await user.save();

    console.log('✅ Email verified for user:', user.username);

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user);
      console.log('📧 Welcome email sent to:', user.email);
    } catch (emailError) {
      console.error('❌ Welcome email failed:', emailError);
      // Don't fail the verification if welcome email fails
    }

    // Notify admins about new verified user needing approval
    try {
      // Get all admin emails for notification
      const admins = await User.find({ role: 'admin', isActive: true, emailVerified: true });
      console.log(`📧 Notifying ${admins.length} admins about new verified user`);
      
      for (const admin of admins) {
        await emailService.sendNewUserNotification(admin.email, user);
      }
    } catch (notificationError) {
      console.error('❌ Admin notification failed:', notificationError);
      // Don't fail verification if admin notification fails
    }

    res.json({
      success: true,
      message: 'Email verified successfully! Your account is now pending admin approval.',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed. Please try again.'
    });
  }
});

// POST resend-verification - Real implementation
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

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Check attempt limit (prevent spam)
    if (user.verificationAttempts >= 3) {
      return res.status(429).json({
        success: false,
        message: 'Too many verification attempts. Please contact support.'
      });
    }

    // Generate new token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    user.verificationAttempts += 1;
    user.updatedAt = new Date();

    await user.save();

    // Send verification email
    try {
      const emailResult = await emailService.sendVerificationEmail(user, verificationToken);
      
      if (emailResult.success) {
        console.log('📧 Verification email resent to:', user.email);
        res.json({
          success: true,
          message: 'Verification email sent successfully!',
          attemptsRemaining: 3 - user.verificationAttempts
        });
      } else {
        console.log('❌ Failed to resend verification email');
        res.status(500).json({
          success: false,
          message: 'Failed to send verification email. Please try again later.'
        });
      }
    } catch (emailError) {
      console.error('❌ Resend verification email failed:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.'
      });
    }

  } catch (error) {
    console.error('❌ Resend verification error:', error);
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

    // Create new user (admin-created users are automatically active and verified)
    const newUser = new User({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password, // Will be hashed by pre-save middleware
      firstName,
      lastName,
      role,
      permissions: userPermissions,
      registeredBy: req.user._id,
      isActive: true, // Admin-created users are automatically active
      emailVerified: true // Admin-created users are automatically verified
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
        isActive: newUser.isActive,
        emailVerified: newUser.emailVerified
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
        isActive: req.user.isActive,
        emailVerified: req.user.emailVerified
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
      .select('-password -emailVerificationToken') // Don't expose sensitive data
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

// GET pending users (admin only) - Enhanced with email verification status
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
    .select('-password -emailVerificationToken') // Don't expose sensitive data
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

// PUT approve user (admin only) - Enhanced to require email verification
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

    // Check if email is verified (NEW)
    if (!user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve user with unverified email'
      });
    }

    // Approve the user
    user.isActive = true;
    user.updatedAt = new Date();
    await user.save();

    console.log('✅ User approved:', user.username, 'by:', req.user.username);

    // Send approval notification email
    try {
      await emailService.sendApprovalNotification(user);
      console.log('📧 Approval notification sent to:', user.email);
    } catch (emailError) {
      console.error('❌ Approval email failed:', emailError);
      // Don't fail approval if email fails
    }

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
        isActive: user.isActive,
        emailVerified: user.emailVerified
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

// PUT reject user (admin only) - NEW endpoint for rejecting users
router.put('/reject-user/:id', authMiddleware, async (req, res) => {
  try {
    console.log(`PUT /api/auth/reject-user/${req.params.id} - Rejecting user`);
    
    const { reason } = req.body;
    
    // Check permissions
    if (req.user.role !== 'admin' && !req.user.permissions?.users?.delete) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to reject users'
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
        message: 'Cannot reject an active user'
      });
    }

    console.log('✅ User rejected:', user.username, 'by:', req.user.username);

    // Send rejection notification email
    try {
      await emailService.sendRejectionNotification(user, reason);
      console.log('📧 Rejection notification sent to:', user.email);
    } catch (emailError) {
      console.error('❌ Rejection email failed:', emailError);
      // Continue with rejection even if email fails
    }

    // Remove the user from database
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User rejected and removed successfully'
    });

  } catch (error) {
    console.error('Error rejecting user:', error);
    res.status(500).json({
      success: false,
      message: 'Server error rejecting user'
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
    
    user.updatedAt = new Date();

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
        isActive: user.isActive,
        emailVerified: user.emailVerified
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
    user.updatedAt = new Date();
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

// GET routes - Debug endpoint
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

// GET test - Test endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth routes working correctly',
    timestamp: new Date().toISOString(),
    emailServiceConfigured: emailService.isConfigured
  });
});

module.exports = router;