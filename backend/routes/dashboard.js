const express = require('express');
const axios = require('axios');
const Usage = require('../models/Usage');
const Prediction = require('../models/Prediction');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/dashboard/summary
// @desc    Get dashboard summary data
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's usage
    const todayUsage = await Usage.find({
      userId,
      startTime: { $gte: today, $lt: tomorrow }
    });

    const consumedToday = todayUsage.reduce((sum, usage) => sum + usage.energyUsedWh, 0);

    // Get today's prediction
    const todayPrediction = await Prediction.findOne({
      userId,
      date: { $gte: today, $lt: tomorrow }
    });

    const generatedToday = todayPrediction ? todayPrediction.totalPredictedGeneration : 0;
    const surplus = generatedToday - consumedToday;

    res.json({
      generatedToday: Math.round(generatedToday / 1000 * 100) / 100, // Convert to kWh
      consumedToday: Math.round(consumedToday / 1000 * 100) / 100, // Convert to kWh
      surplus: Math.round(surplus / 1000 * 100) / 100, // Convert to kWh
      isDeficit: surplus < 0,
      efficiency: generatedToday > 0 ? Math.round((consumedToday / generatedToday) * 100) : 0
    });
  } catch (error) {
    console.error('Dashboard summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/predictions
// @desc    Get energy predictions
// @access  Private
router.get('/predictions', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const user = req.user;

    if (!user.isSetupComplete) {
      return res.status(400).json({ message: 'User setup not complete' });
    }

    // Check if we have recent predictions (within last 6 hours)
    const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
    let prediction = await Prediction.findOne({
      userId,
      lastUpdated: { $gte: sixHoursAgo }
    }).sort({ lastUpdated: -1 });

    // If no recent prediction, fetch new one from ML service
    if (!prediction) {
      try {
        const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:8001';
        const response = await axios.post(`${mlServiceUrl}/predict`, {
          userId: userId.toString(),
          latitude: user.location?.latitude || 0,
          longitude: user.location?.longitude || 0,
          resourceCapacity: user.setupData.totalCapacity,
          renewableResource: user.setupData.renewableResource
        });

        // Save prediction to database
        prediction = new Prediction({
          userId,
          date: new Date(),
          hourlyData: response.data.hourlyData,
          recommendedWindows: response.data.recommendedWindows,
          totalPredictedGeneration: response.data.totalPredictedGeneration,
          averageEfficiency: response.data.averageEfficiency,
          weatherSummary: response.data.weatherSummary
        });

        await prediction.save();
      } catch (mlError) {
        console.error('ML service error:', mlError);
        // Return mock data if ML service is unavailable
        prediction = {
          hourlyData: generateMockHourlyData(),
          recommendedWindows: generateMockRecommendedWindows(),
          totalPredictedGeneration: user.setupData.totalCapacity * 0.8,
          averageEfficiency: 0.8,
          weatherSummary: 'Partly cloudy with good solar conditions'
        };
      }
    }

    res.json({
      hourlyData: prediction.hourlyData,
      recommendedWindows: prediction.recommendedWindows,
      totalPredictedGeneration: prediction.totalPredictedGeneration,
      averageEfficiency: prediction.averageEfficiency,
      weatherSummary: prediction.weatherSummary,
      lastUpdated: prediction.lastUpdated
    });
  } catch (error) {
    console.error('Dashboard predictions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/recent-usage
// @desc    Get recent usage data for charts
// @access  Private
router.get('/recent-usage', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 7;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const usage = await Usage.find({
      userId,
      startTime: { $gte: startDate }
    }).sort({ startTime: 1 });

    // Group usage by date
    const dailyUsage = {};
    usage.forEach(u => {
      const date = u.startTime.toISOString().split('T')[0];
      if (!dailyUsage[date]) {
        dailyUsage[date] = { energyUsed: 0, cost: 0, devices: [] };
      }
      dailyUsage[date].energyUsed += u.energyUsedWh;
      dailyUsage[date].cost += u.cost || 0;
      dailyUsage[date].devices.push(u.device.name);
    });

    res.json({ dailyUsage });
  } catch (error) {
    console.error('Recent usage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/device-usage-breakdown
// @desc    Get device usage breakdown for pie chart
// @access  Private
router.get('/device-usage-breakdown', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const days = parseInt(req.query.days) || 30;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Aggregate usage by device
    const deviceBreakdown = await Usage.aggregate([
      {
        $match: {
          userId: userId,
          startTime: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$device.name',
          totalEnergyUsed: { $sum: '$energyUsedWh' },
          totalDuration: { $sum: '$duration' },
          usageCount: { $sum: 1 },
          avgPower: { $avg: '$device.power' }
        }
      },
      {
        $project: {
          deviceName: '$_id',
          totalEnergyUsed: { $round: ['$totalEnergyUsed', 2] },
          totalDuration: { $round: ['$totalDuration', 2] },
          usageCount: 1,
          avgPower: { $round: ['$avgPower', 2] },
          _id: 0
        }
      },
      {
        $sort: { totalEnergyUsed: -1 }
      }
    ]);

    res.json(deviceBreakdown);
  } catch (error) {
    console.error('Device usage breakdown error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions for mock data
function generateMockHourlyData() {
  const data = [];
  for (let hour = 0; hour < 24; hour++) {
    const isDaytime = hour >= 6 && hour <= 18;
    const baseGeneration = isDaytime ? Math.random() * 1000 + 500 : 0;
    
    data.push({
      hour,
      predictedGeneration: Math.round(baseGeneration),
      weatherCondition: isDaytime ? 'sunny' : 'clear',
      temperature: 20 + Math.random() * 15,
      windSpeed: Math.random() * 5,
      solarIrradiance: isDaytime ? Math.random() * 800 + 200 : 0
    });
  }
  return data;
}

function generateMockRecommendedWindows() {
  return [
    {
      startHour: 10,
      endHour: 14,
      confidence: 0.9,
      reason: 'Peak solar generation period'
    },
    {
      startHour: 15,
      endHour: 17,
      confidence: 0.7,
      reason: 'Good solar conditions with moderate generation'
    }
  ];
}

module.exports = router;

