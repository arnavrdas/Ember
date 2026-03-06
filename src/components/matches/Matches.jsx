import { useState } from 'react'
import './Matches.css'
import { useApp } from '../../context/AppContext'
import MatchDetailsModal from './MatchDetailsModal'

export default function Matches() {
  const { matches, setActiveChatUser, setActiveSection, markMatchSeen } = useApp()
  const [selectedMatch, setSelectedMatch] = useState(null)

  const openChat = (match, e) => {
    e.stopPropagation()
    markMatchSeen(match.userId || match.id)
    setActiveChatUser(match)
    setActiveSection('messages')
  }

  const openMatchDetails = (match) => {
    setSelectedMatch(match.id)
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
          <div 
            className="match-card" 
            key={match.id} 
            onClick={() => openMatchDetails(match)}
          >
            <div className="match-avatar">
              {match.avatar || match.emoji || '😊'}
            </div>
            {match.isNew && <div className="match-badge" />}
            <div className="match-overlay">
              <div className="match-name">{match.name}</div>
              {match.isNew && <div className="new-match-label">New Match!</div>}
            </div>
            
            {/* Action buttons */}
            <div className="match-actions-overlay">
              <button 
                className="match-action-btn chat-btn"
                onClick={(e) => openChat(match, e)}
                title="Send message"
              >
                💬
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Match Details Modal */}
      {selectedMatch && (
        <MatchDetailsModal 
          matchId={selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  )
}