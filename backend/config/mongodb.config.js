// Importing Libraries
const mongoose = require('mongoose') // ODM for MongoDB

// Config
const connectToMongDB = async function () {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)
  }
  catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`)
    process.exit(1)
  }
}

// Exporting
module.exports = connectToMongDB