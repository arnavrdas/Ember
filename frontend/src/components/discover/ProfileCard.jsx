// src/components/discover/ProfileCard.jsx
// ─────────────────────────────────────────────────────────
// A single swipeable card. Handles all drag/touch logic internally.
// Calls onSwipe(profile, direction) when a swipe is resolved.
// ─────────────────────────────────────────────────────────
import { useRef } from 'react'

export default function ProfileCard({ profile, stackClass, onSwipe }) {
  const cardRef   = useRef(null)
  const startX    = useRef(0)
  const curX      = useRef(0)
  const dragging  = useRef(false)

  // Safely access profile properties with defaults
  const {
    name = 'Anonymous',
    age = '?',
    bio = 'No bio available',
    emoji = '👤',
    tags = []
  } = profile || {}

  // ── Shared drag logic ──────────────────────────────────
  const onDragStart = (clientX) => {
    startX.current   = clientX
    dragging.current = true
    if (cardRef.current) {
      cardRef.current.classList.add('dragging')
    }
  }

  const onDragMove = (clientX) => {
    if (!dragging.current || !cardRef.current) return
    curX.current = clientX - startX.current
    const card = cardRef.current
    card.style.transform = `translateX(${curX.current}px) rotate(${curX.current * 0.04}deg)`
    
    // Safely update stamps
    const likeStamp = card.querySelector('.stamp.like')
    const nopeStamp = card.querySelector('.stamp.nope')
    
    if (likeStamp) {
      likeStamp.style.opacity = Math.max(0, curX.current / 80)
    }
    if (nopeStamp) {
      nopeStamp.style.opacity = Math.max(0, -curX.current / 80)
    }
  }

  const onDragEnd = () => {
    if (!dragging.current || !cardRef.current) return
    dragging.current = false
    cardRef.current.classList.remove('dragging')

    if      (curX.current >  80) resolve('right')
    else if (curX.current < -80) resolve('left')
    else {
      // Snap back to center
      cardRef.current.style.transform = ''
      const likeStamp = cardRef.current.querySelector('.stamp.like')
      const nopeStamp = cardRef.current.querySelector('.stamp.nope')
      if (likeStamp) likeStamp.style.opacity = 0
      if (nopeStamp) nopeStamp.style.opacity = 0
    }
    curX.current = 0
  }

  // ── Animate card flying off screen, then notify parent ─
  const resolve = (dir) => {
    if (!cardRef.current || !profile) return
    
    const fly  = dir === 'right' ? '150vw' : dir === 'left' ? '-150vw' : '0'
    const rot  = dir === 'right' ? '30deg' : '-30deg'
    const flyY = dir === 'super' ? '-150vh' : '0'

    const card = cardRef.current
    card.style.transition = 'transform 0.4s ease, opacity 0.4s'
    card.style.transform  = `translateX(${fly}) translateY(${flyY}) rotate(${rot})`
    card.style.opacity    = '0'

    // Wait for animation to finish before removing from state
    setTimeout(() => {
      if (onSwipe && profile) {
        onSwipe(profile, dir)
      }
    }, 400)
  }

  // ── Mouse events ───────────────────────────────────────
  const onMouseDown = (e) => {
    e.preventDefault() // Prevent text selection while dragging
    onDragStart(e.clientX)
  }
  const onMouseMove = (e) => {
    e.preventDefault()
    onDragMove(e.clientX)
  }
  const onMouseUp   = ()  => onDragEnd()

  // ── Touch events ───────────────────────────────────────
  const onTouchStart = (e) => {
    e.preventDefault()
    onDragStart(e.touches[0].clientX)
  }
  const onTouchMove  = (e) => {
    e.preventDefault()
    onDragMove(e.touches[0].clientX)
  }
  const onTouchEnd   = ()  => onDragEnd()

  // Safely render tags
  const renderTags = () => {
    if (!tags || tags.length === 0) {
      return <span className="tag">New here</span>
    }
    
    return tags.map(t => {
      // Handle if tag is an object with text property or just a string
      const tagText = typeof t === 'object' ? t.text || t.name || JSON.stringify(t) : t
      return <span className="tag" key={tagText}>{tagText}</span>
    })
  }

  return (
    <div
      ref={cardRef}
      className={`profile-card ${stackClass || ''}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="card-img">{emoji}</div>
      <div className="card-gradient" />
      <div className="card-info">
        <div className="card-name">{name}, {age}</div>
        <div className="card-meta">✦ 2 km away</div>
        <div className="card-bio">{bio}</div>
        <div className="card-tags">
          {renderTags()}
        </div>
      </div>
      <div className="stamp like">LIKE</div>
      <div className="stamp nope">NOPE</div>
    </div>
  )
}