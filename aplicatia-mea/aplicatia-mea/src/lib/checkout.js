const MAIL = /^\S+@\S+\.\S+$/

export const isEmail = (v) => MAIL.test(v)

// Algoritmul Luhn pentru numărul cardului
export function luhn(num) {
  let sum = 0
  ;[...num].reverse().forEach((ch, i) => {
    let d = Number(ch)
    if (i % 2) {
      d *= 2
      if (d > 9) d -= 9
    }
    sum += d
  })
  return sum % 10 === 0
}

export const formatCardNumber = (v) =>
  v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()

export function formatExpiry(v) {
  const digits = v.replace(/\D/g, '').slice(0, 4)
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

export const newBookingId = () => 'VG-' + Math.random().toString(36).slice(2, 8).toUpperCase()

// Fiecare funcție întoarce un mesaj de eroare sau '' dacă datele sunt valide
export function validateTravelers({ people, email, phone }) {
  if (people.some((p) => !p.first.trim() || !p.last.trim())) return 'Completează numele tuturor călătorilor.'
  if (!isEmail(email.trim())) return 'Introdu un email valid.'
  if (phone.replace(/\D/g, '').length < 9) return 'Introdu un număr de telefon valid.'
  return ''
}

export function validatePayment({ method, card, paypal }, now = new Date()) {
  if (method === 'card') {
    const num = card.num.replace(/\s/g, '')
    const m = card.exp.trim().match(/^(\d{2})\/(\d{2})$/)
    if (!card.name.trim()) return 'Introdu numele de pe card.'
    if (!/^\d{16}$/.test(num) || !luhn(num))
      return 'Numărul cardului nu este valid (16 cifre). Pentru test: 4242 4242 4242 4242.'
    if (!m || +m[1] < 1 || +m[1] > 12 || new Date(2000 + +m[2], +m[1]) <= now)
      return 'Data de expirare nu este validă.'
    if (!/^\d{3,4}$/.test(card.cvv)) return 'CVV-ul trebuie să aibă 3 sau 4 cifre.'
  }
  if (method === 'paypal' && !isEmail(paypal.trim())) return 'Introdu emailul contului PayPal.'
  return ''
}
