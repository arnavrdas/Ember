// src/hooks/useSocket.js
import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

const SOCKET_URL = 'http://localhost:5000'

export function useSocket({ token, onMessage, onMessageSent, onReadAck, onTyping, onOnline, onOffline, onOnlineList, onNewMatch }) {
  const socketRef = useRef(null)

  useEffect(() => {
    if (!token) return

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socketRef.current = socket

    socket.on('connect',       () => console.log('🔌 Socket connected:', socket.id))
    socket.on('disconnect',    (r) => console.log('🔌 Socket disconnected:', r))
    socket.on('connect_error', (e) => console.error('🔌 Socket error:', e.message))

    socket.on('message:receive',  (msg)  => onMessage?.(msg))
    socket.on('message:sent',     (msg)  => onMessageSent?.(msg))
    socket.on('message:read:ack', (data) => onReadAck?.(data))
    socket.on('typing',           (data) => onTyping?.(data))
    socket.on('user:online',      (data) => onOnline?.(data))
    socket.on('user:offline',     (data) => onOffline?.(data))
    socket.on('online:list',      (ids)  => onOnlineList?.(ids))
    socket.on('match:new',        (data) => onNewMatch?.(data))
    socket.on('error',            (err)  => console.error('Socket server error:', err.message))

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const sendMessage = useCallback((toId, text) => {
    socketRef.current?.emit('message:send', { toId, text })
  }, [])

  const markRead = useCallback((fromId) => {
    socketRef.current?.emit('message:read', { fromId })
  }, [])

  const sendTyping = useCallback((toId, isTyping) => {
    socketRef.current?.emit('typing', { toId, isTyping })
  }, [])

  return { sendMessage, markRead, sendTyping }
}
