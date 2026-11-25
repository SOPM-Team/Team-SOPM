import EmptyState from '../components/EmptyState.jsx'
import Guard from '../components/Guard.jsx'
import usePageTitle from '../hooks/usePageTitle.js'
import useLocalStorage from '../hooks/useLocalStorage.js'
import { eur } from '../lib/format.js'
import { useAuth } from '../context/authContext.js'

export default function BookingsPage() {
  usePageTitle('Rezervările mele')
  const { user } = useAuth()
  const [bookings] = useLocalStorage('bookings', [])
  const mine = bookings.filter((b) => b.user === user?.email).reverse()

  return (
    <Guard text="Rezervările sunt legate de contul tău.">
      <section className="page-head"><div className="wrap"><h1>Rezervările mele</h1></div></section>
      <div className="wrap section" style={{ paddingTop: 40 }}>
        {mine.length ? (
          <div className="grid">
            {mine.map((b) => (
              <article className="country" key={b.id}>
                <div className="flag" style={{ backgroundImage: `url('${b.flag}')` }} />
                <div className="body">
                  <h3>{b.country}</h3>
                  <div className="chips"><span className="chip">{b.id}</span><span className="chip">{b.status}</span></div>
                  <p className="muted">{b.days} zile · {b.travelers} pers. · {new Date(b.date).toLocaleDateString('ro-RO')}</p>
                  <b style={{ fontSize: '1.3rem' }}>{eur(b.total)}</b>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState title="Nu ai nicio rezervare încă" text="După ce plătești, rezervarea apare aici." to="/#destinatii" cta="Alege o destinație" />
        )}
      </div>
    </Guard>
  )
}
