import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FALLBACK, getCountry } from '../data/countries.js'
import { CAR_RENTAL } from '../data/poi.js'
import { PROMO_CODE } from '../lib/budget.js'
import { DEFAULT_DAYS, daysBetween, isoDate } from '../lib/format.js'
import { useAuth } from '../context/authContext.js'
import { useToast } from '../context/toastContext.js'
import { useTrip } from '../context/tripContext.js'

const TABS = {
  flight: { icon: '✈️', name: 'Zbor', start: 'Plecare', end: 'Întoarcere' },
  hotel: { icon: '🏨', name: 'Cazare', start: 'Check-in', end: 'Check-out' },
  car: { icon: '🚗', name: 'Mașină', start: 'Preluare', end: 'Returnare' },
}

export default function PlannerForm() {
  const navigate = useNavigate()
  const toast = useToast()
  const { requireAuth } = useAuth()
  const { chooseCountry, setBudget, setPois } = useTrip()

  const [tab, setTab] = useState('flight')
  const [trip, setTrip] = useState('rt')
  const [form, setForm] = useState(() => ({
    from: 'București', dest: 'IT', d1: isoDate(14), d2: isoDate(19), pax: '2', promo: '',
  }))
  const [showPromo, setShowPromo] = useState(false)

  const labels = TABS[tab]
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  function handleStartChange(e) {
    const d1 = e.target.value
    setForm({ ...form, d1, d2: form.d2 < d1 ? d1 : form.d2 })
  }

  function handleSubmit(event) {
    event.preventDefault()
    const promo = form.promo.trim().toUpperCase()
    if (promo && promo !== PROMO_CODE) return toast(`Cod promoțional invalid. Încearcă ${PROMO_CODE}.`)

    const run = () => {
      const days = trip === 'ow' ? DEFAULT_DAYS : daysBetween(form.d1, form.d2)
      chooseCountry(getCountry(form.dest))
      setBudget((b) => ({ ...b, days, travelers: Number(form.pax), promo }))
      if (tab === 'car') setPois([CAR_RENTAL])
      navigate('/puncte-interes')
    }
    requireAuth(run, 'Creează un cont ca să continui rezervarea.')
  }

  return (
    <form className="planner" onSubmit={handleSubmit}>
      <h2>Planifică o călătorie</h2>
      <div className="seg" role="tablist">
        {Object.entries(TABS).map(([key, t]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key}
            className={tab === key ? 'on' : ''} onClick={() => setTab(key)}>
            {t.icon} {t.name}
          </button>
        ))}
      </div>
      <div className="trip">
        <label><input type="radio" name="trip" value="rt" checked={trip === 'rt'} onChange={() => setTrip('rt')} /> Dus-întors</label>
        <label><input type="radio" name="trip" value="ow" checked={trip === 'ow'} onChange={() => setTrip('ow')} /> Dus</label>
      </div>
      <div className="pgrid">
        {tab === 'flight' && (
          <label className="sf full">Orașul de plecare
            <input name="from" value={form.from} onChange={update('from')} />
          </label>
        )}
        <label className="sf full">Destinația
          <select name="dest" value={form.dest} onChange={update('dest')}>
            {FALLBACK.map((c) => <option key={c.cca2} value={c.cca2}>{c.name.common}</option>)}
          </select>
        </label>
        <label className="sf"><span>{labels.start}</span>
          <input type="date" name="d1" required min={isoDate(0)} value={form.d1} onChange={handleStartChange} />
        </label>
        {trip === 'rt' && (
          <label className="sf"><span>{labels.end}</span>
            <input type="date" name="d2" min={form.d1} value={form.d2} onChange={update('d2')} />
          </label>
        )}
        <label className="sf full">Pasageri
          <select name="pax" value={form.pax} onChange={update('pax')}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
      </div>
      <div className="srow2">
        <button type="button" className="link" onClick={() => setShowPromo((s) => !s)}>Ai un cod promoțional?</button>
        {showPromo && (
          <input name="promo" placeholder={PROMO_CODE} aria-label="Cod promoțional" autoFocus
            value={form.promo} onChange={update('promo')} />
        )}
      </div>
      <button className="btn lime" type="submit">Începe planificarea &rsaquo;</button>
    </form>
  )
}
