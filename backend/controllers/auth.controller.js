// Importing

  // Libraries
  const jwt = require('jsonwebtoken')

  // Models
  const User = require('../models/user.model')

  // Utils
  const { createError } = require('../utils/global.utils')

// Defing Helpers

  const generateToken = (userId) => {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )
  }

// Defining Controllers

  // Route: /api/auth/register

    // POST
    const register = async (req, res, next) => {
      try {
        const { name, email, password, age } = req.body

        if (!name || !email || !password || !age) {
          return next(createError(400, 'Please provide name, email, password, and age'))
        }

        const existingUser = await User.findOne({ email })
        if (existingUser) {
          return next(createError(400, 'An account with this email already exists'))
        }

        const user = await User.create({ name, email, password, age })

        res.status(201).json({
          _id:   user._id,
          name:  user.name,
          email: user.email,
          age:   user.age,
          avatar: user.avatar,
          token: generateToken(user._id),
        })

      } catch (err) {
        if (err.code === 11000) {
          return next(createError(400, 'An account with this email already exists'))
        }
        next(err)
      }
    }

  // Route: /api/auth/login

    // POST
    const login = async (req, res, next) => {
      try {
        const { email, password } = req.body

        if (!email || !password) {
          return next(createError(400, 'Please provide email and password'))
        }

        const user = await User.findOne({ email }).select('+password')

        if (!user) {
          return next(createError(401, 'Invalid email or password'))
        }

        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
          return next(createError(401, 'Invalid email or password'))
        }

        res.json({
          _id:   user._id,
          name:  user.name,
          email: user.email,
          age:   user.age,
          avatar: user.avatar,
          token: generateToken(user._id),
        })

      } catch (err) {
        next(err)
      }
    }

  // Route: /api/auth/me

    // GET
    const getMe = async (req, res, next) => {
      try {
        res.json(req.user)
      } catch (err) {
        next(err)
      }
    }

module.exports = { register, login, getMe }