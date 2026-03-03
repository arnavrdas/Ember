// src/components/messages/Messages.jsx
import './Messages.css'
import { useApp } from '../../context/AppContext'

export default function Messages() {
  const { matches, conversations, setActiveChatUser, markMatchSeen } = useApp()

  const openChat = (match) => {
    markMatchSeen(match.id)
    setActiveChatUser(match)
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

  return (
    <div>
      <h2 className="section-title">Messages</h2>
      <div className="conv-list">
        {matches.map(match => {
          const msgs = conversations[match.id] || []
          const last = msgs[msgs.length - 1]
          return (
            <div className="conv-item" key={match.id} onClick={() => openChat(match)}>
              <div className="conv-avatar">{match.avatar || match.emoji || '😊'}</div>
              <div className="conv-info">
                <div className="conv-name">{match.name}</div>
                <div className="conv-preview">{last ? last.text : 'Say hello! 👋'}</div>
              </div>
              <div className="conv-meta">
                <div className="conv-time">{last ? 'Just now' : ''}</div>
                {match.isNew && <div className="unread-dot" />}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
