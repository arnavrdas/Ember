const mongoose = require('mongoose')
const dotenv = require('dotenv')
const User = require('../models/user.model')

dotenv.config()

// Sample users with all required fields
const sampleUsers = [
  {
    name: 'Alex Johnson',
    email: 'alex@example.com',
    password: '123456',
    age: 25,
    bio: 'Software developer who loves hiking and photography. Looking for someone to explore the outdoors with!',
    avatar: '🌲',
    tags: ['hiking', 'photography', 'coding', 'coffee']
  },
  {
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    password: '123456',
    age: 24,
    bio: 'Foodie and yoga enthusiast. I believe in living life one meal at a time!',
    avatar: '🧘',
    tags: ['yoga', 'cooking', 'travel', 'reading']
  },
  {
    name: 'Michael Rodriguez',
    email: 'michael@example.com',
    password: '123456',
    age: 28,
    bio: 'Musician and dog lover. Always down for concerts or just chilling with my guitar.',
    avatar: '🎸',
    tags: ['music', 'dogs', 'concerts', 'guitar']
  },
  {
    name: 'Emma Watson',
    email: 'emma@example.com',
    password: '123456',
    age: 26,
    bio: 'Artist and plant mom. Looking for someone to visit art galleries and coffee shops with.',
    avatar: '🎨',
    tags: ['art', 'plants', 'coffee', 'museums']
  },
  {
    name: 'James Wilson',
    email: 'james@example.com',
    password: '123456',
    age: 30,
    bio: 'Fitness trainer who loves cooking healthy meals. Let\'s work out together!',
    avatar: '💪',
    tags: ['fitness', 'healthy eating', 'gym', 'meal prep']
  },
  {
    name: 'Lisa Park',
    email: 'lisa@example.com',
    password: '123456',
    age: 27,
    bio: 'Bookworm and aspiring writer. Looking for my next story... and maybe my next love?',
    avatar: '📚',
    tags: ['reading', 'writing', 'poetry', 'coffee']
  },
  {
    name: 'David Kim',
    email: 'david@example.com',
    password: '123456',
    age: 29,
    bio: 'Tech entrepreneur who loves extreme sports. Work hard, play harder!',
    avatar: '🏂',
    tags: ['skiing', 'startups', 'travel', 'adventure']
  },
  {
    name: 'Maria Garcia',
    email: 'maria@example.com',
    password: '123456',
    age: 23,
    bio: 'Dance teacher who brings rhythm everywhere. Let\'s dance the night away!',
    avatar: '💃',
    tags: ['dancing', 'salsa', 'fitness', 'music']
  },
  {
    name: 'Tom Harris',
    email: 'tom@example.com',
    password: '123456',
    age: 31,
    bio: 'Chef by day, food blogger by night. Looking for someone to be my taste tester!',
    avatar: '👨‍🍳',
    tags: ['cooking', 'food', 'wine', 'restaurants']
  },
  {
    name: 'Nina Patel',
    email: 'nina@example.com',
    password: '123456',
    age: 26,
    bio: 'Yoga instructor and mindfulness coach. Let\'s find our zen together.',
    avatar: '🧘‍♀️',
    tags: ['yoga', 'meditation', 'wellness', 'tea']
  },
  {
    name: 'Chris Evans',
    email: 'chris@example.com',
    password: '123456',
    age: 32,
    bio: 'Marine biologist who loves the ocean. Scuba diving is my happy place!',
    avatar: '🐠',
    tags: ['scuba diving', 'ocean', 'marine life', 'photography']
  },
  {
    name: 'Olivia Brown',
    email: 'olivia@example.com',
    password: '123456',
    age: 24,
    bio: 'Veterinary student with a soft spot for all animals. Looking for someone kind-hearted.',
    avatar: '🐱',
    tags: ['animals', 'vet med', 'nature', 'hiking']
  },
  {
    name: 'Ryan Cooper',
    email: 'ryan@example.com',
    password: '123456',
    age: 28,
    bio: 'Photographer capturing moments and hearts. Let me take your picture!',
    avatar: '📸',
    tags: ['photography', 'travel', 'art', 'coffee'],
    likes: [], // Will be populated after creation
    passes: [],
    matches: []
  },
  {
    name: 'Amy Chen',
    email: 'amy@example.com',
    password: '123456',
    age: 27,
    bio: 'Graphic designer with a passion for typography and lattes.',
    avatar: '✏️',
    tags: ['design', 'typography', 'coffee', 'art'],
    likes: [],
    passes: [],
    matches: []
  }
]

// Seed function
const seedUsers = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ember')
    console.log('📦 Connected to MongoDB')

    // Clear existing users if specified
    if (process.env.CLEAR_DB === 'true') {
      await User.deleteMany({})
      console.log('🗑️  Cleared existing users')
    }

    console.log(`👤 Attempting to seed ${sampleUsers.length} users...`)

    // Create users one by one to handle duplicates
    const createdUsers = []
    for (const userData of sampleUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ email: userData.email })
        
        if (existingUser) {
          console.log(`⚠️  User ${userData.email} already exists, skipping...`)
          continue
        }

        // Create new user
        const user = new User(userData)
        await user.save()
        createdUsers.push(user)
        console.log(`✅ Created: ${user.name} (${user.email}) - Age: ${user.age}`)

      }
      catch (error) {
        console.error(`❌ Error creating user ${userData.email}:`, error.message)
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50))
    console.log(`📊 SEEDING SUMMARY:`)
    console.log('='.repeat(50))
    console.log(`Total users attempted: ${sampleUsers.length}`)
    console.log(`Successfully created: ${createdUsers.length}`)
    console.log(`Skipped (already existed): ${sampleUsers.length - createdUsers.length}`)
    
    if (createdUsers.length > 0) {
      console.log('\n👥 Created Users:')
      createdUsers.forEach(user => {
        console.log(`  - ${user.name} (${user.email})`)
        console.log(`    Age: ${user.age} | Avatar: ${user.avatar}`)
        console.log(`    Bio: ${user.bio.substring(0, 50)}${user.bio.length > 50 ? '...' : ''}`)
        console.log(`    Tags: [${user.tags.join(', ')}]`)
        console.log('    ---')
      })
    }

    // Age distribution stats
    const ages = createdUsers.map(u => u.age)
    if (ages.length > 0) {
      const avgAge = ages.reduce((a, b) => a + b, 0) / ages.length
      console.log('\n📈 Age Statistics:')
      console.log(`  - Range: ${Math.min(...ages)} - ${Math.max(...ages)}`)
      console.log(`  - Average: ${avgAge.toFixed(1)}`)
      console.log(`  - Total: ${createdUsers.length} users`)
    }

  }
  catch (error) {
    console.error('❌ Fatal error:', error)
  }
  finally {
    await mongoose.connection.close()
    console.log('\n🔌 Database connection closed')
  }
}

// Run the seed function
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2)
  if (args.includes('--clear')) {
    process.env.CLEAR_DB = 'true'
  }

  seedUsers()
}

module.exports = { seedUsers, sampleUsers }