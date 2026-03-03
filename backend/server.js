// Importing

  // Libraries
  require('dotenv').config()
  const http = require('http')

  // Configs
  const connectToMongDB = require('./config/mongodb.config')
  const express         = require('./config/express.config')

// Connecting to database
connectToMongDB()

// Intializing Express App
const server = http.createServer(express)

// Starting server
const PORT = process.env.PORT || 5000
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`)
})