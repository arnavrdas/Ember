// scripts/clear_messages.js
// ─────────────────────────────────────────────────────────
// Clears all messages from the database.
//
// Usage:
//   node scripts/clear_messages.js           ← dry run (shows count, deletes nothing)
//   node scripts/clear_messages.js --confirm ← actually deletes
// ─────────────────────────────────────────────────────────

const mongoose = require('mongoose')
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })

const Message = require('../src/api/models/message.model')

const DRY_RUN = !process.argv.includes('--confirm')

async function clearMessages() {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log(`✅ Connected to MongoDB: ${mongoose.connection.host}`)

    const count = await Message.countDocuments()
    console.log(`📨 Messages found: ${count}`)

    if (count === 0) {
      console.log('ℹ️  Nothing to delete.')
      return
    }

    if (DRY_RUN) {
      console.log(`\n⚠️  DRY RUN — no data was deleted.`)
      console.log(`   To actually delete, run:`)
      console.log(`   node scripts/clear_messages.js --confirm\n`)
      return
    }

    const result = await Message.deleteMany({})
    console.log(`🗑️  Deleted ${result.deletedCount} message(s).`)
    console.log('✅ Done.')

  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

clearMessages()
