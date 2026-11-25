import { useMemo } from 'react'
import EmptyState from '../components/EmptyState.jsx'
import Guard from '../components/Guard.jsx'
import PoiMap from '../components/PoiMap.jsx'
import { Link } from 'react-router-dom'
import { CATS, LM, MODE, buildPoiItems } from '../data/poi.js'
import usePageTitle from '../hooks/usePageTitle.js'
import usePlaces from '../hooks/usePlaces.js'
import { useTrip } from '../context/tripContext.js'
import { eur } from '../lib/format.js'

function PoiContent({ country }) {
  const { pois, setPois } = useTrip()
  const items = useMemo(() => buildPoiItems(country.code), [country.code])
  const titles = useMemo(() => [LM[country.code], ...items.filter((i) => i.wiki).map((i) => i.wiki)], [country.code, items])
  const places = usePlaces(titles)

  const markers = useMemo(
    () =>
      items
        .filter((i) => i.cat === 'atractii' && places[i.wiki]?.lat != null)
        .map((i) => ({
          name: i.name,
          label: i.price ? eur(i.price) : 'Gratuit',
          lat: places[i.wiki].lat,
          lon: places[i.wiki].lon,
        })),
    [items, places],
  )
  const centerPlace = places[LM[country.code]]
  const center = centerPlace?.lat != null ? { lat: centerPlace.lat, lon: centerPlace.lon } : null

  const isSelected = (id) => pois.some((p) => p.id === id)
  const toggle = (item) =>
    setPois((current) => (current.some((p) => p.id === item.id) ? current.filter((p) => p.id !== item.id) : [...current, item]))

  return (
    <>
      <section className="page-head">
        <div className="wrap">
          <h1>Ce vrei să faci în {country.name}?</h1>
          <p className="muted">Bifează ce te interesează. Prețurile sunt estimări în euro și intră automat în buget.</p>
          <div className="dest"><img src={country.flag} alt="" /> {country.name}{country.capital ? ' · ' + country.capital : ''}</div>
        </div>
      </section>
      <div className="wrap" style={{ paddingTop: 40 }}>
        <PoiMap center={center} markers={markers} />
        <p className="muted" style={{ fontSize: '.8rem', marginTop: 6 }}>Poze: Unsplash / Wikipedia · Hartă: © OpenStreetMap, © CARTO</p>
      </div>
      <div className="wrap section" style={{ paddingTop: 32 }}>
        {Object.entries(CATS).map(([cat, title]) => (
          <div className="cat" key={cat}>
            <h2>{title}</h2>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))' }}>
              {items.filter((i) => i.cat === cat).map((item) => {
                const img = item.wiki ? places[item.wiki]?.img : ''
                return (
                  <button key={item.id} type="button" className="poi" aria-pressed={isSelected(item.id)} onClick={() => toggle(item)}>
                    <span className="ic">{img ? <img src={img} alt={item.name} loading="lazy" /> : item.icon}</span>
                    <span>
                      <b>{item.name}</b>
                      <small>{item.price ? `${eur(item.price)} ${MODE[item.mode]}` : 'Gratuit'}</small>
                    </span>
                    <span className="tick">✓</span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
        <div className="dock">
          <span>{pois.length ? `${pois.length} ${pois.length === 1 ? 'selecție' : 'selecții'}` : 'Nimic bifat încă'}</span>
          <Link className="btn sm" to="/buget">Calculează bugetul</Link>
        </div>
      </div>
    </>
  )
}

export default function PoiPage() {
  usePageTitle('Puncte de interes')
  const { country } = useTrip()
  return (
    <Guard needCountry text="Punctele de interes se salvează în contul tău și depind de destinația aleasă.">
      {country && buildPoiItems(country.code).length > 0 ? (
        <PoiContent country={country} />
      ) : (
        <div className="wrap section">
          <EmptyState title="Destinație necunoscută" text="Alege din nou o țară de pe prima pagină." to="/#destinatii" cta="Vezi destinațiile" />
        </div>
      )}
    </Guard>
  )
}
