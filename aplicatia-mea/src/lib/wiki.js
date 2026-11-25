import { readStorage, writeStorage } from './storage.js'

// Date despre un articol Wikipedia: poză + coordonate. Rezultatele se păstrează în cache.
export async function fetchWiki(title) {
  const cached = readStorage('wikiCache2', {})
  if (title in cached) return cached[title]
  try {
    const url =
      'https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1' +
      `&titles=${encodeURIComponent(title)}&prop=pageimages|coordinates&piprop=thumbnail&pithumbsize=800&colimit=1`
    const data = await (await fetch(url)).json()
    const page = Object.values(data.query?.pages || {})[0]
    const value =
      page && !('missing' in page)
        ? { img: page.thumbnail?.source || '', lat: page.coordinates?.[0]?.lat, lon: page.coordinates?.[0]?.lon }
        : null
    // recitim cache-ul după await, ca să nu pierdem intrările scrise între timp
    writeStorage('wikiCache2', { ...readStorage('wikiCache2', {}), [title]: value })
    return value
  } catch {
    return null
  }
}

// Poze Unsplash (dacă utilizatorul are cheie), altfel poza de pe Wikipedia
export async function fetchPhoto(query, fallback) {
  const key = readStorage('unsplashKey')
  if (!key) return fallback
  const cache = readStorage('photoCache2', {})
  if (query in cache) return cache[query] || fallback
  try {
    const url =
      'https://api.unsplash.com/search/photos?per_page=1&orientation=landscape' +
      `&query=${encodeURIComponent(query)}&client_id=${encodeURIComponent(key)}`
    const r = await fetch(url)
    if (!r.ok) return fallback
    const photo = (await r.json()).results?.[0]?.urls?.small || ''
    writeStorage('photoCache2', { ...readStorage('photoCache2', {}), [query]: photo })
    return photo || fallback
  } catch {
    return fallback
  }
}
