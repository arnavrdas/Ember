const Match = require('../models/match.model');
const User = require('../models/user.model'); // Using your naming convention
const { validationResult } = require('express-validator');

/**
 * Get all matches for the authenticated user
 * @route GET /api/matches
 * @access Private
 */
exports.getMatches = async (req, res) => {
  try {
    const userId = req.user.id; // or req.user._id depending on your user object

    // Find all matches where the user is either user1 or user2
    const matches = await Match.find({
      $or: [
        { user1: userId, status: 'matched' },
        { user2: userId, status: 'matched' }
      ]
    })
    .populate('user1', 'name email profilePicture lastActive')
    .populate('user2', 'name email profilePicture lastActive')
    .sort({ matchedAt: -1 });

    // Format the response to show the matched user info
    const formattedMatches = matches.map(match => {
      const isUser1 = match.user1._id.toString() === userId.toString();
      const matchedUser = isUser1 ? match.user2 : match.user1;
      
      return {
        matchId: match._id,
        matchedUser: {
          id: matchedUser._id,
          name: matchedUser.name,
          email: matchedUser.email,
          profilePicture: matchedUser.profilePicture,
          lastActive: matchedUser.lastActive
        },
        matchedAt: match.matchedAt,
        lastMessageAt: match.lastMessageAt,
        isActive: match.isActive
      };
    });

    res.json({
      success: true,
      count: formattedMatches.length,
      matches: formattedMatches
    });
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching matches',
      error: error.message
    });
  }
};

/**
 * Get a specific match by ID
 * @route GET /api/matches/:matchId
 * @access Private
 */
exports.getMatchById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { matchId } = req.params;

    // Find the match and verify user is part of it
    const match = await Match.findOne({
      _id: matchId,
      $or: [
        { user1: userId },
        { user2: userId }
      ],
      status: 'matched'
    })
    .populate('user1', 'name email profilePicture lastActive bio interests')
    .populate('user2', 'name email profilePicture lastActive bio interests');

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found or you do not have permission to view it'
      });
    }

    // Determine which user is the matched user
    const isUser1 = match.user1._id.toString() === userId.toString();
    const matchedUser = isUser1 ? match.user2 : match.user1;
    const currentUser = isUser1 ? match.user1 : match.user2;

    res.json({
      success: true,
      match: {
        matchId: match._id,
        matchedUser: {
          id: matchedUser._id,
          name: matchedUser.name,
          email: matchedUser.email,
          profilePicture: matchedUser.profilePicture,
          lastActive: matchedUser.lastActive,
          bio: matchedUser.bio,
          interests: matchedUser.interests
        },
        currentUser: {
          id: currentUser._id,
          name: currentUser.name
        },
        matchedAt: match.matchedAt,
        lastMessageAt: match.lastMessageAt,
        messages: match.messages || [],
        isActive: match.isActive
      }
    });
  } catch (error) {
    console.error('Get match by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching match details',
      error: error.message
    });
  }
};

/**
 * Unmatch a user (delete/disable the match)
 * @route DELETE /api/matches/:matchId/unmatch
 * @access Private
 */
exports.unmatchUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { matchId } = req.params;
    const { reason } = req.body; // Optional reason for unmatching

    // Find the match and verify user is part of it
    const match = await Match.findOne({
      _id: matchId,
      $or: [
        { user1: userId },
        { user2: userId }
      ],
      status: 'matched'
    });

    if (!match) {
      return res.status(404).json({
        success: false,
        message: 'Match not found or you do not have permission to unmatch'
      });
    }

    // Option 1: Hard delete - Remove the match completely
    // await Match.findByIdAndDelete(matchId);

    // Option 2: Soft delete - Update status to 'unmatched' or 'blocked'
    match.status = 'unmatched';
    match.unmatchedBy = userId;
    match.unmatchedAt = new Date();
    match.unmatchedReason = reason || 'User initiated unmatch';
    match.isActive = false;
    
    await match.save();

    // Optionally, you might want to notify the other user about the unmatch
    // This could be done through websockets or push notifications

    res.json({
      success: true,
      message: 'Successfully unmatched the user',
      data: {
        matchId: match._id,
        status: match.status,
        unmatchedAt: match.unmatchedAt
      }
    });
  } catch (error) {
    console.error('Unmatch user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unmatching user',
      error: error.message
    });
  }
};

/**
 * Get mutual matches (users who liked each other)
 * @route GET /api/matches/mutual
 * @access Private
 */
exports.getMutualMatches = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all mutual matches (where both users liked each other)
    const matches = await Match.find({
      $or: [
        { user1: userId, status: 'matched' },
        { user2: userId, status: 'matched' }
      ],
      isMutual: true
    })
    .populate('user1', 'name email profilePicture')
    .populate('user2', 'name email profilePicture')
    .sort({ matchedAt: -1 });

    const formattedMatches = matches.map(match => {
      const isUser1 = match.user1._id.toString() === userId.toString();
      const matchedUser = isUser1 ? match.user2 : match.user1;
      
      return {
        matchId: match._id,
        matchedUser: {
          id: matchedUser._id,
          name: matchedUser.name,
          profilePicture: matchedUser.profilePicture
        },
        matchedAt: match.matchedAt
      };
    });

    res.json({
      success: true,
      count: formattedMatches.length,
      matches: formattedMatches
    });
  } catch (error) {
    console.error('Get mutual matches error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mutual matches',
      error: error.message
    });
  }
};