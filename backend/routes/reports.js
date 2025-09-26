const express = require('express');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const path = require('path');
const fs = require('fs');
const Usage = require('../models/Usage');
const auth = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reports/monthly
// @desc    Export monthly usage report as CSV
// @access  Private
router.get('/monthly', auth, async (req, res) => {
  try {
    const { year, month } = req.query;
    const userId = req.user._id;

    if (!year || !month) {
      return res.status(400).json({ message: 'Year and month are required' });
    }

    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get usage data for the month
    const usage = await Usage.find({
      userId,
      startTime: { $gte: startDate, $lte: endDate }
    }).sort({ startTime: 1 });

    if (usage.length === 0) {
      return res.status(404).json({ message: 'No usage data found for the specified month' });
    }

    // Prepare CSV data
    const csvData = usage.map(record => ({
      date: record.startTime.toISOString().split('T')[0],
      time: record.startTime.toTimeString().split(' ')[0],
      device: record.device.name,
      power: record.device.power,
      duration: record.duration,
      energyUsed: record.energyUsedWh,
      cost: record.cost || 0,
      notes: record.notes || ''
    }));

    // Create CSV file
    const fileName = `usage_report_${year}_${month}_${userId}.csv`;
    const filePath = path.join(__dirname, '../temp', fileName);

    // Ensure temp directory exists
    const tempDir = path.dirname(filePath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const csvWriter = createCsvWriter({
      path: filePath,
      header: [
        { id: 'date', title: 'Date' },
        { id: 'time', title: 'Time' },
        { id: 'device', title: 'Device' },
        { id: 'power', title: 'Power (W)' },
        { id: 'duration', title: 'Duration (hours)' },
        { id: 'energyUsed', title: 'Energy Used (Wh)' },
        { id: 'cost', title: 'Cost' },
        { id: 'notes', title: 'Notes' }
      ]
    });

    await csvWriter.writeRecords(csvData);

    // Send file to client
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(500).json({ message: 'Error downloading file' });
      }
      
      // Clean up file after download
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error('File cleanup error:', unlinkErr);
      });
    });
  } catch (error) {
    console.error('Monthly report error:', error);
    res.status(500).json({ message: 'Server error generating report' });
  }
});

// @route   GET /api/reports/summary
// @desc    Get usage summary for reports page
// @access  Private
router.get('/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user._id;

    let query = { userId };
    
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const usage = await Usage.find(query).sort({ startTime: -1 });

    // Calculate summary statistics
    const totalEnergyUsed = usage.reduce((sum, record) => sum + record.energyUsedWh, 0);
    const totalCost = usage.reduce((sum, record) => sum + (record.cost || 0), 0);
    const totalDuration = usage.reduce((sum, record) => sum + record.duration, 0);

    // Group by device
    const deviceStats = {};
    usage.forEach(record => {
      const deviceName = record.device.name;
      if (!deviceStats[deviceName]) {
        deviceStats[deviceName] = {
          name: deviceName,
          power: record.device.power,
          totalEnergy: 0,
          totalDuration: 0,
          usageCount: 0
        };
      }
      deviceStats[deviceName].totalEnergy += record.energyUsedWh;
      deviceStats[deviceName].totalDuration += record.duration;
      deviceStats[deviceName].usageCount += 1;
    });

    // Group by date
    const dailyStats = {};
    usage.forEach(record => {
      const date = record.startTime.toISOString().split('T')[0];
      if (!dailyStats[date]) {
        dailyStats[date] = {
          date,
          energyUsed: 0,
          cost: 0,
          deviceCount: 0
        };
      }
      dailyStats[date].energyUsed += record.energyUsedWh;
      dailyStats[date].cost += record.cost || 0;
      dailyStats[date].deviceCount += 1;
    });

    res.json({
      summary: {
        totalRecords: usage.length,
        totalEnergyUsed,
        totalCost,
        totalDuration,
        averageEnergyPerDay: usage.length > 0 ? totalEnergyUsed / Object.keys(dailyStats).length : 0
      },
      deviceStats: Object.values(deviceStats),
      dailyStats: Object.values(dailyStats).sort((a, b) => new Date(b.date) - new Date(a.date)),
      recentUsage: usage.slice(0, 10)
    });
  } catch (error) {
    console.error('Reports summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reports/export
// @desc    Export custom date range report
// @access  Private
router.get('/export', auth, async (req, res) => {
  try {
    const { startDate, endDate, format = 'csv' } = req.query;
    const userId = req.user._id;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    const usage = await Usage.find({
      userId,
      startTime: { $gte: start, $lte: end }
    }).sort({ startTime: 1 });

    if (usage.length === 0) {
      return res.status(404).json({ message: 'No usage data found for the specified date range' });
    }

    if (format === 'csv') {
      // Generate CSV
      const csvData = usage.map(record => ({
        date: record.startTime.toISOString().split('T')[0],
        time: record.startTime.toTimeString().split(' ')[0],
        device: record.device.name,
        power: record.device.power,
        duration: record.duration,
        energyUsed: record.energyUsedWh,
        cost: record.cost || 0,
        notes: record.notes || ''
      }));

      const fileName = `usage_export_${startDate}_to_${endDate}_${userId}.csv`;
      const filePath = path.join(__dirname, '../temp', fileName);

      const tempDir = path.dirname(filePath);
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const csvWriter = createCsvWriter({
        path: filePath,
        header: [
          { id: 'date', title: 'Date' },
          { id: 'time', title: 'Time' },
          { id: 'device', title: 'Device' },
          { id: 'power', title: 'Power (W)' },
          { id: 'duration', title: 'Duration (hours)' },
          { id: 'energyUsed', title: 'Energy Used (Wh)' },
          { id: 'cost', title: 'Cost' },
          { id: 'notes', title: 'Notes' }
        ]
      });

      await csvWriter.writeRecords(csvData);

      res.download(filePath, fileName, (err) => {
        if (err) {
          console.error('Download error:', err);
          res.status(500).json({ message: 'Error downloading file' });
        }
        
        fs.unlink(filePath, (unlinkErr) => {
          if (unlinkErr) console.error('File cleanup error:', unlinkErr);
        });
      });
    } else {
      // Return JSON data
      res.json({
        usage,
        summary: {
          totalRecords: usage.length,
          totalEnergyUsed: usage.reduce((sum, record) => sum + record.energyUsedWh, 0),
          totalCost: usage.reduce((sum, record) => sum + (record.cost || 0), 0)
        }
      });
    }
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({ message: 'Server error generating export' });
  }
});

module.exports = router;

