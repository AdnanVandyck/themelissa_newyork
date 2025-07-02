const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const upload = require('../middleware/upload');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// GET all active gallery images (PUBLIC)
router.get('/public', async (req, res) => {
    try {
        console.log('GET /api/gallery/public - Fetching active gallery images');
        
        const { category } = req.query;
        const query = { isActive: true };
        
        if (category) {
            query.category = category;
        }
        
        const galleryItems = await Gallery.find(query).sort({ sortOrder: 1, createdAt: -1 });
        
        console.log(`Found ${galleryItems.length} active gallery items`);
        res.json(galleryItems);
        
    } catch (error) {
        console.error('Error fetching public gallery:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching gallery images'
        });
    }
});

// Apply authentication middleware for admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// GET all gallery images (ADMIN)
router.get('/', async (req, res) => {
    try {
        console.log('GET /api/gallery - Admin fetching all gallery images');
        console.log('Authenticated admin:', req.user.username);
        
        const { category, isActive } = req.query;
        const query = {};
        
        if (category) query.category = category;
        if (isActive !== undefined) query.isActive = isActive === 'true';
        
        const galleryItems = await Gallery.find(query).sort({ sortOrder: 1, createdAt: -1 });
        
        console.log(`Found ${galleryItems.length} gallery items for admin`);
        res.json({
            success: true,
            galleryItems
        });
        
    } catch (error) {
        console.error('Error fetching gallery for admin:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching gallery images'
        });
    }
});

// POST upload gallery image (ADMIN)
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        console.log('POST /api/gallery/upload - Admin uploading gallery image');
        console.log('Authenticated admin:', req.user.username);
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const { title, description, category, sortOrder } = req.body;
        const imageUrl = `/uploads/${req.file.filename}`;

        const galleryItem = new Gallery({
            title: title || 'Gallery Image',
            description: description || '',
            imageUrl,
            category: category || 'building-exterior',
            sortOrder: sortOrder || 0,
            isActive: true
        });

        const savedItem = await galleryItem.save();

        console.log('Gallery image uploaded by admin:', req.user.username, '- Item:', savedItem._id);
        
        res.status(201).json({
            success: true,
            message: 'Gallery image uploaded successfully',
            galleryItem: savedItem
        });
        
    } catch (error) {
        console.error('Error uploading gallery image:', error);
        res.status(500).json({
            success: false,
            message: 'Error uploading gallery image'
        });
    }
});

// PUT update gallery item (ADMIN)
router.put('/:id', async (req, res) => {
    try {
        console.log(`PUT /api/gallery/${req.params.id} - Admin updating gallery item`);
        console.log('Authenticated admin:', req.user.username);
        
        const { title, description, category, isActive, sortOrder } = req.body;
        
        const galleryItem = await Gallery.findByIdAndUpdate(
            req.params.id,
            {
                title,
                description,
                category,
                isActive,
                sortOrder,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );

        if (!galleryItem) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
        }

        console.log('Gallery item updated by admin:', req.user.username, '- Item:', galleryItem._id);
        
        res.json({
            success: true,
            message: 'Gallery item updated successfully',
            galleryItem
        });
        
    } catch (error) {
        console.error('Error updating gallery item:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating gallery item'
        });
    }
});

// DELETE gallery item (ADMIN)
router.delete('/:id', async (req, res) => {
    try {
        console.log(`DELETE /api/gallery/${req.params.id} - Admin deleting gallery item`);
        console.log('Authenticated admin:', req.user.username);
        
        const galleryItem = await Gallery.findByIdAndDelete(req.params.id);

        if (!galleryItem) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
        }

        console.log('Gallery item deleted by admin:', req.user.username, '- Item:', galleryItem._id);
        
        res.json({
            success: true,
            message: 'Gallery item deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting gallery item:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting gallery item'
        });
    }
});

module.exports = router;