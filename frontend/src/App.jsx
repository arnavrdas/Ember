// src/App.jsx
// ─────────────────────────────────────────────────────────
// Root component. Decides which screen to show based on:
//   - currentUser     → logged in or not (auth vs main)
//   - activeChatUser  → in a chat (replaces main with ChatView)
//   - activeSection   → which tab is active
// ─────────────────────────────────────────────────────────
import './styles/global.css'
import { useApp } from './context/AppContext'

// Screens & layout
import AuthScreen from './components/auth/AuthScreen'
import Navbar     from './components/layout/Navbar'
import ChatView   from './components/messages/ChatView'

// Sections
import Discover from './components/discover/Discover'
import Matches  from './components/matches/Matches'
import Messages from './components/messages/Messages'
import Profile  from './components/profile/Profile'

// Global overlays (always mounted, conditionally visible)
import MatchModal from './components/common/MatchModal'
import Toast      from './components/common/Toast'

// Inline style for the content area (identical to original .content CSS)
const contentStyle = {
  flex: 1,
  padding: '2rem 1.5rem',
  maxWidth: '560px',
  margin: '0 auto',
  width: '100%',
}

export default function App() {
  const { currentUser, activeSection, activeChatUser } = useApp()

  // ── Not logged in → show auth screen ──────────────────
  if (!currentUser) {
    return (
      <>
        <AuthScreen />
        <Toast />
      </>
    )
  }

  // ── In a chat → show full-screen chat view ─────────────
  if (activeChatUser) {
    return (
      <>
        <ChatView />
        <Toast />
      </>
    )
  }

  // ── Main app ───────────────────────────────────────────
  return (
    <>
      {/* Sticky nav */}
      <Navbar />

      {/* Page content */}
      <div style={contentStyle}>
        {activeSection === 'discover'  && <Discover />}
        {activeSection === 'matches'   && <Matches  />}
        {activeSection === 'messages'  && <Messages />}
        {activeSection === 'profile'   && <Profile  />}
      </div>

      {/* Global overlays */}
      <MatchModal />
      <Toast />
    </>
  )
}
