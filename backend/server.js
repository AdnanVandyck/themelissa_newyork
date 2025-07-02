// Dependencies
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors');
const path = require('path');

const app = express();

// CORS Configuration for Vercel
app.use(cors({
  origin: [
    'https://your-vercel-app.vercel.app', // We'll update this after deployment
    'https://www.themelissanyc.com',
    'https://themelissanyc.com',
    'http://localhost:3000',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
    platform: 'Vercel',
    version: '4.0'
  });
});

// Routes (note the /api prefix for Vercel)
app.use('/api/units', require('./routes/units'));
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/gallery', require('./routes/gallery'));

// Root route for testing
app.get('/api', (req, res) => {
  res.json({ 
    message: 'The Melissa Backend API is running on Vercel!',
    version: '4.0',
    platform: 'Vercel'
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
        // Don't exit on Vercel - let it retry
    });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'API endpoint not found',
    availableEndpoints: ['/api/health', '/api/units', '/api/contacts', '/api/gallery']
  });
});

// For Vercel, export the app instead of listening
module.exports = app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}