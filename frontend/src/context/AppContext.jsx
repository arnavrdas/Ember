// src/context/AppContext.jsx
// ─────────────────────────────────────────────────────────
// Global state + real-time socket wiring.
// ─────────────────────────────────────────────────────────
import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { profilesAPI, swipeAPI, matchAPI } from '../api/index'
import { useSocket } from '../hooks/useSocket'

const AppContext = createContext(null)

// ── Full reset shape — used on logout and before a new login ──
const EMPTY_STATE = {
  profiles:      [],
  matches:       [],
  conversations: {},
  matchDetails:  {},
  activeChatUser: null,
  matchModalUser: null,
  onlineUsers:   new Set(),
  typingUsers:   {},
}

// Append msg to a thread only if its _id isn't already present.
// Falls back to text+createdAt comparison for messages without an _id (optimistic inserts).
function appendUnique(thread, msg) {
  if (msg._id && thread.some(m => m._id && m._id.toString() === msg._id.toString())) {
    return thread
  }
  return [...thread, msg]
}

export function AppProvider({ children }) {
  // ── Auth ────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null)

  // ── Navigation ──────────────────────────────────────────
  const [activeSection, setActiveSection] = useState('discover')

  // ── App data (all reset on logout) ──────────────────────
  const [profiles,       setProfiles]       = useState(EMPTY_STATE.profiles)
  const [matches,        setMatches]        = useState(EMPTY_STATE.matches)
  const [conversations,  setConversations]  = useState(EMPTY_STATE.conversations)
  const [matchDetails,   setMatchDetails]   = useState(EMPTY_STATE.matchDetails)
  const [activeChatUser, setActiveChatUser] = useState(EMPTY_STATE.activeChatUser)
  const [matchModalUser, setMatchModalUser] = useState(EMPTY_STATE.matchModalUser)
  const [onlineUsers,    setOnlineUsers]    = useState(EMPTY_STATE.onlineUsers)
  const [typingUsers,    setTypingUsers]    = useState(EMPTY_STATE.typingUsers)

  // ── Socket token — only set after login, cleared on logout ─
  const [socketToken, setSocketToken] = useState(null)

  // ── Toast ────────────────────────────────────────────────
  const [toast, setToast] = useState(null)
  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  // ── Keep activeChatUser ref fresh inside socket callbacks ─
  const activeChatRef = useRef(null)
  activeChatRef.current = activeChatUser

  // ── Socket ref for use inside callbacks ──────────────────
  const socketActionsRef = useRef({})

  // ────────────────────────────────────────────────────────
  // Socket event handlers
  // ────────────────────────────────────────────────────────

  const handleIncomingMessage = useCallback((msg) => {
    const fromId = msg.from
    setConversations(prev => {
      const entry = { _id: msg._id, from: 'them', text: msg.text, read: msg.read, createdAt: msg.createdAt }
      return { ...prev, [fromId]: appendUnique(prev[fromId] || [], entry) }
    })
    if (activeChatRef.current?.id !== fromId) {
      setMatches(prev => prev.map(m =>
        (m.userId || m.id) === fromId ? { ...m, isNew: true } : m
      ))
    } else {
      socketActionsRef.current.markRead?.(fromId)
    }
    setMatches(prev => prev.map(m =>
      (m.userId || m.id) === fromId
        ? { ...m, lastMessage: msg.text, lastMessageAt: msg.createdAt }
        : m
    ))
  }, [])

  const handleMessageSent = useCallback((msg) => {
    const toId = msg.to
    setConversations(prev => {
      const entry = { _id: msg._id, from: 'me', text: msg.text, read: false, createdAt: msg.createdAt }
      return { ...prev, [toId]: appendUnique(prev[toId] || [], entry) }
    })
    setMatches(prev => prev.map(m =>
      (m.userId || m.id) === toId
        ? { ...m, lastMessage: msg.text, lastMessageAt: msg.createdAt }
        : m
    ))
  }, [])

  const handleReadAck = useCallback(({ byUserId }) => {
    setConversations(prev => {
      const thread = prev[byUserId]
      if (!thread) return prev
      return {
        ...prev,
        [byUserId]: thread.map(m => m.from === 'me' ? { ...m, read: true } : m),
      }
    })
  }, [])

  const handleTyping = useCallback(({ fromId, isTyping }) => {
    setTypingUsers(prev => ({ ...prev, [fromId]: isTyping }))
    if (isTyping) {
      setTimeout(() => {
        setTypingUsers(prev => ({ ...prev, [fromId]: false }))
      }, 4000)
    }
  }, [])

  const handleOnline = useCallback(({ userId }) => {
    setOnlineUsers(prev => new Set([...prev, userId]))
  }, [])

  const handleOffline = useCallback(({ userId }) => {
    setOnlineUsers(prev => { const s = new Set(prev); s.delete(userId); return s })
  }, [])

  const handleOnlineList = useCallback((ids) => {
    setOnlineUsers(new Set(ids))
  }, [])

  // Real-time match notification (the OTHER user gets this when someone likes them back)
  const handleNewMatch = useCallback(({ matchedUser }) => {
    if (!matchedUser) return
    setMatches(prev => {
      const uid = matchedUser.id || matchedUser._id
      if (prev.find(m => m.id === uid || m.userId === uid)) return prev
      return [...prev, {
        id:     uid,
        userId: uid,
        name:   matchedUser.name,
        avatar: matchedUser.avatar || '😊',
        isNew:  true,
      }]
    })
  }, [])

  // ── Socket (reconnects whenever socketToken changes) ─────
  const { sendMessage: socketSend, markRead, sendTyping } = useSocket({
    token:         socketToken,
    onMessage:     handleIncomingMessage,
    onMessageSent: handleMessageSent,
    onReadAck:     handleReadAck,
    onTyping:      handleTyping,
    onOnline:      handleOnline,
    onOffline:     handleOffline,
    onOnlineList:  handleOnlineList,
    onNewMatch:    handleNewMatch,
  })
  socketActionsRef.current = { markRead }

  // ────────────────────────────────────────────────────────
  // Login — clears all previous state FIRST, then loads fresh
  // ────────────────────────────────────────────────────────
  const login = useCallback(async (userData, token) => {
    // 1. Clear all stale state from any previous session
    setProfiles(EMPTY_STATE.profiles)
    setMatches(EMPTY_STATE.matches)
    setConversations(EMPTY_STATE.conversations)
    setMatchDetails(EMPTY_STATE.matchDetails)
    setActiveChatUser(EMPTY_STATE.activeChatUser)
    setMatchModalUser(EMPTY_STATE.matchModalUser)
    setOnlineUsers(EMPTY_STATE.onlineUsers)
    setTypingUsers(EMPTY_STATE.typingUsers)
    setActiveSection('discover')

    // 2. Persist token and set user
    localStorage.setItem('token', token)
    setSocketToken(token)           // triggers socket reconnect with new user's token
    setCurrentUser(userData)

    // 3. Load fresh data for this user
    await loadAppDataForToken(token)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ────────────────────────────────────────────────────────
  // Logout — clear everything
  // ────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('token')
    setSocketToken(null)            // triggers socket disconnect
    setCurrentUser(null)
    setProfiles(EMPTY_STATE.profiles)
    setMatches(EMPTY_STATE.matches)
    setConversations(EMPTY_STATE.conversations)
    setMatchDetails(EMPTY_STATE.matchDetails)
    setActiveChatUser(EMPTY_STATE.activeChatUser)
    setMatchModalUser(EMPTY_STATE.matchModalUser)
    setOnlineUsers(EMPTY_STATE.onlineUsers)
    setTypingUsers(EMPTY_STATE.typingUsers)
    setActiveSection('discover')
  }, [])

  // ────────────────────────────────────────────────────────
  // Data loader (accepts explicit token to avoid stale closure)
  // ────────────────────────────────────────────────────────
  const loadAppDataForToken = async (token) => {
    try {
      // Temporarily set the token so the request() helper picks it up
      const prev = localStorage.getItem('token')
      if (token) localStorage.setItem('token', token)

      const [fetchedProfiles, fetchedMatchesRaw] = await Promise.all([
        profilesAPI.getAll(),
        swipeAPI.getMatches(),
      ])

      setProfiles(fetchedProfiles.map(p => ({ ...p, id: p._id })))

      // /users/my-matches returns a bare array of populated User objects
      const rawMatches = Array.isArray(fetchedMatchesRaw)
        ? fetchedMatchesRaw
        : (fetchedMatchesRaw.matches || [])

      setMatches(rawMatches.map(m => {
        // Support both shapes: bare User {_id, name, avatar} and wrapped {matchId, matchedUser:{id,name}}
        const uid    = m.matchId ? (m.matchedUser?.id || m.matchedUser?._id) : (m._id || m.id)
        const name   = m.matchedUser?.name  || m.name
        const avatar = m.matchedUser?.avatar || m.avatar || m.emoji || '😊'
        return {
          id:            uid,
          userId:        uid,
          name,
          avatar,
          lastMessageAt: m.lastMessageAt,
          isNew:         false,
        }
      }))
    } catch (err) {
      console.error('Failed to load app data:', err.message)
    }
  }

  // Kept for backward compatibility (called from AuthScreen)
  const loadAppData = () => loadAppDataForToken(localStorage.getItem('token'))

  // ── Match details & unmatch ───────────────────────────
  const loadMatchDetails = async (matchId) => {
    try {
      const data = await matchAPI.getById(matchId)
      if (data.success) {
        setMatchDetails(prev => ({ ...prev, [matchId]: data.match }))
        return data.match
      }
    } catch (err) {
      console.error('Failed to load match details:', err.message)
      showToast('Failed to load match details', 'error')
    }
  }

  const unmatchUser = async (matchId, reason = '') => {
    try {
      const response = await matchAPI.unmatch(matchId, reason)
      if (response.success) {
        setMatches(prev => prev.filter(m => m.id !== matchId))
        setConversations(prev => {
          const next = { ...prev }
          const m = matches.find(x => x.id === matchId)
          if (m?.userId) delete next[m.userId]
          return next
        })
        if (activeChatUser?.id === matchId) setActiveChatUser(null)
        showToast('Successfully unmatched user', 'success')
        return true
      }
    } catch (err) {
      console.error('Failed to unmatch user:', err.message)
      showToast('Failed to unmatch user', 'error')
      return false
    }
  }

  // ── Real-time actions ─────────────────────────────────
  const sendSocketMessage = useCallback((toId, text) => {
    socketSend(toId, text)
  }, [socketSend])

  const markMessagesRead = useCallback((fromId) => {
    markRead(fromId)
    setConversations(prev => {
      const thread = prev[fromId]
      if (!thread) return prev
      return { ...prev, [fromId]: thread.map(m => m.from === 'them' ? { ...m, read: true } : m) }
    })
    setMatches(prev => prev.map(m =>
      (m.userId || m.id) === fromId ? { ...m, isNew: false } : m
    ))
  }, [markRead])

  const emitTyping = useCallback((toId, isTyping) => {
    sendTyping(toId, isTyping)
  }, [sendTyping])

  // ── Legacy helpers ────────────────────────────────────
  const addMatch = (profile) => {
    setMatches(prev => {
      const uid = profile.id || profile._id
      if (prev.find(m => m.id === uid || m.userId === uid)) return prev
      return [...prev, {
        id:     uid,
        userId: uid,
        name:   profile.name,
        avatar: profile.avatar || profile.emoji || '😊',
        isNew:  true,
      }]
    })
  }

  const addMessage = (userId, msg) => {
    setConversations(prev => ({
      ...prev,
      [userId]: appendUnique(prev[userId] || [], msg),
    }))
  }

  const markMatchSeen = (userId) => {
    setMatches(prev => prev.map(m =>
      (m.userId || m.id) === userId ? { ...m, isNew: false } : m
    ))
  }

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      activeSection, setActiveSection,
      profiles, setProfiles,
      matches, addMatch,
      conversations, addMessage, setConversations,
      activeChatUser, setActiveChatUser,
      matchModalUser, setMatchModalUser,
      matchDetails,
      markMatchSeen,
      toast, showToast,
      loadAppData,
      loadMatchDetails,
      unmatchUser,
      login,
      logout,
      // Real-time
      onlineUsers,
      typingUsers,
      sendSocketMessage,
      markMessagesRead,
      emitTyping,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
