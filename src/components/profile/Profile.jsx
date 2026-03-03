// src/components/profile/Profile.jsx
import { useState } from 'react'
import './Profile.css'
import { useApp } from '../../context/AppContext'

export default function Profile() {
  const { currentUser, setCurrentUser } = useApp()

  // Local state for toggle switches
  const [notifications,  setNotifications]  = useState(true)
  const [showOnDiscover, setShowOnDiscover]  = useState(true)
  const [location,       setLocation]        = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    setCurrentUser(null)
  }

  return (
    <div className="profile-section">
      {/* Avatar & name */}
      <div className="profile-hero">{currentUser?.avatar || '😊'}</div>
      <div className="profile-name-big">{currentUser?.name}</div>
      <div className="profile-sub">{currentUser?.email || 'Member'}</div>

      {/* Preferences */}
      <div className="settings-group">
        <div className="settings-label">Preferences</div>

        <div className="settings-row">
          <span>🔔 Push Notifications</span>
          <button className={`toggle ${notifications ? 'on' : ''}`} onClick={() => setNotifications(v => !v)} />
        </div>

        <div className="settings-row">
          <span>👁 Show Me on Discover</span>
          <button className={`toggle ${showOnDiscover ? 'on' : ''}`} onClick={() => setShowOnDiscover(v => !v)} />
        </div>

        <div className="settings-row">
          <span>📍 Location Services</span>
          <button className={`toggle ${location ? 'on' : ''}`} onClick={() => setLocation(v => !v)} />
        </div>
      </div>

      {/* Account */}
      <div className="settings-group">
        <div className="settings-label">Account</div>
        <div className="settings-row clickable" onClick={handleLogout}>
          <span>🚪 Sign Out</span>
          <span style={{ color: 'var(--muted)' }}>›</span>
        </div>
      </div>
    </div>
  )
}
