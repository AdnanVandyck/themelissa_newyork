const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit.model.js')


// Get all available units
router.get('/', async (req, res) => {
    try {
        console.log('Get /api/units - Fetching all properties');
        const units = await Unit.find({ available: true }).sort({ createdAt: -1});
        console.log(`Found ${units.length} units`);
        res.json(units)
    } catch (error) {
        console.log('Error fetching units:', error.message);
        res.status(500).json({
            message: 'Error fetching properties',
            error: error.message
        })
    }
});


//  Get single unit by ID
router.get('/:id', async (req, res) => {
    try {
        console.log(`Get /api/units/${req.params.is}`);
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


//  POST new unit
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

//  PUT update unit
router.put('/:id', async (req, res) => {
    try {
        console.log(`PUT /api/units/${req.params.is}`);
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


//  DELETE unit
router.put('/:id', async (req, res) => {
    try {
        console.log(`DELETE /api/units/${req.params.is}`);
        const unit = await Unit.findByIdAndDelete(req.params.id);

        if (!unit) {
            return res.status(404).json({message: 'Unit not found'});
        }

        console.log('Unit deleted:', unit.unitNumber);
        res.json({ message: 'Unit delted successfully'});
    } catch (error) {
        console.log('Error deleting unit:', error.message);
        res.status(500).json({
            message: 'Error deleting unit',
            error: error.message
        })
    }
});

module.exports = router;