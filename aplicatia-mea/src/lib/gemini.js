export const AIRLINES = {
  'Wizz Air': { url: 'https://www.wizzair.com/ro-ro', css: 'w' },
  Ryanair: { url: 'https://www.ryanair.com/ro/ro', css: 'r' },
  TAROM: { url: 'https://www.tarom.ro/ro', css: 't' },
}

export const MODELS = ['gemini-3-flash-preview', 'gemini-3.5-flash', 'gemini-2.5-flash']

// Apelează Gemini; încearcă pe rând mai multe modele dacă unul nu e disponibil sau cota e epuizată.
export async function askGemini(prompt, key, model, search = true) {
  const tried = [...new Set([model, ...MODELS])]
  const fails = []
  for (const m of tried) {
    const body = { contents: [{ parts: [{ text: prompt }] }] }
    if (search) body.tools = [{ google_search: {} }]
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify(body),
    })
    const d = await r.json().catch(() => ({}))
    const msg = d.error?.message || 'Eroare ' + r.status
    if (r.ok) {
      const cand = d.candidates?.[0]
      return {
        text: (cand?.content?.parts || []).map((p) => p.text || '').join(''),
        sources: (cand?.groundingMetadata?.groundingChunks || []).map((c) => c.web).filter(Boolean),
        model: m,
      }
    }
    if ([404, 429, 500, 503].includes(r.status)) {
      fails.push(`${m}: ${msg.slice(0, 160)}`)
      continue
    }
    throw new Error(r.status === 403 || /api key/i.test(msg) ? 'Cheia API nu este validă sau nu are acces.' : msg)
  }
  const quota = fails.some((f) => /quota|exhaust|limit|429/i.test(f))
  const err = new Error(
    quota
      ? 'Google a refuzat cererea pentru toate modelele încercate: cota gratuită (mai ales pentru căutarea Google) este depășită sau este 0 pe contul tău.'
      : 'Niciun model Gemini nu a răspuns.',
  )
  err.details = fails
  throw err
}

export function buildFlightPrompt({ from, city, ro, d1, d2, pax }) {
  return `Caută pe web zboruri de la ${from} la ${city} (${ro}) în jurul datei ${d1}${d2 ? ', cu întoarcere în jurul datei ' + d2 : ''}, pentru ${pax} pasageri, operate de Wizz Air, Ryanair și TAROM (doar cele care zboară pe rută). Răspunde DOAR cu JSON valid, fără alt text și fără markdown, în forma: {"zboruri":[{"companie":"Wizz Air|Ryanair|TAROM","ruta":"OTP - FCO","plecare_ora":"HH:MM sau null","sosire_ora":"HH:MM sau null","durata":"text sau null","escale":0,"pret_eur":număr sau null,"zile":"zilele de operare sau null","sursa":"URL"}],"nota":"o propoziție"}. Nu inventa: dacă nu găsești o informație sigură, pune null, iar dacă o companie nu zboară pe rută, nu o include. Prețurile sunt per persoană, în euro. Nu afirma că zborurile nu sunt în vânzare decât dacă ai o sursă clară.`
}

// Extrage JSON-ul din răspunsul modelului; întoarce null dacă nu e valid
export function parseFlights(text) {
  try {
    const data = JSON.parse(text.match(/\{[\s\S]*\}/)[0])
    return { flights: (data.zboruri || []).filter((z) => AIRLINES[z.companie]), note: data.nota || '' }
  } catch {
    return null
  }
}
