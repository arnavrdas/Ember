const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  user1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'matched', 'unmatched', 'blocked'],
    default: 'pending'
  },
  isMutual: {
    type: Boolean,
    default: false
  },
  matchedAt: {
    type: Date,
    default: Date.now
  },
  lastMessageAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  unmatchedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  unmatchedAt: {
    type: Date
  },
  unmatchedReason: {
    type: String,
    maxlength: 500
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    type: {
      type: String,
      enum: ['text', 'image', 'video', 'audio'],
      default: 'text'
    },
    readBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  user1Liked: {
    type: Boolean,
    default: false
  },
  user2Liked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create a compound index to ensure unique matches between users
matchSchema.index({ user1: 1, user2: 1 }, { unique: true });

// Pre-save middleware to set isMutual when both users have liked each other
matchSchema.pre('save', function(next) {
  if (this.user1Liked && this.user2Liked) {
    this.isMutual = true;
    this.status = 'matched';
  }
  next();
});

// Static method to create or update a match
matchSchema.statics.createOrUpdateMatch = async function(user1Id, user2Id, likedBy) {
  try {
    // Check if match already exists
    let match = await this.findOne({
      $or: [
        { user1: user1Id, user2: user2Id },
        { user1: user2Id, user2: user1Id }
      ]
    });

    if (match) {
      // Update existing match
      if (match.user1.toString() === likedBy.toString()) {
        match.user1Liked = true;
      } else {
        match.user2Liked = true;
      }
    } else {
      // Create new match
      match = new this({
        user1: user1Id,
        user2: user2Id,
        user1Liked: user1Id.toString() === likedBy.toString(),
        user2Liked: user2Id.toString() === likedBy.toString()
      });
    }

    await match.save();
    return match;
  } catch (error) {
    throw error;
  }
};

module.exports = mongoose.model('Match', matchSchema);