import { calcBudget, normalizeBudget, totalOf } from './budget.js'

const base = { days: 5, travelers: 2, stay: 70, flight: 180, daily: 20, promo: '' }

describe('calcBudget', () => {
  it('calculează cazare, zbor și cheltuieli zilnice', () => {
    const r = calcBudget(base, [])
    expect(r.Cazare).toBe(350) // 1 cameră x 70 € x 5 nopți
    expect(r.Zbor).toBe(360) // 180 € x 2 persoane
    expect(r['Mâncare și cheltuieli zilnice']).toBe(200)
    expect(totalOf(r)).toBe(910)
  })

  it('aplică codul VOYAGO10 doar la zbor', () => {
    expect(calcBudget({ ...base, promo: 'VOYAGO10' }, []).Zbor).toBeCloseTo(324)
  })

  it('folosește câte o cameră la 2 persoane', () => {
    expect(calcBudget({ ...base, travelers: 3 }, []).Cazare).toBe(70 * 2 * 5)
  })

  it('tratează modurile de preț: pe persoană, pe zi, pe grup', () => {
    const pois = [
      { cat: 'atractii', price: 29, mode: 'pers' },
      { cat: 'transport', price: 45, mode: 'zi' },
      { cat: 'transport', price: 25, mode: 'unic' },
    ]
    const r = calcBudget(base, pois)
    expect(r.Atracții).toBe(58)
    expect(r['Transport local']).toBe(250)
  })
})

describe('normalizeBudget', () => {
  it('înlocuiește valorile invalide cu minimul permis', () => {
    expect(normalizeBudget({ days: '', travelers: '3', stay: '90', flight: '-4', daily: 'x' })).toEqual({
      days: 1, travelers: 3, stay: 90, flight: 0, daily: 0, promo: '',
    })
  })
})
