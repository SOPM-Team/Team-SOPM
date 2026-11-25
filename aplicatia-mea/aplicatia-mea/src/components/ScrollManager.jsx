import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// La schimbarea paginii: sus; dacă URL-ul are #ancoră, derulează la ea
export default function ScrollManager() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
    else window.scrollTo(0, 0)
  }, [pathname, hash])

  return null
}
