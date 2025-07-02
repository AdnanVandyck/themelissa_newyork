// Dependencies
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors');
const path = require('path');




const app = express();


// CORS Configuration - Updated for production
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://www.themelissanyc.com',
      'https://themelissanyc.com',
      'http://localhost:3000',
      'http://localhost:5173'
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Origin: ${req.get('Origin')}`);
  next();
});

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/units', require('./routes/units'));
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/gallery', require('./routes/gallery'));

// Root route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Backend API is running!' });
});


// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB Atlas connected successfully');
        console.log('Database', mongoose.connection.name)
    })
    .catch(err => {
        console.log('MongoDB connection error:', err.message);
        process.exit(1)
    });



app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    cors: 'Updated for themelissanyc.com',
    version: '2.0'
  });
});

// Force deployment - update 1
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    // console.log(`Test the server at: http://localhost:${PORT}`)
    // console.log(`API endpoints`)
    // console.log(`GET /api/units`)
    // console.log(`POST /api/units`)
    // console.log(`GET /api/units/:id`)
    // console.log(`POST /api/auth/login`)
    // console.log(`POST /api/auth/register`)
})