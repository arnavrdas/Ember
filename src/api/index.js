// src/api/index.js
// ─────────────────────────────────────────────────────────
// All network calls live here. Components never call fetch() directly.
// Change BASE_URL to point at your running backend.
// ─────────────────────────────────────────────────────────

const BASE_URL = 'http://localhost:5000/api'  // ← your Express server

// ── Core fetch wrapper ───────────────────────────────────
// Every request goes through here so error handling is consistent.
async function request(method, path, body) {
  const token = localStorage.getItem('token')

  const res = await fetch(BASE_URL + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })

  const data = await res.json()

  // If the server responded with an error status, throw it
  // so the calling component can catch it and show a message.
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong')
  }

  return data
}

// ── Auth ─────────────────────────────────────────────────
export const authAPI = {
  // POST /api/auth/register  →  { _id, name, email, age, avatar, token }
  register: (name, email, password, age) =>
    request('POST', '/auth/register', { name, email, password, age }),

  // POST /api/auth/login  →  { _id, name, email, age, avatar, token }
  login: (email, password) =>
    request('POST', '/auth/login', { email, password }),

  // GET /api/auth/me  →  current user object
  me: () => request('GET', '/auth/me'),
}

// ── Profiles ─────────────────────────────────────────────
export const profilesAPI = {
  // GET /api/profiles  →  array of user profiles for Discover
  getAll: () => request('GET', '/profiles'),

  // PUT /api/profiles/me  →  updated user object
  updateMe: (fields) => request('PUT', '/profiles/me', fields),
}

// ── Swipe & Matches ──────────────────────────────────────
export const swipeAPI = {
  // POST /api/users/:targetId/like
  like: (targetId) => request('POST', `/users/${targetId}/like`),

  // POST /api/users/:targetId/pass
  pass: (targetId) => request('POST', `/users/${targetId}/pass`),

  // GET /api/users/potential-matches
  getPotentialMatches: () => request('GET', '/users/potential-matches'),

  // GET /api/matches
  getMatches: () => request('GET', '/matches'),

  // POST /api/swipe
  swipe: (targetId, direction) => {
    // Map directions to the new endpoints
    if (direction === 'left') {
      return swipeAPI.pass(targetId)
    } else if (direction === 'right' || direction === 'super') {
      return swipeAPI.like(targetId)
    }
    throw new Error('Invalid swipe direction')
  },
}

// ── Messages ─────────────────────────────────────────────
export const messagesAPI = {
  // POST /api/messages  →  saved message object
  send: (toId, text) =>
    request('POST', '/messages', { toId, text }),

  // GET /api/messages/:userId  →  array of messages
  getConversation: (userId) =>
    request('GET', `/messages/${userId}`),
}