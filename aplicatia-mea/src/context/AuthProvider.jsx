import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AuthContext } from './authContext.js'
import useLocalStorage from '../hooks/useLocalStorage.js'
import { hashPassword } from '../lib/password.js'

export default function AuthProvider({ children }) {
  const [users, setUsers] = useLocalStorage('users', [])
  const [user, setUser] = useLocalStorage('currentUser', null)
  const [dialog, setDialog] = useState({ open: false, tab: 'login', note: '' })
  const pending = useRef(null) // acțiune de executat după autentificare

  // După autentificare rulăm acțiunea care a cerut contul (ex.: alegerea destinației)
  useEffect(() => {
    if (user && pending.current) {
      const run = pending.current
      pending.current = null
      run()
    }
  }, [user])

  const openAuth = useCallback((tab = 'login', note = '') => setDialog({ open: true, tab, note }), [])
  const setTab = useCallback((tab) => setDialog((d) => ({ ...d, tab })), [])
  const closeAuth = useCallback(() => setDialog((d) => (d.open ? { ...d, open: false } : d)), [])
  const dismissAuth = useCallback(() => {
    pending.current = null
    closeAuth()
  }, [closeAuth])

  // Rulează acțiunea acum dacă ești autentificat, altfel deschide formularul de cont
  const requireAuth = useCallback(
    (action, note = '') => {
      if (user) return action()
      pending.current = action
      setDialog({ open: true, tab: 'register', note })
    },
    [user],
  )

  function register(name, email, pass) {
    if (users.some((u) => u.email === email)) {
      return { ok: false, msg: 'Există deja un cont cu acest email. Autentifică-te.' }
    }
    setUsers([...users, { name, email, pass: hashPassword(pass) }])
    setUser({ name, email })
    return { ok: true }
  }

  function login(email, pass) {
    const found = users.find((u) => u.email === email && u.pass === hashPassword(pass))
    if (!found) return { ok: false, msg: 'Email sau parolă incorecte. Verifică datele și încearcă din nou.' }
    setUser({ name: found.name, email: found.email })
    return { ok: true }
  }

  const logout = () => setUser(null)

  const value = useMemo(
    () => ({ user, dialog, openAuth, setTab, closeAuth, dismissAuth, requireAuth, register, login, logout }),
    // register/login/logout depind doar de users și user
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, users, dialog, openAuth, setTab, closeAuth, dismissAuth, requireAuth],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
