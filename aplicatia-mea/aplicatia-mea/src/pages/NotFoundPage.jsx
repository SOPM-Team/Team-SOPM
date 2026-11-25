import EmptyState from '../components/EmptyState.jsx'
import usePageTitle from '../hooks/usePageTitle.js'

export default function NotFoundPage() {
  usePageTitle('Pagină inexistentă')
  return (
    <div className="wrap section">
      <EmptyState title="Pagina nu există" text="Adresa pe care ai deschis-o nu există sau a fost mutată." to="/" cta="Înapoi acasă" />
    </div>
  )
}
