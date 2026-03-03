// Importing

  // Models
  const User = require('../models/user.model')

// Defining Controllers

  // Route: /api/profiles

    // GET
    const getProfiles = async (req, res, next) => {
      try {
        const excludeIds = [
          req.user._id,
          ...req.user.likes,
          ...req.user.passes,
        ]

        const profiles = await User
          .find({ _id: { $nin: excludeIds } })
          .select('-password -likes -passes -matches')
          .limit(20)

        res.json(profiles)
      } catch (err) {
        next(err)
      }
    }

  // Route: /api/profiles/me

    // PUT
    const updateProfile = async (req, res, next) => {
      try {
        const { bio, avatar, tags } = req.body

        const updateFields = {}
        if (bio    !== undefined) updateFields.bio    = bio
        if (avatar !== undefined) updateFields.avatar = avatar
        if (tags   !== undefined) updateFields.tags   = tags

        const updatedUser = await User.findByIdAndUpdate(
          req.user._id,
          { $set: updateFields },
          { new: true, runValidators: true }
        ).select('-password')

        res.json(updatedUser)
      } catch (err) {
        next(err)
      }
    }

module.exports = { getProfiles, updateProfile }