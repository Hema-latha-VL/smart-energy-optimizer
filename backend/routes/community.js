const express = require('express');
const User = require('../models/User');
const Usage = require('../models/Usage');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/community/test
// @desc    Test community route
// @access  Private
router.get('/test', auth, async (req, res) => {
  res.json({ message: 'Community route is working', userType: req.user.userType });
});

// @route   GET /api/community
// @desc    Get community dashboard data with energy allocation and analytics
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    if (req.user.userType !== 'community') {
      return res.status(403).json({ message: 'Access denied. Community admin required.' });
    }

    const user = await User.findById(req.user._id);
    if (!user || !user.setupData) {
      return res.status(404).json({ message: 'User setup data not found' });
    }

    const {
      dailyEnergyAvailable,
      totalHouseholds,
      allocationPercentage,
      communityDevices
    } = user.setupData;

    // Validate required fields
    if (!dailyEnergyAvailable || !totalHouseholds || !communityDevices) {
      return res.status(400).json({ 
        message: 'Missing required setup data. Please complete your community setup first.' 
      });
    }

    // Get actual usage data from today
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    // Fetch today's community device usage
    const todaysUsage = await Usage.find({
      userId: req.user._id,
      startTime: { $gte: startOfDay, $lt: endOfDay },
      'communityData': { $exists: true }
    });

    // Calculate actual community consumption from logged usage
    let actualCommunityConsumption = 0;
    const deviceUsageMap = {};

    // Process actual usage data
    todaysUsage.forEach(usage => {
      actualCommunityConsumption += usage.energyUsedWh;
      const deviceName = usage.device.name;
      if (!deviceUsageMap[deviceName]) {
        deviceUsageMap[deviceName] = {
          name: deviceName,
          totalConsumption: 0,
          usageCount: 0,
          lastUsed: usage.startTime
        };
      }
      deviceUsageMap[deviceName].totalConsumption += usage.energyUsedWh;
      deviceUsageMap[deviceName].usageCount += 1;
      if (usage.startTime > deviceUsageMap[deviceName].lastUsed) {
        deviceUsageMap[deviceName].lastUsed = usage.startTime;
      }
    });

    // Create device consumption breakdown combining setup and actual usage
    const deviceConsumptionBreakdown = (communityDevices || []).map(device => {
      const actualUsage = deviceUsageMap[device.name];
      const plannedDailyConsumption = device.power * (device.hoursPerDay || 1) * (device.count || 1);
      const actualConsumption = actualUsage ? actualUsage.totalConsumption : 0;
      
      return {
        name: device.name,
        power: device.power,
        count: device.count || 1,
        hoursPerDay: device.hoursPerDay || 1,
        plannedDailyConsumption: plannedDailyConsumption,
        actualConsumption: actualConsumption,
        usageCount: actualUsage ? actualUsage.usageCount : 0,
        lastUsed: actualUsage ? actualUsage.lastUsed : null,
        // Use actual consumption for chart, fallback to planned if no usage logged
        totalDailyConsumption: actualConsumption || plannedDailyConsumption
      };
    });

    // Use actual consumption if available, otherwise use planned consumption
    const communityConsumption = actualCommunityConsumption > 0 ? 
      actualCommunityConsumption : 
      deviceConsumptionBreakdown.reduce((sum, device) => sum + device.plannedDailyConsumption, 0);

    // Calculate remaining energy after community devices
    const remainingEnergy = Math.max(0, dailyEnergyAvailable - communityConsumption);

    // Calculate per household allocation
    const perHouseholdAllocation = totalHouseholds > 0 ? 
      (remainingEnergy * (allocationPercentage / 100)) / totalHouseholds : 0;

    // Total household allocation
    const totalHouseholdAllocation = perHouseholdAllocation * totalHouseholds;

    // Calculate surplus
    const surplus = remainingEnergy - totalHouseholdAllocation;

    // Prepare chart data with actual values
    const allocationData = [
      {
        name: 'Community Devices Usage',
        value: Math.round(communityConsumption),
        color: '#ef4444',
        percentage: ((communityConsumption / dailyEnergyAvailable) * 100).toFixed(1)
      },
      {
        name: 'Household Allocation',
        value: Math.round(totalHouseholdAllocation),
        color: '#3b82f6',
        percentage: ((totalHouseholdAllocation / dailyEnergyAvailable) * 100).toFixed(1)
      },
      {
        name: 'Surplus',
        value: Math.max(0, Math.round(surplus)),
        color: '#10b981',
        percentage: ((Math.max(0, surplus) / dailyEnergyAvailable) * 100).toFixed(1)
      }
    ];

    res.json({
      summary: {
        dailyEnergyAvailable,
        totalHouseholds,
        communityConsumption: Math.round(communityConsumption),
        actualCommunityConsumption: Math.round(actualCommunityConsumption),
        totalHouseholdAllocation: Math.round(totalHouseholdAllocation),
        perHouseholdAllocation: Math.round(perHouseholdAllocation * 100) / 100,
        surplus: Math.max(0, Math.round(surplus)),
        allocationPercentage,
        hasActualUsage: actualCommunityConsumption > 0,
        usageLogCount: todaysUsage.length
      },
      allocationData,
      deviceConsumptionBreakdown,
      villageName: user.setupData.villageName || 'Community',
      todaysUsage: todaysUsage.map(usage => ({
        device: usage.device.name,
        consumption: usage.energyUsedWh,
        time: usage.startTime,
        duration: usage.duration,
        isOptimized: usage.isOptimized
      }))
    });
  } catch (error) {
    console.error('Community dashboard error:', error);
    res.status(500).json({ message: 'Server error fetching community dashboard data' });
  }
});

module.exports = router;