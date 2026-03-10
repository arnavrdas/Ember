// src/socket/socket.js
// ─────────────────────────────────────────────────────────
// Socket.io server — handles real-time messaging, typing
// indicators, read receipts, and online presence.
// ─────────────────────────────────────────────────────────

const { Server } = require('socket.io')
const jwt        = require('jsonwebtoken')
const User       = require('../api/models/user.model')
const Message    = require('../api/models/message.model')

// Map: userId (string) → Set of socket IDs
// One user may have multiple browser tabs open.
const onlineUsers = new Map()

// ── Helper: get all socket IDs for a user ───────────────
function getSocketIds(userId) {
  return onlineUsers.get(userId.toString()) || new Set()
}

// ── Helper: emit to every socket a user has open ────────
function emitToUser(io, userId, event, data) {
  getSocketIds(userId).forEach(socketId => {
    io.to(socketId).emit(event, data)
  })
}

// ── Auth middleware for Socket.io ────────────────────────
async function authenticateSocket(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '')

    if (!token) {
      return next(new Error('No token provided'))
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user    = await User.findById(decoded.id).select('-password')

    if (!user) {
      return next(new Error('User not found'))
    }

    socket.user = user
    next()
  } catch (err) {
    next(new Error('Invalid token'))
  }
}

// ── Main initialiser ─────────────────────────────────────
function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin:      process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      methods:     ['GET', 'POST'],
      credentials: true,
    },
  })

  // Apply auth middleware to every connection
  io.use(authenticateSocket)

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString()
    console.log(`🔌 Socket connected: ${socket.user.name} (${socket.id})`)

    // ── Track online presence ──────────────────────────
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set())
    }
    onlineUsers.get(userId).add(socket.id)

    // Let the user's matches know they came online
    socket.user.matches.forEach(matchId => {
      emitToUser(io, matchId, 'user:online', { userId })
    })

    // ── Send caller their current online matches ───────
    const onlineMatchIds = socket.user.matches
      .map(id => id.toString())
      .filter(id => onlineUsers.has(id) && onlineUsers.get(id).size > 0)
    socket.emit('online:list', onlineMatchIds)

    // ── Join a personal room so we can target this user ─
    socket.join(userId)

    // ────────────────────────────────────────────────────
    // EVENT: send a new message
    // payload: { toId, text }
    // ────────────────────────────────────────────────────
    socket.on('message:send', async ({ toId, text }) => {
      try {
        if (!toId || !text?.trim()) return

        // Verify these two users are matched
        const sender = await User.findById(userId)
        const isMatch = sender.matches.some(id => id.toString() === toId)
        if (!isMatch) {
          socket.emit('error', { message: 'You can only message your matches' })
          return
        }

        // Persist to DB
        const message = await Message.create({
          from: userId,
          to:   toId,
          text: text.trim(),
        })

        const payload = {
          _id:       message._id,
          from:      userId,
          to:        toId,
          text:      message.text,
          read:      false,
          createdAt: message.createdAt,
        }

        // Deliver to recipient (all their open tabs)
        emitToUser(io, toId, 'message:receive', payload)

        // Echo back to sender (all their other tabs)
        emitToUser(io, userId, 'message:sent', payload)

      } catch (err) {
        console.error('message:send error', err.message)
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // ────────────────────────────────────────────────────
    // EVENT: mark messages as read
    // payload: { fromId }  — mark all messages FROM fromId as read
    // ────────────────────────────────────────────────────
    socket.on('message:read', async ({ fromId }) => {
      try {
        if (!fromId) return

        await Message.updateMany(
          { from: fromId, to: userId, read: false },
          { $set: { read: true } }
        )

        // Notify the sender so they can update their tick icons
        emitToUser(io, fromId, 'message:read:ack', {
          byUserId: userId,
          fromId,
        })
      } catch (err) {
        console.error('message:read error', err.message)
      }
    })

    // ────────────────────────────────────────────────────
    // EVENT: typing indicator
    // payload: { toId, isTyping }
    // ────────────────────────────────────────────────────
    socket.on('typing', ({ toId, isTyping }) => {
      if (!toId) return
      emitToUser(io, toId, 'typing', {
        fromId:   userId,
        isTyping: Boolean(isTyping),
      })
    })

    // ────────────────────────────────────────────────────
    // DISCONNECT
    // ────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user.name} (${socket.id})`)

      const sockets = onlineUsers.get(userId)
      if (sockets) {
        sockets.delete(socket.id)
        if (sockets.size === 0) {
          onlineUsers.delete(userId)
          // Tell matches this user went offline
          socket.user.matches.forEach(matchId => {
            emitToUser(io, matchId, 'user:offline', { userId })
          })
        }
      }
    })
  })

  return io
}

// Export helper so other modules can emit events (e.g. on HTTP match creation)
module.exports = { initSocket, emitToUser, getSocketIds, onlineUsers }
