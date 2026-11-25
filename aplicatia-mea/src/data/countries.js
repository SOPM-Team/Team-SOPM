import { readStorage } from '../lib/storage.js'

export const CODES = ['FR', 'IT', 'ES', 'GR', 'JP', 'TH', 'TR', 'PT', 'HR', 'EG']

// Listă de rezervă, folosită doar dacă API-ul nu răspunde: [cod, nume, capitală, populație, monedă]
export const FALLBACK = [
  ['FR', 'Franța', 'Paris', 68000000, 'Euro'],
  ['IT', 'Italia', 'Roma', 59000000, 'Euro'],
  ['ES', 'Spania', 'Madrid', 48000000, 'Euro'],
  ['GR', 'Grecia', 'Atena', 10400000, 'Euro'],
  ['JP', 'Japonia', 'Tokyo', 124000000, 'Yen japonez'],
  ['TH', 'Thailanda', 'Bangkok', 66000000, 'Baht thailandez'],
  ['TR', 'Turcia', 'Ankara', 85000000, 'Liră turcească'],
  ['PT', 'Portugalia', 'Lisabona', 10400000, 'Euro'],
  ['HR', 'Croația', 'Zagreb', 3900000, 'Euro'],
  ['EG', 'Egipt', 'Cairo', 112000000, 'Liră egipteană'],
].map(([c, n, cap, pop, cur]) => ({
  cca2: c,
  name: { common: n },
  translations: { ron: { common: n } },
  capital: [cap],
  population: pop,
  currencies: { x: { name: cur } },
  flags: { png: `https://flagcdn.com/w320/${c.toLowerCase()}.png` },
}))

export const countryName = (c) => c.translations?.ron?.common || c.name.common

export const nameByCode = (code) => FALLBACK.find((c) => c.cca2 === code)?.name.common ?? code

// Caută întâi în cache-ul din API, apoi în lista de rezervă
export function getCountry(code) {
  const cached = readStorage('countriesCache', [])
  return cached.find((c) => c.cca2 === code) || FALLBACK.find((c) => c.cca2 === code) || null
}

// Forma salvată pentru destinația aleasă
export const toSavedCountry = (c) => ({
  code: c.cca2,
  name: countryName(c),
  flag: c.flags.png,
  capital: c.capital?.[0] || '',
})
