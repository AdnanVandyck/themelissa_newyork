const express = require('express');
const mongoose = require('mongoose')
const cors = require('cors');
require('dotenv').config();


const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('MongoDB Atlas connected successfully');
        console.log('Database', mongoose.connection.name)
    })
    .catch(err => {
        console.log('MongoDB connection error:', err.message);
        process.exit(1)
    })


// TEST ROUTE TO MAKE SURE SERVER RUNNING
app.get('/', (req, res) => {
    res.json({ 
        message: 'The Melissa NYC API Server is running',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});


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
    console.log(`Test the server at: http://localhost:${PORT}`)
})