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
    'https://themelissa-newyork.vercel.app', // Fixed: Added https://
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
    platform: 'Render',
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
    message: 'The Melissa Backend API is running on Render!',
    version: '4.0',
    platform: 'Render'
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

// 404 handler - FIXED for Express 5.x
app.use('/*catchall', (req, res) => {
  res.status(404).json({ 
    message: 'API endpoint not found',
    availableEndpoints: ['/api/health', '/api/units', '/api/contacts', '/api/gallery']
  });
});

// For Render, export the app
module.exports = app;

// For local development and Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;

// Minimal server.js for testing (replace your backend/server.js temporarily)
// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const unitsRoutes = require('./routes/units');

// const app = express();

// // CORS
// app.use(cors({
//   origin: [
//     'https://www.themelissanyc.com',
//     'https://themelissanyc.com',
//     'http://localhost:3000',
//     'http://localhost:5173'
//   ],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// app.use(express.json());

// app.use('/api/units', unitsRoutes);

// // Simple health check
// app.get('/health', (req, res) => {
//   res.json({
//     status: 'OK',
//     timestamp: new Date().toISOString(),
//     platform: 'Render',
//     version: '6.0'
//   });
// });

// // Simple API routes (no complex routing)
// app.get('/api/units/public', (req, res) => {
//   res.json([
//     {
//       _id: 'test1',
//       unitNumber: 'Test Unit 1',
//       price: 5000,
//       bedrooms: 2,
//       bathrooms: 1,
//       available: true,
//       description: 'Test unit for deployment'
//     }
//   ]);
// });

// app.post('/api/contacts', (req, res) => {
//   console.log('Contact form received:', req.body);
//   res.json({
//     success: true,
//     message: 'Contact form submitted successfully'
//   });
// });

// // Root route
// app.get('/', (req, res) => {
//   res.json({ message: 'The Melissa API is running on Render!' });
// });

// // MongoDB connection (optional for testing)
// if (process.env.MONGODB_URI) {
//   mongoose.connect(process.env.MONGODB_URI)
//     .then(() => console.log('✅ MongoDB connected'))
//     .catch(err => console.log('❌ MongoDB error:', err.message));
// }

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

// module.exports = app