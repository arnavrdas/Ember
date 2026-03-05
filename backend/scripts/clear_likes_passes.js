// clear_likes_passes.js
// Script to clear all likes, passes, and matches from all users

print("\n=== CLEAR ALL LIKES, PASSES, AND MATCHES ===\n");

// Show current statistics before clearing
const beforeStats = {
  users: db.users.countDocuments({}),
  totalLikes: db.users.aggregate([{ $group: { _id: null, total: { $sum: { $size: "$likes" } } } }]).toArray()[0]?.total || 0,
  totalPasses: db.users.aggregate([{ $group: { _id: null, total: { $sum: { $size: "$passes" } } } }]).toArray()[0]?.total || 0,
  totalMatches: db.users.aggregate([{ $group: { _id: null, total: { $sum: { $size: "$matches" } } } }]).toArray()[0]?.total || 0
};

print("📊 CURRENT STATISTICS:");
print(`─`.repeat(30));
print(`Total Users: ${beforeStats.users}`);
print(`Total Likes: ${beforeStats.totalLikes}`);
print(`Total Passes: ${beforeStats.totalPasses}`);
print(`Total Matches: ${beforeStats.totalMatches}`);

// For MongoDB shell, we can't use prompt/confirm
// So we'll just ask for a manual check
print("\n⚠️  WARNING: This will delete ALL likes, passes, and matches from ALL users!");
print("Press Ctrl+C within 5 seconds to cancel, or wait to continue...");

// Simple countdown (no actual delay in shell, just a message)
sleep(5000); // Wait 5 seconds

// Perform the clearing
print("\n\n🔄 Clearing all likes, passes, and matches...");

const result = db.users.updateMany(
  {},
  { 
    $set: { 
      likes: [], 
      passes: [], 
      matches: [] 
    } 
  }
);

print(`\n✅ Update completed!`);
print(`Matched: ${result.matchedCount} users`);
print(`Modified: ${result.modifiedCount} users`);

// Show statistics after clearing
const afterStats = {
  totalLikes: db.users.aggregate([{ $group: { _id: null, total: { $sum: { $size: "$likes" } } } }]).toArray()[0]?.total || 0,
  totalPasses: db.users.aggregate([{ $group: { _id: null, total: { $sum: { $size: "$passes" } } } }]).toArray()[0]?.total || 0,
  totalMatches: db.users.aggregate([{ $group: { _id: null, total: { $sum: { $size: "$matches" } } } }]).toArray()[0]?.total || 0
};

print("\n📊 UPDATED STATISTICS:");
print(`─`.repeat(30));
print(`Total Likes: ${afterStats.totalLikes}`);
print(`Total Passes: ${afterStats.totalPasses}`);
print(`Total Matches: ${afterStats.totalMatches}`);

if (afterStats.totalLikes === 0 && afterStats.totalPasses === 0 && afterStats.totalMatches === 0) {
  print("\n✅ All likes, passes, and matches have been successfully cleared!");
} else {
  print("\n⚠️  Warning: Some data may not have been cleared completely.");
  
  // Show users with any remaining data
  const remainingData = db.users.find({
    $or: [
      { likes: { $ne: [] } },
      { passes: { $ne: [] } },
      { matches: { $ne: [] } }
    ]
  }, { 
    name: 1, 
    email: 1, 
    likesCount: { $size: "$likes" }, 
    passesCount: { $size: "$passes" }, 
    matchesCount: { $size: "$matches" } 
  }).toArray();

  if (remainingData.length > 0) {
    print("\n⚠️  Users with remaining data:");
    remainingData.forEach(user => {
      print(`  • ${user.name} (${user.email}): ${user.likesCount} likes, ${user.passesCount} passes, ${user.matchesCount} matches`);
    });
  }
}