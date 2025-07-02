const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    moveInDate: {
        type: Date,
        required: [true, 'Move-in date is required']
    },
    budgetRange: {
        type: String,
        required: [true, 'Budget range is required'],
        enum: [
            'Under $2,000',
            '$2,000 - $3,000', 
            '$3,000 - $4,000',
            '$4,000 - $5,000',
            '$5,000 - $7,000',
            'Over $7,000'
        ]
    },
    bedrooms: {
        type: String,
        required: [true, 'Bedroom preference is required'],
        enum: ['Studio', '1 Bedroom', '2 Bedrooms', '3+ Bedrooms', 'Flexible']
    },
    message: {
        type: String,
        trim: true,
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'scheduled', 'completed', 'declined'],
        default: 'new'
    },
    source: {
        type: String,
        default: 'website'
    },
    notes: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt field before saving
ContactSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Contact', ContactSchema);