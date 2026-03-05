// Initializing Express Router
const express = require('express')
const router  = express.Router()

// Importing

  // Middlewares
  const { protect } = require('../middlewares/auth.middleware')

  // Controllers
  const { swipe, getMatches } = require('../controllers/swipe.controller')

// Middlewares
router.use(protect)

// Routing
router.get    ('/matches', getMatches)
router.post   ('/',        swipe)

module.exports = router