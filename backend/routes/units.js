const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');
const upload = require('../middleware/upload');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Public route - Get available units only (for regular users/visitors)
router.get('/public', async (req, res) => {
    try {
        console.log('GET /api/units/public - Fetching available units');
        const units = await Unit.find({ available: true }).sort({ createdAt: -1 });
        console.log(`Found ${units.length} available units`);
        res.json(units);
    } catch (error) {
        console.log('Error fetching public units:', error.message);
        res.status(500).json({
            message: 'Error fetching units',
            error: error.message
        });
    }
});

// Public route - Get single unit by ID (available units only)
router.get('/public/:id', async (req, res) => {
    try {
        console.log(`GET /api/units/public/${req.params.id} - Public access`);
        
        const unit = await Unit.findOne({ 
            _id: req.params.id, 
            available: true  // Only allow access to available units
        });

        if (!unit) {
            console.log('Unit not found or not available for public access');
            return res.status(404).json({ 
                message: 'Unit not found or not available' 
            });
        }

        console.log('Public unit found:', unit.unitNumber);
        res.json(unit);
    } catch (error) {
        console.log('Error fetching public unit:', error.message);
        res.status(500).json({
            message: 'Error fetching unit',
            error: error.message
        });
    }
});


// Apply authentication middleware to all routes below this line
router.use(authMiddleware);

// Apply admin middleware to all routes below this line (admin-only routes)
router.use(adminMiddleware);

// Get all units (available AND unavailable for admin only)
router.get('/', async (req, res) => {
    try {
        console.log('GET /api/units - Admin fetching all units');
        console.log('Authenticated admin:', req.user.username);
        
        const units = await Unit.find().sort({ createdAt: -1 });
        console.log(`Found ${units.length} units for admin`);
        res.json(units);
    } catch (error) {
        console.log('Error fetching units:', error.message);
        res.status(500).json({
            message: 'Error fetching units',
            error: error.message
        });
    }
});

// Get single unit by ID (admin only)
router.get('/:id', async (req, res) => {
    try {
        console.log(`GET /api/units/${req.params.id} - Admin access`);
        console.log('Authenticated admin:', req.user.username);
        
        const unit = await Unit.findById(req.params.id);

        if (!unit) {
            console.log('Unit not found');
            return res.status(404).json({ message: 'Unit not found' });
        }

        console.log('Unit found:', unit.unitNumber);
        res.json(unit);
    } catch (error) {
        console.log('Error fetching unit:', error.message);
        res.status(500).json({
            message: 'Error fetching unit',
            error: error.message
        });
    }
});

// POST new unit (admin only)
router.post('/', async (req, res) => {
    try {
        console.log('POST /api/units - Admin creating new unit');
        console.log('Authenticated admin:', req.user.username);
        console.log('Data received:', req.body);

        const unit = new Unit(req.body);
        const savedUnit = await unit.save();

        console.log('Unit created by admin:', req.user.username, '- Unit:', savedUnit.unitNumber);
        res.status(201).json(savedUnit);
    } catch (error) {
        console.log('Error creating unit:', error.message);
        res.status(400).json({
            message: 'Error creating unit',
            error: error.message
        });
    }
});

// POST upload image (admin only)
router.post('/upload-image', upload.single('image'), (req, res) => {
    try {
        console.log('POST /api/units/upload-image - Admin image upload');
        console.log('Authenticated admin:', req.user.username);
        
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        console.log('File uploaded by admin:', req.user.username, '- File:', req.file.filename);
        
        const imageUrl = `/uploads/${req.file.filename}`;
        
        res.json({ 
            message: 'Image uploaded successfully',
            imageUrl: imageUrl,
            filename: req.file.filename
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Error uploading image' });
    }
});

// POST upload multiple images (NEW ENDPOINT)
router.post('/upload-images', upload.array('images', 10), (req, res) => {
    try {
        console.log('POST /api/units/upload-images - Admin multiple image upload');
        console.log('Authenticated admin:', req.user.username);
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No image files provided' });
        }

        console.log(`${req.files.length} files uploaded by admin:`, req.user.username);
        
        const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
        const filenames = req.files.map(file => file.filename);
        
        res.json({ 
            message: `${req.files.length} images uploaded successfully`,
            imageUrls: imageUrls,
            filenames: filenames,
            count: req.files.length
        });
    } catch (error) {
        console.error('Error uploading images:', error);
        res.status(500).json({ message: 'Error uploading images' });
    }
});


// PUT update unit (admin only)
router.put('/:id', async (req, res) => {
    try {
        console.log(`PUT /api/units/${req.params.id} - Admin updating unit`);
        console.log('Authenticated admin:', req.user.username);
        
        const unit = await Unit.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!unit) {
            return res.status(404).json({ message: 'Unit not found' });
        }

        console.log('Unit updated by admin:', req.user.username, '- Unit:', unit.unitNumber);
        res.json(unit);
    } catch (error) {
        console.log('Error updating unit:', error.message);
        res.status(400).json({
            message: 'Error updating unit',
            error: error.message
        });
    }
});

// PUT add images to existing unit (NEW ENDPOINT)
router.put('/:id/images', async (req, res) => {
    try {
        console.log(`PUT /api/units/${req.params.id}/images - Admin adding images to unit`);
        console.log('Authenticated admin:', req.user.username);
        
        const { imageUrls } = req.body;
        
        if (!imageUrls || !Array.isArray(imageUrls)) {
            return res.status(400).json({ message: 'imageUrls array is required' });
        }

        const unit = await Unit.findById(req.params.id);
        if (!unit) {
            return res.status(404).json({ message: 'Unit not found' });
        }

        // Initialize images array if it doesn't exist
        if (!unit.images) {
            unit.images = [];
        }

        // Add new images to existing array
        unit.images.push(...imageUrls);
        
        await unit.save();

        console.log(`Added ${imageUrls.length} images to unit:`, unit.unitNumber);
        res.json({
            message: `${imageUrls.length} images added to unit successfully`,
            unit: unit,
            totalImages: unit.images.length
        });
    } catch (error) {
        console.log('Error adding images to unit:', error.message);
        res.status(400).json({
            message: 'Error adding images to unit',
            error: error.message
        });
    }
});


// DELETE unit (admin only)
router.delete('/:id', async (req, res) => {
    try {
        console.log(`DELETE /api/units/${req.params.id} - Admin deleting unit`);
        console.log('Authenticated admin:', req.user.username);
        
        const unit = await Unit.findByIdAndDelete(req.params.id);

        if (!unit) {
            return res.status(404).json({ message: 'Unit not found' });
        }

        console.log('Unit deleted by admin:', req.user.username, '- Unit:', unit.unitNumber);
        res.json({ message: 'Unit deleted successfully' });
    } catch (error) {
        console.log('Error deleting unit:', error.message);
        res.status(500).json({
            message: 'Error deleting unit',
            error: error.message
        });
    }
});

// DELETE remove specific image from unit (NEW ENDPOINT)
router.delete('/:id/images/:imageIndex', async (req, res) => {
    try {
        console.log(`DELETE /api/units/${req.params.id}/images/${req.params.imageIndex} - Admin removing image`);
        console.log('Authenticated admin:', req.user.username);
        
        const unit = await Unit.findById(req.params.id);
        if (!unit) {
            return res.status(404).json({ message: 'Unit not found' });
        }

        const imageIndex = parseInt(req.params.imageIndex);
        if (!unit.images || imageIndex < 0 || imageIndex >= unit.images.length) {
            return res.status(400).json({ message: 'Invalid image index' });
        }

        // Remove the image at the specified index
        const removedImage = unit.images.splice(imageIndex, 1)[0];
        await unit.save();

        console.log(`Removed image from unit:`, unit.unitNumber, '- Image:', removedImage);
        res.json({
            message: 'Image removed successfully',
            removedImage: removedImage,
            remainingImages: unit.images.length
        });
    } catch (error) {
        console.log('Error removing image from unit:', error.message);
        res.status(400).json({
            message: 'Error removing image from unit',
            error: error.message
        });
    }
});

module.exports = router;