// check_user_received_actions.js
// Script to check who has liked/passed each user (incoming actions)

print("\n=== CHECKING WHO LIKED/PASSED EACH USER ===\n");

// Get all users
const users = db.users.find({}).toArray();

users.forEach(targetUser => {
  print(`\n📌 USER: ${targetUser.name} (${targetUser.email}) [ID: ${targetUser._id}]`);
  print(`─`.repeat(60));
  
  // Find users who liked this user
  const likedBy = db.users.find({ likes: targetUser._id }).toArray();
  
  if (likedBy.length > 0) {
    print(`\n❤️  LIKED BY (${likedBy.length} users):`);
    likedBy.forEach((user, index) => {
      print(`   ${index + 1}. ${user.name} (${user.email}) - ID: ${user._id}`);
    });
  } else {
    print(`\n❤️  No one has liked this user yet`);
  }
  
  // Find users who passed on this user
  const passedBy = db.users.find({ passes: targetUser._id }).toArray();
  
  if (passedBy.length > 0) {
    print(`\n👎 PASSED BY (${passedBy.length} users):`);
    passedBy.forEach((user, index) => {
      print(`   ${index + 1}. ${user.name} (${user.email}) - ID: ${user._id}`);
    });
  } else {
    print(`\n👎 No one has passed on this user yet`);
  }
  
  // Check if this user is in any matches
  const matchedWith = db.users.find({ matches: targetUser._id }).toArray();
  
  if (matchedWith.length > 0) {
    print(`\n💕 MATCHED WITH (${matchedWith.length} users):`);
    matchedWith.forEach((user, index) => {
      print(`   ${index + 1}. ${user.name} (${user.email}) - ID: ${user._id}`);
    });
  }
  
  print(`\n${'='.repeat(60)}`);
});

// Summary statistics
print("\n📊 SUMMARY STATISTICS:");
print(`─`.repeat(40));

let totalLikesReceived = 0;
let totalPassesReceived = 0;

users.forEach(user => {
  totalLikesReceived += db.users.countDocuments({ likes: user._id });
  totalPassesReceived += db.users.countDocuments({ passes: user._id });
});

print(`Total Users: ${users.length}`);
print(`Total Likes Received: ${totalLikesReceived}`);
print(`Total Passes Received: ${totalPassesReceived}`);
print(`Average Likes per User: ${(totalLikesReceived / users.length).toFixed(2)}`);
print(`Average Passes per User: ${(totalPassesReceived / users.length).toFixed(2)}`);