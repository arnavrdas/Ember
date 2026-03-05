// check_user_actions.js
// Script to check who each user liked and passed on

print("\n=== CHECKING WHO EACH USER LIKED/PASSED ===\n");

// Get all users
const users = db.users.find({}).toArray();

users.forEach(user => {
  print(`\n📌 USER: ${user.name} (${user.email}) [ID: ${user._id}]`);
  print(`─`.repeat(50));
  
  // Check likes
  if (user.likes && user.likes.length > 0) {
    print(`\n❤️  LIKED (${user.likes.length} users):`);
    user.likes.forEach((likedUserId, index) => {
      const likedUser = db.users.findOne({ _id: likedUserId });
      if (likedUser) {
        print(`   ${index + 1}. ${likedUser.name} (${likedUser.email}) - ID: ${likedUserId}`);
      } else {
        print(`   ${index + 1}. [User not found] - ID: ${likedUserId}`);
      }
    });
  } else {
    print(`\n❤️  No likes yet`);
  }
  
  // Check passes
  if (user.passes && user.passes.length > 0) {
    print(`\n👎 PASSED (${user.passes.length} users):`);
    user.passes.forEach((passedUserId, index) => {
      const passedUser = db.users.findOne({ _id: passedUserId });
      if (passedUser) {
        print(`   ${index + 1}. ${passedUser.name} (${passedUser.email}) - ID: ${passedUserId}`);
      } else {
        print(`   ${index + 1}. [User not found] - ID: ${passedUserId}`);
      }
    });
  } else {
    print(`\n👎 No passes yet`);
  }
  
  // Check matches
  if (user.matches && user.matches.length > 0) {
    print(`\n💕 MATCHES (${user.matches.length} users):`);
    user.matches.forEach((matchId, index) => {
      const matchUser = db.users.findOne({ _id: matchId });
      if (matchUser) {
        print(`   ${index + 1}. ${matchUser.name} (${matchUser.email}) - ID: ${matchId}`);
      } else {
        print(`   ${index + 1}. [User not found] - ID: ${matchId}`);
      }
    });
  }
  
  print(`\n${'='.repeat(60)}`);
});

// Summary statistics
print("\n📊 SUMMARY STATISTICS:");
print(`─`.repeat(30));
const totalLikes = users.reduce((sum, user) => sum + (user.likes?.length || 0), 0);
const totalPasses = users.reduce((sum, user) => sum + (user.passes?.length || 0), 0);
const totalMatches = users.reduce((sum, user) => sum + (user.matches?.length || 0), 0);

print(`Total Users: ${users.length}`);
print(`Total Likes: ${totalLikes}`);
print(`Total Passes: ${totalPasses}`);
print(`Total Matches: ${totalMatches}`);
print(`Average Likes per User: ${(totalLikes / users.length).toFixed(2)}`);
print(`Average Passes per User: ${(totalPasses / users.length).toFixed(2)}`);