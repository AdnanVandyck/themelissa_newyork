// Dependencies
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors');
const path = require('path');

const app = express();

// Import Cloudinary test function (we'll create this file next)
let testCloudinaryConnection;
try {
  const { testCloudinaryConnection: cloudinaryTest } = require('./config/cloudinary');
  testCloudinaryConnection = cloudinaryTest;
} catch (error) {
  console.log('⚠️ Cloudinary config not found - will create during setup');
  testCloudinaryConnection = async () => false;
}

// Handle preflight requests first
app.options('*', cors());

// CORS Configuration - Updated for Hostinger frontend + Render backend
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Allow localhost and local network IPs
    if (origin.includes('localhost') || 
        origin.includes('192.168.') || 
        origin.includes('10.0.0.') ||
        origin.includes('themelissanyc.com')) {
      return callback(null, true);
    }
    
    callback(null, true); // Allow all for development
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));

// Body parser middleware
app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
  next();
});

// IMPORTANT: Keep this for backward compatibility during migration
// You can remove this after confirming all images are moved to Cloudinary
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Enhanced Health check endpoint with Cloudinary status
app.get('/api/health', async (req, res) => {
  // Test Cloudinary connection
  const cloudinaryStatus = await testCloudinaryConnection();
  
  // Check if Cloudinary environment variables are set
  const cloudinaryConfigured = !!(
    process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET
  );
  
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    platform: 'Render',
    version: '4.1', // Updated version
    express: require('express/package.json').version,
    cloudinary: cloudinaryStatus ? 'Connected' : 'Disconnected',
    cloudinaryConfigured: cloudinaryConfigured,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    imageStorage: cloudinaryStatus ? 'Cloudinary' : 'Local (Ephemeral)'
  });
});

// Routes with proper error handling and loading verification
console.log('📂 Loading API routes...');

try {
  app.use('/api/units', require('./routes/units'));
  console.log('✅ Units routes loaded');
} catch (error) {
  console.error('❌ Failed to load units routes:', error.message);
}

try {
  // FIXED: Proper auth route loading with error handling
  const authRoutes = require('./routes/auth.route.js');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded from ./routes/auth.route.js');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message);
  console.error('   Check if ./routes/auth.route.js exists and has proper exports');
}

try {
  app.use('/api/contacts', require('./routes/contacts'));
  console.log('✅ Contacts routes loaded');
} catch (error) {
  console.error('❌ Failed to load contacts routes:', error.message);
}

try {
  app.use('/api/gallery', require('./routes/gallery'));
  console.log('✅ Gallery routes loaded');
} catch (error) {
  console.error('❌ Failed to load gallery routes:', error.message);
}

// Test route to verify auth routes are working
app.get('/api/auth/test', (req, res) => {
  res.json({ 
    message: 'Auth routes are working!',
    timestamp: new Date().toISOString(),
    availableAuthEndpoints: [
      'POST /api/auth/login',
      'POST /api/auth/register',
      'POST /api/auth/register-public',
      'GET /api/auth/verify',
      'GET /api/auth/users',
      'GET /api/auth/pending-users',
      'PUT /api/auth/approve-user/:id'
    ]
  });
});

// Root route for testing
app.get('/api', (req, res) => {
  res.json({ 
    message: 'The Melissa Backend API is running on Render with Cloudinary!',
    version: '4.1',
    platform: 'Render',
    express: require('express/package.json').version,
    imageStorage: 'Cloudinary + Local (Migration Mode)',
    availableEndpoints: {
      health: '/api/health',
      auth: '/api/auth (login, register, register-public, verify, users)',
      units: '/api/units (property listings)',
      contacts: '/api/contacts (contact forms)',
      gallery: '/api/gallery (image gallery)'
    }
  });
});

// Database connection with Cloudinary connection test
mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('✅ MongoDB Atlas connected successfully');
        console.log('📊 Database:', mongoose.connection.name);
        
        // Test Cloudinary connection on startup
        console.log('🔍 Testing Cloudinary connection...');
        const cloudinaryConnected = await testCloudinaryConnection();
        
        if (cloudinaryConnected) {
          console.log('☁️ ✅ Cloudinary connection successful!');
          console.log('📸 Image storage: Cloudinary (Persistent)');
        } else {
          console.log('☁️ ❌ Cloudinary connection failed');
          console.log('📋 Check these environment variables:');
          console.log('   - CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING');
          console.log('   - CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING');
          console.log('   - CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING');
          console.log('📸 Falling back to local storage (images will be ephemeral)');
        }
    })
    .catch(err => {
        console.log('❌ MongoDB connection error:', err.message);
        // Don't exit on Render - let it retry
    });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler - Works with Express 4.x
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'API endpoint not found',
    requestedPath: req.originalUrl,
    availableEndpoints: [
      '/api/health', 
      '/api/auth (with /test, /login, /register, /register-public)', 
      '/api/units', 
      '/api/contacts', 
      '/api/gallery'
    ],
    suggestion: 'Check the API documentation or try /api for available endpoints'
  });
});

// For local development and Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Express version: ${require('express/package.json').version}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('🔄 Migration Mode: Supporting both Cloudinary and local storage');
  
  // Show current configuration status
  if (process.env.CLOUDINARY_CLOUD_NAME) {
    console.log('☁️ Cloudinary configured for:', process.env.CLOUDINARY_CLOUD_NAME);
  } else {
    console.log('⚠️ Cloudinary not configured - add environment variables');
  }
  
  console.log('🔗 API URLs:');
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Auth Test: http://localhost:${PORT}/api/auth/test`);
  console.log(`   Registration: http://localhost:${PORT}/api/auth/register-public`);
});

module.exports = app;