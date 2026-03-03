// src/components/auth/AuthScreen.jsx
import { useState } from 'react'
import './AuthScreen.css'
import { useApp } from '../../context/AppContext'
import { authAPI } from '../../api/index'

export default function AuthScreen() {
  const { setCurrentUser, loadAppData } = useApp()
  const [tab, setTab] = useState('login') // 'login' | 'register'

  // Called by both forms on success: store token, set user, load data
  const handleSuccess = async (data) => {
    localStorage.setItem('token', data.token)
    setCurrentUser({ id: data._id, name: data.name, avatar: data.avatar, email: data.email })
    await loadAppData()
  }

  return (
    <div className="auth-screen">
      <div className="logo">Ember</div>
      <div className="tagline">Find your spark</div>

      <div className="auth-card">
        <div className="tabs">
          <button className={`tab ${tab === 'login'    ? 'active' : ''}`} onClick={() => setTab('login')}>Sign In</button>
          <button className={`tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Join Now</button>
        </div>

        {tab === 'login'
          ? <LoginForm    onSuccess={handleSuccess} />
          : <RegisterForm onSuccess={handleSuccess} />
        }
      </div>
    </div>
  )
}

// ── Login Form ───────────────────────────────────────────
function LoginForm({ onSuccess }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return }
    setError('')
    setLoading(true)
    try {
      const data = await authAPI.login(email, password)
      await onSuccess(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form">
      {error && <div className="auth-error">{error}</div>}
      <div className="input-group">
        <label>Email</label>
        <input type="email" placeholder="you@example.com"
          value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="input-group">
        <label>Password</label>
        <input type="password" placeholder="••••••••"
          value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
      </div>
      <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Signing in…' : 'Light the Flame ✦'}
      </button>
    </div>
  )
}

// ── Register Form ────────────────────────────────────────
function RegisterForm({ onSuccess }) {
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [age,      setAge]      = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async () => {
    if (!name || !email || !password || !age) { setError('Please fill in all fields'); return }
    setError('')
    setLoading(true)
    try {
      const data = await authAPI.register(name, email, password, Number(age))
      await onSuccess(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-form">
      {error && <div className="auth-error">{error}</div>}
      <div className="input-group">
        <label>Full Name</label>
        <input type="text" placeholder="Your name"
          value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="input-group">
        <label>Email</label>
        <input type="email" placeholder="you@example.com"
          value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <div className="input-group">
        <label>Password</label>
        <input type="password" placeholder="Create a password"
          value={password} onChange={e => setPassword(e.target.value)} />
      </div>
      <div className="input-group">
        <label>Age</label>
        <input type="number" placeholder="25" min="18" max="99"
          value={age} onChange={e => setAge(e.target.value)} />
      </div>
      <button className="auth-btn" onClick={handleSubmit} disabled={loading}>
        {loading ? 'Creating account…' : 'Start Your Story ✦'}
      </button>
    </div>
  )
}
