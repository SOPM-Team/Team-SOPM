import { useEffect, useState } from 'react'
import { CODES, FALLBACK } from '../data/countries.js'
import { readStorage, writeStorage } from '../lib/storage.js'

const API = import.meta.env.VITE_COUNTRIES_API || 'https://restcountries.com/v3.1'
const FIELDS = 'name,cca2,capital,flags,population,currencies,translations'

async function fetchCountries(url, signal) {
  const r = await fetch(url, { signal })
  if (!r.ok) throw new Error('HTTP ' + r.status)
  const data = await r.json()
  const list = CODES.map((c) => data.find((x) => x.cca2 === c)).filter(Boolean)
  if (list.length < CODES.length) throw new Error('Răspuns incomplet')
  return list
}

// Încarcă țările din REST Countries. status: 'loading' | 'success' | 'fallback'
export default function useCountries() {
  const [countries, setCountries] = useState(() => readStorage('countriesCache', []))
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    const controller = new AbortController()
    async function load() {
      const base = `${API}/alpha?codes=${CODES.join(',')}`
      for (const url of [`${base}&fields=${FIELDS}`, base]) {
        try {
          const list = await fetchCountries(url, controller.signal)
          writeStorage('countriesCache', list)
          setCountries(list)
          setStatus('success')
          return
        } catch (e) {
          if (e.name === 'AbortError') return
          console.warn('REST Countries a eșuat:', e.message)
        }
      }
      setCountries((current) => (current.length ? current : FALLBACK))
      setStatus('fallback')
    }
    load()
    return () => controller.abort()
  }, [])

  return { countries, status }
}
