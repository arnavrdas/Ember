// Importing

  // Models
  const User    = require('../models/user.model')
  const Message = require('../models/message.model')

  // Utils
  const { createError } = require('../utils/global.utils')

// Defining Controllers

  // Route: /api/messages

    // POST
    const sendMessage = async (req, res, next) => {
      try {
        const { toId, text } = req.body

        if (!toId || !text) {
          return next(createError(400, 'Please provide toId and text'))
        }

        const currentUser = await User.findById(req.user._id)
        const isMatch = currentUser.matches.some(id => id.toString() === toId)

        if (!isMatch) {
          return next(createError(403, 'You can only message your matches'))
        }

        const message = await Message.create({ from: req.user._id, to: toId, text })
        res.status(201).json(message)

      } catch (err) {
        next(err)
      }
    }

  // Route: /api/messages/:userId

    // GET
    const getConversation = async (req, res, next) => {
      try {
        const otherUserId = req.params.userId

        const messages = await Message
          .find({
            $or: [
              { from: req.user._id, to: otherUserId },
              { from: otherUserId,  to: req.user._id },
            ]
          })
          .sort({ createdAt: 1 })

        await Message.updateMany(
          { from: otherUserId, to: req.user._id, read: false },
          { $set: { read: true } }
        )

        res.json(messages)
      } catch (err) {
        next(err)
      }
    }

module.exports = { sendMessage, getConversation }