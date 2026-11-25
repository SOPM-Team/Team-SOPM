import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import CountryCard from '../components/CountryCard.jsx'
import PlannerForm from '../components/PlannerForm.jsx'
import { countryName, getCountry } from '../data/countries.js'
import { LM } from '../data/poi.js'
import useCountries from '../hooks/useCountries.js'
import usePageTitle from '../hooks/usePageTitle.js'
import usePlaces from '../hooks/usePlaces.js'
import { useAuth } from '../context/authContext.js'
import { useTrip } from '../context/tripContext.js'

const STEPS = [
  ['Creezi un cont', 'Gratuit, în câteva secunde.'],
  ['Alegi destinația', 'Una din cele 10 țări populare.'],
  ['Bifezi și calculezi', 'Atracții, mâncare, transport și buget.'],
  ['Confirmi și plătești', 'Card, PayPal sau transfer bancar.'],
]

const FAQ = [
  ['Cum funcționează Voyago?', 'Îți faci un cont, alegi o țară, bifezi atracții, restaurante și transport, vezi bugetul și apoi confirmi și plătești rezervarea.'],
  ['Plata este reală?', 'Nu. Este o simulare pentru proiect: niciun card nu este încărcat, iar numărul cardului nu se salvează, doar ultimele 4 cifre.'],
  ['Unde se salvează contul și rezervările?', 'Totul rămâne în browserul tău (localStorage). Nu se trimite nimic către un server.'],
  ['Cum folosesc codul promoțional?', 'Scrie VOYAGO10 în formularul de planificare. Primești 10% reducere la biletele de avion din buget.'],
]

const PHOTO_TITLES = Object.values(LM)

export default function HomePage() {
  usePageTitle('')
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { requireAuth, openAuth } = useAuth()
  const { country, chooseCountry } = useTrip()
  const { countries, status } = useCountries()
  const photos = usePlaces(PHOTO_TITLES)
  const [query, setQuery] = useState('')

  function selectCountry(c) {
    requireAuth(() => {
      chooseCountry(c)
      navigate('/puncte-interes')
    }, 'Creează un cont ca să îți salvezi destinația.')
  }

  // Link din footer: /?tara=ES alege direct țara
  const tara = params.get('tara')?.toUpperCase()
  const handled = useRef('')
  useEffect(() => {
    if (!tara || handled.current === tara) return
    handled.current = tara
    const c = getCountry(tara)
    setParams({}, { replace: true })
    if (c) selectCountry(c)
    // selectCountry se recreează la fiecare randare; ref-ul `handled` evită dublarea
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tara])

  const visible = countries.filter((c) => countryName(c).toLowerCase().includes(query.toLowerCase()))

  return (
    <>
      <section className="hero3">
        <div className="wrap hero3-in">
          <div>
            <span className="kicker">Planificator de călătorii</span>
            <h1>Vacanța ta, <em>calculată</em> până la ultimul leu.</h1>
            <p className="lead">Alegi țara, bifezi ce vrei să vezi și să mănânci, iar noi îți spunem cât costă. Apoi confirmi rezervarea direct de aici.</p>
            <a className="btn" href="#destinatii">Vezi destinațiile</a>
            <div className="stats">
              <div><b>10</b><span>destinații</span></div>
              <div><b>3</b><span>metode de plată</span></div>
              <div><b>0 €</b><span>cont gratuit</span></div>
            </div>
          </div>
          <PlannerForm />
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="wrap">
          <h2 style={{ fontSize: 'clamp(1.8rem,3.4vw,2.6rem)', marginBottom: 28 }}>Patru pași până la plecare</h2>
          <div className="how">
            {STEPS.map(([title, text], i) => (
              <div key={title}><b>{i + 1}</b><h3>{title}</h3><p>{text}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt" id="destinatii">
        <div className="wrap">
          <div className="head">
            <div>
              <h2>10 destinații populare</h2>
              <p className="muted">Date din REST Countries. Alege țara în care vrei să mergi.</p>
            </div>
            <input className="search" type="search" placeholder="Caută o țară…" aria-label="Caută o țară"
              value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          {status === 'fallback' && (
            <p className="muted" role="status">API-ul nu a răspuns, așa că afișăm lista locală de destinații.</p>
          )}
          <div className="grid">
            {status === 'loading' && countries.length === 0 ? (
              [0, 1, 2, 3].map((i) => <div key={i} className="skeleton" />)
            ) : visible.length === 0 ? (
              <div className="state" style={{ gridColumn: '1/-1' }}>
                <h3>Nicio destinație găsită</h3>
                <p className="muted">Încearcă alt nume de țară.</p>
              </div>
            ) : (
              visible.map((c) => (
                <CountryCard key={c.cca2} country={c} selected={c.cca2 === country?.code}
                  photo={photos[LM[c.cca2]]?.img} onSelect={selectCountry} />
              ))
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="band">
            <h2>Prima ta vacanță planificată începe cu un cont.</h2>
            <button className="btn" type="button" onClick={() => openAuth('register')}>Creează cont gratuit</button>
          </div>
        </div>
      </section>

      <section className="section alt" id="faq">
        <div className="wrap" style={{ maxWidth: 820 }}>
          <h2 style={{ marginBottom: 24 }}>Întrebări frecvente</h2>
          {FAQ.map(([q, a]) => (
            <details key={q}><summary>{q}</summary><p>{a}</p></details>
          ))}
          <details>
            <summary>Cum vă pot contacta?</summary>
            <p>Scrie-ne la <a href="mailto:contact@voyago.example" style={{ color: 'var(--coral)', fontWeight: 700 }}>contact@voyago.example</a>.</p>
          </details>
        </div>
      </section>
    </>
  )
}
