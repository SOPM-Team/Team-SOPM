import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authContext.js'

const LINKS = [
  { to: '/#destinatii', label: 'Destinații', path: '/' },
  { to: '/zboruri', label: 'Zboruri', path: '/zboruri' },
  { to: '/puncte-interes', label: 'Puncte de interes', path: '/puncte-interes' },
  { to: '/buget', label: 'Buget', path: '/buget' },
  { to: '/rezervari', label: 'Rezervări', path: '/rezervari' },
  { to: '/#faq', label: 'Ajutor' },
]

export default function Navbar() {
  const { user, logout, openAuth } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Link className="logo" to="/">Voyago<i></i></Link>
        <nav aria-label="Navigare principală">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={l.path === pathname ? 'on' : ''}
              aria-current={l.path === pathname ? 'page' : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="nav-user">
          {user ? (
            <>
              <span>Salut, {user.name.split(' ')[0]}</span>
              <button type="button" className="btn ghost sm" onClick={handleLogout}>Ieși din cont</button>
            </>
          ) : (
            <button type="button" className="btn sm" onClick={() => openAuth('login')}>Conectează-te</button>
          )}
        </div>
      </div>
    </header>
  )
}
