const express = require('express');
const router = express.Router();
const multer = require('multer');
const Gallery = require('../models/Gallery');
// Remove this line: const upload = require('../middleware/upload');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const { cloudinary } = require('../config/cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary storage for gallery images
const galleryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'melissa-apartments/gallery', // Separate folder for gallery
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [
      { 
        width: 1200, 
        height: 800, 
        crop: 'limit',
        quality: 'auto',
        fetch_format: 'auto'
      }
    ],
    public_id: (req, file) => {
      const timestamp = Date.now()
      const random = Math.round(Math.random() * 1E9)
      return `gallery-${timestamp}-${random}`
    }
  }
});

// Configure multer with Cloudinary
const galleryUpload = multer({ 
  storage: galleryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper function to extract public_id from Cloudinary URL
const getPublicIdFromUrl = (imageUrl) => {
  if (!imageUrl) return null
  const matches = imageUrl.match(/\/v\d+\/(.+)\.[^.]+$/)
  return matches ? matches[1] : null
}

// Helper function to get the correct base URL (keeping for backward compatibility)
const getBaseUrl = () => {
  // Check if we're in production (Render deployment)
  if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    return 'https://themelissa-backend.onrender.com';
  }
  
  // For local development
  return `http://localhost:${process.env.PORT || 5000}`;
};

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

// POST upload gallery image to Cloudinary (ADMIN) - UPDATED: Now uses Cloudinary
router.post('/upload', galleryUpload.single('image'), async (req, res) => {
    try {
        console.log('POST /api/gallery/upload - Admin uploading gallery image to Cloudinary');
        console.log('Authenticated admin:', req.user.username);
        
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const { title, description, category, sortOrder } = req.body;
        
        // Cloudinary automatically generates the full URL
        const imageUrl = req.file.path;
        
        console.log('Generated Cloudinary gallery image URL:', imageUrl);

        const galleryItem = new Gallery({
            title: title || 'Gallery Image',
            description: description || '',
            imageUrl, // This is now a Cloudinary URL
            category: category || 'building-exterior',
            sortOrder: sortOrder || 0,
            isActive: true
        });

        const savedItem = await galleryItem.save();

        console.log('✅ Gallery image uploaded to Cloudinary by admin:', req.user.username, '- Item:', savedItem._id);
        
        res.status(201).json({
            success: true,
            message: 'Gallery image uploaded successfully to Cloudinary',
            galleryItem: savedItem,
            cloudinaryUrl: imageUrl
        });
        
    } catch (error) {
        console.error('❌ Error uploading gallery image to Cloudinary:', error);
        
        // Clean up uploaded file on error
        if (req.file) {
          const publicId = getPublicIdFromUrl(req.file.path)
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId)
            } catch (cleanupError) {
              console.error('Error cleaning up failed upload:', cleanupError)
            }
          }
        }
        
        res.status(500).json({
            success: false,
            message: 'Error uploading gallery image to Cloudinary'
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

// DELETE gallery item (ADMIN) - UPDATED: Now cleans up Cloudinary
router.delete('/:id', async (req, res) => {
    try {
        console.log(`DELETE /api/gallery/${req.params.id} - Admin deleting gallery item`);
        console.log('Authenticated admin:', req.user.username);
        
        const galleryItem = await Gallery.findById(req.params.id);

        if (!galleryItem) {
            return res.status(404).json({
                success: false,
                message: 'Gallery item not found'
            });
        }

        // Delete from Cloudinary if it's a Cloudinary URL
        if (galleryItem.imageUrl && galleryItem.imageUrl.includes('cloudinary.com')) {
          const publicId = getPublicIdFromUrl(galleryItem.imageUrl);
          if (publicId) {
            try {
              await cloudinary.uploader.destroy(publicId);
              console.log('✅ Gallery image deleted from Cloudinary');
            } catch (deleteError) {
              console.error('Error deleting from Cloudinary:', deleteError);
            }
          }
        }

        // Delete from database
        await Gallery.findByIdAndDelete(req.params.id);

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