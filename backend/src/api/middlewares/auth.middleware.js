// Imports

  // Libraries
  const jwt  = require('jsonwebtoken')
  const User = require('../models/user.model')

// Middlewares

  const protect = async (req, res, next) => {
    let token

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id).select('-password')

        if (!req.user) {
          const err = new Error('User not found')
          err.statusCode = 401
          return next(err)
        }

        next()

      } catch (error) {
        const err = new Error('Not authorized, invalid token')
        err.statusCode = 401
        return next(err)
      }
    } else {
      const err = new Error('Not authorized, no token provided')
      err.statusCode = 401
      return next(err)
    }
  }

module.exports = { protect }