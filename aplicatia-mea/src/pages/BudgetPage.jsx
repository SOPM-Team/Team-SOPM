import { useState } from 'react'
import { Link } from 'react-router-dom'
import Guard from '../components/Guard.jsx'
import usePageTitle from '../hooks/usePageTitle.js'
import { PROMO_CODE, STAYS, calcBudget, normalizeBudget, totalOf, withDefaults } from '../lib/budget.js'
import { eur } from '../lib/format.js'
import { useTrip } from '../context/tripContext.js'

function BudgetContent({ country }) {
  const { pois, budget, setBudget } = useTrip()
  const saved = withDefaults(budget)
  // formularul păstrează textul tastat; în context se salvează valorile curățate
  const [form, setForm] = useState({ days: saved.days, travelers: saved.travelers, stay: saved.stay, flight: saved.flight, daily: saved.daily })

  function handleChange(e) {
    const next = { ...form, [e.target.name]: e.target.value }
    setForm(next)
    setBudget(normalizeBudget(next, saved.promo))
  }

  const values = normalizeBudget(form, saved.promo)
  const breakdown = calcBudget(values, pois)
  const total = totalOf(breakdown)

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <h1>Bugetul tău pentru {country.name}</h1>
          <p className="muted">Modifică valorile și vezi totalul actualizat pe loc.</p>
        </div>
      </section>
      <div className="wrap budget">
        <form className="panel" onSubmit={(e) => e.preventDefault()}>
          <h2>Detaliile călătoriei</h2>
          <div className="two">
            <label className="field">Număr de zile<input type="number" name="days" min="1" max="60" value={form.days} onChange={handleChange} /></label>
            <label className="field">Număr de persoane<input type="number" name="travelers" min="1" max="12" value={form.travelers} onChange={handleChange} /></label>
          </div>
          <label className="field">Tip de cazare
            <select name="stay" value={form.stay} onChange={handleChange}>
              {Object.entries(STAYS).map(([price, label]) => <option key={price} value={price}>{label}</option>)}
            </select>
          </label>
          <div className="two">
            <label className="field">Bilet de avion (€ / persoană)<input type="number" name="flight" min="0" value={form.flight} onChange={handleChange} /></label>
            <label className="field">Cheltuieli zilnice (€ / persoană)<input type="number" name="daily" min="0" value={form.daily} onChange={handleChange} /></label>
          </div>
          <p className="muted">Cazarea se calculează pentru o cameră la 2 persoane, iar numărul de nopți este egal cu numărul de zile.</p>
          <p style={{ marginTop: 16 }}>
            <Link className="btn ghost sm" to="/puncte-interes">Modifică punctele de interes ({pois.length})</Link>{' '}
            <Link className="btn ghost sm" to="/zboruri">Caută zboruri</Link>
          </p>
        </form>
        <aside className="summary" aria-live="polite">
          <span style={{ opacity: 0.7 }}>Total estimat</span>
          <div className="total">{eur(total)}</div>
          <span style={{ opacity: 0.7 }}>
            {eur(total / values.travelers)} / persoană · {values.days} zile
            {values.promo === PROMO_CODE ? ' · cod VOYAGO10 aplicat (−10% la zbor)' : ''}
          </span>
          <div>
            {Object.entries(breakdown).map(([label, n]) => (
              <div className="row" key={label}>
                <div><span>{label}</span><span>{eur(n)}</span></div>
                <div className="bar"><i style={{ width: `${total ? (n / total) * 100 : 0}%` }} /></div>
              </div>
            ))}
          </div>
          <Link className="btn lime" to="/plata" style={{ marginTop: 26 }}>Continuă spre confirmare &rsaquo;</Link>
        </aside>
      </div>
    </>
  )
}

export default function BudgetPage() {
  usePageTitle('Buget')
  const { country } = useTrip()
  return (
    <Guard needCountry text="Bugetul se bazează pe destinația și selecțiile tale.">
      {country && <BudgetContent country={country} />}
    </Guard>
  )
}
