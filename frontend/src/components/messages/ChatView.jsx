// src/components/messages/ChatView.jsx
// ─────────────────────────────────────────────────────────
// Real-time chat view with typing indicators, read receipts,
// and chat history loaded from the REST API.
// ─────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback } from 'react'
import './Messages.css'
import { useApp } from '../../context/AppContext'
import { messagesAPI } from '../../api/index'

// Debounce helper — fires fn after `wait` ms of silence
function useDebounce(fn, wait) {
  const timer = useRef(null)
  return useCallback((...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), wait)
  }, [fn, wait])
}

export default function ChatView() {
  const {
    activeChatUser,
    setActiveChatUser,
    conversations,
    addMessage,
    setConversations,
    onlineUsers,
    typingUsers,
    sendSocketMessage,
    markMessagesRead,
    emitTyping,
  } = useApp()

  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const listRef    = useRef(null)
  const inputRef   = useRef(null)
  const isTypingRef = useRef(false)

  const userId   = activeChatUser?.id || activeChatUser?._id
  const messages = conversations[userId] || []
  const isOnline = onlineUsers.has(userId)
  const isTyping = typingUsers[userId] || false

  // ── Load conversation history via REST on open ───────────
  useEffect(() => {
    if (!userId) return
    setHistoryLoaded(false)

    const loadHistory = async () => {
      try {
        const history = await messagesAPI.getConversation(userId)
        // Bulk-replace the thread so REST history never duplicates socket messages
        const normalized = history.map(msg => ({
          _id:       msg._id,
          from:      msg.from === userId ? 'them' : 'me',
          text:      msg.text,
          read:      msg.read,
          createdAt: msg.createdAt,
        }))
        setConversations(prev => ({ ...prev, [userId]: normalized }))
      } catch (err) {
        console.error('Failed to load messages:', err.message)
      } finally {
        setHistoryLoaded(true)
      }
    }

    // Always reload from REST when opening a chat to get the authoritative history
    loadHistory()

    // Mark unread messages from this user as read
    markMessagesRead(userId)

    return () => {
      // Stop typing when leaving the chat
      if (isTypingRef.current) {
        emitTyping(userId, false)
        isTypingRef.current = false
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // ── Auto-scroll to bottom on new messages ────────────────
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, isTyping])

  // ── Typing indicator logic ───────────────────────────────
  const stopTyping = useDebounce(() => {
    if (isTypingRef.current) {
      emitTyping(userId, false)
      isTypingRef.current = false
    }
  }, 1500)

  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (!isTypingRef.current) {
      emitTyping(userId, true)
      isTypingRef.current = true
    }
    stopTyping()
  }

  // ── Send via Socket.io ────────────────────────────────────
  const sendMessage = () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')

    // Stop typing indicator
    if (isTypingRef.current) {
      emitTyping(userId, false)
      isTypingRef.current = false
    }

    // Send over socket (AppContext handles optimistic update via message:sent event)
    sendSocketMessage(userId, text)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Format timestamp
  const formatTime = (ts) => {
    if (!ts) return ''
    const d = new Date(ts)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="chat-view">
      {/* ── Header ── */}
      <div className="chat-header">
        <button className="icon-btn" onClick={() => setActiveChatUser(null)}>←</button>
        <div className="chat-header-avatar">
          {activeChatUser.avatar || activeChatUser.emoji || '😊'}
        </div>
        <div className="chat-header-info">
          <div className="chat-header-name">{activeChatUser.name}</div>
          <div className={`chat-header-status ${isOnline ? 'status-online' : 'status-offline'}`}>
            {isOnline ? '● Active now' : '○ Offline'}
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="messages-list" ref={listRef}>
        {!historyLoaded ? (
          <div className="chat-loading">
            <div className="chat-loading-dots">
              <span /><span /><span />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-empty">
            You matched with <strong>{activeChatUser.name}</strong>! Say hello 👋
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.from === 'me'
            const showTime = i === messages.length - 1 ||
              messages[i + 1]?.from !== msg.from

            return (
              <div key={msg._id || i} className={`msg-wrapper ${isMe ? 'me' : 'them'}`}>
                <div className={`msg ${isMe ? 'me' : 'them'}`}>
                  {msg.text}
                </div>
                {showTime && (
                  <div className="msg-meta">
                    <span className="msg-time">{formatTime(msg.createdAt)}</span>
                    {isMe && (
                      <span className={`msg-read-receipt ${msg.read ? 'read' : 'sent'}`}>
                        {msg.read ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="msg-wrapper them">
            <div className="msg them typing-bubble">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
      </div>

      {/* ── Input ── */}
      <div className="chat-input-row">
        <input
          ref={inputRef}
          className="chat-input"
          type="text"
          placeholder="Say something warm…"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoFocus
        />
        <button
          className="send-btn"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  )
}
