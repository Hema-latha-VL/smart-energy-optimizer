const express = require('express');
const { body, validationResult } = require('express-validator');
const Usage = require('../models/Usage');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/usage
// @desc    Log device usage
// @access  Private
router.post('/', auth, [
  body('device.name').notEmpty().withMessage('Device name is required'),
  body('device.power').isNumeric().withMessage('Device power must be a number'),
  body('startTime').isISO8601().withMessage('Start time must be a valid date'),
  body('duration').isNumeric().withMessage('Duration must be a number'),
  body('notes').optional().isString().withMessage('Notes must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { device, startTime, duration, notes } = req.body;
    const userId = req.user._id;

    // Calculate end time and energy used
    const start = new Date(startTime);
    const end = new Date(start.getTime() + duration * 60 * 60 * 1000); // duration in hours
    const energyUsedWh = device.power * duration;

    // Create usage record
    const usage = new Usage({
      userId,
      device,
      startTime: start,
      endTime: end,
      duration,
      energyUsedWh,
      notes
    });

    await usage.save();

    res.status(201).json({
      message: 'Usage logged successfully',
      usage: {
        id: usage._id,
        device: usage.device,
        startTime: usage.startTime,
        endTime: usage.endTime,
        duration: usage.duration,
        energyUsedWh: usage.energyUsedWh,
        notes: usage.notes
      }
    });
  } catch (error) {
    console.error('Log usage error:', error);
    res.status(500).json({ message: 'Server error during usage logging' });
  }
});

// @route   GET /api/usage
// @desc    Get usage history
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, device } = req.query;
    const userId = req.user._id;

    // Build query
    const query = { userId };
    
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) query.startTime.$gte = new Date(startDate);
      if (endDate) query.startTime.$lte = new Date(endDate);
    }
    
    if (device) {
      query['device.name'] = new RegExp(device, 'i');
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get usage records
    const usage = await Usage.find(query)
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Usage.countDocuments(query);

    res.json({
      usage,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get usage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/usage/today
// @desc    Get today's usage summary
// @access  Private
router.get('/today', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayUsage = await Usage.find({
      userId,
      startTime: { $gte: today, $lt: tomorrow }
    });

    const totalEnergyUsed = todayUsage.reduce((sum, usage) => sum + usage.energyUsedWh, 0);
    const totalCost = todayUsage.reduce((sum, usage) => sum + (usage.cost || 0), 0);

    res.json({
      totalEnergyUsed,
      totalCost,
      usageCount: todayUsage.length,
      devices: todayUsage.map(u => ({
        name: u.device.name,
        energyUsed: u.energyUsedWh,
        duration: u.duration
      }))
    });
  } catch (error) {
    console.error('Get today usage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/usage/:id
// @desc    Delete usage record
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const usage = await Usage.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!usage) {
      return res.status(404).json({ message: 'Usage record not found' });
    }

    res.json({ message: 'Usage record deleted successfully' });
  } catch (error) {
    console.error('Delete usage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/usage/community
// @desc    Log community device usage
// @access  Private (Community users only)
router.post('/community', auth, [
  body('device.name').notEmpty().withMessage('Device name is required'),
  body('device.power').isNumeric().withMessage('Device power must be a number'),
  body('date').isISO8601().withMessage('Date must be valid'),
  body('hours').isNumeric().withMessage('Hours must be a number'),
  body('unitsUsed').isNumeric().withMessage('Units used must be a number'),
  body('totalConsumption').isNumeric().withMessage('Total consumption must be a number'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('isOptimized').optional().isBoolean().withMessage('Is optimized must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is a community user
    if (req.user.userType !== 'community') {
      return res.status(403).json({ message: 'Access denied. Community users only.' });
    }

    const { 
      device, 
      date, 
      hours, 
      unitsUsed, 
      totalConsumption, 
      notes, 
      isOptimized,
      timestamp 
    } = req.body;
    const userId = req.user._id;

    // Convert date to start and end times
    const usageDate = new Date(date);
    const startTime = new Date(usageDate);
    const endTime = new Date(usageDate.getTime() + hours * 60 * 60 * 1000);

    // Create usage record with community-specific fields
    const usage = new Usage({
      userId,
      device: {
        name: device.name,
        power: device.power,
        totalPower: device.totalPower || device.power * unitsUsed
      },
      startTime,
      endTime,
      duration: hours,
      energyUsedWh: totalConsumption,
      notes: notes || '',
      isOptimized: isOptimized || false,
      communityData: {
        unitsUsed: unitsUsed,
        timestamp: timestamp || new Date().toISOString()
      }
    });

    await usage.save();

    res.status(201).json({
      message: 'Community usage logged successfully',
      usage: {
        id: usage._id,
        device: usage.device,
        startTime: usage.startTime,
        endTime: usage.endTime,
        duration: usage.duration,
        energyUsedWh: usage.energyUsedWh,
        notes: usage.notes,
        isOptimized: usage.isOptimized,
        communityData: usage.communityData
      }
    });
  } catch (error) {
    console.error('Community usage logging error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

