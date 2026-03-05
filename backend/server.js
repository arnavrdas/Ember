// Importing

  // Libraries
  const dotenv = require('dotenv').config()
  const http   = require('http')

  // Configs
  const connectToMongDB = require('./src/config/mongodb.config')
  const express         = require('./src/app')

// Connecting to database
connectToMongDB(dotenv)

// Intializing Express App
const server = http.createServer(express)

// Starting server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`)
})