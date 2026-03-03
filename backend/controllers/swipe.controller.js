// Importing

  // Models
  const User = require('../models/user.model')

// Defining Helpers

  const createError = (statusCode, message) => {
    const err = new Error(message)
    err.statusCode = statusCode
    return err
  }

// Defining Controllers

  // Route: /api/swipe

    // POST
    const swipe = async (req, res, next) => {
      try {
        const { targetId, direction } = req.body

        if (!targetId || !direction) {
          return next(createError(400, 'Please provide targetId and direction'))
        }

        const targetUser = await User.findById(targetId)
        if (!targetUser) {
          return next(createError(404, 'User not found'))
        }

        if (targetId === req.user._id.toString()) {
          return next(createError(400, 'You cannot swipe on yourself'))
        }

        if (direction === 'left') {
          await User.findByIdAndUpdate(req.user._id, { $addToSet: { passes: targetId } })
          return res.json({ matched: false, message: 'Passed' })
        }

        if (direction === 'right' || direction === 'super') {
          await User.findByIdAndUpdate(req.user._id, { $addToSet: { likes: targetId } })

          const targetLikesUs = targetUser.likes.includes(req.user._id)
          if (targetLikesUs) {
            await User.findByIdAndUpdate(req.user._id, { $addToSet: { matches: targetId } })
            await User.findByIdAndUpdate(targetId,      { $addToSet: { matches: req.user._id } })

            return res.json({
              matched: true,
              matchedUser: { _id: targetUser._id, name: targetUser.name, avatar: targetUser.avatar },
            })
          }

          return res.json({ matched: false, message: 'Liked' })
        }

        next(createError(400, 'Invalid direction — must be left, right, or super'))

      } catch (err) {
        next(err)
      }
    }

  // Route: /api/matches

    // GET
    const getMatches = async (req, res, next) => {
      try {
        const user = await User
          .findById(req.user._id)
          .populate('matches', 'name avatar bio tags')

        res.json(user.matches)
      } catch (err) {
        next(err)
      }
    }

module.exports = { swipe, getMatches }