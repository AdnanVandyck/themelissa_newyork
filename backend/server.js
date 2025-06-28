// Dependencies
const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors');
require('dotenv').config();



const app = express();

// Debug enviornment variables
// console.log('Enviornment Variables Check:')
// console.log('NODE_ENV:', process.env.NODE_ENV)
// console.log('PORT:', process.env.PORT)
// console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI)
// console.log('JWT_SECRET exists', !!process.env.JWT_SECRET)

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/units', require('./routes/units'));
app.use('/api/auth', require('./routes/auth.route'));

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





// // TEST ROUTE TO MAKE SURE SERVER RUNNING
// app.get('/', (req, res) => {
//     res.json({ 
//         message: 'The Melissa NYC API Server is running',
//         database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
//         endpoints: {
//             units: '/api/units',
//             auth: '/api/auth',
//             test: '/api/test'
//         }
//     });
// });


app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
})

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