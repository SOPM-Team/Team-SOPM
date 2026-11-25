import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../context/authContext.js'
import { useToast } from '../context/toastContext.js'

function LoginForm() {
  const { login, closeAuth } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ email: '', pass: '' })
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const result = login(form.email.trim().toLowerCase(), form.pass)
    if (!result.ok) return setError(result.msg)
    toast('Ești autentificat. Spor la planificat!')
    closeAuth()
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="field">Email
        <input type="email" required autoComplete="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </label>
      <label className="field">Parolă
        <input type="password" required autoComplete="current-password" value={form.pass}
          onChange={(e) => setForm({ ...form, pass: e.target.value })} />
      </label>
      <p className="err" role="alert">{error}</p>
      <button className="btn" type="submit">Intră în cont</button>
    </form>
  )
}

function RegisterForm() {
  const { register, closeAuth } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ name: '', email: '', pass: '' })
  const [error, setError] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    if (form.pass.length < 6) return setError('Parola trebuie să aibă minimum 6 caractere.')
    const result = register(form.name.trim(), form.email.trim().toLowerCase(), form.pass)
    if (!result.ok) return setError(result.msg)
    toast('Ești autentificat. Spor la planificat!')
    closeAuth()
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="field">Nume complet
        <input type="text" required autoComplete="name" value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </label>
      <label className="field">Email
        <input type="email" required autoComplete="email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </label>
      <label className="field">Parolă (minimum 6 caractere)
        <input type="password" required minLength={6} autoComplete="new-password" value={form.pass}
          onChange={(e) => setForm({ ...form, pass: e.target.value })} />
      </label>
      <p className="err" role="alert">{error}</p>
      <button className="btn" type="submit">Creează contul</button>
    </form>
  )
}

export default function AuthDialog() {
  const { dialog, setTab, closeAuth, dismissAuth } = useAuth()
  const ref = useRef(null)

  // Sincronizăm elementul <dialog> nativ cu starea din context
  useEffect(() => {
    const el = ref.current
    if (dialog.open && !el.open) el.showModal()
    if (!dialog.open && el.open) el.close()
  }, [dialog.open])

  return (
    <dialog ref={ref} aria-labelledby="auth-title" onCancel={dismissAuth} onClose={closeAuth}>
      <button type="button" className="close" aria-label="Închide" onClick={dismissAuth}>&times;</button>
      <h2 id="auth-title" style={{ fontSize: '1.8rem' }}>Bine ai venit</h2>
      <p className="muted">{dialog.note}</p>
      <div className="tabs" role="tablist">
        <button type="button" role="tab" aria-selected={dialog.tab === 'login'}
          className={dialog.tab === 'login' ? 'on' : ''} onClick={() => setTab('login')}>Autentificare</button>
        <button type="button" role="tab" aria-selected={dialog.tab === 'register'}
          className={dialog.tab === 'register' ? 'on' : ''} onClick={() => setTab('register')}>Cont nou</button>
      </div>
      {/* Formularele se montează doar când dialogul e deschis, deci câmpurile se golesc la fiecare deschidere */}
      {dialog.open && (dialog.tab === 'login' ? <LoginForm key="login" /> : <RegisterForm key="register" />)}
    </dialog>
  )
}
