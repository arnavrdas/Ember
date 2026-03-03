// src/components/matches/Matches.jsx
import './Matches.css'
import { useApp } from '../../context/AppContext'

export default function Matches() {
  const { matches, setActiveChatUser, setActiveSection, markMatchSeen } = useApp()

  const openChat = (match) => {
    markMatchSeen(match.id)
    setActiveChatUser(match)
    setActiveSection('messages')
  }

  if (!matches.length) {
    return (
      <div>
        <h2 className="section-title">Your <em>Matches</em></h2>
        <div className="empty">
          <div className="empty-icon">💘</div>
          <h3>No matches yet</h3>
          <p>Keep swiping to find your spark</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="section-title">Your <em>Matches</em></h2>
      <div className="matches-grid">
        {matches.map(match => (
          <div className="match-card" key={match.id} onClick={() => openChat(match)}>
            {/* Backend stores avatar as an emoji string */}
            <div className="match-avatar">{match.avatar || match.emoji || '😊'}</div>
            {match.isNew && <div className="match-badge" />}
            <div className="match-overlay">
              <div className="match-name">{match.name}</div>
              {match.isNew && <div className="new-match-label">New Match!</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
