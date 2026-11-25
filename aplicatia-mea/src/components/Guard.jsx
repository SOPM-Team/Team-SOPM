import EmptyState from './EmptyState.jsx'
import { useAuth } from '../context/authContext.js'
import { useTrip } from '../context/tripContext.js'

// Protejează o pagină: cere cont și, opțional, o destinație aleasă
export default function Guard({ text, needCountry = false, children }) {
  const { user, openAuth } = useAuth()
  const { country } = useTrip()

  if (!user) {
    return (
      <div className="wrap section">
        <EmptyState title="Autentifică-te ca să continui" text={text} cta="Autentificare" onClick={() => openAuth('login')} />
      </div>
    )
  }
  if (needCountry && !country) {
    return (
      <div className="wrap section">
        <EmptyState title="Alege mai întâi o destinație" text={text} to="/#destinatii" cta="Vezi destinațiile" />
      </div>
    )
  }
  return children
}
