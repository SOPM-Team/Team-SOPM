const euro = new Intl.NumberFormat('ro-RO', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export const eur = (n) => euro.format(n)

export const DEFAULT_DAYS = 5

// Data de azi + offset zile, în format YYYY-MM-DD (pentru <input type="date">)
export function isoDate(offsetDays = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0, 10)
}

// Număr de zile între două date (minimum 1). Dacă o dată lipsește: valoarea implicită.
export function daysBetween(start, end, fallback = DEFAULT_DAYS) {
  const n = Math.round((new Date(end) - new Date(start)) / 864e5)
  return Number.isFinite(n) ? Math.max(1, n) : fallback
}
