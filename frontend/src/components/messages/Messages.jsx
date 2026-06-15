// src/components/messages/Messages.jsx
import { useState } from 'react'
import './Messages.css'
import { useApp } from '../../context/AppContext'

export default function Messages() {
  const {
    matches,
    conversations,
    setActiveChatUser,
    markMatchSeen,
    showToast,
    onlineUsers,
    typingUsers,
  } = useApp()

  const [loading, setLoading] = useState({})

  const openChat = async (match) => {
    try {
      setLoading(prev => ({ ...prev, [match.id]: true }))
      markMatchSeen(match.userId || match.id)
      setActiveChatUser(match)
    } catch (err) {
      showToast('Failed to open conversation', 'error')
    } finally {
      setLoading(prev => ({ ...prev, [match.id]: false }))
    }
  }

  const formatTime = (ts) => {
    if (!ts) return ''
    const now  = new Date()
    const date = new Date(ts)
    const diff = now - date
    if (diff < 60000)         return 'now'
    if (diff < 3600000)       return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000)      return `${Math.floor(diff / 3600000)}h`
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  if (!matches.length) {
    return (
      <div>
        <h2 className="section-title">Messages</h2>
        <div className="empty">
          <div className="empty-icon">💬</div>
          <h3>No conversations yet</h3>
          <p>Match with someone to start chatting</p>
        </div>
      </div>
    )
  }

  // Sort: unread first, then by last message time
  const sorted = [...matches].sort((a, b) => {
    if (a.isNew && !b.isNew) return -1
    if (!a.isNew && b.isNew)  return 1
    const ta = a.lastMessageAt ? new Date(a.lastMessageAt) : new Date(0)
    const tb = b.lastMessageAt ? new Date(b.lastMessageAt) : new Date(0)
    return tb - ta
  })

  return (
    <div>
      <h2 className="section-title">Messages</h2>
      <div className="conv-list">
        {sorted.map(match => {
          const uid       = match.userId || match.id
          const msgs      = conversations[uid] || []
          const last      = match.lastMessage || (msgs.length ? msgs[msgs.length - 1].text : null)
          const lastTime  = match.lastMessageAt || (msgs.length ? msgs[msgs.length - 1].createdAt : null)
          const isLoading = loading[match.id]
          const isOnline  = onlineUsers.has(uid)
          const isTyping  = typingUsers[uid]

          return (
            <div
              className={`conv-item ${isLoading ? 'loading' : ''}`}
              key={match.id}
              onClick={() => !isLoading && openChat(match)}
            >
              <div className="conv-avatar-wrap">
                <div className="conv-avatar">
                  {match.avatar || match.emoji || '😊'}
                </div>
                {isOnline && <div className="online-pip" />}
              </div>
              <div className="conv-info">
                <div className="conv-name">{match.name}</div>
                <div className="conv-preview">
                  {isTyping
                    ? <span className="typing-label">typing…</span>
                    : (last || 'Say hello! 👋')
                  }
                </div>
              </div>
              <div className="conv-meta">
                <div className="conv-time">{formatTime(lastTime)}</div>
                {match.isNew && <div className="unread-dot" />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
