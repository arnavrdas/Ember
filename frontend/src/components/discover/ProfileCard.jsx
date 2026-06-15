// src/components/discover/ProfileCard.jsx
// ─────────────────────────────────────────────────────────
// A single swipeable card. Touch events are attached via
// useEffect with { passive: false } so preventDefault works
// (React's synthetic onTouchStart/Move are passive by default
// in modern browsers, which prevents preventDefault).
// ─────────────────────────────────────────────────────────
import { useRef, useEffect } from 'react'

export default function ProfileCard({ profile, stackClass, onSwipe }) {
  const cardRef  = useRef(null)
  const startX   = useRef(0)
  const curX     = useRef(0)
  const dragging = useRef(false)

  const {
    name = 'Anonymous',
    age  = '?',
    bio  = 'No bio available',
    emoji = '👤',
    tags  = [],
  } = profile || {}

  // ── Shared drag logic ───────────────────────────────────
  const onDragStart = (clientX) => {
    startX.current   = clientX
    dragging.current = true
    cardRef.current?.classList.add('dragging')
  }

  const onDragMove = (clientX) => {
    if (!dragging.current || !cardRef.current) return
    curX.current = clientX - startX.current
    const card = cardRef.current
    card.style.transform = `translateX(${curX.current}px) rotate(${curX.current * 0.04}deg)`
    const likeStamp = card.querySelector('.stamp.like')
    const nopeStamp = card.querySelector('.stamp.nope')
    if (likeStamp) likeStamp.style.opacity = Math.max(0,  curX.current / 80)
    if (nopeStamp) nopeStamp.style.opacity = Math.max(0, -curX.current / 80)
  }

  const onDragEnd = () => {
    if (!dragging.current || !cardRef.current) return
    dragging.current = false
    cardRef.current.classList.remove('dragging')
    if      (curX.current >  80) resolve('right')
    else if (curX.current < -80) resolve('left')
    else {
      cardRef.current.style.transform = ''
      const likeStamp = cardRef.current.querySelector('.stamp.like')
      const nopeStamp = cardRef.current.querySelector('.stamp.nope')
      if (likeStamp) likeStamp.style.opacity = 0
      if (nopeStamp) nopeStamp.style.opacity = 0
    }
    curX.current = 0
  }

  // ── Animate off screen, then notify parent ───────────────
  const resolve = (dir) => {
    if (!cardRef.current || !profile) return
    const fly  = dir === 'right' ? '150vw' : dir === 'left' ? '-150vw' : '0'
    const rot  = dir === 'right' ? '30deg' : '-30deg'
    const flyY = dir === 'super' ? '-150vh' : '0'
    const card = cardRef.current
    card.style.transition = 'transform 0.4s ease, opacity 0.4s'
    card.style.transform  = `translateX(${fly}) translateY(${flyY}) rotate(${rot})`
    card.style.opacity    = '0'
    setTimeout(() => { if (onSwipe && profile) onSwipe(profile, dir) }, 400)
  }

  // ── Mouse events (synthetic is fine — no passive issue) ──
  const onMouseDown  = (e) => { e.preventDefault(); onDragStart(e.clientX) }
  const onMouseMove  = (e) => { e.preventDefault(); onDragMove(e.clientX) }
  const onMouseUp    = ()  => onDragEnd()

  // ── Attach touch events imperatively with { passive: false } ──
  // React registers synthetic touch listeners as passive in modern
  // browsers, which means calling e.preventDefault() throws a warning
  // and is silently ignored — breaking the swipe-scroll prevention.
  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleTouchStart = (e) => {
      e.preventDefault()
      onDragStart(e.touches[0].clientX)
    }
    const handleTouchMove = (e) => {
      e.preventDefault()
      onDragMove(e.touches[0].clientX)
    }
    const handleTouchEnd = () => onDragEnd()

    card.addEventListener('touchstart', handleTouchStart, { passive: false })
    card.addEventListener('touchmove',  handleTouchMove,  { passive: false })
    card.addEventListener('touchend',   handleTouchEnd)

    return () => {
      card.removeEventListener('touchstart', handleTouchStart)
      card.removeEventListener('touchmove',  handleTouchMove)
      card.removeEventListener('touchend',   handleTouchEnd)
    }
  // Re-attach if the profile changes (card re-renders with new profile)
  }, [profile?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const renderTags = () => {
    if (!tags || tags.length === 0) return <span className="tag">New here</span>
    return tags.map(t => {
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
      // Touch events handled via imperative listeners above
    >
      <div className="card-img">{emoji}</div>
      <div className="card-gradient" />
      <div className="card-info">
        <div className="card-name">{name}, {age}</div>
        <div className="card-meta">✦ 2 km away</div>
        <div className="card-bio">{bio}</div>
        <div className="card-tags">{renderTags()}</div>
      </div>
      <div className="stamp like">LIKE</div>
      <div className="stamp nope">NOPE</div>
    </div>
  )
}
