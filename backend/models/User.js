const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  userType: {
    type: String,
    enum: ['individual', 'community'],
    required: true
  },
  setupData: {
    // For individual users
    renewableResource: {
      type: String,
      enum: ['solar', 'wind']
    },
    totalCapacity: {
      type: Number, // in Wh/kWh
      min: 0
    },
    devices: [{
      name: {
        type: String,
        required: true
      },
      power: {
        type: Number, // in Watts
        required: true,
        min: 0
      }
    }],
    // For community users
    villageName: String,
    totalHouseholds: {
      type: Number,
      min: 1
    },
    dailyEnergyAvailable: {
      type: Number, // in Wh - daily renewable energy available
      min: 0
    },
    allocationPercentage: {
      type: Number,
      default: 1, // Default 1% per household
      min: 0.1,
      max: 10
    },
    communityDevices: [{
      name: {
        type: String,
        required: true
      },
      power: {
        type: Number,
        required: true,
        min: 0
      },
      count: {
        type: Number,
        default: 1,
        min: 1
      },
      hoursPerDay: {
        type: Number,
        default: 1,
        min: 0.1,
        max: 24
      }
    }]
  },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  isSetupComplete: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

module.exports = mongoose.model('User', userSchema);
