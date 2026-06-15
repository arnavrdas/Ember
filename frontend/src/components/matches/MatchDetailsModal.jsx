import { useState, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import './MatchDetailsModal.css'

export default function MatchDetailsModal({ matchId, onClose }) {
  const { matchDetails, loadMatchDetails, unmatchUser, showToast } = useApp()
  const [showUnmatchConfirm, setShowUnmatchConfirm] = useState(false)
  const [unmatchReason, setUnmatchReason] = useState('')
  const [isUnmatching, setIsUnmatching] = useState(false)
  const [loading, setLoading] = useState(true)

  const match = matchDetails[matchId]

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true)
      await loadMatchDetails(matchId)
      setLoading(false)
    }
    if (matchId) {
      loadDetails()
    }
  }, [matchId])

  const handleUnmatch = async () => {
    setIsUnmatching(true)
    const success = await unmatchUser(matchId, unmatchReason)
    setIsUnmatching(false)
    if (success) {
      setShowUnmatchConfirm(false)
      onClose()
    }
  }

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-loading">Loading match details...</div>
        </div>
      </div>
    )
  }

  if (!match) return null

  const matchedUser = match.matchedUser
  const matchedAt = new Date(match.matchedAt).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        {!showUnmatchConfirm ? (
          <>
            <div className="match-header">
              <div className="match-avatar-large">
                {matchedUser.profilePicture || matchedUser.avatar || '😊'}
              </div>
              <h2>{matchedUser.name}</h2>
              <p className="match-date">Matched on {matchedAt}</p>
            </div>

            <div className="match-info">
              {matchedUser.bio && (
                <div className="info-section">
                  <h3>About</h3>
                  <p>{matchedUser.bio}</p>
                </div>
              )}

              {matchedUser.interests && matchedUser.interests.length > 0 && (
                <div className="info-section">
                  <h3>Interests</h3>
                  <div className="interests-list">
                    {matchedUser.interests.map((interest, i) => (
                      <span key={i} className="interest-tag">{interest}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="info-section">
                <h3>Last Active</h3>
                <p>{matchedUser.lastActive ? new Date(matchedUser.lastActive).toLocaleString() : 'Recently'}</p>
              </div>
            </div>

            <div className="match-actions">
              <button 
                className="btn-chat"
                onClick={() => {
                  onClose()
                  // Navigate to chat (you'll need to implement this)
                }}
              >
                Send Message
              </button>
              <button 
                className="btn-unmatch"
                onClick={() => setShowUnmatchConfirm(true)}
              >
                Unmatch
              </button>
            </div>
          </>
        ) : (
          <div className="unmatch-confirm">
            <h3>Unmatch with {matchedUser.name}?</h3>
            <p className="unmatch-warning">
              This action cannot be undone. You will no longer be able to message each other.
            </p>
            
            <textarea
              className="unmatch-reason"
              placeholder="Reason for unmatching (optional)"
              value={unmatchReason}
              onChange={(e) => setUnmatchReason(e.target.value)}
              maxLength={500}
              rows={3}
            />
            
            <div className="unmatch-actions">
              <button 
                className="btn-cancel"
                onClick={() => setShowUnmatchConfirm(false)}
                disabled={isUnmatching}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm-unmatch"
                onClick={handleUnmatch}
                disabled={isUnmatching}
              >
                {isUnmatching ? 'Unmatching...' : 'Yes, Unmatch'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}