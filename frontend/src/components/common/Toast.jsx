// src/components/common/Toast.jsx
import './Toast.css'
import { useApp } from '../../context/AppContext'

export default function Toast() {
  const { toast } = useApp()
  // toast can be a plain string (legacy) or { msg, type } (new shape)
  const message = toast?.msg ?? toast
  const type    = toast?.type ?? 'info'
  return (
    <div className={`toast ${toast ? 'show' : ''} toast-${type}`}>
      {message}
    </div>
  )
}
