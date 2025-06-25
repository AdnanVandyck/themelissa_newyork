const express = require('express');
const cors = require('cors');
require('dotenv').config();


const app = express();

// MIDDLEWARE
app.use(cors());
app.use(express.json());


// TEST ROUTE TO MAKE SURE SERVER RUNNING
app.get('/', (req, res) => {
    res.json({ message: 'The Melissa NYC API Server is running'});
});


app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working',
        timestamp: new Date().toISOString()
    })
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Test the server at: http://localhost:${PORT}`)
})