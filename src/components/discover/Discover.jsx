// src/components/discover/Discover.jsx
import './Discover.css'
import ProfileCard from './ProfileCard'
import { useApp } from '../../context/AppContext'
import { swipeAPI } from '../../api/index'

export default function Discover() {
  const { profiles, setProfiles, addMatch, setMatchModalUser, showToast } = useApp()

  const visible = profiles.slice(0, 3)

  const handleSwipe = async (profile, dir) => {
    // Remove from deck immediately for snappy UX
    setProfiles(prev => prev.filter(p => p.id !== profile.id))

    try {
      const result = await swipeAPI.swipe(profile.id, dir)

      if (result.matched && result.matchedUser) {
        const matchUser = {
          id:     result.matchedUser._id,
          name:   result.matchedUser.name,
          avatar: result.matchedUser.avatar,
          isNew:  true,
        }
        addMatch(matchUser)
        setTimeout(() => setMatchModalUser(matchUser), 100)
      }
    } catch (err) {
      console.error('Swipe failed:', err.message)
    }

    if (dir === 'super') showToast('⭐ Super Liked!')
  }

  const handleButtonSwipe = (dir) => {
    if (!profiles.length) return
    handleSwipe(profiles[0], dir)
  }

  const stackClass = (index) => {
    if (index === 0) return 'card-top'
    if (index === 1) return 'card-behind-1'
    return 'card-behind-2'
  }

  return (
    <div>
      <h2 className="section-title">Discover <em>Today</em></h2>

      <div className="card-stack">
        {visible.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🔥</div>
            <h3>You've seen everyone!</h3>
            <p>Check back later for more people nearby</p>
          </div>
        ) : (
          [...visible].reverse().map((profile, reversedIndex) => {
            const index = visible.length - 1 - reversedIndex
            return (
              <ProfileCard
                key={profile.id}
                profile={profile}
                stackClass={stackClass(index)}
                onSwipe={handleSwipe}
              />
            )
          })
        )}
      </div>

      <div className="action-row">
        <button className="action-btn btn-nope"  onClick={() => handleButtonSwipe('left')}  title="Pass">✕</button>
        <button className="action-btn btn-super" onClick={() => handleButtonSwipe('super')} title="Super Like">⭐</button>
        <button className="action-btn btn-like"  onClick={() => handleButtonSwipe('right')} title="Like">♥</button>
      </div>
    </div>
  )
}
