// ember/src/components/discover/Discover.jsx

// src/components/discover/Discover.jsx
import './Discover.css'
import ProfileCard from './ProfileCard'
import { useApp } from '../../context/AppContext'
import { swipeAPI } from '../../api/index'
import { useState, useEffect } from 'react'

export default function Discover() {
  const { profiles, setProfiles, addMatch, setMatchModalUser, showToast } = useApp()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch potential matches when component mounts
  useEffect(() => {
    fetchPotentialMatches()
  }, [])

  const fetchPotentialMatches = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await swipeAPI.getPotentialMatches()
      
      // Normalize IDs for the frontend
      const normalizedProfiles = data.map(p => ({ ...p, id: p._id }))
      setProfiles(normalizedProfiles)
    } catch (err) {
      console.error('Failed to fetch potential matches:', err)
      setError(err.message)
      showToast('Failed to load profiles')
    } finally {
      setLoading(false)
    }
  }

  const visible = profiles.slice(0, 3)

  const handleSwipe = async (profile, dir) => {
    // Remove from deck immediately for snappy UX
    setProfiles(prev => prev.filter(p => p.id !== profile.id))

    try {
      let result
      
      if (dir === 'left') {
        result = await swipeAPI.pass(profile.id)
        showToast('Passed')
      } else {
        // right or super
        result = await swipeAPI.like(profile.id)
        
        if (result.matched && result.matchedUser) {
          const matchUser = {
            id:     result.matchedUser._id,
            name:   result.matchedUser.name,
            avatar: result.matchedUser.avatar,
            isNew:  true,
          }
          addMatch(matchUser)
          setTimeout(() => setMatchModalUser(matchUser), 100)
          showToast("It's a match! 🎉")
        } else if (dir === 'super') {
          showToast('⭐ Super Liked!')
        } else {
          showToast('Liked!')
        }
      }
    } catch (err) {
      console.error('Swipe failed:', err.message)
      showToast('Failed to record swipe')
      // Optionally add the profile back to the deck on error
      setProfiles(prev => [...prev, profile])
    }
  }

  const handleButtonSwipe = (dir) => {
    if (!profiles.length) {
      fetchPotentialMatches() // Try to load more profiles when deck is empty
      return
    }
    handleSwipe(profiles[0], dir)
  }

  const stackClass = (index) => {
    if (index === 0) return 'card-top'
    if (index === 1) return 'card-behind-1'
    return 'card-behind-2'
  }

  if (loading && profiles.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner">Loading profiles...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Failed to load profiles</h3>
        <p>{error}</p>
        <button 
          className="refresh-btn" 
          onClick={fetchPotentialMatches}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 2rem',
            background: '#ff6b6b',
            color: 'white',
            border: 'none',
            borderRadius: '999px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    )
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
            <button 
              className="refresh-btn" 
              onClick={fetchPotentialMatches}
              style={{
                marginTop: '1rem',
                padding: '0.75rem 2rem',
                background: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '999px',
                cursor: 'pointer'
              }}
            >
              Refresh
            </button>
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
        <button 
          className="action-btn btn-nope"  
          onClick={() => handleButtonSwipe('left')}  
          title="Pass"
          disabled={profiles.length === 0}
        >
          ✕
        </button>
        <button 
          className="action-btn btn-super" 
          onClick={() => handleButtonSwipe('super')} 
          title="Super Like"
          disabled={profiles.length === 0}
        >
          ⭐
        </button>
        <button 
          className="action-btn btn-like"  
          onClick={() => handleButtonSwipe('right')} 
          title="Like"
          disabled={profiles.length === 0}
        >
          ♥
        </button>
      </div>
    </div>
  )
}