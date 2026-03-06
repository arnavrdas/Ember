// Importing

  // Libraries
  const express = require('express')
  const cors    = require('cors')

  // Middlewares
  const { errorHandler } = require('./api/middlewares/errorHandler.middleware')

  // Routes
  const authRoutes      = require('./api/routes/auth.router')
  const profileRoutes   = require('./api/routes/profile.router')
  const userSwipeRoutes = require('./api/routes/userSwipe.router')
  const messageRoutes   = require('./api/routes/message.router')
  const matchRoutes     = require('./api/routes/match.routes')
  const swipeRoutes     = require('./api/routes/swipe.router')
  
// Initializing Express App
const app = express()

// Defing Middlewares & Routes

  // Middlewares
  app.use(cors({ 
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    credentials: true
  }))
  app.use(express.json())

  // Routing
  app.use('/api/auth',     authRoutes)
  app.use('/api/profiles', profileRoutes)
  app.use('/api/users',    userSwipeRoutes)
  app.use('/api/messages', messageRoutes)
  app.use('/api/matches',  matchRoutes)
  app.use('/api',          swipeRoutes)

  // Health Check Route
  app.get('/api/health',   (req, res) => {
    res.json({ status: 'OK', message: '🔥 Ember API is running' })
  })

  // Handling 404 requests
  app.use((req, res) => {
    res.status(404).json({ message: `Route ${req.originalUrl} not found` })
  })

  // Global error handler
  app.use(errorHandler)

// Exporting
module.exports = app