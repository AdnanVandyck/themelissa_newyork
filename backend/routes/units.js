const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');
const upload = require('../middleware/upload');  

// Get all units (available AND unavailable for admin)
router.get('/', async (req, res) => {
    try {
        console.log('GET /api/units - Fetching all units');
        const units = await Unit.find().sort({ createdAt: -1});  // ← Fixed: removed available filter
        console.log(`Found ${units.length} units`);
        res.json(units)
    } catch (error) {
        console.log('Error fetching units:', error.message);
        res.status(500).json({
            message: 'Error fetching units',  // ← Fixed: consistent naming
            error: error.message
        })
    }
});

// Get single unit by ID
router.get('/:id', async (req, res) => {
    try {
        console.log(`GET /api/units/${req.params.id}`);  // ← Fixed: was req.params.is
        const unit = await Unit.findById(req.params.id);

        if (!unit) {
            console.log('Unit not found');
            return res.status(404).json({message: 'Unit not found'});
        }

        console.log('Unit found:', unit.unitNumber);
        res.json(unit)
    } catch (error) {
        console.log('Error fetching unit:', error.message);
        res.status(500).json({
            message: 'Error fetching unit',
            error: error.message
        })
    }
});

// POST new unit
router.post('/', async (req, res) => {
    try {
        console.log('POST /api/units - Creating new unit');
        console.log('Data received:', req.body);

        const unit = new Unit(req.body);
        const savedUnit = await unit.save();

        console.log('Unit created:', savedUnit.unitNumber);
        res.status(201).json(savedUnit)
    } catch (error) {
        console.log('Error creating unit:', error.message);
        res.status(400).json({
            message: 'Error creating unit',
            error: error.message
        })
    }
});

// POST /api/units/upload-image - Upload image
router.post('/upload-image', upload.single('image'), (req, res) => {
  try {
    console.log('POST /api/units/upload-image - Image upload request');
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    console.log('File uploaded:', req.file.filename);
    
    // Return the file URL that frontend can use
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

// PUT update unit
router.put('/:id', async (req, res) => {
    try {
        console.log(`PUT /api/units/${req.params.id}`);  // ← Fixed: was req.params.is
        const unit = await Unit.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true}
        );

        if (!unit) {
            return res.status(404).json({message: 'Unit not found'});
        }

        console.log('Unit updated:', unit.unitNumber);
        res.json(unit);
    } catch (error) {
        console.log('Error updating unit:', error.message);
        res.status(400).json({
            message: 'Error updating unit',
            error: error.message
        })
    }
});

// DELETE unit
router.delete('/:id', async (req, res) => {  // ← Fixed: was router.put
    try {
        console.log(`DELETE /api/units/${req.params.id}`);  // ← Fixed: was req.params.is
        const unit = await Unit.findByIdAndDelete(req.params.id);

        if (!unit) {
            return res.status(404).json({message: 'Unit not found'});
        }

        console.log('Unit deleted:', unit.unitNumber);
        res.json({ message: 'Unit deleted successfully'});  // ← Fixed: was "delted"
    } catch (error) {
        console.log('Error deleting unit:', error.message);
        res.status(500).json({
            message: 'Error deleting unit',
            error: error.message
        })
    }
});

module.exports = router;