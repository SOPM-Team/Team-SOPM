import { countryName } from '../data/countries.js'

export default function CountryCard({ country, selected, photo, onSelect }) {
  const name = countryName(country)
  const currency = Object.values(country.currencies || {})[0]?.name || '–'
  const image = photo || country.flags.png

  return (
    <article className={selected ? 'country on' : 'country'}>
      <div className="flag" role="img" aria-label={name} style={{ backgroundImage: `url('${image}')` }}>
        <img className="fbadge" src={country.flags.png} alt="" />
      </div>
      <div className="body">
        <h3>{name}</h3>
        <div className="chips">
          <span className="chip">{country.capital?.[0] || '–'}</span>
          <span className="chip">{(country.population / 1e6).toFixed(1)} mil. loc.</span>
          <span className="chip">{currency}</span>
        </div>
        <button type="button" className="btn sm" onClick={() => onSelect(country)}>
          {selected ? 'Destinație aleasă ✓' : 'Alege destinația'}
        </button>
      </div>
    </article>
  )
}
