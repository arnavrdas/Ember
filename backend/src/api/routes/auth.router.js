// Initializing Express Router
const express = require('express')
const router  = express.Router()

// Importing

  // Middlewares
  const { protect } = require('../middlewares/auth.middleware')

  // Controllers
  const { register, login, getMe } = require('../controllers/auth.controller')

// Routing
router.post   ('/register', register)
router.post   ('/login',    login)
router.get    ('/me',       protect, getMe)

module.exports = router