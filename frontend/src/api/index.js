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
  // POST /api/swipe  →  { matched: bool, matchedUser?: { _id, name, avatar } }
  swipe: (targetId, direction) =>
    request('POST', '/swipe', { targetId, direction }),

  // GET /api/matches  →  array of matched user objects
  getMatches: () => request('GET', '/matches'),
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
