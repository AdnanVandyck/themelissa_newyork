const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// POST - Submit contact form (PUBLIC)
router.post('/', async (req, res) => {
    try {
        console.log('POST /api/contacts - New contact form submission');
        console.log('Form data received:', req.body);

        const {
            firstName,
            lastName,
            email,
            phone,
            moveInDate,
            budgetRange,
            bedrooms,
            message
        } = req.body;

        // Create new contact
        const contact = new Contact({
            firstName,
            lastName,
            email,
            phone,
            moveInDate,
            budgetRange,
            bedrooms,
            message,
            status: 'new'
        });

        const savedContact = await contact.save();

        console.log('Contact form saved successfully:', savedContact._id);

        // Here you could add email notification logic
        // await sendEmailNotification(savedContact);

        res.status(201).json({
            success: true,
            message: 'Thank you for your inquiry! We will contact you within 24 hours.',
            contactId: savedContact._id
        });

    } catch (error) {
        console.error('Error saving contact form:', error);
        
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: validationErrors
            });
        }

        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
});

// Apply authentication middleware for admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// GET all contacts (ADMIN ONLY)
router.get('/', async (req, res) => {
    try {
        console.log('GET /api/contacts - Admin fetching all contacts');
        console.log('Authenticated admin:', req.user.username);

        const { status, page = 1, limit = 10 } = req.query;
        const query = status ? { status } : {};

        const contacts = await Contact.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Contact.countDocuments(query);

        console.log(`Found ${contacts.length} contacts`);

        res.json({
            success: true,
            contacts,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contacts'
        });
    }
});

// GET single contact by ID (ADMIN ONLY)
router.get('/:id', async (req, res) => {
    try {
        console.log(`GET /api/contacts/${req.params.id} - Admin fetching contact`);
        
        const contact = await Contact.findById(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        res.json({
            success: true,
            contact
        });

    } catch (error) {
        console.error('Error fetching contact:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching contact'
        });
    }
});

// PUT update contact status (ADMIN ONLY)
router.put('/:id', async (req, res) => {
    try {
        console.log(`PUT /api/contacts/${req.params.id} - Admin updating contact`);
        console.log('Update data:', req.body);

        const { status, notes } = req.body;

        const contact = await Contact.findByIdAndUpdate(
            req.params.id,
            { 
                status, 
                notes,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        console.log('Contact updated successfully:', contact._id);

        res.json({
            success: true,
            message: 'Contact updated successfully',
            contact
        });

    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating contact'
        });
    }
});

// DELETE contact (ADMIN ONLY)
router.delete('/:id', async (req, res) => {
    try {
        console.log(`DELETE /api/contacts/${req.params.id} - Admin deleting contact`);

        const contact = await Contact.findByIdAndDelete(req.params.id);

        if (!contact) {
            return res.status(404).json({
                success: false,
                message: 'Contact not found'
            });
        }

        console.log('Contact deleted successfully:', contact._id);

        res.json({
            success: true,
            message: 'Contact deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting contact'
        });
    }
});

module.exports = router;