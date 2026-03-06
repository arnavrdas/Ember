import { useState } from 'react'
import './Messages.css'
import { useApp } from '../../context/AppContext'

export default function Messages() {
  const { matches, conversations, setActiveChatUser, markMatchSeen, showToast } = useApp()
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
          const msgs = conversations[match.userId || match.id] || []
          const last = msgs[msgs.length - 1]
          const isLoading = loading[match.id]
          
          return (
            <div 
              className={`conv-item ${isLoading ? 'loading' : ''}`} 
              key={match.id} 
              onClick={() => !isLoading && openChat(match)}
            >
              <div className="conv-avatar">
                {match.avatar || match.emoji || '😊'}
              </div>
              <div className="conv-info">
                <div className="conv-name">{match.name}</div>
                <div className="conv-preview">
                  {last ? last.text : 'Say hello! 👋'}
                </div>
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