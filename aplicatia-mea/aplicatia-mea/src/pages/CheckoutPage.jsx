import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Guard from '../components/Guard.jsx'
import usePageTitle from '../hooks/usePageTitle.js'
import useLocalStorage from '../hooks/useLocalStorage.js'
import { calcBudget, totalOf, withDefaults } from '../lib/budget.js'
import { formatCardNumber, formatExpiry, newBookingId, validatePayment, validateTravelers } from '../lib/checkout.js'
import { eur } from '../lib/format.js'
import { useAuth } from '../context/authContext.js'
import { useTrip } from '../context/tripContext.js'

const METHODS = {
  card: ['💳', 'Card bancar', 'Visa sau Mastercard'],
  paypal: ['🅿️', 'PayPal', 'Plătești cu contul tău'],
  bank: ['🏦', 'Transfer bancar', 'Rezervarea se confirmă după plată'],
}
const STEPS = ['Călători', 'Plată', 'Confirmare']

function TravelersStep({ data, onChange }) {
  const setPerson = (i, field, value) =>
    onChange({ people: data.people.map((p, idx) => (idx === i ? { ...p, [field]: value } : p)) })
  return (
    <>
      <h2>Datele călătorilor</h2>
      {data.people.map((p, i) => (
        <div className="two" key={i}>
          <label className="field">Prenume (călător {i + 1})
            <input value={p.first} onChange={(e) => setPerson(i, 'first', e.target.value)} />
          </label>
          <label className="field">Nume
            <input value={p.last} onChange={(e) => setPerson(i, 'last', e.target.value)} />
          </label>
        </div>
      ))}
      <div className="two">
        <label className="field">Email de contact
          <input type="email" value={data.email} onChange={(e) => onChange({ email: e.target.value })} />
        </label>
        <label className="field">Telefon
          <input type="tel" value={data.phone} placeholder="07xx xxx xxx" onChange={(e) => onChange({ phone: e.target.value })} />
        </label>
      </div>
    </>
  )
}

function PaymentStep({ data, onChange }) {
  const setCard = (field, value) => onChange({ card: { ...data.card, [field]: value } })
  return (
    <>
      <h2>Metoda de plată</h2>
      <div className="methods">
        {Object.entries(METHODS).map(([key, [icon, title, desc]]) => (
          <label key={key} className={data.method === key ? 'method on' : 'method'}>
            <input type="radio" name="method" value={key} checked={data.method === key} onChange={() => onChange({ method: key })} />
            <span className="mi">{icon}</span>
            <span><b>{title}</b><small>{desc}</small></span>
          </label>
        ))}
      </div>
      {data.method === 'card' && (
        <>
          <label className="field">Numele de pe card
            <input value={data.card.name} autoComplete="cc-name" onChange={(e) => setCard('name', e.target.value)} />
          </label>
          <label className="field">Număr card
            <input value={data.card.num} inputMode="numeric" maxLength={19} placeholder="0000 0000 0000 0000"
              autoComplete="cc-number" onChange={(e) => setCard('num', formatCardNumber(e.target.value))} />
          </label>
          <div className="two">
            <label className="field">Expirare (LL/AA)
              <input value={data.card.exp} placeholder="08/28" maxLength={5} onChange={(e) => setCard('exp', formatExpiry(e.target.value))} />
            </label>
            <label className="field">CVV
              <input type="password" value={data.card.cvv} maxLength={4} inputMode="numeric"
                onChange={(e) => setCard('cvv', e.target.value.replace(/\D/g, ''))} />
            </label>
          </div>
          <p className="muted">Simulare: nu se face nicio plată reală, iar cardul nu se salvează.</p>
        </>
      )}
      {data.method === 'paypal' && (
        <label className="field">Email PayPal
          <input type="email" value={data.paypal} onChange={(e) => onChange({ paypal: e.target.value })} />
        </label>
      )}
      {data.method === 'bank' && (
        <p className="muted">După confirmare primești datele pentru transfer. Rezervarea rămâne „În așteptarea plății” până la efectuarea lui.</p>
      )}
    </>
  )
}

function ReviewStep({ data, country, days, travelers, total, pois, accepted, onAccept }) {
  const payment =
    data.method === 'card' ? 'Card •••• ' + data.card.num.replace(/\s/g, '').slice(-4)
    : data.method === 'paypal' ? `PayPal (${data.paypal})`
    : 'Transfer bancar'
  return (
    <>
      <h2>Revizuiește și confirmă</h2>
      <div className="review">
        <p><b>Destinație:</b> {country.name} · {days} zile · {travelers} persoane</p>
        <p><b>Călători:</b> {data.people.map((p) => `${p.first} ${p.last}`).join(', ')}</p>
        <p><b>Contact:</b> {data.email} · {data.phone}</p>
        <p><b>Selecții:</b> {pois.length ? pois.map((p) => p.name).join(', ') : 'fără puncte de interes'}</p>
        <p><b>Plată:</b> {payment}</p>
        <p><b>Total:</b> {eur(total)}</p>
      </div>
      <label className="chk">
        <input type="checkbox" checked={accepted} onChange={(e) => onAccept(e.target.checked)} />
        Sunt de acord cu termenii și condițiile și confirm că datele sunt corecte.
      </label>
    </>
  )
}

function Confirmation({ booking }) {
  return (
    <div className="wrap section">
      <div className="panel ok">
        <div className="okic">✓</div>
        <h2>{booking.status === 'Confirmată' ? 'Rezervare confirmată!' : 'Rezervare înregistrată!'}</h2>
        <p className="muted">Cod rezervare</p>
        <div className="code">{booking.id}</div>
        <p>{booking.country} · {booking.days} zile · {booking.travelers} persoane · <b>{eur(booking.total)}</b></p>
        <p className="muted" style={{ margin: '10px 0 24px' }}>
          {booking.method === 'bank'
            ? `Transfer în contul RO00 VOYA 0000 0000 0000 0000 (demo), cu mențiunea ${booking.id}.`
            : 'Rezervarea a fost salvată în contul tău.'}
        </p>
        <div className="btns" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn" onClick={() => window.print()}>Printează confirmarea</button>
          <Link className="btn ghost" to="/rezervari">Rezervările mele</Link>
          <Link className="btn ghost" to="/">Planifică altă călătorie</Link>
        </div>
      </div>
    </div>
  )
}

function CheckoutContent({ country }) {
  const { user } = useAuth()
  const { pois, budget, setPois } = useTrip()
  const [, setBookings] = useLocalStorage('bookings', [])

  const b = withDefaults(budget)
  const total = Math.round(totalOf(calcBudget(b, pois)))
  const breakdown = Object.entries(calcBudget(b, pois)).filter(([, n]) => n)

  const [step, setStep] = useState(1)
  const [data, setData] = useState(() => ({
    email: user.email,
    phone: '',
    method: 'card',
    card: { name: '', num: '', exp: '', cvv: '' },
    paypal: user.email,
    people: Array.from({ length: b.travelers }, (_, i) => ({
      first: i ? '' : user.name.split(' ')[0],
      last: i ? '' : user.name.split(' ').slice(1).join(' '),
    })),
  }))
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')
  const [paying, setPaying] = useState(false)
  const [booking, setBooking] = useState(null)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const merge = (patch) => { setData((d) => ({ ...d, ...patch })); setError('') }

  function pay() {
    setPaying(true)
    timer.current = setTimeout(() => {
      const created = {
        id: newBookingId(), date: new Date().toISOString(), user: user.email, country: country.name, flag: country.flag,
        days: b.days, travelers: b.travelers, total, method: data.method,
        last4: data.method === 'card' ? data.card.num.replace(/\s/g, '').slice(-4) : '',
        people: data.people.map((p) => `${p.first} ${p.last}`), email: data.email,
        status: data.method === 'bank' ? 'În așteptarea plății' : 'Confirmată',
      }
      setBookings((all) => [...all, created])
      setPois([])
      setBooking(created)
    }, 1600)
  }

  function handleSubmit(event) {
    event.preventDefault()
    const message =
      step === 1 ? validateTravelers(data)
      : step === 2 ? validatePayment(data)
      : accepted ? '' : 'Bifează acceptarea termenilor.'
    if (message) return setError(message)
    setError('')
    if (step < 3) setStep(step + 1)
    else pay()
  }

  if (booking) return <Confirmation booking={booking} />

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <h1>Finalizează rezervarea</h1>
          <ol className="steps">
            {STEPS.map((t, i) => (
              <li key={t} className={step === i + 1 ? 'on' : step > i + 1 ? 'done' : ''}>{i + 1}. {t}</li>
            ))}
          </ol>
        </div>
      </section>
      <div className="wrap budget">
        <form className="panel" onSubmit={handleSubmit} noValidate>
          {step === 1 && <TravelersStep data={data} onChange={merge} />}
          {step === 2 && <PaymentStep data={data} onChange={merge} />}
          {step === 3 && (
            <ReviewStep data={data} country={country} days={b.days} travelers={b.travelers} total={total}
              pois={pois} accepted={accepted} onAccept={(v) => { setAccepted(v); setError('') }} />
          )}
          <p className="err" role="alert">{error}</p>
          <div className="btns">
            {step > 1 ? (
              <button type="button" className="btn ghost" onClick={() => { setStep(step - 1); setError('') }}>Înapoi</button>
            ) : (
              <Link className="btn ghost" to="/buget">Înapoi la buget</Link>
            )}
            <button className="btn" type="submit" disabled={paying}>
              {paying ? 'Se procesează plata…' : step === 3 ? `Confirmă și plătește ${eur(total)}` : 'Continuă'}
            </button>
          </div>
        </form>
        <aside className="summary">
          <span style={{ opacity: 0.7 }}>Total de plată</span>
          <div className="total">{eur(total)}</div>
          <span style={{ opacity: 0.7 }}>{country.name} · {b.days} zile · {b.travelers} pers.</span>
          {breakdown.map(([label, n]) => (
            <div className="row" key={label}><div><span>{label}</span><span>{eur(n)}</span></div></div>
          ))}
        </aside>
      </div>
    </>
  )
}

export default function CheckoutPage() {
  usePageTitle('Confirmare și plată')
  const { country } = useTrip()
  return (
    <Guard needCountry text="Ai nevoie de cont și de o destinație pentru a rezerva.">
      {country && <CheckoutContent country={country} />}
    </Guard>
  )
}
