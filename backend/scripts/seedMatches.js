/**
 * seedMatches.js
 * Seeds realistic matches and chat messages for a specific target user.
 *
 * Usage:
 *   npm run seed:matches
 *   npm run seed:matches -- --email user@example.com
 *   npm run seed:matches -- --clear   (removes existing seeded matches first)
 *
 * If --email is not provided, the script will prompt you in the console.
 */
 
const mongoose = require('mongoose')
const readline = require('readline')
const dotenv   = require('dotenv')
 
const User    = require('../src/api/models/user.model')
const Match   = require('../src/api/models/match.model')
const Message = require('../src/api/models/message.model')
 
dotenv.config()
 
// ─── Sample conversation pairs ────────────────────────────────────────────────
// Each entry is a back-and-forth chat thread between the target user and one match.
// The placeholder TARGET / MATCH will be swapped for real names at runtime.
const CONVERSATION_TEMPLATES = [
  [
    { from: 'TARGET', text: 'Hey! I saw you like hiking too 🌲 any favourite trails?' },
    { from: 'MATCH',  text: "Yes! I love the Rattlesnake Ridge trail. It's hard but the view is unreal 😍" },
    { from: 'TARGET', text: 'Oh nice, I haven\'t done that one yet. I usually go to Tiger Mountain.' },
    { from: 'MATCH',  text: 'That one\'s great! Maybe we could do one together sometime?' },
    { from: 'TARGET', text: 'I\'d be down for that 😄 weekends work best for me' },
    { from: 'MATCH',  text: 'Same! I\'ll DM you when the weather looks good 🌤️' },
  ],
  [
    { from: 'MATCH',  text: 'Your bio says you\'re into photography — film or digital?' },
    { from: 'TARGET', text: 'Both honestly, but I love film for the vibe. You?' },
    { from: 'MATCH',  text: 'Never tried film but always wanted to. Could you teach me? 😅' },
    { from: 'TARGET', text: 'Ha, absolutely! It\'s surprisingly fun. You just have to be patient.' },
    { from: 'MATCH',  text: 'Patience is not my strong suit lol but I\'m willing to try' },
    { from: 'TARGET', text: 'Fair warning: you will accidentally expose a whole roll at least once 😂' },
    { from: 'MATCH',  text: 'Oh no 😂 ok I\'m already scared. When do we start?' },
  ],
  [
    { from: 'TARGET', text: 'Hi! Your taste in music is exactly what I needed to see today' },
    { from: 'MATCH',  text: 'Haha thank you! Who are you listening to lately?' },
    { from: 'TARGET', text: 'Been on a massive Khruangbin kick for like two weeks straight' },
    { from: 'MATCH',  text: 'Oh wow great taste. Saw them live last year — absolutely incredible' },
    { from: 'TARGET', text: 'I\'m so jealous! I missed that tour. Did you go alone or with friends?' },
    { from: 'MATCH',  text: 'With friends, but honestly I\'d have been happy going alone. The music takes over' },
  ],
  [
    { from: 'MATCH',  text: 'Quick question: tea or coffee?' },
    { from: 'TARGET', text: 'Coffee in the morning, tea in the evening. I refuse to choose 😄' },
    { from: 'MATCH',  text: 'Correct answer. I was testing you.' },
    { from: 'TARGET', text: 'Ha! Did I pass?' },
    { from: 'MATCH',  text: 'With flying colours. Do you have a go-to coffee spot?' },
    { from: 'TARGET', text: 'Yeah, there\'s this tiny place near me that does a ridiculous oat flat white' },
    { from: 'MATCH',  text: 'Name and address, please. For science.' },
  ],
  [
    { from: 'TARGET', text: 'I saw you\'re a chef — what\'s the most underrated ingredient in your opinion?' },
    { from: 'MATCH',  text: 'Ooh good question. Honestly? Fish sauce. People are scared of it but it adds depth to everything' },
    { from: 'TARGET', text: 'I would not have guessed that. I barely know how to cook tbh 😅' },
    { from: 'MATCH',  text: 'I love teaching people! It\'s easier than you think.' },
    { from: 'TARGET', text: 'Are you offering to cook for me?' },
    { from: 'MATCH',  text: 'Only if you\'re brave enough to try fish sauce 😏' },
    { from: 'TARGET', text: 'Challenge accepted.' },
  ],
]
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
 
function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans.trim()) }))
}
 
/** Space out createdAt timestamps so messages appear in the right order. */
function timestampsFor(count, baseDate, spreadMinutes = 3) {
  return Array.from({ length: count }, (_, i) =>
    new Date(baseDate.getTime() + i * spreadMinutes * 60 * 1000)
  )
}
 
// ─── Core seeding logic ───────────────────────────────────────────────────────
 
async function seedMatchesForUser(targetUser, otherUsers, clearExisting) {
  const results = { matches: 0, messages: 0, skipped: 0 }
 
  // Shuffle candidates so we get variety each run
  const candidates = [...otherUsers].sort(() => Math.random() - 0.5)
 
  // Pick how many matches to create (up to the number of conversation templates)
  const matchCount = Math.min(candidates.length, CONVERSATION_TEMPLATES.length)
 
  for (let i = 0; i < matchCount; i++) {
    const otherUser = candidates[i]
    const template  = CONVERSATION_TEMPLATES[i]
 
    // ── 1. Check / clear existing match ──────────────────────────────────────
    const existingMatch = await Match.findOne({
      $or: [
        { user1: targetUser._id, user2: otherUser._id },
        { user1: otherUser._id, user2: targetUser._id },
      ],
    })
 
    if (existingMatch) {
      if (clearExisting) {
        // Remove associated messages too
        await Message.deleteMany({
          $or: [
            { from: targetUser._id, to: otherUser._id },
            { from: otherUser._id, to: targetUser._id },
          ],
        })
        await Match.deleteOne({ _id: existingMatch._id })
        console.log(`🗑️  Cleared existing match: ${targetUser.name} ↔ ${otherUser.name}`)
      } else {
        console.log(`⚠️  Match already exists: ${targetUser.name} ↔ ${otherUser.name} (skip — use --clear to overwrite)`)
        results.skipped++
        continue
      }
    }
 
    // ── 2. Create Match document ──────────────────────────────────────────────
    const matchDate = new Date(Date.now() - (matchCount - i) * 24 * 60 * 60 * 1000) // spread over last N days
 
    const match = new Match({
      user1:      targetUser._id,
      user2:      otherUser._id,
      user1Liked: true,
      user2Liked: true,
      isMutual:   true,
      status:     'matched',
      matchedAt:  matchDate,
      isActive:   true,
    })
 
    // ── 3. Build embedded messages (inside Match.messages) ───────────────────
    const times = timestampsFor(template.length, matchDate)
    const embeddedMessages = template.map((msg, idx) => {
      const sender = msg.from === 'TARGET' ? targetUser._id : otherUser._id
      return {
        sender,
        content:   msg.text,
        type:      'text',
        readBy:    [sender], // sender always "read" their own message
        createdAt: times[idx],
      }
    })
 
    match.messages     = embeddedMessages
    match.lastMessageAt = times[times.length - 1]
    await match.save()
 
    // ── 4. Also create standalone Message documents ───────────────────────────
    // (the message.router/socket system uses the Message collection separately)
    const standaloneDocs = template.map((msg, idx) => ({
      from:      msg.from === 'TARGET' ? targetUser._id : otherUser._id,
      to:        msg.from === 'TARGET' ? otherUser._id  : targetUser._id,
      text:      msg.text,
      read:      true,
      createdAt: times[idx],
      updatedAt: times[idx],
    }))
    await Message.insertMany(standaloneDocs)
 
    // ── 5. Update User.matches arrays ─────────────────────────────────────────
    await User.updateOne(
      { _id: targetUser._id },
      { $addToSet: { matches: otherUser._id, likes: otherUser._id } }
    )
    await User.updateOne(
      { _id: otherUser._id },
      { $addToSet: { matches: targetUser._id, likes: targetUser._id } }
    )
 
    results.matches++
    results.messages += template.length
    console.log(`✅ Match seeded: ${targetUser.name} ↔ ${otherUser.name}  (${template.length} messages)`)
  }
 
  return results
}
 
// ─── Main ─────────────────────────────────────────────────────────────────────
 
async function main() {
  const args        = process.argv.slice(2)
  const clearFlag   = args.includes('--clear')
  const emailArgIdx = args.indexOf('--email')
  let   targetEmail = emailArgIdx !== -1 ? args[emailArgIdx + 1] : null
 
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ember')
  console.log('📦 Connected to MongoDB\n')
 
  // ── Resolve target user ───────────────────────────────────────────────────
  if (!targetEmail) {
    // List available users so the operator can choose easily
    const allUsers = await User.find({}, 'name email').lean()
    if (allUsers.length === 0) {
      console.error('❌ No users found in the database. Run `npm run seed` first.')
      process.exit(1)
    }
 
    console.log('👥 Users in the database:')
    allUsers.forEach((u, i) => console.log(`  ${i + 1}. ${u.name} — ${u.email}`))
    console.log()
 
    // Uncomment the line below (and comment out the prompt) to hardcode a target:
    // targetEmail = 'alex@example.com' // 🔧 HARDCODED TARGET — change as needed
 
    targetEmail = await ask('Enter the email of the user to seed matches for: ')
  }
 
  const targetUser = await User.findOne({ email: targetEmail.toLowerCase() })
  if (!targetUser) {
    console.error(`❌ No user found with email "${targetEmail}"`)
    process.exit(1)
  }
  console.log(`\n🎯 Target user: ${targetUser.name} (${targetUser.email})\n`)
 
  // ── Get all other users as match candidates ───────────────────────────────
  const otherUsers = await User.find({ _id: { $ne: targetUser._id } })
  if (otherUsers.length === 0) {
    console.error('❌ No other users found to match with. Run `npm run seed` first.')
    process.exit(1)
  }
 
  // ── Seed ──────────────────────────────────────────────────────────────────
  const { matches, messages, skipped } = await seedMatchesForUser(targetUser, otherUsers, clearFlag)
 
  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(50))
  console.log('📊 SEEDING SUMMARY')
  console.log('='.repeat(50))
  console.log(`Target user : ${targetUser.name} (${targetUser.email})`)
  console.log(`Matches created  : ${matches}`)
  console.log(`Messages seeded  : ${messages}`)
  console.log(`Skipped (exist)  : ${skipped}`)
  if (skipped > 0) console.log('  ↳ run with --clear to overwrite existing matches')
  console.log('='.repeat(50))
}
 
main()
  .catch(err => { console.error('❌ Fatal error:', err); process.exit(1) })
  .finally(async () => {
    await mongoose.connection.close()
    console.log('\n🔌 Database connection closed')
  })
 