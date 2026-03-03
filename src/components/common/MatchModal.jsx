// src/components/common/MatchModal.jsx
import './MatchModal.css'
import { useApp } from '../../context/AppContext'

export default function MatchModal() {
  const { currentUser, matchModalUser, setMatchModalUser, setActiveChatUser, setActiveSection } = useApp()

  if (!matchModalUser) return null

  const close = () => setMatchModalUser(null)

  const openChat = () => {
    close()
    setActiveChatUser(matchModalUser)
    setActiveSection('messages')
  }

  return (
    <div className={`match-modal-overlay ${matchModalUser ? 'open' : ''}`}>
      <div className="modal-card">
        <div className="modal-hearts">💕</div>
        <div className="modal-title">It's a Match!</div>
        <div className="modal-sub">
          You and <strong>{matchModalUser.name}</strong> liked each other
        </div>
        <div className="modal-avatars">
          <div className="modal-avatar you">{currentUser?.avatar || '😊'}</div>
          <div className="modal-avatar">{matchModalUser.emoji}</div>
        </div>
        <div className="modal-btns">
          <button className="btn-primary" onClick={openChat}>Send a Message</button>
          <button className="btn-ghost"   onClick={close}>Keep Swiping</button>
        </div>
      </div>
    </div>
  )
}
