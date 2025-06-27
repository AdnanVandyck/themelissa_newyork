const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
    unitNumber:{
        type: String,
        required: [true, 'Unit name is required'],
        maxlength: [5, 'Unit name cannot exceed 5 characters']
    },
    description: {
        type: String,
        required: [true, 'Unit description is required'],
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    price: {
        type: Number,
        required: [true, 'Unit Price is required'],
        min: [0, 'Price cannot be negative']
    },
    bedrooms: {
        type: Number,
        required: [true, 'Number of bedrooms is required'],
        min: [0, 'Bedrooms cannot be negative']
    },
    bathrooms: {
        type: Number,
        required: [true, 'Number of bathrooms is required'],
        min: [0, 'Bathrooms cannot be negative']
    },
    imageURL: {
        type: String,
        default: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
    },
    available: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Unit', UnitSchema);