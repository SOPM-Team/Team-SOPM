import { useCallback, useEffect, useRef, useState } from 'react'
import { ToastContext } from './toastContext.js'

export default function ToastProvider({ children }) {
  const [message, setMessage] = useState('')
  const timer = useRef(null)

  const toast = useCallback((text) => {
    clearTimeout(timer.current)
    setMessage(text)
    timer.current = setTimeout(() => setMessage(''), 2600)
  }, [])

  useEffect(() => () => clearTimeout(timer.current), [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div role="status">{message && <div className="toast">{message}</div>}</div>
    </ToastContext.Provider>
  )
}
