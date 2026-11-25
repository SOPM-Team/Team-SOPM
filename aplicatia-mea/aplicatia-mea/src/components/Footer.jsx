import { Link } from 'react-router-dom'
import { nameByCode } from '../data/countries.js'
import { useAuth } from '../context/authContext.js'

const POPULAR = ['ES', 'IT', 'GR', 'TR', 'PT', 'FR']
const SOCIAL = [['f', 'facebook.com'], ['ig', 'instagram.com'], ['yt', 'youtube.com'], ['in', 'linkedin.com']]

export default function Footer() {
  const { openAuth } = useAuth()

  return (
    <footer className="foot">
      <div className="wrap">
        <div className="fcols">
          <div>
            <h4>Servicii</h4>
            <Link to="/#destinatii">Alege destinația</Link>
            <Link to="/zboruri">Caută zboruri</Link>
            <Link to="/puncte-interes">Puncte de interes</Link>
            <Link to="/buget">Calculator de buget</Link>
            <a href="#cont" onClick={(e) => { e.preventDefault(); openAuth('login') }}>Cont Voyago</a>
          </div>
          <div>
            <h4>Ajutor</h4>
            <Link to="/#faq">Întrebări frecvente</Link>
            <Link to="/rezervari">Rezervările mele</Link>
            <a href="mailto:contact@voyago.example">Contact</a>
          </div>
          <div>
            <h4>Destinații populare</h4>
            {POPULAR.map((code) => (
              <Link key={code} to={`/?tara=${code}`}>Către {nameByCode(code)}</Link>
            ))}
          </div>
          <div>
            <h4>Urmărește-ne</h4>
            <div className="social">
              {SOCIAL.map(([label, domain]) => (
                <a key={domain} href={`https://www.${domain}`} target="_blank" rel="noopener noreferrer" aria-label={domain}>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <p className="copy">© Voyago – proiect școlar realizat cu React.</p>
      </div>
    </footer>
  )
}
