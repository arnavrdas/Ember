// Importing Libraries
  const mongoose = require('mongoose')

// Defining Schema
const messageSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
)

// Exporting
module.exports = mongoose.model('Message', messageSchema)