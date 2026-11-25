import { formatCardNumber, formatExpiry, luhn, validatePayment, validateTravelers } from './checkout.js'

const now = new Date('2026-11-24')
const card = { name: 'Radu', num: '4242 4242 4242 4242', exp: '08/28', cvv: '123' }

describe('luhn', () => {
  it('acceptă un card de test valid și respinge unul greșit', () => {
    expect(luhn('4242424242424242')).toBe(true)
    expect(luhn('4242424242424241')).toBe(false)
  })
})

describe('formatare', () => {
  it('grupează cardul și data de expirare', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242')
    expect(formatExpiry('0828')).toBe('08/28')
  })
})

describe('validatePayment', () => {
  it('acceptă date valide', () => {
    expect(validatePayment({ method: 'card', card, paypal: '' }, now)).toBe('')
  })
  it('respinge un card expirat', () => {
    expect(validatePayment({ method: 'card', card: { ...card, exp: '01/26' }, paypal: '' }, now)).toMatch(/expirare/)
  })
  it('cere email valid pentru PayPal', () => {
    expect(validatePayment({ method: 'paypal', card, paypal: 'abc' }, now)).toMatch(/PayPal/)
  })
})

describe('validateTravelers', () => {
  const ok = { people: [{ first: 'Radu', last: 'Gherghe' }], email: 'a@b.ro', phone: '0712345678' }
  it('acceptă date complete', () => expect(validateTravelers(ok)).toBe(''))
  it('cere numele tuturor călătorilor', () => {
    expect(validateTravelers({ ...ok, people: [{ first: 'Radu', last: '' }] })).toMatch(/numele/)
  })
})
