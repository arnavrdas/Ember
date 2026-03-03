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

  // ── Shared drag logic ──────────────────────────────────
  const onDragStart = (clientX) => {
    startX.current   = clientX
    dragging.current = true
    cardRef.current.classList.add('dragging')
  }

  const onDragMove = (clientX) => {
    if (!dragging.current) return
    curX.current = clientX - startX.current
    const card = cardRef.current
    card.style.transform = `translateX(${curX.current}px) rotate(${curX.current * 0.04}deg)`
    card.querySelector('.stamp.like').style.opacity = Math.max(0, curX.current / 80)
    card.querySelector('.stamp.nope').style.opacity = Math.max(0, -curX.current / 80)
  }

  const onDragEnd = () => {
    if (!dragging.current) return
    dragging.current = false
    cardRef.current.classList.remove('dragging')

    if      (curX.current >  80) resolve('right')
    else if (curX.current < -80) resolve('left')
    else {
      // Snap back to center
      cardRef.current.style.transform = ''
      cardRef.current.querySelector('.stamp.like').style.opacity = 0
      cardRef.current.querySelector('.stamp.nope').style.opacity = 0
    }
    curX.current = 0
  }

  // ── Animate card flying off screen, then notify parent ─
  const resolve = (dir) => {
    const fly  = dir === 'right' ? '150vw' : dir === 'left' ? '-150vw' : '0'
    const rot  = dir === 'right' ? '30deg' : '-30deg'
    const flyY = dir === 'super' ? '-150vh' : '0'

    const card = cardRef.current
    card.style.transition = 'transform 0.4s ease, opacity 0.4s'
    card.style.transform  = `translateX(${fly}) translateY(${flyY}) rotate(${rot})`
    card.style.opacity    = '0'

    // Wait for animation to finish before removing from state
    setTimeout(() => onSwipe(profile, dir), 400)
  }

  // ── Mouse events ───────────────────────────────────────
  const onMouseDown = (e) => onDragStart(e.clientX)
  const onMouseMove = (e) => onDragMove(e.clientX)
  const onMouseUp   = ()  => onDragEnd()

  // ── Touch events ───────────────────────────────────────
  const onTouchStart = (e) => onDragStart(e.touches[0].clientX)
  const onTouchMove  = (e) => onDragMove(e.touches[0].clientX)
  const onTouchEnd   = ()  => onDragEnd()

  return (
    <div
      ref={cardRef}
      className={`profile-card ${stackClass}`}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="card-img">{profile.emoji}</div>
      <div className="card-gradient" />
      <div className="card-info">
        <div className="card-name">{profile.name}, {profile.age}</div>
        <div className="card-meta">✦ 2 km away</div>
        <div className="card-bio">{profile.bio}</div>
        <div className="card-tags">
          {profile.tags.map(t => <span className="tag" key={t}>{t}</span>)}
        </div>
      </div>
      <div className="stamp like">LIKE</div>
      <div className="stamp nope">NOPE</div>
    </div>
  )
}
