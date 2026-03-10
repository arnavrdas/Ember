// Importing

  // Libraries
  const dotenv = require('dotenv').config()
  const http   = require('http')

  // Configs
  const connectToMongDB = require('./src/config/mongodb.config')
  const express         = require('./src/app')

  // Socket
  const { initSocket } = require('./src/socket/socket')

// Connecting to database
connectToMongDB(dotenv)

// Intializing Express App
const server = http.createServer(express)

// Initialize Socket.io (attaches to the same HTTP server)
const io = initSocket(server)

// Make io accessible in Express routes via req.app.get('io')
express.set('io', io)

// Starting server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`)
  console.log(`🔌 Socket.io real-time chat enabled`)
})