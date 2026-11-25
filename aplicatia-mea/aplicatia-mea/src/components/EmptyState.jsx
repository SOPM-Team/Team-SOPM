import { Link } from 'react-router-dom'

// Mesaj pentru listă goală / acces blocat. Primește fie `to` (link), fie `onClick` (buton).
export default function EmptyState({ title, text, to, onClick, cta }) {
  return (
    <div className="state">
      <h3>{title}</h3>
      <p className="muted">{text}</p>
      {to ? (
        <Link className="btn" to={to}>{cta}</Link>
      ) : (
        <button type="button" className="btn" onClick={onClick}>{cta}</button>
      )}
    </div>
  )
}
