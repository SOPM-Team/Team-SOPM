import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'
import { FALLBACK, countryName, getCountry } from '../data/countries.js'
import usePageTitle from '../hooks/usePageTitle.js'
import { AIRLINES, MODELS, askGemini, buildFlightPrompt, parseFlights } from '../lib/gemini.js'
import { daysBetween, eur, isoDate } from '../lib/format.js'
import { readStorage, removeStorage, writeStorage } from '../lib/storage.js'
import { useToast } from '../context/toastContext.js'
import { useTrip } from '../context/tripContext.js'

function ApiKeysForm() {
  const toast = useToast()
  const [keys, setKeys] = useState(() => ({
    key: readStorage('geminiKey', ''),
    model: readStorage('geminiModel', MODELS[0]),
    unsplash: readStorage('unsplashKey', ''),
  }))
  const link = { color: 'var(--coral)', fontWeight: 700 }

  function save(e) {
    e.preventDefault()
    writeStorage('geminiKey', keys.key.trim())
    writeStorage('geminiModel', keys.model.trim() || MODELS[0])
    writeStorage('unsplashKey', keys.unsplash.trim())
    removeStorage('photoCache2')
    toast('Cheile au fost salvate.')
  }

  function deleteKey() {
    removeStorage('geminiKey')
    setKeys({ ...keys, key: '' })
    toast('Cheia a fost ștearsă.')
  }

  return (
    <form className="panel" onSubmit={save}>
      <h2>Chei API</h2>
      <label className="field">Cheie API
        <input type="password" value={keys.key} placeholder="AIza…" autoComplete="off"
          onChange={(e) => setKeys({ ...keys, key: e.target.value })} />
      </label>
      <label className="field">Model
        <input value={keys.model} onChange={(e) => setKeys({ ...keys, model: e.target.value })} />
      </label>
      <label className="field">Cheie Unsplash (opțional, pentru poze)
        <input type="password" value={keys.unsplash} placeholder="Access Key" autoComplete="off"
          onChange={(e) => setKeys({ ...keys, unsplash: e.target.value })} />
      </label>
      <div className="btns" style={{ marginTop: 0 }}>
        <button className="btn sm" type="submit">Salvează</button>
        <button className="btn ghost sm" type="button" onClick={deleteKey}>Șterge cheia</button>
      </div>
      <p className="muted" style={{ marginTop: 14, fontSize: '.88rem' }}>
        Creează o cheie gratuită la{' '}
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={link}>aistudio.google.com/apikey</a>.
        Pozele mai frumoase le iei cu o cheie gratuită de pe{' '}
        <a href="https://unsplash.com/developers" target="_blank" rel="noopener noreferrer" style={link}>unsplash.com/developers</a>{' '}
        (Access Key; versiunea demo are 50 de cereri pe oră). Cheile rămân doar în browserul tău. Nu le pune în cod și nu le trimite altcuiva.
      </p>
    </form>
  )
}

function FlightCard({ flight, city, manualPrice, onPriceChange, onPick }) {
  const airline = AIRLINES[flight.companie]
  const stops = Number(flight.escale)
  return (
    <article className="flight">
      <span className={`air ${airline.css}`}>{flight.companie}</span>
      <div>
        <b>{flight.ruta || city}</b>
        <div className="muted">
          {flight.plecare_ora ? `${flight.plecare_ora} → ${flight.sosire_ora || '?'}` : 'Ore: vezi pe site'}
          {flight.durata ? ` · ${flight.durata}` : ''} · {stops ? `${stops} escală` : 'direct'}
          {flight.zile ? ` · ${flight.zile}` : ''}
        </div>
      </div>
      <div>
        <div className="price">
          {flight.pret_eur ? 'de la ' + eur(flight.pret_eur) : 'Preț pe site'}
          <small>{flight.pret_eur ? 'orientativ, per persoană' : 'îl vezi la companie'}</small>
        </div>
        <div className="act">
          <a className="btn ghost sm" href={airline.url} target="_blank" rel="noopener noreferrer">Verifică pe site</a>
          {!flight.pret_eur && (
            <input className="pin" type="number" min="1" placeholder="€ / pers." aria-label="Prețul văzut pe site, în euro"
              value={manualPrice} onChange={(e) => onPriceChange(e.target.value)} />
          )}
          <button className="btn sm" type="button" onClick={onPick}>Alege zborul</button>
        </div>
      </div>
    </article>
  )
}

export default function FlightsPage() {
  usePageTitle('Zboruri')
  const navigate = useNavigate()
  const toast = useToast()
  const { country, budget, chooseCountry, setBudget, setFlight } = useTrip()

  const [form, setForm] = useState(() => ({
    from: 'București', dest: country?.code || 'IT', d1: isoDate(14), d2: isoDate(19), pax: String(budget.travelers || 2),
  }))
  const [result, setResult] = useState({ status: 'idle' }) // idle | loading | success | error
  const [prices, setPrices] = useState({})
  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  const dest = getCountry(form.dest)
  const city = dest.capital?.[0] || dest.name.common
  const ro = countryName(dest)

  const googleQuery = encodeURIComponent(
    `Flights from ${form.from} to ${city} on ${form.d1}${form.d2 ? ' returning ' + form.d2 : ''}`,
  )

  async function search(useWeb) {
    const key = readStorage('geminiKey')
    if (!key) return setResult({ status: 'nokey' })
    setResult({ status: 'loading' })
    setPrices({})
    try {
      const prompt = buildFlightPrompt({ from: form.from, city, ro, d1: form.d1, d2: form.d2, pax: form.pax })
      const out = await askGemini(prompt, key, readStorage('geminiModel', MODELS[0]), useWeb)
      const parsed = parseFlights(out.text)
      setResult({ status: 'success', useWeb, flights: parsed?.flights || [], note: parsed?.note || '', sources: out.sources })
    } catch (err) {
      setResult({ status: 'error', useWeb, message: err.message, details: err.details })
    }
  }

  function pick(flight, index) {
    const price = Math.round(flight.pret_eur || Number(prices[index]) || 0)
    if (!price) return toast('Scrie prețul văzut pe site-ul companiei, apoi alege zborul.')
    if (country?.code !== dest.cca2) chooseCountry(dest)
    const days = daysBetween(form.d1, form.d2 || form.d1)
    setBudget((b) => ({ ...b, flight: price, days, travelers: Number(form.pax) }))
    setFlight({ ...flight, date: form.d1 })
    toast(`Zbor ${flight.companie} adăugat în buget (${eur(price)} / persoană).`)
    setTimeout(() => navigate('/buget'), 900)
  }

  function renderResult() {
    switch (result.status) {
      case 'loading':
        return <div className="skeleton" />
      case 'nokey':
        return (
          <EmptyState title="Adaugă cheia Gemini"
            text="Introdu cheia în căsuța din dreapta și apasă „Salvează”, apoi caută din nou. Între timp poți folosi linkurile de verificare live."
            cta="Am înțeles" onClick={() => setResult({ status: 'idle' })} />
        )
      case 'error':
        return (
          <>
            <EmptyState title="Căutarea nu a reușit" text={result.message || 'Verifică conexiunea la internet și cheia API.'}
              cta="Înapoi la căutare" onClick={() => setResult({ status: 'idle' })} />
            {result.details && <p className="src">{result.details.map((d) => <span key={d}>{d}<br /></span>)}</p>}
            {result.useWeb && result.details && (
              <p style={{ textAlign: 'center', marginTop: 16 }}>
                <button className="btn ghost sm" type="button" onClick={() => search(false)}>Încearcă fără Google Search (estimare AI)</button>
              </p>
            )}
          </>
        )
      case 'success':
        return (
          <>
            {result.flights.length ? (
              result.flights.map((f, i) => (
                <FlightCard key={`${f.companie}-${f.ruta}-${i}`} flight={f} city={city}
                  manualPrice={prices[i] ?? ''} onPriceChange={(v) => setPrices({ ...prices, [i]: v })} onPick={() => pick(f, i)} />
              ))
            ) : (
              <EmptyState title="Nu am găsit zboruri sigure"
                text="Gemini nu a găsit informații verificabile pentru această rută. Folosește linkurile de verificare live."
                cta="Înapoi la căutare" onClick={() => setResult({ status: 'idle' })} />
            )}
            {result.note && <p className="muted">Nota Gemini (părere, nu confirmare): {result.note}</p>}
            {result.sources.length > 0 && (
              <p className="src">Surse: {result.sources.slice(0, 5).map((s) => (
                <a key={s.uri} href={s.uri} target="_blank" rel="noopener noreferrer">{s.title || 'sursă'}</a>
              ))}</p>
            )}
            {!result.useWeb && (
              <p className="src"><b>Atenție:</b> aceste date sunt o estimare AI făcută fără căutare web și pot fi greșite. Verifică pe site-ul companiei.</p>
            )}
            <p className="src">Prețurile reale ale biletelor nu apar în căutările web. Deschide site-ul companiei, vezi prețul și scrie-l în căsuță, apoi apasă „Alege zborul”.</p>
          </>
        )
      default:
        return null
    }
  }

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <h1>Caută zboruri</h1>
          <p className="muted">Wizz Air, Ryanair și TAROM, căutate cu Gemini prin Google Search. Prețurile sunt orientative.</p>
        </div>
      </section>
      <div className="wrap fl">
        <form className="panel" onSubmit={(e) => { e.preventDefault(); search(true) }}>
          <h2>Zborul tău</h2>
          <div className="two">
            <label className="field">Din<input value={form.from} onChange={update('from')} /></label>
            <label className="field">Către
              <select value={form.dest} onChange={update('dest')}>
                {FALLBACK.map((c) => <option key={c.cca2} value={c.cca2}>{c.name.common}</option>)}
              </select>
            </label>
          </div>
          <div className="two">
            <label className="field">Plecare<input type="date" required min={isoDate(0)} value={form.d1} onChange={update('d1')} /></label>
            <label className="field">Întoarcere<input type="date" min={form.d1} value={form.d2} onChange={update('d2')} /></label>
          </div>
          <label className="field">Pasageri<input type="number" min="1" max="9" value={form.pax} onChange={update('pax')} /></label>
          <button className="btn" type="submit" style={{ width: '100%' }}>Caută cu Gemini</button>
          <p className="muted" style={{ marginTop: 16, fontWeight: 600 }}>Verifică live, direct pe site:</p>
          <div className="quick">
            {Object.entries(AIRLINES).map(([name, a]) => (
              <a key={name} href={a.url} target="_blank" rel="noopener noreferrer">{name}</a>
            ))}
            <a href={`https://www.google.com/travel/flights?q=${googleQuery}`} target="_blank" rel="noopener noreferrer">Google Zboruri</a>
          </div>
        </form>
        <ApiKeysForm />
      </div>
      <div className="wrap section" style={{ paddingTop: 8 }}>{renderResult()}</div>
    </>
  )
}
