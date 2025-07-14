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
//     minlength: 6
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
//     enum: ['admin', 'manager', 'staff'],
//     default: 'staff'
//   },
//   isActive: {
//     type: Boolean,
//     default: true
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

// // Remove password from JSON output
// userSchema.methods.toJSON = function() {
//   const userObject = this.toObject()
//   delete userObject.password
//   return userObject
// }

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
    minlength: 8 // Updated from 6 to 8 for better security
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
    enum: ['admin', 'manager', 'staff', 'super_admin'], // Added super_admin
    default: 'staff'
  },
  
  // === EMAIL VERIFICATION FIELDS (NEW) ===
  isEmailVerified: {
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
  
  // === PASSWORD RESET FIELDS (NEW) ===
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  
  // === EXISTING FIELDS ===
  isActive: {
    type: Boolean,
    default: false // Changed from true to false - requires approval for new users
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
  
  // === APPROVAL FIELDS (NEW) ===
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

// Hash password before saving
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

// === EXISTING METHODS ===
// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

// Instance method to get full name
userSchema.methods.getFullName = function() {
  return `${this.firstName} ${this.lastName}`
}

// Static method to find active users
userSchema.statics.findActive = function() {
  return this.find({ isActive: true })
}

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject()
  delete userObject.password
  delete userObject.emailVerificationToken
  delete userObject.passwordResetToken
  return userObject
}

// === NEW METHODS FOR EMAIL VERIFICATION ===
// Generate email verification token
userSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto')
  const token = crypto.randomBytes(32).toString('hex')
  
  this.emailVerificationToken = token
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  
  return token
}

// Generate password reset token
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto')
  const token = crypto.randomBytes(32).toString('hex')
  
  this.passwordResetToken = token
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000 // 1 hour
  
  return token
}

// Clear verification tokens
userSchema.methods.clearVerificationTokens = function() {
  this.emailVerificationToken = null
  this.emailVerificationExpires = null
  this.passwordResetToken = null
  this.passwordResetExpires = null
}

// Approve user account
userSchema.methods.approveAccount = function(approvedByUserId) {
  this.isActive = true
  this.approvedBy = approvedByUserId
  this.approvedAt = new Date()
}

// Check if user can access admin features
userSchema.methods.canAccessAdmin = function() {
  return this.isEmailVerified && this.isActive && ['admin', 'manager', 'super_admin'].includes(this.role)
}

// Check if user is super admin
userSchema.methods.isSuperAdmin = function() {
  return this.role === 'super_admin' && this.isActive && this.isEmailVerified
}

// Check if user can manage other users
userSchema.methods.canManageUsers = function() {
  return this.isSuperAdmin() || (this.role === 'admin' && this.permissions.users.create)
}

// === NEW STATIC METHODS ===
// Find users pending approval
userSchema.statics.findPendingApproval = function() {
  return this.find({ 
    isEmailVerified: true, 
    isActive: false 
  }).select('-password -emailVerificationToken -passwordResetToken')
}

// Find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role: role, isActive: true })
}

// Get user statistics
userSchema.statics.getStats = async function() {
  const totalUsers = await this.countDocuments()
  const activeUsers = await this.countDocuments({ isActive: true })
  const pendingApproval = await this.countDocuments({ 
    isEmailVerified: true, 
    isActive: false 
  })
  const unverifiedEmail = await this.countDocuments({ 
    isEmailVerified: false 
  })
  
  const roleStats = await this.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: '$role', count: { $sum: 1 } } }
  ])
  
  return {
    total: totalUsers,
    active: activeUsers,
    pendingApproval,
    unverifiedEmail,
    roleBreakdown: roleStats
  }
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

// === INDEXES FOR PERFORMANCE ===
// userSchema.index({ email: 1 })
// userSchema.index({ username: 1 })
userSchema.index({ emailVerificationToken: 1 })
userSchema.index({ passwordResetToken: 1 })
userSchema.index({ isActive: 1, role: 1 })
userSchema.index({ isEmailVerified: 1, isActive: 1 })

module.exports = mongoose.model('User', userSchema)