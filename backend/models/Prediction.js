const mongoose = require('mongoose');

const hourlyDataSchema = new mongoose.Schema({
  hour: {
    type: Number,
    required: true,
    min: 0,
    max: 23
  },
  predictedGeneration: {
    type: Number, // in Wh
    required: true
  },
  weatherCondition: {
    type: String,
    required: true
  },
  temperature: {
    type: Number, // in Celsius
    required: true
  },
  windSpeed: {
    type: Number, // in m/s
    default: 0
  },
  solarIrradiance: {
    type: Number, // in W/m²
    default: 0
  }
});

const recommendedWindowSchema = new mongoose.Schema({
  startHour: {
    type: Number,
    required: true,
    min: 0,
    max: 23
  },
  endHour: {
    type: Number,
    required: true,
    min: 0,
    max: 23
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  reason: {
    type: String,
    required: true
  }
});

const predictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  hourlyData: [hourlyDataSchema],
  recommendedWindows: [recommendedWindowSchema],
  totalPredictedGeneration: {
    type: Number, // in Wh
    required: true
  },
  averageEfficiency: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  weatherSummary: {
    type: String,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
predictionSchema.index({ userId: 1, date: -1 });
predictionSchema.index({ userId: 1, lastUpdated: -1 });

module.exports = mongoose.model('Prediction', predictionSchema);
