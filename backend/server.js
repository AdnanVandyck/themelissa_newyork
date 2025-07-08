
// Dependencies
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors');
const path = require('path');

const app = express();

// Handle preflight requests first
app.options('*', cors());

// CORS Configuration - Updated for Hostinger frontend + Render backend
// app.use(cors({
//   origin: [
//     // Production URLs (Hostinger)
//     'https://www.themelissanyc.com',
//     'https://themelissanyc.com',
//     'http://www.themelissanyc.com',
//     'http://themelissanyc.com',
//     // Local development ports
//     'http://localhost:3000',
//     'http://localhost:5173',
//     'http://localhost:5174'
//   ],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
// }));

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

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    platform: 'Render',
    version: '4.0',
    express: require('express/package.json').version
  });
});

// Routes
app.use('/api/units', require('./routes/units'));
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/gallery', require('./routes/gallery'));

// Root route for testing
app.get('/api', (req, res) => {
  res.json({ 
    message: 'The Melissa Backend API is running on Render!',
    version: '4.0',
    platform: 'Render',
    express: require('express/package.json').version
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Atlas connected successfully');
        console.log('📊 Database:', mongoose.connection.name)
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
    availableEndpoints: ['/api/health', '/api/units', '/api/contacts', '/api/gallery']
  });
});

// For local development and Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📦 Express version: ${require('express/package.json').version}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;