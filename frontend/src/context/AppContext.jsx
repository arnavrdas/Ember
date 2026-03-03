// src/context/AppContext.jsx
// ─────────────────────────────────────────────────────────
// One place for all global state that multiple components need.
// Pass data down via context instead of prop-drilling.
// ─────────────────────────────────────────────────────────
import { createContext, useContext, useState } from 'react'
import { profilesAPI, swipeAPI } from '../api/index'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  // ── Auth ────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState(null)

  // ── Navigation ──────────────────────────────────────────
  const [activeSection, setActiveSection] = useState('discover')

  // ── Discover ────────────────────────────────────────────
  // Starts empty — populated by loadAppData() after login
  const [profiles, setProfiles] = useState([])

  // ── Matches & Conversations ──────────────────────────────
  const [matches, setMatches] = useState([])
  const [conversations, setConversations] = useState({})

  // ── Chat ────────────────────────────────────────────────
  const [activeChatUser, setActiveChatUser] = useState(null)

  // ── Match Modal ─────────────────────────────────────────
  const [matchModalUser, setMatchModalUser] = useState(null)

  // ── Toast ────────────────────────────────────────────────
  const [toast, setToast] = useState(null)
  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  // ── Called once after a successful login / register ─────
  // Fetches profiles to discover and the user's existing matches.
  const loadAppData = async () => {
    try {
      const [fetchedProfiles, fetchedMatches] = await Promise.all([
        profilesAPI.getAll(),
        swipeAPI.getMatches(),
      ])
      // The backend returns _id; normalise to id so the rest of the
      // frontend doesn't care which DB field name is used.
      setProfiles(fetchedProfiles.map(p => ({ ...p, id: p._id })))
      setMatches(fetchedMatches.map(m => ({ ...m, id: m._id, isNew: false })))
    } catch (err) {
      console.error('Failed to load app data:', err.message)
    }
  }

  // ── Helpers ─────────────────────────────────────────────
  const addMatch = (profile) => {
    setMatches(prev => {
      if (prev.find(m => m.id === profile.id)) return prev
      return [...prev, { id: profile.id, name: profile.name, avatar: profile.avatar, isNew: true }]
    })
  }

  const addMessage = (userId, msg) => {
    setConversations(prev => ({
      ...prev,
      [userId]: [...(prev[userId] || []), msg],
    }))
  }

  const markMatchSeen = (userId) => {
    setMatches(prev => prev.map(m => m.id === userId ? { ...m, isNew: false } : m))
  }

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser,
      activeSection, setActiveSection,
      profiles, setProfiles,
      matches, addMatch,
      conversations, addMessage,
      activeChatUser, setActiveChatUser,
      matchModalUser, setMatchModalUser,
      markMatchSeen,
      toast, showToast,
      loadAppData,
    }}>
      {children}
    </AppContext.Provider>
  )
}

// Custom hook — any component can call useApp() to get global state
export const useApp = () => useContext(AppContext)
