// const mongoose = require('mongoose')
// const bcrypt = require('bcryptjs')

// const userSchema = new mongoose.Schema({
//   username: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//     minlength: 3,
//     maxlength: 30
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//     lowercase: true,
//     match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
//   },
//   password: {
//     type: String,
//     required: true,
//     minlength: 8 // Updated from 6 to 8 for better security
//   },
//   firstName: {
//     type: String,
//     required: true,
//     trim: true,
//     maxlength: 50
//   },
//   lastName: {
//     type: String,
//     required: true,
//     trim: true,
//     maxlength: 50
//   },
//   role: {
//     type: String,
//     enum: ['admin', 'manager', 'staff', 'super_admin'], // Added super_admin
//     default: 'staff'
//   },
  
//   // === EMAIL VERIFICATION FIELDS (UPDATED) ===
//   emailVerified: { // CHANGED: from isEmailVerified to emailVerified (to match auth routes)
//     type: Boolean,
//     default: false
//   },
//   emailVerificationToken: {
//     type: String,
//     default: null
//   },
//   emailVerificationExpires: {
//     type: Date,
//     default: null
//   },
//   verificationAttempts: { // NEW: Added missing field for attempt tracking
//     type: Number,
//     default: 0
//   },
  
//   // === PASSWORD RESET FIELDS (EXISTING) ===
//   passwordResetToken: {
//     type: String,
//     default: null
//   },
//   passwordResetExpires: {
//     type: Date,
//     default: null
//   },
  
//   // === EXISTING FIELDS ===
//   isActive: {
//     type: Boolean,
//     default: false // Changed from true to false - requires approval for new users
//   },
//   permissions: {
//     units: {
//       create: { type: Boolean, default: true },
//       read: { type: Boolean, default: true },
//       update: { type: Boolean, default: true },
//       delete: { type: Boolean, default: false }
//     },
//     contacts: {
//       read: { type: Boolean, default: true },
//       update: { type: Boolean, default: true },
//       delete: { type: Boolean, default: false }
//     },
//     gallery: {
//       create: { type: Boolean, default: true },
//       read: { type: Boolean, default: true },
//       update: { type: Boolean, default: true },
//       delete: { type: Boolean, default: false }
//     },
//     users: {
//       create: { type: Boolean, default: false },
//       read: { type: Boolean, default: false },
//       update: { type: Boolean, default: false },
//       delete: { type: Boolean, default: false }
//     }
//   },
//   lastLogin: {
//     type: Date
//   },
//   registeredBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
  
//   // === APPROVAL FIELDS (EXISTING) ===
//   approvedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     default: null
//   },
//   approvedAt: {
//     type: Date,
//     default: null
//   }
// }, {
//   timestamps: true
// })

// // Hash password before saving
// userSchema.pre('save', async function(next) {
//   // Only hash the password if it has been modified (or is new)
//   if (!this.isModified('password')) return next()
  
//   try {
//     // Hash password with cost of 12
//     const hashedPassword = await bcrypt.hash(this.password, 12)
//     this.password = hashedPassword
//     next()
//   } catch (error) {
//     next(error)
//   }
// })

// // === EXISTING METHODS ===
// // Instance method to check password
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return bcrypt.compare(candidatePassword, this.password)
// }

// // Instance method to get full name
// userSchema.methods.getFullName = function() {
//   return `${this.firstName} ${this.lastName}`
// }

// // Static method to find active users
// userSchema.statics.findActive = function() {
//   return this.find({ isActive: true })
// }

// // Remove password and sensitive tokens from JSON output
// userSchema.methods.toJSON = function() {
//   const userObject = this.toObject()
//   delete userObject.password
//   delete userObject.emailVerificationToken
//   delete userObject.passwordResetToken
//   return userObject
// }

// // === UPDATED METHODS FOR EMAIL VERIFICATION ===
// // Generate email verification token
// userSchema.methods.generateEmailVerificationToken = function() {
//   const crypto = require('crypto')
//   const token = crypto.randomBytes(32).toString('hex')
  
//   this.emailVerificationToken = token
//   this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  
//   return token
// }

// // Generate password reset token
// userSchema.methods.generatePasswordResetToken = function() {
//   const crypto = require('crypto')
//   const token = crypto.randomBytes(32).toString('hex')
  
//   this.passwordResetToken = token
//   this.passwordResetExpires = Date.now() + 60 * 60 * 1000 // 1 hour
  
//   return token
// }

// // Clear verification tokens
// userSchema.methods.clearVerificationTokens = function() {
//   this.emailVerificationToken = null
//   this.emailVerificationExpires = null
//   this.verificationAttempts = 0 // Reset attempts when clearing
// }

// // Clear password reset tokens
// userSchema.methods.clearPasswordResetTokens = function() {
//   this.passwordResetToken = null
//   this.passwordResetExpires = null
// }

// // Approve user account (UPDATED to work with approvedBy)
// userSchema.methods.approveAccount = function(approvedByUserId) {
//   this.isActive = true
//   this.approvedBy = approvedByUserId
//   this.approvedAt = new Date()
// }

// // Check if user can access admin features (UPDATED field name)
// userSchema.methods.canAccessAdmin = function() {
//   return this.emailVerified && this.isActive && ['admin', 'manager', 'super_admin'].includes(this.role)
// }

// // Check if user is super admin (UPDATED field name)
// userSchema.methods.isSuperAdmin = function() {
//   return this.role === 'super_admin' && this.isActive && this.emailVerified
// }

// // Check if user can manage other users
// userSchema.methods.canManageUsers = function() {
//   return this.isSuperAdmin() || (this.role === 'admin' && this.permissions.users.create)
// }

// // NEW: Check if user can attempt email verification
// userSchema.methods.canAttemptVerification = function() {
//   return this.verificationAttempts < 3
// }

// // NEW: Increment verification attempts
// userSchema.methods.incrementVerificationAttempts = function() {
//   this.verificationAttempts += 1
// }

// // NEW: Reset verification attempts
// userSchema.methods.resetVerificationAttempts = function() {
//   this.verificationAttempts = 0
// }

// // NEW: Check if email verification token is valid
// userSchema.methods.isEmailVerificationTokenValid = function(token) {
//   return this.emailVerificationToken === token && 
//          this.emailVerificationExpires && 
//          this.emailVerificationExpires > Date.now()
// }

// // NEW: Check if password reset token is valid
// userSchema.methods.isPasswordResetTokenValid = function(token) {
//   return this.passwordResetToken === token && 
//          this.passwordResetExpires && 
//          this.passwordResetExpires > Date.now()
// }

// // === UPDATED STATIC METHODS ===
// // Find users pending approval (email verified but not approved) - UPDATED field name
// userSchema.statics.findPendingApproval = function() {
//   return this.find({ 
//     emailVerified: true, 
//     isActive: false 
//   }).select('-password -emailVerificationToken -passwordResetToken')
// }

// // Find users pending email verification - UPDATED field name
// userSchema.statics.findPendingEmailVerification = function() {
//   return this.find({ 
//     emailVerified: false 
//   }).select('-password -emailVerificationToken -passwordResetToken')
// }

// // Find users by role
// userSchema.statics.findByRole = function(role) {
//   return this.find({ role: role, isActive: true })
// }

// // Get user statistics - UPDATED field name
// userSchema.statics.getStats = async function() {
//   const totalUsers = await this.countDocuments()
//   const activeUsers = await this.countDocuments({ isActive: true })
//   const pendingApproval = await this.countDocuments({ 
//     emailVerified: true, 
//     isActive: false 
//   })
//   const unverifiedEmail = await this.countDocuments({ 
//     emailVerified: false 
//   })
  
//   const roleStats = await this.aggregate([
//     { $match: { isActive: true } },
//     { $group: { _id: '$role', count: { $sum: 1 } } }
//   ])
  
//   return {
//     total: totalUsers,
//     active: activeUsers,
//     pendingApproval,
//     unverifiedEmail,
//     roleBreakdown: roleStats
//   }
// }

// // NEW: Find users with expired verification tokens
// userSchema.statics.findExpiredVerificationTokens = function() {
//   return this.find({
//     emailVerificationToken: { $ne: null },
//     emailVerificationExpires: { $lt: Date.now() }
//   })
// }

// // NEW: Find users with expired password reset tokens  
// userSchema.statics.findExpiredPasswordResetTokens = function() {
//   return this.find({
//     passwordResetToken: { $ne: null },
//     passwordResetExpires: { $lt: Date.now() }
//   })
// }

// // === PERMISSION HELPER METHODS ===
// // Check specific permission
// userSchema.methods.hasPermission = function(resource, action) {
//   if (this.isSuperAdmin()) {
//     return true // Super admin has all permissions
//   }
  
//   if (!this.permissions[resource]) {
//     return false
//   }
  
//   return this.permissions[resource][action] === true
// }

// // Get user's permissions summary
// userSchema.methods.getPermissionsSummary = function() {
//   if (this.isSuperAdmin()) {
//     return 'All permissions (Super Admin)'
//   }
  
//   const summary = []
//   for (const [resource, actions] of Object.entries(this.permissions)) {
//     const allowedActions = Object.entries(actions)
//       .filter(([action, allowed]) => allowed)
//       .map(([action]) => action)
    
//     if (allowedActions.length > 0) {
//       summary.push(`${resource}: ${allowedActions.join(', ')}`)
//     }
//   }
  
//   return summary.join(' | ')
// }

// // Set default permissions based on role
// userSchema.methods.setDefaultPermissions = function() {
//   switch (this.role) {
//     case 'super_admin':
//       // Super admin doesn't need explicit permissions - they have everything
//       break
      
//     case 'admin':
//       this.permissions = {
//         units: { create: true, read: true, update: true, delete: true },
//         contacts: { read: true, update: true, delete: true },
//         gallery: { create: true, read: true, update: true, delete: true },
//         users: { create: true, read: true, update: true, delete: false }
//       }
//       break
      
//     case 'manager':
//       this.permissions = {
//         units: { create: true, read: true, update: true, delete: false },
//         contacts: { read: true, update: true, delete: false },
//         gallery: { create: true, read: true, update: true, delete: false },
//         users: { create: false, read: true, update: false, delete: false }
//       }
//       break
      
//     case 'staff':
//     default:
//       this.permissions = {
//         units: { create: false, read: true, update: false, delete: false },
//         contacts: { read: true, update: false, delete: false },
//         gallery: { create: false, read: true, update: false, delete: false },
//         users: { create: false, read: false, update: false, delete: false }
//       }
//       break
//   }
// }

// // Pre-save middleware to set default permissions for new users
// userSchema.pre('save', function(next) {
//   if (this.isNew && this.role) {
//     this.setDefaultPermissions()
//   }
//   next()
// })

// // === INDEXES FOR PERFORMANCE ===
// // userSchema.index({ email: 1 })
// // userSchema.index({ username: 1 })
// userSchema.index({ emailVerificationToken: 1 })
// userSchema.index({ passwordResetToken: 1 })
// userSchema.index({ isActive: 1, role: 1 })
// userSchema.index({ emailVerified: 1, isActive: 1 }) // UPDATED: index name changed
// userSchema.index({ verificationAttempts: 1 }) // NEW: index for verification attempts

// module.exports = mongoose.model('User', userSchema)


const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'staff', 'super_admin'],
    default: 'staff'
  },
  
  // === EMAIL VERIFICATION FIELDS ===
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  verificationAttempts: {
    type: Number,
    default: 0,
    max: 5 // Enhanced: Maximum 5 attempts
  },
  lastVerificationRequest: { // NEW: For cooldown tracking
    type: Date,
    default: null
  },
  
  // === ENHANCED SECURITY FIELDS ===
  loginAttempts: { // NEW: Track failed login attempts
    type: Number,
    default: 0,
    max: 5
  },
  lockUntil: { // NEW: Account lockout timestamp
    type: Date,
    default: null
  },
  
  // === CLIENT TRACKING FIELDS ===
  lastLoginIP: { // NEW: Track last login IP
    type: String,
    default: null
  },
  lastLoginUserAgent: { // NEW: Track last login user agent
    type: String,
    default: null
  },
  registrationIP: { // NEW: Track registration IP
    type: String,
    default: null
  },
  registrationUserAgent: { // NEW: Track registration user agent
    type: String,
    default: null
  },
  
  // === PASSWORD RESET FIELDS ===
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  
  // === ACCOUNT STATUS FIELDS ===
  isActive: {
    type: Boolean,
    default: false // Requires approval for new users
  },
  permissions: {
    units: {
      create: { type: Boolean, default: true },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: true },
      delete: { type: Boolean, default: false }
    },
    contacts: {
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: true },
      delete: { type: Boolean, default: false }
    },
    gallery: {
      create: { type: Boolean, default: true },
      read: { type: Boolean, default: true },
      update: { type: Boolean, default: true },
      delete: { type: Boolean, default: false }
    },
    users: {
      create: { type: Boolean, default: false },
      read: { type: Boolean, default: false },
      update: { type: Boolean, default: false },
      delete: { type: Boolean, default: false }
    }
  },
  lastLogin: {
    type: Date
  },
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // === APPROVAL FIELDS ===
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  approvedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
})

// === PASSWORD HASHING ===
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next()
  
  try {
    // Hash password with cost of 12
    const hashedPassword = await bcrypt.hash(this.password, 12)
    this.password = hashedPassword
    next()
  } catch (error) {
    next(error)
  }
})

// === BASIC METHODS ===
// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Instance method to get full name
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`
}

// Remove password and sensitive tokens from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject()
  delete userObject.password
  delete userObject.emailVerificationToken
  delete userObject.passwordResetToken
  return userObject
}

// === ENHANCED SECURITY METHODS ===
// Check if account is locked
userSchema.methods.isAccountLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now())
}

// Lock account after failed login attempts
userSchema.methods.lockAccount = function() {
  this.lockUntil = Date.now() + 30 * 60 * 1000 // 30 minutes
  this.loginAttempts = 5 // Set to max attempts
}

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = function() {
  this.loginAttempts = 0
  this.lockUntil = undefined
}

// Increment login attempts
userSchema.methods.incrementLoginAttempts = function() {
  this.loginAttempts = (this.loginAttempts || 0) + 1
  if (this.loginAttempts >= 5) {
    this.lockAccount()
  }
}

// Update login tracking
userSchema.methods.updateLoginTracking = function(ipAddress, userAgent) {
  this.lastLogin = new Date()
  this.lastLoginIP = ipAddress
  this.lastLoginUserAgent = userAgent
  this.resetLoginAttempts()
}

// Update registration tracking
userSchema.methods.updateRegistrationTracking = function(ipAddress, userAgent) {
  this.registrationIP = ipAddress
  this.registrationUserAgent = userAgent
}

// === EMAIL VERIFICATION METHODS ===
// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto')
  const token = crypto.randomBytes(32).toString('hex')
  
  this.emailVerificationToken = token
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  
  return token
}

// Clear verification tokens
userSchema.methods.clearVerificationTokens = function() {
  this.emailVerificationToken = null
  this.emailVerificationExpires = null
  this.verificationAttempts = 0
  this.lastVerificationRequest = null
}

// Check if user can attempt email verification
userSchema.methods.canAttemptVerification = function() {
  const MAX_ATTEMPTS = 5
  return this.verificationAttempts < MAX_ATTEMPTS
}

// Check cooldown period for verification requests
userSchema.methods.canRequestVerification = function() {
  if (!this.lastVerificationRequest) return true
  
  const cooldownPeriod = 2 * 60 * 1000 // 2 minutes
  return (Date.now() - this.lastVerificationRequest.getTime()) >= cooldownPeriod
}

// Increment verification attempts with cooldown tracking
userSchema.methods.incrementVerificationAttempts = function() {
  this.verificationAttempts += 1
  this.lastVerificationRequest = new Date()
}

// Reset verification attempts
userSchema.methods.resetVerificationAttempts = function() {
  this.verificationAttempts = 0
  this.lastVerificationRequest = null
}

// Check if email verification token is valid
userSchema.methods.isEmailVerificationTokenValid = function(token) {
  return this.emailVerificationToken === token && 
         this.emailVerificationExpires && 
         this.emailVerificationExpires > Date.now()
}

// Complete email verification
userSchema.methods.completeEmailVerification = function() {
  this.emailVerified = true
  this.clearVerificationTokens()
  this.updatedAt = new Date()
}

// === PASSWORD RESET METHODS ===
// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto')
  const token = crypto.randomBytes(32).toString('hex')
  
  this.passwordResetToken = token
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000 // 1 hour
  
  return token
}

// Clear password reset tokens
userSchema.methods.clearPasswordResetTokens = function() {
  this.passwordResetToken = null
  this.passwordResetExpires = null
}

// Check if password reset token is valid
userSchema.methods.isPasswordResetTokenValid = function(token) {
  return this.passwordResetToken === token && 
         this.passwordResetExpires && 
         this.passwordResetExpires > Date.now()
}

// === ACCOUNT MANAGEMENT METHODS ===
// Approve user account
userSchema.methods.approveAccount = function(approvedByUserId) {
  this.isActive = true
  this.approvedBy = approvedByUserId
  this.approvedAt = new Date()
}

// Check if user can access admin features
userSchema.methods.canAccessAdmin = function() {
  return this.emailVerified && this.isActive && ['admin', 'manager', 'super_admin'].includes(this.role)
}

// Check if user is super admin
userSchema.methods.isSuperAdmin = function() {
  return this.role === 'super_admin' && this.isActive && this.emailVerified
}

// Check if user can manage other users
userSchema.methods.canManageUsers = function() {
  return this.isSuperAdmin() || (this.role === 'admin' && this.permissions.users.create)
}

// Check if user can log in
userSchema.methods.canLogin = function() {
  return this.emailVerified && this.isActive && !this.isAccountLocked()
}

// Get account status summary
userSchema.methods.getAccountStatus = function() {
  if (!this.emailVerified) return 'Email not verified'
  if (!this.isActive) return 'Pending approval'
  if (this.isAccountLocked()) return 'Account locked'
  return 'Active'
}

// === PERMISSION HELPER METHODS ===
// Check specific permission
userSchema.methods.hasPermission = function(resource, action) {
  if (this.isSuperAdmin()) {
    return true // Super admin has all permissions
  }
  
  if (!this.permissions[resource]) {
    return false
  }
  
  return this.permissions[resource][action] === true
}

// Get user's permissions summary
userSchema.methods.getPermissionsSummary = function() {
  if (this.isSuperAdmin()) {
    return 'All permissions (Super Admin)'
  }
  
  const summary = []
  for (const [resource, actions] of Object.entries(this.permissions)) {
    const allowedActions = Object.entries(actions)
      .filter(([action, allowed]) => allowed)
      .map(([action]) => action)
    
    if (allowedActions.length > 0) {
      summary.push(`${resource}: ${allowedActions.join(', ')}`)
    }
  }
  
  return summary.join(' | ')
}

// Set default permissions based on role
userSchema.methods.setDefaultPermissions = function() {
  switch (this.role) {
    case 'super_admin':
      // Super admin doesn't need explicit permissions - they have everything
      this.permissions = {
        units: { create: true, read: true, update: true, delete: true },
        contacts: { read: true, update: true, delete: true },
        gallery: { create: true, read: true, update: true, delete: true },
        users: { create: true, read: true, update: true, delete: true }
      }
      break
      
    case 'admin':
      this.permissions = {
        units: { create: true, read: true, update: true, delete: true },
        contacts: { read: true, update: true, delete: true },
        gallery: { create: true, read: true, update: true, delete: true },
        users: { create: true, read: true, update: true, delete: false }
      }
      break
      
    case 'manager':
      this.permissions = {
        units: { create: true, read: true, update: true, delete: false },
        contacts: { read: true, update: true, delete: false },
        gallery: { create: true, read: true, update: true, delete: false },
        users: { create: false, read: true, update: false, delete: false }
      }
      break
      
    case 'staff':
    default:
      this.permissions = {
        units: { create: false, read: true, update: false, delete: false },
        contacts: { read: true, update: false, delete: false },
        gallery: { create: false, read: true, update: false, delete: false },
        users: { create: false, read: false, update: false, delete: false }
      }
      break
  }
}

// Pre-save middleware to set default permissions for new users
userSchema.pre('save', function(next) {
  if (this.isNew && this.role) {
    this.setDefaultPermissions()
  }
  next()
})

// === STATIC METHODS ===
// Find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true })
}

// Find users pending approval (email verified but not approved)
userSchema.statics.findPendingApproval = function() {
  return this.find({ 
    emailVerified: true, 
    isActive: false 
  }).select('-password -emailVerificationToken -passwordResetToken')
}

// Find users pending email verification
userSchema.statics.findPendingEmailVerification = function() {
  return this.find({ 
    emailVerified: false 
  }).select('-password -emailVerificationToken -passwordResetToken')
}

// Find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role: role, isActive: true })
}

// Find locked accounts
userSchema.statics.findLockedAccounts = function() {
  return this.find({
    lockUntil: { $gt: Date.now() }
  }).select('-password -emailVerificationToken -passwordResetToken')
}

// Get comprehensive user statistics
userSchema.statics.getStats = async function() {
  const totalUsers = await this.countDocuments()
  const activeUsers = await this.countDocuments({ isActive: true })
  const pendingApproval = await this.countDocuments({ 
    emailVerified: true, 
    isActive: false 
  })
  const unverifiedEmail = await this.countDocuments({ 
    emailVerified: false 
  })
  const lockedAccounts = await this.countDocuments({
    lockUntil: { $gt: Date.now() }
  })
  
  const roleStats = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ])
  
  const securityStats = await this.aggregate([
    {
      $group: {
        _id: null,
        avgLoginAttempts: { $avg: '$loginAttempts' },
        maxLoginAttempts: { $max: '$loginAttempts' },
        avgVerificationAttempts: { $avg: '$verificationAttempts' },
        maxVerificationAttempts: { $max: '$verificationAttempts' }
      }
    }
  ])
  
  return {
    total: totalUsers,
    active: activeUsers,
    pendingApproval,
    unverifiedEmail,
    lockedAccounts,
    roleBreakdown: roleStats,
    security: securityStats[0] || {}
  }
}

// Find users with expired verification tokens
userSchema.statics.findExpiredVerificationTokens = function() {
  return this.find({
    emailVerificationToken: { $ne: null },
    emailVerificationExpires: { $lt: Date.now() }
  })
}

// Find users with expired password reset tokens  
userSchema.statics.findExpiredPasswordResetTokens = function() {
  return this.find({
    passwordResetToken: { $ne: null },
    passwordResetExpires: { $lt: Date.now() }
  })
}

// Cleanup expired tokens (for maintenance)
userSchema.statics.cleanupExpiredTokens = async function() {
  const expiredVerification = await this.updateMany(
    {
      emailVerificationToken: { $ne: null },
      emailVerificationExpires: { $lt: Date.now() }
    },
    {
      $unset: {
        emailVerificationToken: 1,
        emailVerificationExpires: 1
      }
    }
  )
  
  const expiredPasswordReset = await this.updateMany(
    {
      passwordResetToken: { $ne: null },
      passwordResetExpires: { $lt: Date.now() }
    },
    {
      $unset: {
        passwordResetToken: 1,
        passwordResetExpires: 1
      }
    }
  )
  
  return {
    expiredVerificationTokens: expiredVerification.modifiedCount,
    expiredPasswordResetTokens: expiredPasswordReset.modifiedCount
  }
}

// Unlock expired account locks
userSchema.statics.unlockExpiredAccounts = async function() {
  const result = await this.updateMany(
    {
      lockUntil: { $lt: Date.now() }
    },
    {
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 0 }
    }
  )
  
  return result.modifiedCount
}

// === INDEXES FOR PERFORMANCE ===
// userSchema.index({ email: 1 })
// userSchema.index({ username: 1 })
userSchema.index({ emailVerificationToken: 1 })
userSchema.index({ passwordResetToken: 1 })
userSchema.index({ isActive: 1, role: 1 })
userSchema.index({ emailVerified: 1, isActive: 1 })
userSchema.index({ verificationAttempts: 1 })
userSchema.index({ lockUntil: 1 }) // NEW: Index for account locks
userSchema.index({ lastVerificationRequest: 1 }) // NEW: Index for cooldown tracking
userSchema.index({ loginAttempts: 1 }) // NEW: Index for login attempts

module.exports = mongoose.model('User', userSchema)