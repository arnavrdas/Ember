// Initializing Express Router
const express = require('express')
const router  = express.Router()

// Importing

  // Middlewares
  const { protect } = require('../middlewares/auth.middleware')

  // Controllers
  const { getProfiles, updateProfile } = require('../controllers/profile.controller')

// Middlewares
router.use(protect)

// Routing
router.put    ('/me', updateProfile)
router.get    ('/',   getProfiles)

module.exports = router