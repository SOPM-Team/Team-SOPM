import { useEffect, useState } from 'react'
import { fetchPhoto, fetchWiki } from '../lib/wiki.js'

// Încarcă poza și coordonatele pentru mai multe articole Wikipedia.
// Rezultatul { [titlu]: { img, lat, lon } } se completează pe măsură ce sosesc răspunsurile.
export default function usePlaces(titles) {
  const [places, setPlaces] = useState({})
  const key = titles.join('|')

  useEffect(() => {
    let cancelled = false
    for (const title of key ? key.split('|') : []) {
      fetchWiki(title)
        .then(async (w) => {
          const img = await fetchPhoto(title, w?.img)
          if (!cancelled) {
            setPlaces((p) => ({ ...p, [title]: { img: img || '', lat: w?.lat ?? null, lon: w?.lon ?? null } }))
          }
        })
        .catch(() => {})
    }
    return () => {
      cancelled = true
    }
  }, [key])

  return places
}
