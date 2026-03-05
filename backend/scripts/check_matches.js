// check_matches.js
// Script to check all matches (where two users liked each other)

print("\n=== CHECKING ALL MATCHES (MUTUAL LIKES) ===\n");

// Get all users
const users = db.users.find({}).toArray();
const matches = [];
const processedPairs = new Set();

users.forEach(user1 => {
  if (!user1.likes || user1.likes.length === 0) return;
  
  user1.likes.forEach(user2Id => {
    // Create a unique key for this pair (sorted to avoid duplicates)
    const pairKey = [user1._id.toString(), user2Id.toString()].sort().join('_');
    
    // Skip if already processed
    if (processedPairs.has(pairKey)) return;
    processedPairs.add(pairKey);
    
    // Check if user2 also likes user1
    const user2 = db.users.findOne({ _id: user2Id });
    if (user2 && user2.likes && user2.likes.includes(user1._id)) {
      matches.push({
        user1: {
          id: user1._id,
          name: user1.name,
          email: user1.email
        },
        user2: {
          id: user2._id,
          name: user2.name,
          email: user2.email
        }
      });
    }
  });
});

if (matches.length === 0) {
  print("❌ No matches found yet!");
} else {
  print(`✅ Found ${matches.length} match(es)!\n`);
  
  matches.forEach((match, index) => {
    print(`\n💕 MATCH #${index + 1}:`);
    print(`─`.repeat(40));
    print(`User 1: ${match.user1.name} (${match.user1.email})`);
    print(`User 2: ${match.user2.name} (${match.user2.email})`);
    
    // Check if they're in each other's matches array
    const user1 = db.users.findOne({ _id: match.user1.id });
    const user2 = db.users.findOne({ _id: match.user2.id });
    
    const user1HasMatch = user1.matches && user1.matches.includes(match.user2.id);
    const user2HasMatch = user2.matches && user2.matches.includes(match.user1.id);
    
    print(`\nMatch Status:`);
    print(`  • ${match.user1.name} has match in array: ${user1HasMatch ? '✅' : '❌'}`);
    print(`  • ${match.user2.name} has match in array: ${user2HasMatch ? '✅' : '❌'}`);
    
    if (!user1HasMatch || !user2HasMatch) {
      print(`\n  ⚠️  Warning: Mutual likes exist but matches array not updated!`);
    }
  });
}

// Additional check: Verify matches array consistency
print("\n\n🔍 VERIFYING MATCHES ARRAY CONSISTENCY:");
print(`─`.repeat(40));

let inconsistencies = 0;
users.forEach(user => {
  if (!user.matches || user.matches.length === 0) return;
  
  user.matches.forEach(matchId => {
    const matchUser = db.users.findOne({ _id: matchId });
    if (!matchUser) {
      print(`❌ User ${user.name} has match with non-existent user: ${matchId}`);
      inconsistencies++;
    } else if (!matchUser.likes || !matchUser.likes.includes(user._id)) {
      print(`⚠️  User ${user.name} has match with ${matchUser.name} but mutual like doesn't exist!`);
      inconsistencies++;
    }
  });
});

if (inconsistencies === 0) {
  print("✅ All matches arrays are consistent!");
}

// Match statistics
print("\n📊 MATCH STATISTICS:");
print(`─`.repeat(30));
print(`Total Matches: ${matches.length}`);
print(`Total Users: ${users.length}`);
print(`Users with matches: ${users.filter(u => u.matches && u.matches.length > 0).length}`);
print(`Average matches per user: ${(users.reduce((sum, u) => sum + (u.matches?.length || 0), 0) / users.length).toFixed(2)}`);