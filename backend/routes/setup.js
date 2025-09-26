const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/setup
// @desc    Save user setup data
// @access  Private
router.post('/', auth, [
  body('renewableResource').optional().isIn(['solar', 'wind']).withMessage('Resource must be solar or wind'),
  body('totalCapacity').optional().isNumeric().withMessage('Capacity must be a number'),
  body('devices').optional().isArray().withMessage('Devices must be an array'),
  body('villageName').optional().isString().withMessage('Village name must be a string'),
  body('totalHouseholds').optional().isNumeric().withMessage('Total households must be a number'),
  body('dailyEnergyAvailable').optional().isNumeric().withMessage('Daily energy available must be a number'),
  body('allocationPercentage').optional().isNumeric().withMessage('Allocation percentage must be a number'),
  body('communityDevices').optional().isArray().withMessage('Community devices must be an array'),
  body('location.latitude').optional().isNumeric().withMessage('Latitude must be a number'),
  body('location.longitude').optional().isNumeric().withMessage('Longitude must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      renewableResource, 
      totalCapacity, 
      devices, 
      villageName, 
      totalHouseholds,
      dailyEnergyAvailable,
      allocationPercentage,
      communityDevices, 
      location 
    } = req.body;
    const userId = req.user._id;

    // Validate setup data based on user type
    if (req.user.userType === 'individual') {
      if (!renewableResource || !totalCapacity || !devices || devices.length === 0) {
        return res.status(400).json({ 
          message: 'Individual users must provide renewable resource, total capacity, and devices' 
        });
      }
    } else if (req.user.userType === 'community') {
      if (!villageName || !totalHouseholds || !dailyEnergyAvailable || !communityDevices || communityDevices.length === 0) {
        return res.status(400).json({ 
          message: 'Community users must provide village name, total households, daily energy available, and community devices' 
        });
      }
    }

    // Update user setup data
    const updateData = {
      setupData: {
        renewableResource,
        totalCapacity,
        devices,
        villageName,
        totalHouseholds,
        dailyEnergyAvailable,
        allocationPercentage: allocationPercentage || 1,
        communityDevices
      },
      location,
      isSetupComplete: true
    };

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Setup completed successfully',
      setupData: user.setupData,
      location: user.location,
      isSetupComplete: user.isSetupComplete
    });
  } catch (error) {
    console.error('Setup error:', error);
    res.status(500).json({ message: 'Server error during setup' });
  }
});

// @route   GET /api/setup
// @desc    Get user setup data
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      setupData: user.setupData,
      location: user.location,
      isSetupComplete: user.isSetupComplete,
      userType: user.userType
    });
  } catch (error) {
    console.error('Get setup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/setup
// @desc    Update user setup data
// @access  Private
router.put('/', auth, [
  body('renewableResource').optional().isIn(['solar', 'wind']).withMessage('Resource must be solar or wind'),
  body('totalCapacity').optional().isNumeric().withMessage('Capacity must be a number'),
  body('devices').optional().isArray().withMessage('Devices must be an array'),
  body('villageName').optional().isString().withMessage('Village name must be a string'),
  body('communityDevices').optional().isArray().withMessage('Community devices must be an array'),
  body('location.latitude').optional().isNumeric().withMessage('Latitude must be a number'),
  body('location.longitude').optional().isNumeric().withMessage('Longitude must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updateData = {};
    
    if (req.body.setupData) {
      updateData.setupData = { ...req.user.setupData, ...req.body.setupData };
    }
    
    if (req.body.location) {
      updateData.location = { ...req.user.location, ...req.body.location };
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Setup updated successfully',
      setupData: user.setupData,
      location: user.location
    });
  } catch (error) {
    console.error('Update setup error:', error);
    res.status(500).json({ message: 'Server error during update' });
  }
});

module.exports = router;
