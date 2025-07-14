// const express = require("express");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const crypto = require("crypto");
// const rateLimit = require("express-rate-limit"); // Add this package
// const validator = require("validator"); // Add this package for email validation
// const User = require("../models/User.js");
// const { authMiddleware } = require('../middleware/auth');
// const emailService = require('../config/emailService');
// const router = express.Router();

// // ===========================================
// // RATE LIMITING CONFIGURATIONS
// // ===========================================

// // Registration rate limiting
// const registrationLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 5, // Limit each IP to 5 registration attempts per hour
//   message: {
//     success: false,
//     message: 'Too many registration attempts. Please try again in 1 hour.',
//     code: 'REGISTRATION_LIMIT_EXCEEDED'
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// });

// // Email verification rate limiting
// const emailVerificationLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 3, // Limit each IP to 3 verification requests per 15 minutes
//   message: {
//     success: false,
//     message: 'Too many verification requests. Please try again in 15 minutes.',
//     code: 'RATE_LIMIT_EXCEEDED'
//   }
// });

// // Resend verification rate limiting
// const resendLimiter = rateLimit({
//   windowMs: 30 * 60 * 1000, // 30 minutes
//   max: 2, // Limit to 2 resend attempts per 30 minutes
//   message: {
//     success: false,
//     message: 'Too many resend requests. Please try again in 30 minutes.',
//     code: 'RESEND_LIMIT_EXCEEDED'
//   }
// });

// // Login rate limiting
// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // Limit each IP to 10 login attempts per 15 minutes
//   message: {
//     success: false,
//     message: 'Too many login attempts. Please try again in 15 minutes.',
//     code: 'LOGIN_LIMIT_EXCEEDED'
//   }
// });

// // ===========================================
// // HELPER FUNCTIONS
// // ===========================================

// // Generate secure verification token
// function generateVerificationToken() {
//   return crypto.randomBytes(32).toString('hex');
// }

// // Get client information for security tracking
// const getClientInfo = (req) => ({
//   ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
//   userAgent: req.get('User-Agent') || 'unknown'
// });

// // Enhanced password validation
// function validatePassword(password) {
//   const errors = [];
  
//   if (!password || password.length < 8) {
//     errors.push('Password must be at least 8 characters long');
//   }
  
//   if (!/(?=.*[a-z])/.test(password)) {
//     errors.push('Password must contain at least one lowercase letter');
//   }
  
//   if (!/(?=.*[A-Z])/.test(password)) {
//     errors.push('Password must contain at least one uppercase letter');
//   }
  
//   if (!/(?=.*\d)/.test(password)) {
//     errors.push('Password must contain at least one number');
//   }
  
//   if (!/(?=.*[@$!%*?&])/.test(password)) {
//     errors.push('Password must contain at least one special character (@$!%*?&)');
//   }
  
//   return errors;
// }

// // ===========================================
// // AUTHENTICATION ROUTES
// // ===========================================

// // POST login - Enhanced with security and email verification
// router.post("/login", loginLimiter, async (req, res) => {
//   try {
//     console.log("POST /api/auth/login");
//     console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
    
//     const { username, email, password, emailOrUsername } = req.body;
//     const loginIdentifier = emailOrUsername || email || username;

//     // Enhanced input validation
//     if (!loginIdentifier || !password) {
//       return res.status(400).json({ 
//         success: false,
//         message: "Email/Username and password are required" 
//       });
//     }

//     // Find User by email or username
//     const user = await User.findOne({
//       $or: [
//         { email: loginIdentifier.toLowerCase() },
//         { username: loginIdentifier.toLowerCase() }
//       ]
//     });

//     if (!user) {
//       console.log("User not found:", loginIdentifier);
//       return res.status(401).json({ 
//         success: false,
//         message: "Invalid credentials" 
//       });
//     }

//     // Check if account is locked
//     if (user.lockUntil && user.lockUntil > Date.now()) {
//       const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
//       return res.status(423).json({
//         success: false,
//         message: `Account temporarily locked. Try again in ${lockTimeRemaining} minutes.`,
//         code: 'ACCOUNT_LOCKED'
//       });
//     }

//     // Verify password
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       console.log("Invalid password for user:", loginIdentifier);
      
//       // Enhanced security: Track failed login attempts
//       user.loginAttempts = (user.loginAttempts || 0) + 1;
      
//       if (user.loginAttempts >= 5) {
//         user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
//         console.log(`Account locked for user: ${loginIdentifier} after 5 failed attempts`);
//       }
      
//       await user.save();
      
//       return res.status(401).json({ 
//         success: false,
//         message: "Invalid credentials" 
//       });
//     }

//     // Check if email is verified
//     if (!user.emailVerified) {
//       console.log("Email not verified for user:", loginIdentifier);
//       return res.status(403).json({ 
//         success: false,
//         message: "Please verify your email before logging in",
//         code: 'EMAIL_NOT_VERIFIED',
//         emailNotVerified: true,
//         email: user.email,
//         canResend: true
//       });
//     }

//     // Check if user is active
//     if (!user.isActive) {
//       console.log("User account deactivated:", loginIdentifier);
//       return res.status(403).json({ 
//         success: false,
//         message: "Your account is pending approval. Please contact an administrator.",
//         code: 'ACCOUNT_INACTIVE',
//         pendingApproval: true
//       });
//     }

//     // Check JWT_Secret
//     if (!process.env.JWT_SECRET) {
//       console.error('JWT_SECRET is missing from environment variables');
//       return res.status(500).json({ 
//         success: false,
//         message: 'Server configuration error'
//       });
//     }

//     // Reset login attempts and update last login
//     user.loginAttempts = 0;
//     user.lockUntil = undefined;
//     user.lastLogin = new Date();
    
//     // Track client info for security
//     const clientInfo = getClientInfo(req);
//     user.lastLoginIP = clientInfo.ipAddress;
//     user.lastLoginUserAgent = clientInfo.userAgent;
    
//     await user.save();

//     // Create enhanced JWT token
//     const token = jwt.sign(
//       { 
//         userId: user._id, 
//         username: user.username,
//         email: user.email,
//         role: user.role,
//         fullName: user.getFullName ? user.getFullName() : `${user.firstName} ${user.lastName}`,
//         emailVerified: user.emailVerified,
//         isActive: user.isActive
//       },
//       process.env.JWT_SECRET,
//       { expiresIn: "7d" }
//     );

//     console.log(`✅ User logged in successfully: ${user.username} (${user.role})`);
    
//     res.json({
//       success: true,
//       message: "Login successful",
//       token,
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         fullName: user.getFullName ? user.getFullName() : `${user.firstName} ${user.lastName}`,
//         role: user.role,
//         permissions: user.permissions,
//         lastLogin: user.lastLogin,
//         isActive: user.isActive,
//         emailVerified: user.emailVerified
//       },
//     });
    
//   } catch (error) {
//     console.error("Login error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Login error",
//       error: error.message,
//     });
//   }
// });

// // POST register-public - Enhanced with production email service
// router.post("/register-public", registrationLimiter, async (req, res) => {
//   try {
//     console.log("POST /api/auth/register-public - Public user registration");
    
//     const { 
//       username, 
//       email, 
//       password, 
//       firstName, 
//       lastName, 
//       role = 'staff',
//       invitationCode 
//     } = req.body;

//     // Enhanced input validation
//     const errors = [];
    
//     if (!firstName || firstName.trim().length < 2) {
//       errors.push('First name must be at least 2 characters');
//     }
//     if (!lastName || lastName.trim().length < 2) {
//       errors.push('Last name must be at least 2 characters');
//     }
//     if (!username || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
//       errors.push('Username must be 3-20 characters (letters, numbers, underscore only)');
//     }
//     if (!email || !validator.isEmail(email)) {
//       errors.push('Valid email address required');
//     }
//     if (!password) {
//       errors.push('Password is required');
//     } else {
//       const passwordErrors = validatePassword(password);
//       errors.push(...passwordErrors);
//     }

//     if (errors.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors
//       });
//     }

//     // Check for existing users
//     const existingUser = await User.findOne({
//       $or: [
//         { email: email.toLowerCase() },
//         { username: username.toLowerCase() }
//       ]
//     });

//     if (existingUser) {
//       if (existingUser.email === email.toLowerCase()) {
//         return res.status(409).json({
//           success: false,
//           message: 'Email already registered',
//           code: 'EMAIL_EXISTS'
//         });
//       }
//       if (existingUser.username === username.toLowerCase()) {
//         return res.status(409).json({
//           success: false,
//           message: 'Username already taken',
//           code: 'USERNAME_EXISTS'
//         });
//       }
//     }

//     // Validate role
//     const validRoles = ['staff', 'manager', 'admin'];
//     if (!validRoles.includes(role)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid role. Must be staff, manager, or admin'
//       });
//     }

//     // Check invitation code for admin roles
//     if (role === 'admin' && process.env.REQUIRE_INVITATION_CODE) {
//       if (!invitationCode || invitationCode !== process.env.INVITATION_CODE) {
//         return res.status(400).json({
//           success: false,
//           message: 'Valid invitation code required for admin registration'
//         });
//       }
//     }

//     // Set enhanced permissions based on role
//     const userPermissions = {
//       units: {
//         create: role === 'admin' || role === 'manager',
//         read: true,
//         update: role === 'admin' || role === 'manager',
//         delete: role === 'admin'
//       },
//       contacts: {
//         read: true,
//         update: role === 'admin' || role === 'manager',
//         delete: role === 'admin'
//       },
//       gallery: {
//         create: role === 'admin' || role === 'manager',
//         read: true,
//         update: role === 'admin' || role === 'manager',
//         delete: role === 'admin'
//       },
//       users: {
//         create: role === 'admin',
//         read: role === 'admin',
//         update: role === 'admin',
//         delete: role === 'admin'
//       }
//     };

//     // Generate verification token
//     const verificationToken = generateVerificationToken();
//     const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

//     // Get client info for security tracking
//     const clientInfo = getClientInfo(req);

//     // Create new user with enhanced security fields
//     const newUser = new User({
//       username: username.toLowerCase().trim(),
//       email: email.toLowerCase().trim(),
//       password, // Will be hashed by pre-save middleware
//       firstName: firstName.trim(),
//       lastName: lastName.trim(),
//       role,
//       permissions: userPermissions,
//       isActive: false, // Requires admin approval
//       emailVerified: false, // Requires email verification
//       emailVerificationToken: verificationToken,
//       emailVerificationExpires: verificationExpires,
//       verificationAttempts: 0,
//       lastVerificationRequest: new Date(),
//       registrationIP: clientInfo.ipAddress,
//       registrationUserAgent: clientInfo.userAgent,
//       registeredBy: 'self-registration'
//     });

//     await newUser.save();
//     console.log(`✅ New user registered (pending verification): ${newUser.username}`);

//     // Send verification email using enhanced email service
//     try {
//       // Ensure email service is ready
//       await emailService.ensureReady();
      
//       const emailResult = await emailService.sendVerificationEmail(newUser, verificationToken);
      
//       if (emailResult.success) {
//         console.log(`📧 Verification email sent successfully to: ${newUser.email}`);
        
//         res.status(201).json({
//           success: true,
//           message: 'Registration successful! Please check your email to verify your account.',
//           user: {
//             id: newUser._id,
//             username: newUser.username,
//             email: newUser.email,
//             firstName: newUser.firstName,
//             lastName: newUser.lastName,
//             role: newUser.role,
//             isActive: newUser.isActive,
//             emailVerified: newUser.emailVerified
//           },
//           emailSent: true
//         });
        
//       } else if (emailResult.simulated) {
//         console.log('⚠️ Email service not configured - registration successful but no email sent');
        
//         res.status(201).json({
//           success: true,
//           message: 'Registration successful! Email service not configured - please contact administrator for manual verification.',
//           user: {
//             id: newUser._id,
//             username: newUser.username,
//             email: newUser.email,
//             firstName: newUser.firstName,
//             lastName: newUser.lastName,
//             role: newUser.role,
//             isActive: newUser.isActive,
//             emailVerified: newUser.emailVerified
//           },
//           emailSent: false
//         });
        
//       } else {
//         console.error(`❌ Email sending failed: ${emailResult.error}`);
        
//         res.status(201).json({
//           success: true,
//           message: 'Registration successful! However, there was an issue sending the verification email. Please use the resend option.',
//           user: {
//             id: newUser._id,
//             username: newUser.username,
//             email: newUser.email,
//             firstName: newUser.firstName,
//             lastName: newUser.lastName,
//             role: newUser.role,
//             isActive: newUser.isActive,
//             emailVerified: newUser.emailVerified
//           },
//           emailSent: false,
//           emailError: emailResult.error
//         });
//       }
      
//     } catch (emailError) {
//       console.error('❌ Email sending failed with exception:', emailError);
      
//       res.status(201).json({
//         success: true,
//         message: 'Registration successful! However, there was an issue sending the verification email. Please use the resend option.',
//         user: {
//           id: newUser._id,
//           username: newUser.username,
//           email: newUser.email,
//           firstName: newUser.firstName,
//           lastName: newUser.lastName,
//           role: newUser.role,
//           isActive: newUser.isActive,
//           emailVerified: newUser.emailVerified
//         },
//         emailSent: false
//       });
//     }

//   } catch (error) {
//     console.error("Public registration error:", error);
    
//     if (error.name === 'ValidationError') {
//       const validationErrors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({
//         success: false,
//         message: "Validation error",
//         errors: validationErrors
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Registration error",
//       error: error.message,
//     });
//   }
// });

// // POST verify-email - Enhanced email verification
// router.post("/verify-email/:token", emailVerificationLimiter, async (req, res) => {
//   try {
//     const { token } = req.params;
//     console.log("POST /api/auth/verify-email - Token verification");

//     // Enhanced token validation
//     if (!token || token.length < 10) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid verification token format',
//         code: 'INVALID_TOKEN_FORMAT'
//       });
//     }

//     // Find user with valid token
//     const user = await User.findOne({
//       emailVerificationToken: token,
//       emailVerificationExpires: { $gt: Date.now() }
//     });

//     if (!user) {
//       console.log('❌ Invalid or expired token');
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid or expired verification link. Please request a new one.',
//         code: 'TOKEN_INVALID_OR_EXPIRED',
//         expired: true
//       });
//     }

//     // Check if already verified
//     if (user.emailVerified) {
//       return res.status(409).json({
//         success: false,
//         message: 'Email address is already verified. You can log in to your account.',
//         code: 'ALREADY_VERIFIED'
//       });
//     }

//     // Update user verification status
//     user.emailVerified = true;
//     user.emailVerificationToken = undefined;
//     user.emailVerificationExpires = undefined;
//     user.verificationAttempts = 0;
//     user.lastVerificationRequest = undefined;
//     user.updatedAt = new Date();

//     await user.save();
//     console.log(`✅ Email verified successfully for user: ${user.username}`);

//     // Send welcome email using enhanced email service
//     try {
//       await emailService.ensureReady();
//       const welcomeResult = await emailService.sendWelcomeEmail(user);
      
//       if (welcomeResult.success) {
//         console.log(`📧 Welcome email sent to: ${user.email}`);
//       } else {
//         console.log(`⚠️ Welcome email failed for: ${user.email} - ${welcomeResult.error}`);
//       }
//     } catch (emailError) {
//       console.error('❌ Welcome email failed:', emailError);
//       // Don't fail verification if welcome email fails
//     }

//     // Notify admins about new verified user needing approval
//     try {
//       const admins = await User.find({ 
//         role: { $in: ['admin', 'super_admin'] },
//         isActive: true, 
//         emailVerified: true 
//       });
      
//       console.log(`📧 Notifying ${admins.length} admins about new verified user`);
      
//       for (const admin of admins) {
//         try {
//           await emailService.sendNewUserNotification(admin.email, user);
//         } catch (notificationError) {
//           console.error(`❌ Admin notification failed for ${admin.email}:`, notificationError);
//         }
//       }
//     } catch (notificationError) {
//       console.error('❌ Admin notification process failed:', notificationError);
//       // Don't fail verification if admin notification fails
//     }

//     res.json({
//       success: true,
//       message: 'Email verified successfully! Your account is now pending admin approval.',
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         role: user.role,
//         emailVerified: user.emailVerified,
//         isActive: user.isActive
//       }
//     });

//   } catch (error) {
//     console.error('❌ Email verification error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Email verification failed. Please try again.'
//     });
//   }
// });

// // POST resend-verification - Enhanced with better rate limiting
// router.post("/resend-verification", resendLimiter, async (req, res) => {
//   try {
//     const { email } = req.body;
//     console.log("POST /api/auth/resend-verification");

//     // Enhanced input validation
//     if (!email || !validator.isEmail(email)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Valid email address required'
//       });
//     }

//     // Find user by email
//     const user = await User.findOne({ email: email.toLowerCase() });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'No account found with this email address.',
//         code: 'USER_NOT_FOUND'
//       });
//     }

//     // Check if already verified
//     if (user.emailVerified) {
//       return res.status(409).json({
//         success: false,
//         message: 'Email address is already verified.',
//         code: 'ALREADY_VERIFIED'
//       });
//     }

//     // Enhanced attempt limiting
//     const MAX_VERIFICATION_ATTEMPTS = 5;
//     if (user.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
//       return res.status(429).json({
//         success: false,
//         message: 'Maximum verification attempts exceeded. Please contact support.',
//         code: 'MAX_ATTEMPTS_EXCEEDED'
//       });
//     }

//     // Check cooldown period
//     const lastRequest = user.lastVerificationRequest;
//     const cooldownPeriod = 2 * 60 * 1000; // 2 minutes
    
//     if (lastRequest && (Date.now() - lastRequest.getTime()) < cooldownPeriod) {
//       return res.status(429).json({
//         success: false,
//         message: 'Please wait 2 minutes before requesting another verification email.',
//         code: 'COOLDOWN_ACTIVE'
//       });
//     }

//     // Generate new token
//     const verificationToken = generateVerificationToken();
//     const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

//     user.emailVerificationToken = verificationToken;
//     user.emailVerificationExpires = verificationExpires;
//     user.verificationAttempts += 1;
//     user.lastVerificationRequest = new Date();
//     user.updatedAt = new Date();

//     await user.save();

//     // Send verification email using enhanced email service
//     try {
//       await emailService.ensureReady();
//       const emailResult = await emailService.sendVerificationEmail(user, verificationToken);
      
//       if (emailResult.success) {
//         console.log(`📧 Verification email resent to: ${user.email}`);
        
//         res.json({
//           success: true,
//           message: 'Verification email sent successfully! Please check your inbox.',
//           attemptsRemaining: MAX_VERIFICATION_ATTEMPTS - user.verificationAttempts
//         });
        
//       } else {
//         console.error(`❌ Failed to resend verification email: ${emailResult.error}`);
        
//         res.status(500).json({
//           success: false,
//           message: 'Failed to send verification email. Please try again later.',
//           code: 'EMAIL_SEND_FAILED'
//         });
//       }
      
//     } catch (emailError) {
//       console.error('❌ Resend verification email failed:', emailError);
      
//       res.status(500).json({
//         success: false,
//         message: 'Failed to send verification email. Please try again later.',
//         code: 'EMAIL_SERVICE_ERROR'
//       });
//     }

//   } catch (error) {
//     console.error('❌ Resend verification error:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to resend verification email. Please try again.'
//     });
//   }
// });

// // PUT approve user - Enhanced with email notifications
// router.put('/approve-user/:id', authMiddleware, async (req, res) => {
//   try {
//     console.log(`PUT /api/auth/approve-user/${req.params.id} - Approving user`);
    
//     // Check permissions
//     if (req.user.role !== 'admin' && !req.user.permissions?.users?.update) {
//       return res.status(403).json({
//         success: false,
//         message: 'Insufficient permissions to approve users'
//       });
//     }

//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     if (user.isActive) {
//       return res.status(400).json({
//         success: false,
//         message: 'User is already approved'
//       });
//     }

//     // Enhanced: Check if email is verified
//     if (!user.emailVerified) {
//       return res.status(400).json({
//         success: false,
//         message: 'Cannot approve user with unverified email. User must verify email first.',
//         code: 'EMAIL_NOT_VERIFIED'
//       });
//     }

//     // Approve the user
//     user.isActive = true;
//     user.updatedAt = new Date();
//     await user.save();

//     console.log(`✅ User approved: ${user.username} by: ${req.user.username}`);

//     // Send approval notification email using enhanced email service
//     try {
//       await emailService.ensureReady();
//       const approvalResult = await emailService.sendApprovalNotification(user);
      
//       if (approvalResult.success) {
//         console.log(`📧 Approval notification sent to: ${user.email}`);
//       } else {
//         console.log(`⚠️ Approval email failed for: ${user.email} - ${approvalResult.error}`);
//       }
//     } catch (emailError) {
//       console.error('❌ Approval email failed:', emailError);
//       // Don't fail approval if email fails
//     }

//     res.json({
//       success: true,
//       message: 'User approved successfully',
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         role: user.role,
//         isActive: user.isActive,
//         emailVerified: user.emailVerified
//       }
//     });

//   } catch (error) {
//     console.error('Error approving user:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error approving user'
//     });
//   }
// });

// // PUT reject user - Enhanced with email notifications
// router.put('/reject-user/:id', authMiddleware, async (req, res) => {
//   try {
//     console.log(`PUT /api/auth/reject-user/${req.params.id} - Rejecting user`);
    
//     const { reason } = req.body;
    
//     // Check permissions
//     if (req.user.role !== 'admin' && !req.user.permissions?.users?.delete) {
//       return res.status(403).json({
//         success: false,
//         message: 'Insufficient permissions to reject users'
//       });
//     }

//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     if (user.isActive) {
//       return res.status(400).json({
//         success: false,
//         message: 'Cannot reject an active user'
//       });
//     }

//     console.log(`✅ User rejected: ${user.username} by: ${req.user.username}`);

//     // Send rejection notification email using enhanced email service
//     try {
//       await emailService.ensureReady();
//       const rejectionResult = await emailService.sendRejectionNotification(user, reason);
      
//       if (rejectionResult.success) {
//         console.log(`📧 Rejection notification sent to: ${user.email}`);
//       } else {
//         console.log(`⚠️ Rejection email failed for: ${user.email} - ${rejectionResult.error}`);
//       }
//     } catch (emailError) {
//       console.error('❌ Rejection email failed:', emailError);
//       // Continue with rejection even if email fails
//     }

//     // Remove the user from database
//     await User.findByIdAndDelete(req.params.id);

//     res.json({
//       success: true,
//       message: 'User rejected and removed successfully'
//     });

//   } catch (error) {
//     console.error('Error rejecting user:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error rejecting user'
//     });
//   }
// });

// // ===========================================
// // EXISTING ROUTES (Enhanced)
// // ===========================================

// // POST register - Admin-only registration (enhanced)
// router.post("/register", authMiddleware, async (req, res) => {
//   try {
//     console.log("POST /api/auth/register - Admin registering new user");
//     console.log("Registering admin:", req.user.username);

//     // Check if current user has permission to create users
//     if (req.user.role !== 'admin' && !req.user.permissions?.users?.create) {
//       return res.status(403).json({
//         success: false,
//         message: 'Insufficient permissions to register new users'
//       });
//     }

//     const { 
//       username, 
//       email, 
//       password, 
//       firstName, 
//       lastName, 
//       role = 'staff',
//       permissions 
//     } = req.body;

//     // Enhanced validation
//     const errors = [];
    
//     if (!firstName || firstName.trim().length < 2) {
//       errors.push('First name must be at least 2 characters');
//     }
//     if (!lastName || lastName.trim().length < 2) {
//       errors.push('Last name must be at least 2 characters');
//     }
//     if (!username || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
//       errors.push('Username must be 3-20 characters (letters, numbers, underscore only)');
//     }
//     if (!email || !validator.isEmail(email)) {
//       errors.push('Valid email address required');
//     }
//     if (!password) {
//       errors.push('Password is required');
//     } else {
//       const passwordErrors = validatePassword(password);
//       errors.push(...passwordErrors);
//     }

//     if (errors.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Validation failed',
//         errors
//       });
//     }

//     // Check for existing users
//     const existingUser = await User.findOne({
//       $or: [
//         { email: email.toLowerCase() },
//         { username: username.toLowerCase() }
//       ]
//     });

//     if (existingUser) {
//       if (existingUser.email === email.toLowerCase()) {
//         return res.status(409).json({
//           success: false,
//           message: 'Email already exists'
//         });
//       }
//       if (existingUser.username === username.toLowerCase()) {
//         return res.status(409).json({
//           success: false,
//           message: 'Username already exists'
//         });
//       }
//     }

//     // Validate role
//     const validRoles = ['admin', 'manager', 'staff'];
//     if (!validRoles.includes(role)) {
//       return res.status(400).json({
//         success: false,
//         message: 'Invalid role. Must be admin, manager, or staff'
//       });
//     }

//     // Only admins can create other admins
//     if (role === 'admin' && req.user.role !== 'admin') {
//       return res.status(403).json({
//         success: false,
//         message: 'Only admins can create other admin accounts'
//       });
//     }

//     // Set default permissions based on role
//     let userPermissions = {
//       units: {
//         create: role === 'admin' || role === 'manager',
//         read: true,
//         update: role === 'admin' || role === 'manager',
//         delete: role === 'admin'
//       },
//       contacts: {
//         read: true,
//         update: role === 'admin' || role === 'manager',
//         delete: role === 'admin'
//       },
//       gallery: {
//         create: role === 'admin' || role === 'manager',
//         read: true,
//         update: role === 'admin' || role === 'manager',
//         delete: role === 'admin'
//       },
//       users: {
//         create: role === 'admin',
//         read: role === 'admin',
//         update: role === 'admin',
//         delete: role === 'admin'
//       }
//     };

//     // Override with custom permissions if provided
//     if (permissions) {
//       userPermissions = { ...userPermissions, ...permissions };
//     }

//     // Create new user (admin-created users are automatically active and verified)
//     const newUser = new User({
//       username: username.toLowerCase().trim(),
//       email: email.toLowerCase().trim(),
//       password, // Will be hashed by pre-save middleware
//       firstName: firstName.trim(),
//       lastName: lastName.trim(),
//       role,
//       permissions: userPermissions,
//       registeredBy: req.user._id,
//       isActive: true, // Admin-created users are automatically active
//       emailVerified: true // Admin-created users are automatically verified
//     });

//     await newUser.save();

//     console.log(`✅ New user registered by admin: ${req.user.username} - New user: ${newUser.username}`);

//     res.status(201).json({
//       success: true,
//       message: 'User registered successfully',
//       user: {
//         id: newUser._id,
//         username: newUser.username,
//         email: newUser.email,
//         firstName: newUser.firstName,
//         lastName: newUser.lastName,
//         role: newUser.role,
//         permissions: newUser.permissions,
//         isActive: newUser.isActive,
//         emailVerified: newUser.emailVerified
//       }
//     });

//   } catch (error) {
//     console.error("Admin registration error:", error);
    
//     if (error.name === 'ValidationError') {
//       const validationErrors = Object.values(error.errors).map(err => err.message);
//       return res.status(400).json({
//         success: false,
//         message: "Validation error",
//         errors: validationErrors
//       });
//     }

//     res.status(500).json({
//       success: false,
//       message: "Registration error",
//       error: error.message,
//     });
//   }
// });

// // ===========================================
// // ALL OTHER EXISTING ROUTES REMAIN THE SAME
// // ===========================================

// // GET verify token
// router.get("/verify", authMiddleware, async (req, res) => {
//   try {
//     console.log('GET /api/auth/verify - Token verification for:', req.user.username);
    
//     res.json({
//       success: true,
//       user: {
//         id: req.user._id,
//         username: req.user.username,
//         email: req.user.email,
//         firstName: req.user.firstName,
//         lastName: req.user.lastName,
//         fullName: req.user.getFullName ? req.user.getFullName() : `${req.user.firstName} ${req.user.lastName}`,
//         role: req.user.role,
//         permissions: req.user.permissions,
//         lastLogin: req.user.lastLogin,
//         isActive: req.user.isActive,
//         emailVerified: req.user.emailVerified
//       }
//     });

//   } catch (error) {
//     console.error('Token verification error:', error.message);
//     res.status(500).json({ 
//       success: false,
//       message: 'Server error during token verification' 
//     });
//   }
// });

// // GET all users (admin only)
// router.get('/users', authMiddleware, async (req, res) => {
//   try {
//     console.log('GET /api/auth/users - Admin fetching all users');
//     console.log('Requesting admin:', req.user.username);

//     // Check permissions
//     if (req.user.role !== 'admin' && !req.user.permissions?.users?.read) {
//       return res.status(403).json({
//         success: false,
//         message: 'Insufficient permissions to view users'
//       });
//     }

//     const users = await User.find()
//       .select('-password -emailVerificationToken') // Don't expose sensitive data
//       .populate('registeredBy', 'username firstName lastName')
//       .sort({ createdAt: -1 });

//     console.log(`Found ${users.length} users`);

//     res.json({
//       success: true,
//       count: users.length,
//       users
//     });

//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error fetching users'
//     });
//   }
// });

// // GET pending users (admin only)
// router.get('/pending-users', authMiddleware, async (req, res) => {
//   try {
//     console.log('GET /api/auth/pending-users - Fetching users pending approval');
    
//     // Check permissions
//     if (req.user.role !== 'admin' && !req.user.permissions?.users?.read) {
//       return res.status(403).json({
//         success: false,
//         message: 'Insufficient permissions to view pending users'
//       });
//     }

//     const pendingUsers = await User.find({ 
//       isActive: false 
//     })
//     .select('-password -emailVerificationToken') // Don't expose sensitive data
//     .sort({ createdAt: -1 });

//     console.log(`Found ${pendingUsers.length} users pending approval`);

//     res.json({
//       success: true,
//       count: pendingUsers.length,
//       users: pendingUsers
//     });

//   } catch (error) {
//     console.error('Error fetching pending users:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error fetching pending users'
//     });
//   }
// });

// // PUT update user (admin only)
// router.put('/users/:id', authMiddleware, async (req, res) => {
//   try {
//     console.log(`PUT /api/auth/users/${req.params.id} - Admin updating user`);
//     console.log('Updating admin:', req.user.username);

//     // Check permissions
//     if (req.user.role !== 'admin' && !req.user.permissions?.users?.update) {
//       return res.status(403).json({
//         success: false,
//         message: 'Insufficient permissions to update users'
//       });
//     }

//     const { firstName, lastName, email, role, isActive, permissions } = req.body;

//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // Update user fields
//     if (firstName) user.firstName = firstName;
//     if (lastName) user.lastName = lastName;
//     if (email && validator.isEmail(email)) user.email = email.toLowerCase();
//     if (role) user.role = role;
//     if (isActive !== undefined) user.isActive = isActive;
//     if (permissions) user.permissions = { ...user.permissions, ...permissions };
    
//     user.updatedAt = new Date();

//     await user.save();

//     console.log('✅ User updated:', user.username);

//     res.json({
//       success: true,
//       message: 'User updated successfully',
//       user: {
//         id: user._id,
//         username: user.username,
//         email: user.email,
//         firstName: user.firstName,
//         lastName: user.lastName,
//         role: user.role,
//         permissions: user.permissions,
//         isActive: user.isActive,
//         emailVerified: user.emailVerified
//       }
//     });

//   } catch (error) {
//     console.error('Error updating user:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error updating user'
//     });
//   }
// });

// // DELETE deactivate user (admin only)
// router.delete('/users/:id', authMiddleware, async (req, res) => {
//   try {
//     console.log(`DELETE /api/auth/users/${req.params.id} - Admin deactivating user`);
//     console.log('Deactivating admin:', req.user.username);

//     // Check permissions
//     if (req.user.role !== 'admin' && !req.user.permissions?.users?.delete) {
//       return res.status(403).json({
//         success: false,
//         message: 'Insufficient permissions to deactivate users'
//       });
//     }

//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // Prevent self-deletion
//     if (user._id.toString() === req.user._id.toString()) {
//       return res.status(400).json({
//         success: false,
//         message: 'Cannot deactivate your own account'
//       });
//     }

//     // Deactivate instead of delete
//     user.isActive = false;
//     user.updatedAt = new Date();
//     await user.save();

//     console.log('✅ User deactivated:', user.username);

//     res.json({
//       success: true,
//       message: 'User deactivated successfully'
//     });

//   } catch (error) {
//     console.error('Error deactivating user:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Server error deactivating user'
//     });
//   }
// });

// // GET routes - Debug endpoint
// router.get('/routes', (req, res) => {
//   const routes = [];
//   router.stack.forEach(function(middleware) {
//     if (middleware.route) {
//       const methods = Object.keys(middleware.route.methods);
//       routes.push({
//         path: middleware.route.path,
//         methods: methods
//       });
//     }
//   });
//   res.json({ 
//     message: 'Registered auth routes:',
//     routes: routes 
//   });
// });

// // GET test - Enhanced test endpoint
// router.get('/test', async (req, res) => {
//   try {
//     // Ensure email service is ready for testing
//     await emailService.ensureReady();
    
//     res.json({
//       success: true,
//       message: 'Auth routes working correctly',
//       timestamp: new Date().toISOString(),
//       emailServiceConfigured: emailService.isConfigured,
//       environment: process.env.NODE_ENV || 'development',
//       jwtConfigured: !!process.env.JWT_SECRET
//     });
//   } catch (error) {
//     res.json({
//       success: true,
//       message: 'Auth routes working correctly',
//       timestamp: new Date().toISOString(),
//       emailServiceConfigured: false,
//       emailServiceError: error.message,
//       environment: process.env.NODE_ENV || 'development',
//       jwtConfigured: !!process.env.JWT_SECRET
//     });
//   }
// });

// module.exports = router;

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const rateLimit = require("express-rate-limit"); // Add this package
const validator = require("validator"); // Add this package for email validation
const User = require("../models/User.js");
const { authMiddleware } = require('../middleware/auth');
const emailService = require('../config/emailService');
const router = express.Router();

// ===========================================
// RATE LIMITING CONFIGURATIONS
// ===========================================

// Registration rate limiting
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 registration attempts per hour
  message: {
    success: false,
    message: 'Too many registration attempts. Please try again in 1 hour.',
    code: 'REGISTRATION_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Email verification rate limiting
const emailVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 verification requests per 15 minutes
  message: {
    success: false,
    message: 'Too many verification requests. Please try again in 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Resend verification rate limiting
const resendLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 2, // Limit to 2 resend attempts per 30 minutes
  message: {
    success: false,
    message: 'Too many resend requests. Please try again in 30 minutes.',
    code: 'RESEND_LIMIT_EXCEEDED'
  }
});

// Login rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 login attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many login attempts. Please try again in 15 minutes.',
    code: 'LOGIN_LIMIT_EXCEEDED'
  }
});

// ===========================================
// HELPER FUNCTIONS
// ===========================================

// Generate secure verification token
function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Get client information for security tracking
const getClientInfo = (req) => ({
  ipAddress: req.ip || req.connection.remoteAddress || 'unknown',
  userAgent: req.get('User-Agent') || 'unknown'
});

// Enhanced password validation
function validatePassword(password) {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return errors;
}

// ===========================================
// AUTHENTICATION ROUTES
// ===========================================

// POST login - Enhanced with security and email verification
router.post("/login", loginLimiter, async (req, res) => {
  try {
    console.log("POST /api/auth/login");
    console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);
    
    const { username, email, password, emailOrUsername } = req.body;
    const loginIdentifier = emailOrUsername || email || username;

    // Enhanced input validation
    if (!loginIdentifier || !password) {
      return res.status(400).json({ 
        success: false,
        message: "Email/Username and password are required" 
      });
    }

    // Find User by email or username
    const user = await User.findOne({
      $or: [
        { email: loginIdentifier.toLowerCase() },
        { username: loginIdentifier.toLowerCase() }
      ]
    });

    if (!user) {
      console.log("User not found:", loginIdentifier);
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / (1000 * 60));
      return res.status(423).json({
        success: false,
        message: `Account temporarily locked. Try again in ${lockTimeRemaining} minutes.`,
        code: 'ACCOUNT_LOCKED'
      });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log("Invalid password for user:", loginIdentifier);
      
      // Enhanced security: Track failed login attempts
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
        console.log(`Account locked for user: ${loginIdentifier} after 5 failed attempts`);
      }
      
      await user.save();
      
      return res.status(401).json({ 
        success: false,
        message: "Invalid credentials" 
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      console.log("Email not verified for user:", loginIdentifier);
      return res.status(403).json({ 
        success: false,
        message: "Please verify your email before logging in",
        code: 'EMAIL_NOT_VERIFIED',
        emailNotVerified: true,
        email: user.email,
        canResend: true
      });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log("User account deactivated:", loginIdentifier);
      return res.status(403).json({ 
        success: false,
        message: "Your account is pending approval. Please contact an administrator.",
        code: 'ACCOUNT_INACTIVE',
        pendingApproval: true
      });
    }

    // Check JWT_Secret
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing from environment variables');
      return res.status(500).json({ 
        success: false,
        message: 'Server configuration error'
      });
    }

    // Reset login attempts and update last login
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLogin = new Date();
    
    // Track client info for security
    const clientInfo = getClientInfo(req);
    user.lastLoginIP = clientInfo.ipAddress;
    user.lastLoginUserAgent = clientInfo.userAgent;
    
    await user.save();

    // Create enhanced JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        email: user.email,
        role: user.role,
        fullName: user.getFullName ? user.getFullName() : `${user.firstName} ${user.lastName}`,
        emailVerified: user.emailVerified,
        isActive: user.isActive
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(`✅ User logged in successfully: ${user.username} (${user.role})`);
    
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
        emailVerified: user.emailVerified
      },
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login error",
      error: error.message,
    });
  }
});

// POST register-public - Enhanced with production email service
router.post("/register-public", registrationLimiter, async (req, res) => {
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

    // Enhanced input validation
    const errors = [];
    
    if (!firstName || firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters');
    }
    if (!lastName || lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters');
    }
    if (!username || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      errors.push('Username must be 3-20 characters (letters, numbers, underscore only)');
    }
    if (!email || !validator.isEmail(email)) {
      errors.push('Valid email address required');
    }
    if (!password) {
      errors.push('Password is required');
    } else {
      const passwordErrors = validatePassword(password);
      errors.push(...passwordErrors);
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Check for existing users
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(409).json({
          success: false,
          message: 'Email already registered',
          code: 'EMAIL_EXISTS'
        });
      }
      if (existingUser.username === username.toLowerCase()) {
        return res.status(409).json({
          success: false,
          message: 'Username already taken',
          code: 'USERNAME_EXISTS'
        });
      }
    }

    // Validate role
    const validRoles = ['staff', 'manager', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be staff, manager, or admin'
      });
    }

    // Check invitation code for admin roles
    if (role === 'admin' && process.env.REQUIRE_INVITATION_CODE) {
      if (!invitationCode || invitationCode !== process.env.INVITATION_CODE) {
        return res.status(400).json({
          success: false,
          message: 'Valid invitation code required for admin registration'
        });
      }
    }

    // Set enhanced permissions based on role
    const userPermissions = {
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

    // Generate verification token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Get client info for security tracking
    const clientInfo = getClientInfo(req);

    // Create new user with enhanced security fields
    const newUser = new User({
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed by pre-save middleware
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      permissions: userPermissions,
      isActive: false, // Requires admin approval
      emailVerified: false, // Requires email verification
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires,
      verificationAttempts: 0,
      lastVerificationRequest: new Date(),
      registrationIP: clientInfo.ipAddress,
      registrationUserAgent: clientInfo.userAgent,
      registeredBy: 'self-registration'
    });

    await newUser.save();
    console.log(`✅ New user registered (pending verification): ${newUser.username}`);

    // Send verification email using enhanced email service
    try {
      // Ensure email service is ready
      await emailService.ensureReady();
      
      const emailResult = await emailService.sendVerificationEmail(newUser, verificationToken);
      
      if (emailResult.success) {
        console.log(`📧 Verification email sent successfully to: ${newUser.email}`);
        
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
        console.error(`❌ Email sending failed: ${emailResult.error}`);
        
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
          emailSent: false,
          emailError: emailResult.error
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
    console.error("Public registration error:", error);
    
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

// POST verify-email - Enhanced email verification
router.post("/verify-email/:token", emailVerificationLimiter, async (req, res) => {
  try {
    const { token } = req.params;
    console.log("POST /api/auth/verify-email - Token verification");

    // Enhanced token validation
    if (!token || token.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification token format',
        code: 'INVALID_TOKEN_FORMAT'
      });
    }

    // Find user with valid token
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      console.log('❌ Invalid or expired token');
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification link. Please request a new one.',
        code: 'TOKEN_INVALID_OR_EXPIRED',
        expired: true
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(409).json({
        success: false,
        message: 'Email address is already verified. You can log in to your account.',
        code: 'ALREADY_VERIFIED'
      });
    }

    // Update user verification status
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.verificationAttempts = 0;
    user.lastVerificationRequest = undefined;
    user.updatedAt = new Date();

    await user.save();
    console.log(`✅ Email verified successfully for user: ${user.username}`);

    // Send welcome email using enhanced email service
    try {
      await emailService.ensureReady();
      const welcomeResult = await emailService.sendWelcomeEmail(user);
      
      if (welcomeResult.success) {
        console.log(`📧 Welcome email sent to: ${user.email}`);
      } else {
        console.log(`⚠️ Welcome email failed for: ${user.email} - ${welcomeResult.error}`);
      }
    } catch (emailError) {
      console.error('❌ Welcome email failed:', emailError);
      // Don't fail verification if welcome email fails
    }

    // Notify admins about new verified user needing approval
    try {
      const admins = await User.find({ 
        role: { $in: ['admin', 'super_admin'] },
        isActive: true, 
        emailVerified: true 
      });
      
      console.log(`📧 Notifying ${admins.length} admins about new verified user`);
      
      for (const admin of admins) {
        try {
          await emailService.sendNewUserNotification(admin.email, user);
        } catch (notificationError) {
          console.error(`❌ Admin notification failed for ${admin.email}:`, notificationError);
        }
      }
    } catch (notificationError) {
      console.error('❌ Admin notification process failed:', notificationError);
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

// POST resend-verification - Enhanced with better rate limiting
router.post("/resend-verification", resendLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    console.log("POST /api/auth/resend-verification");

    // Enhanced input validation
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Valid email address required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email address.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(409).json({
        success: false,
        message: 'Email address is already verified.',
        code: 'ALREADY_VERIFIED'
      });
    }

    // Enhanced attempt limiting
    const MAX_VERIFICATION_ATTEMPTS = 5;
    if (user.verificationAttempts >= MAX_VERIFICATION_ATTEMPTS) {
      return res.status(429).json({
        success: false,
        message: 'Maximum verification attempts exceeded. Please contact support.',
        code: 'MAX_ATTEMPTS_EXCEEDED'
      });
    }

    // Check cooldown period
    const lastRequest = user.lastVerificationRequest;
    const cooldownPeriod = 2 * 60 * 1000; // 2 minutes
    
    if (lastRequest && (Date.now() - lastRequest.getTime()) < cooldownPeriod) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 2 minutes before requesting another verification email.',
        code: 'COOLDOWN_ACTIVE'
      });
    }

    // Generate new token
    const verificationToken = generateVerificationToken();
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    user.verificationAttempts += 1;
    user.lastVerificationRequest = new Date();
    user.updatedAt = new Date();

    await user.save();

    // Send verification email using enhanced email service
    try {
      await emailService.ensureReady();
      const emailResult = await emailService.sendVerificationEmail(user, verificationToken);
      
      if (emailResult.success) {
        console.log(`📧 Verification email resent to: ${user.email}`);
        
        res.json({
          success: true,
          message: 'Verification email sent successfully! Please check your inbox.',
          attemptsRemaining: MAX_VERIFICATION_ATTEMPTS - user.verificationAttempts
        });
        
      } else {
        console.error(`❌ Failed to resend verification email: ${emailResult.error}`);
        
        res.status(500).json({
          success: false,
          message: 'Failed to send verification email. Please try again later.',
          code: 'EMAIL_SEND_FAILED'
        });
      }
      
    } catch (emailError) {
      console.error('❌ Resend verification email failed:', emailError);
      
      res.status(500).json({
        success: false,
        message: 'Failed to send verification email. Please try again later.',
        code: 'EMAIL_SERVICE_ERROR'
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

// PUT approve user - Enhanced with email notifications
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

    // Enhanced: Check if email is verified
    if (!user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Cannot approve user with unverified email. User must verify email first.',
        code: 'EMAIL_NOT_VERIFIED'
      });
    }

    // Approve the user
    user.isActive = true;
    user.updatedAt = new Date();
    await user.save();

    console.log(`✅ User approved: ${user.username} by: ${req.user.username}`);

    // Send approval notification email using enhanced email service
    try {
      await emailService.ensureReady();
      const approvalResult = await emailService.sendApprovalNotification(user);
      
      if (approvalResult.success) {
        console.log(`📧 Approval notification sent to: ${user.email}`);
      } else {
        console.log(`⚠️ Approval email failed for: ${user.email} - ${approvalResult.error}`);
      }
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

// PUT reject user - Enhanced with email notifications
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

    console.log(`✅ User rejected: ${user.username} by: ${req.user.username}`);

    // Send rejection notification email using enhanced email service
    try {
      await emailService.ensureReady();
      const rejectionResult = await emailService.sendRejectionNotification(user, reason);
      
      if (rejectionResult.success) {
        console.log(`📧 Rejection notification sent to: ${user.email}`);
      } else {
        console.log(`⚠️ Rejection email failed for: ${user.email} - ${rejectionResult.error}`);
      }
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

// ===========================================
// EXISTING ROUTES (Enhanced)
// ===========================================

// POST register - Admin-only registration (enhanced)
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

    // Enhanced validation
    const errors = [];
    
    if (!firstName || firstName.trim().length < 2) {
      errors.push('First name must be at least 2 characters');
    }
    if (!lastName || lastName.trim().length < 2) {
      errors.push('Last name must be at least 2 characters');
    }
    if (!username || !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
      errors.push('Username must be 3-20 characters (letters, numbers, underscore only)');
    }
    if (!email || !validator.isEmail(email)) {
      errors.push('Valid email address required');
    }
    if (!password) {
      errors.push('Password is required');
    } else {
      const passwordErrors = validatePassword(password);
      errors.push(...passwordErrors);
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Check for existing users
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
      if (existingUser.username === username.toLowerCase()) {
        return res.status(409).json({
          success: false,
          message: 'Username already exists'
        });
      }
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
      username: username.toLowerCase().trim(),
      email: email.toLowerCase().trim(),
      password, // Will be hashed by pre-save middleware
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role,
      permissions: userPermissions,
      registeredBy: req.user._id,
      isActive: true, // Admin-created users are automatically active
      emailVerified: true // Admin-created users are automatically verified
    });

    await newUser.save();

    console.log(`✅ New user registered by admin: ${req.user.username} - New user: ${newUser.username}`);

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
    console.error("Admin registration error:", error);
    
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

// ===========================================
// ALL OTHER EXISTING ROUTES REMAIN THE SAME
// ===========================================

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

// GET pending users (admin only)
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
    if (email && validator.isEmail(email)) user.email = email.toLowerCase();
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

// GET test - Enhanced test endpoint
router.get('/test', async (req, res) => {
  try {
    // Ensure email service is ready for testing
    await emailService.ensureReady();
    
    res.json({
      success: true,
      message: 'Auth routes working correctly',
      timestamp: new Date().toISOString(),
      emailServiceConfigured: emailService.isConfigured,
      environment: process.env.NODE_ENV || 'development',
      jwtConfigured: !!process.env.JWT_SECRET
    });
  } catch (error) {
    res.json({
      success: true,
      message: 'Auth routes working correctly',
      timestamp: new Date().toISOString(),
      emailServiceConfigured: false,
      emailServiceError: error.message,
      environment: process.env.NODE_ENV || 'development',
      jwtConfigured: !!process.env.JWT_SECRET
    });
  }
});

module.exports = router;