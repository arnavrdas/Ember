// Initializing Express Router
const express = require('express')
const router  = express.Router()

// Importing

  // Middlewares
  const { protect } = require('../middlewares/auth.middleware')

  // Controllers
  const {
    likeUser,
    passUser,
    getPotentialMatches
  } = require('../controllers/swipe.controller')

// Middlewares
router.use(protect)

// Routing
router.post   ('/:targetId/like',    likeUser)
router.post   ('/:targetId/pass',    passUser)
router.get    ('/potential-matches', getPotentialMatches)

module.exports = router