
const express = require('express');
const router = express.Router();
const multer = require('multer');
const Unit = require('../models/Unit');
// Remove this line: const upload = require('../middleware/upload');
const { authMiddleware, adminOrManagerMiddleware } = require('../middleware/auth');
const { cloudinary, unitImageStorage, layoutImageStorage } = require('../config/cloudinary');

// Configure multer with Cloudinary storage
const unitUpload = multer({ 
  storage: unitImageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Max 10 files
  }
});

const layoutUpload = multer({ 
  storage: layoutImageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Single image upload (for backward compatibility)
const singleUpload = multer({ 
  storage: unitImageStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Helper function to extract public_id from Cloudinary URL
const getPublicIdFromUrl = (imageUrl) => {
  if (!imageUrl) return null
  
  // Extract public_id from Cloudinary URL
  // Example: https://res.cloudinary.com/your-cloud/image/upload/v1234567890/melissa-apartments/units/unit-123-456.jpg
  const matches = imageUrl.match(/\/v\d+\/(.+)\.[^.]+$/)
  return matches ? matches[1] : null
}

// Helper function to get the correct base URL (keeping your existing logic)
const getBaseUrl = () => {
  // Check if we're in production (Render deployment)
  if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    return 'https://themelissa-backend.onrender.com';
  }
  
  // For local development
  return `http://localhost:${process.env.PORT || 5000}`;
};

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
router.use(adminOrManagerMiddleware);

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

// POST upload single image to Cloudinary (UPDATED: Now uses Cloudinary)
router.post('/upload-image', singleUpload.single('image'), async (req, res) => {
    try {
        console.log('POST /api/units/upload-image - Admin image upload to Cloudinary');
        console.log('Authenticated admin:', req.user.username);
        
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        console.log('File uploaded to Cloudinary by admin:', req.user.username, '- URL:', req.file.path);
        
        // Cloudinary automatically generates the full URL
        const imageUrl = req.file.path;
        
        console.log('Generated Cloudinary image URL:', imageUrl);
        
        res.json({ 
            message: 'Image uploaded successfully to Cloudinary',
            imageUrl: imageUrl,
            filename: req.file.filename,
            cloudinaryUrl: req.file.path
        });
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        
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
        
        res.status(500).json({ message: 'Error uploading image to Cloudinary' });
    }
});

// POST upload multiple images to Cloudinary (UPDATED: Now uses Cloudinary)
router.post('/upload-images', unitUpload.array('images', 10), async (req, res) => {
    try {
        console.log('POST /api/units/upload-images - Admin multiple image upload to Cloudinary');
        console.log('Authenticated admin:', req.user.username);
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No image files provided' });
        }

        console.log(`${req.files.length} files uploaded to Cloudinary by admin:`, req.user.username);
        
        // Cloudinary automatically generates full URLs
        const imageUrls = req.files.map(file => file.path);
        const filenames = req.files.map(file => file.filename);
        
        console.log('Generated Cloudinary image URLs:', imageUrls);
        
        res.json({ 
            message: `${req.files.length} images uploaded successfully to Cloudinary`,
            imageUrls: imageUrls,
            filenames: filenames,
            count: req.files.length,
            cloudinaryUrls: imageUrls
        });
    } catch (error) {
        console.error('Error uploading images to Cloudinary:', error);
        
        // Clean up uploaded files on error
        if (req.files) {
          const publicIds = req.files.map(file => getPublicIdFromUrl(file.path)).filter(Boolean)
          if (publicIds.length > 0) {
            try {
              await cloudinary.api.delete_resources(publicIds)
            } catch (cleanupError) {
              console.error('Error cleaning up failed uploads:', cleanupError)
            }
          }
        }
        
        res.status(500).json({ message: 'Error uploading images to Cloudinary' });
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

// PUT add images to existing unit (keeping your existing endpoint)
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

// NEW: POST upload layout image to Cloudinary
router.post('/:id/layout', layoutUpload.single('layout'), async (req, res) => {
  try {
    const unitId = req.params.id
    
    console.log(`POST /api/units/${unitId}/layout - Admin uploading layout to Cloudinary`)
    console.log('Authenticated admin:', req.user.username)
    
    if (!req.file) {
      return res.status(400).json({ message: 'No layout image file provided' })
    }

    const unit = await Unit.findById(unitId)
    if (!unit) {
      // Clean up uploaded file if unit not found
      const publicId = getPublicIdFromUrl(req.file.path)
      if (publicId) {
        await cloudinary.uploader.destroy(publicId)
      }
      return res.status(404).json({ message: 'Unit not found' })
    }

    // Delete old layout image from Cloudinary if it exists
    if (unit.layoutImage) {
      const oldPublicId = getPublicIdFromUrl(unit.layoutImage)
      if (oldPublicId) {
        try {
          await cloudinary.uploader.destroy(oldPublicId)
          console.log('Deleted old layout image from Cloudinary')
        } catch (deleteError) {
          console.error('Error deleting old layout image:', deleteError)
        }
      }
    }

    // Save new Cloudinary URL
    unit.layoutImage = req.file.path
    await unit.save()

    console.log(`✅ Layout image uploaded to Cloudinary for unit ${unit.unitNumber} by admin:`, req.user.username)

    res.json({
      message: 'Layout image uploaded successfully to Cloudinary',
      unit: unit,
      layoutImage: req.file.path
    })

  } catch (error) {
    console.error('❌ Error uploading layout image to Cloudinary:', error)
    
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
      message: 'Server error uploading layout image',
      error: error.message 
    })
  }
})

// NEW: DELETE layout image from Cloudinary
router.delete('/:id/layout', async (req, res) => {
  try {
    const unitId = req.params.id

    console.log(`DELETE /api/units/${unitId}/layout - Admin deleting layout`)
    console.log('Authenticated admin:', req.user.username)

    const unit = await Unit.findById(unitId)
    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' })
    }

    if (!unit.layoutImage) {
      return res.status(400).json({ message: 'No layout image to delete' })
    }

    // Delete from Cloudinary
    const publicId = getPublicIdFromUrl(unit.layoutImage)
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId)
        console.log('✅ Layout image deleted from Cloudinary by admin:', req.user.username)
      } catch (deleteError) {
        console.error('Error deleting from Cloudinary:', deleteError)
      }
    }

    // Remove from database
    unit.layoutImage = null
    await unit.save()

    res.json({
      message: 'Layout image deleted successfully',
      unit: unit
    })

  } catch (error) {
    console.error('❌ Error deleting layout image:', error)
    res.status(500).json({ 
      message: 'Server error deleting layout image',
      error: error.message 
    })
  }
})

// DELETE unit (admin only) - UPDATED: Now cleans up Cloudinary images
router.delete('/:id', async (req, res) => {
    try {
        console.log(`DELETE /api/units/${req.params.id} - Admin deleting unit`);
        console.log('Authenticated admin:', req.user.username);
        
        const unit = await Unit.findById(req.params.id);

        if (!unit) {
            return res.status(404).json({ message: 'Unit not found' });
        }

        // Delete all images from Cloudinary before deleting the unit
        const imagesToDelete = []
        
        // Add main image
        if (unit.imageURL) {
          const publicId = getPublicIdFromUrl(unit.imageURL)
          if (publicId) imagesToDelete.push(publicId)
        }
        
        // Add additional images
        if (unit.images && unit.images.length > 0) {
          unit.images.forEach(imageUrl => {
            const publicId = getPublicIdFromUrl(imageUrl)
            if (publicId) imagesToDelete.push(publicId)
          })
        }
        
        // Add layout image
        if (unit.layoutImage) {
          const publicId = getPublicIdFromUrl(unit.layoutImage)
          if (publicId) imagesToDelete.push(publicId)
        }
        
        // Delete images from Cloudinary
        if (imagesToDelete.length > 0) {
          try {
            const deleteResult = await cloudinary.api.delete_resources(imagesToDelete)
            console.log('Deleted images from Cloudinary:', deleteResult)
          } catch (cloudinaryError) {
            console.error('Error deleting images from Cloudinary:', cloudinaryError)
            // Continue with unit deletion even if image deletion fails
          }
        }

        // Delete unit from database
        await Unit.findByIdAndDelete(req.params.id);

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

// DELETE remove specific image from unit (UPDATED: Now cleans up Cloudinary)
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

        // Get the image URL to delete
        const imageUrl = unit.images[imageIndex];
        
        // Delete from Cloudinary
        const publicId = getPublicIdFromUrl(imageUrl)
        if (publicId) {
          try {
            await cloudinary.uploader.destroy(publicId)
            console.log('✅ Image deleted from Cloudinary by admin:', req.user.username)
          } catch (deleteError) {
            console.error('Error deleting from Cloudinary:', deleteError)
          }
        }

        // Remove the image at the specified index from database
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