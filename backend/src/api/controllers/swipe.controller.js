// Importing

  // Models
  const User = require('../models/user.model')

  // Utils
  const { createError } = require('../../utils/global.utils')

// Defining Controllers

  // Route: /api/users/:targetId/like

    // POST
    const likeUser = async (req, res, next) => {
      try {
        const { targetId } = req.params
        const currentUserId = req.user._id

        // Validation
        if (targetId === currentUserId.toString()) {
          return next(createError(400, 'You cannot like yourself'))
        }

        const targetUser = await User.findById(targetId)
        if (!targetUser) {
          return next(createError(404, 'User not found'))
        }

        // Check if already liked
        const currentUser = await User.findById(currentUserId)
        if (currentUser.likes.includes(targetId)) {
          return res.json({ 
            matched: false, 
            message: 'Already liked this user',
            alreadyLiked: true 
          })
        }

        // Add like
        await User.findByIdAndUpdate(currentUserId, { 
          $addToSet: { likes: targetId } 
        })

        // Check if it's a match (target user already liked current user)
        const targetLikesCurrentUser = targetUser.likes.includes(currentUserId)
        
        if (targetLikesCurrentUser) {
          // Create a match
          await User.findByIdAndUpdate(currentUserId, { 
            $addToSet: { matches: targetId } 
          })
          await User.findByIdAndUpdate(targetId, { 
            $addToSet: { matches: currentUserId } 
          })

          return res.json({
            matched: true,
            message: "It's a match!",
            matchedUser: {
              _id: targetUser._id,
              name: targetUser.name,
              avatar: targetUser.avatar,
              bio: targetUser.bio
            }
          })
        }

        return res.json({ 
          matched: false, 
          message: 'User liked successfully' 
        })

      } catch (err) {
        next(err)
      }
    }

  // Route: /api/users/:targetId/pass

    // POST
    const passUser = async (req, res, next) => {
      try {
        const { targetId } = req.params
        const currentUserId = req.user._id

        // Validation
        if (targetId === currentUserId.toString()) {
          return next(createError(400, 'You cannot pass on yourself'))
        }

        const targetUser = await User.findById(targetId)
        if (!targetUser) {
          return next(createError(404, 'User not found'))
        }

        // Check if already passed
        const currentUser = await User.findById(currentUserId)
        if (currentUser.passes.includes(targetId)) {
          return res.json({ 
            message: 'Already passed on this user',
            alreadyPassed: true 
          })
        }

        // Add pass
        await User.findByIdAndUpdate(currentUserId, { 
          $addToSet: { passes: targetId } 
        })

        res.json({ message: 'User passed successfully' })

      } catch (err) {
        next(err)
      }
    }

  // Route: /api/users/potential-matches

    // GET
    const getPotentialMatches = async (req, res, next) => {
      try {
        console.log('getPotentialMatches called for user:', req.user._id)
        const currentUserId = req.user._id
        
        // Get current user with their interactions
        const currentUser = await User.findById(currentUserId)
          .select('likes passes matches preferences')
        
        console.log('Current user found:', currentUser ? 'yes' : 'no')
        
        if (!currentUser) {
          return next(createError(404, 'User not found'))
        }
    
        // Build exclusion list (users to filter out)
        const excludedUserIds = [
          currentUserId,
          ...(currentUser.likes || []),
          ...(currentUser.passes || []),
          ...(currentUser.matches || [])
        ]
        
        console.log('Excluded IDs:', excludedUserIds)
    
        // Build query for potential matches
        const query = {
          _id: { $nin: excludedUserIds },
          isActive: { $ne: false } // Only active users
        }
    
        // Apply preference filters if they exist
        if (currentUser.preferences) {
          const prefs = currentUser.preferences
          
          // Filter by interested in gender
          if (prefs.interestedIn && prefs.interestedIn.length > 0) {
            query.gender = { $in: prefs.interestedIn }
          }
    
          // Filter by age range
          if (prefs.ageRange) {
            const minAge = prefs.ageRange.min || 18
            const maxAge = prefs.ageRange.max || 100
            query.age = { $gte: minAge, $lte: maxAge }
          }
        }
    
        console.log('Query:', JSON.stringify(query))
    
        // Fetch potential matches
        const potentialMatches = await User
          .find(query)
          .select('name avatar bio age gender photos')
          .limit(50)
        
        console.log(`Found ${potentialMatches.length} potential matches`)
    
        // Shuffle the results for variety
        const shuffled = potentialMatches.sort(() => Math.random() - 0.5)
    
        res.json(shuffled)
    
      } catch (err) {
        console.error('Error in getPotentialMatches:', err)
        next(err)
      }
    }

  // Route: /api/users/swipe

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

  // Route: /api/users/matches

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

module.exports = { 
  likeUser,
  passUser,
  getPotentialMatches,
  swipe,
  getMatches
}