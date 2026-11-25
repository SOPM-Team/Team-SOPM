export const PROMO_CODE = 'VOYAGO10'
export const PROMO_DISCOUNT = 0.1

export const STAYS = {
  25: 'Hostel (25 €/noapte)',
  70: 'Hotel 3 stele (70 €/noapte)',
  90: 'Apartament (90 €/noapte)',
  120: 'Hotel 4 stele (120 €/noapte)',
  200: 'Resort 5 stele (200 €/noapte)',
}

export const DEFAULT_BUDGET = { days: 5, travelers: 2, stay: 70, flight: 180, daily: 20, promo: '' }

// Completează valorile lipsă din ce s-a salvat
export const withDefaults = (saved) => ({ ...DEFAULT_BUDGET, ...saved })

// Transformă valorile din formular (text) în numere valide
export function normalizeBudget(raw, promo = '') {
  return {
    days: Math.max(1, Number(raw.days) || 1),
    travelers: Math.max(1, Number(raw.travelers) || 1),
    stay: Number(raw.stay),
    flight: Math.max(0, Number(raw.flight) || 0),
    daily: Math.max(0, Number(raw.daily) || 0),
    promo,
  }
}

// Formula bugetului: o cameră la 2 persoane, nopți = zile
export function calcBudget(b, pois) {
  const rooms = Math.ceil(b.travelers / 2)
  const flightFactor = b.promo === PROMO_CODE ? 1 - PROMO_DISCOUNT : 1
  const result = {
    Cazare: b.stay * rooms * b.days,
    Zbor: b.flight * b.travelers * flightFactor,
    'Mâncare și cheltuieli zilnice': b.daily * b.travelers * b.days,
    Atracții: 0,
    Restaurante: 0,
    'Transport local': 0,
  }
  const labels = { atractii: 'Atracții', restaurante: 'Restaurante', transport: 'Transport local' }
  for (const p of pois) {
    const cost = p.mode === 'zi' ? p.price * b.days : p.mode === 'unic' ? p.price : p.price * b.travelers
    result[labels[p.cat]] += cost
  }
  return result
}

export const totalOf = (breakdown) => Object.values(breakdown).reduce((sum, n) => sum + n, 0)
