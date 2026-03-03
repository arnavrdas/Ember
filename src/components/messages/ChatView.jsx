// src/components/messages/ChatView.jsx
// ─────────────────────────────────────────────────────────
// Full-screen chat with a specific matched user.
// Loads conversation history from the API on open, then sends
// new messages via the API on submit.
// ─────────────────────────────────────────────────────────
import { useState, useEffect, useRef } from 'react'
import './Messages.css'
import { useApp } from '../../context/AppContext'
import { messagesAPI } from '../../api/index'

export default function ChatView() {
  const { activeChatUser, setActiveChatUser, conversations, addMessage } = useApp()
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const listRef = useRef(null)

  const messages = conversations[activeChatUser?.id] || []

  // Load conversation history when the chat opens
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await messagesAPI.getConversation(activeChatUser.id)
        // Map API response to our local format: { from: 'me'|'them', text }
        history.forEach(msg => {
          const from = msg.from === activeChatUser.id ? 'them' : 'me'
          addMessage(activeChatUser.id, { from, text: msg.text })
        })
      } catch (err) {
        console.error('Failed to load messages:', err.message)
      }
    }
    // Only fetch if we don't already have messages loaded locally
    if (!conversations[activeChatUser?.id]) {
      loadHistory()
    }
  }, [activeChatUser?.id])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  const sendMessage = async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    // Optimistic update: show the message immediately before API confirms
    addMessage(activeChatUser.id, { from: 'me', text })

    setLoading(true)
    try {
      await messagesAPI.send(activeChatUser.id, text)
    } catch (err) {
      console.error('Failed to send message:', err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="chat-view">
      {/* Header */}
      <div className="chat-header">
        <button className="icon-btn" onClick={() => setActiveChatUser(null)}>←</button>
        <div className="chat-header-avatar">
          {activeChatUser.avatar || activeChatUser.emoji || '😊'}
        </div>
        <div className="chat-header-info">
          <div className="chat-header-name">{activeChatUser.name}</div>
          <div className="chat-header-status">● Active now</div>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-list" ref={listRef}>
        {messages.length === 0 ? (
          <div className="chat-empty">
            You matched with <strong>{activeChatUser.name}</strong>! Say hello 👋
          </div>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`msg ${msg.from === 'me' ? 'me' : 'them'}`}>
              {msg.text}
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="chat-input-row">
        <input
          className="chat-input"
          type="text"
          placeholder="Say something warm…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          autoFocus
        />
        <button className="send-btn" onClick={sendMessage} disabled={loading}>➤</button>
      </div>
    </div>
  )
}
