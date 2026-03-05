// Initializing Express Router
const express = require('express')
const router  = express.Router()

// Importing

  // Middlewares
  const { protect } = require('../middlewares/auth.middleware')

  // Controllers
  const { sendMessage, getConversation } = require('../controllers/message.controller')

// Middlewares
router.use(protect)

// Routing
router.get    ('/:userId', getConversation)
router.post   ('/',        sendMessage)

module.exports = router