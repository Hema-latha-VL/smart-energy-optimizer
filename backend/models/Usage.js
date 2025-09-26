const mongoose = require('mongoose');

const usageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  device: {
    name: {
      type: String,
      required: true
    },
    power: {
      type: Number, // in Watts
      required: true
    },
    totalPower: {
      type: Number, // Total power when multiple units are used
      default: function() { return this.power; }
    }
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in hours
    required: true,
    min: 0
  },
  energyUsedWh: {
    type: Number, // in Watt-hours
    required: true,
    min: 0
  },
  cost: {
    type: Number, // in currency units
    default: 0
  },
  isOptimized: {
    type: Boolean,
    default: false
  },
  notes: String,
  communityData: {
    unitsUsed: {
      type: Number,
      min: 1
    },
    timestamp: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
usageSchema.index({ userId: 1, startTime: -1 });
usageSchema.index({ userId: 1, device: 1 });

module.exports = mongoose.model('Usage', usageSchema);
