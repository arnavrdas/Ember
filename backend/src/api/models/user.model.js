// Importing Libraries
  const mongoose = require('mongoose')
  const bcrypt   = require('bcryptjs')

// Defining Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String, 
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // IMPORTANT: By default, DON'T include this field when querying users. This prevents accidentally leaking passwords to the frontend.
    },

    age: {
      type: Number,
      required: true,
      min: 18,
      max: 99,
    },

    bio: {
      type: String,
      default: '',
      maxlength: 300,
    },

    avatar: {
      type: String,
      default: '😊',
    },
    
    tags: [String],

    // Swipe related fields
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    
    passes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    
    matches: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    
    // Preferences
    preferences: {
      gender: [String],
      ageRange: {
        min: { type: Number, default: 18 },
        max: { type: Number, default: 100 }
      },
      maxDistance: { type: Number, default: 50 } // in miles/km
    },
    
    // Location for distance-based matching
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        index: '2dsphere'
      }
    }
  },
  { timestamps: true }
)

// Create geospatial index for location-based queries
userSchema.index({ 'location.coordinates': '2dsphere' })

// Defining Middlewares / Mongoose "hooks"

  userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 10)
    next()
  })


// Defining Instance Methods

  userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
  }

// Exporting
module.exports = mongoose.model('User', userSchema)