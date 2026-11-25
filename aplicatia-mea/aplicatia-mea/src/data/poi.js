// format: nume|preț în EUR / persoană|emoji|articol Wikipedia (pentru poză și hartă)
const DATA = {
  FR: { a: ['Turnul Eiffel (vârf)|29|🗼|Eiffel Tower', 'Muzeul Luvru|22|🖼️|Louvre', 'Palatul Versailles|21|🏰|Palace of Versailles'], r: ['Cină într-un bistro parizian|35|🍷|Bistro', 'Croissant și cafea la boulangerie|12|🥐|Croissant'] },
  IT: { a: ['Colosseum și Forum|18|🏛️|Colosseum', 'Capelele Vaticanului|25|⛪|Sistine Chapel', 'Plimbare cu gondola|30|🚣|Gondola'], r: ['Pizza napoletană autentică|15|🍕|Neapolitan pizza', 'Cină cu paste proaspete|30|🍝|Pasta'] },
  ES: { a: ['Sagrada Família|26|⛪|Sagrada Família', 'Alhambra, Granada|19|🕌|Alhambra', 'Parc Güell|10|🌳|Park Güell'], r: ['Tur de tapas|25|🍤|Tapas', 'Paella pe malul mării|30|🥘|Paella'] },
  GR: { a: ['Acropole|20|🏛️|Acropolis of Athens', 'Tur în caldera Santorini|45|🌋|Santorini', 'Palatul Knossos|15|🏺|Knossos'], r: ['Souvlaki în Plaka|10|🥙|Souvlaki', 'Cină la o tavernă pe plajă|28|🐟|Taverna'] },
  JP: { a: ['Templul Senso-ji|0|⛩️|Sensō-ji', 'Tur de o zi în Kyoto|60|🎎|Kyoto', 'Excursie la Muntele Fuji|80|🗻|Mount Fuji'], r: ['Sushi la bar|40|🍣|Sushi', 'Ramen în Shinjuku|12|🍜|Ramen'] },
  TH: { a: ['Marele Palat, Bangkok|15|🛕|Grand Palace', 'Tur al insulelor Phi Phi|45|🏝️|Phi Phi Islands', 'Sanctuar de elefanți|55|🐘|Elephant Nature Park'], r: ['Street food pe Yaowarat|8|🍢|Yaowarat Road', 'Cină thailandeză|20|🍛|Thai cuisine'] },
  TR: { a: ['Hagia Sophia|25|🕌|Hagia Sophia', 'Zbor cu balonul, Cappadocia|150|🎈|Cappadocia', 'Palatul Topkapi|18|👑|Topkapı Palace'], r: ['Kebab și ayran|14|🥙|Kebab', 'Meze și rakı pe Bosfor|25|🫒|Meze'] },
  PT: { a: ['Turnul Belém|8|🏰|Belém Tower', 'Palatul Pena, Sintra|14|🎨|Pena Palace', 'Tramvaiul 28, Lisabona|4|🚋|Trams in Lisbon'], r: ['Pastéis de nata și cafea|5|🥧|Pastel de nata', 'Fructe de mare la Cascais|35|🦐|Cascais'] },
  HR: { a: ['Zidurile Dubrovnikului|35|🏯|Walls of Dubrovnik', 'Lacurile Plitvice|40|💧|Plitvice Lakes National Park', "Palatul lui Dioclețian, Split|8|🏛️|Diocletian's Palace"], r: ['Pește la grătar|25|🐟|Dalmatian cuisine', 'Cină la o konobă|22|🍷|Dalmatia'] },
  EG: { a: ['Piramidele din Giza|20|🔺|Giza pyramid complex', 'Muzeul Egiptean|15|🏺|Egyptian Museum', 'Croazieră pe Nil|50|⛵|Nile'], r: ['Koshari local|5|🍲|Koshari', 'Cină tradițională egipteană|18|🍖|Egyptian cuisine'] },
}

// Articolul Wikipedia al reperului principal din fiecare țară (poza cardului și centrul hărții)
export const LM = {
  FR: 'Eiffel Tower', IT: 'Colosseum', ES: 'Sagrada Família', GR: 'Acropolis of Athens', JP: 'Mount Fuji',
  TH: 'Wat Arun', TR: 'Hagia Sophia', PT: 'Belém Tower', HR: 'Walls of Dubrovnik', EG: 'Giza pyramid complex',
}

export const TRANSPORT = [
  { id: 't1', name: 'Transfer aeroport – centru', price: 25, icon: '🚕', mode: 'unic' },
  { id: 't2', name: 'Abonament transport public', price: 20, icon: '🚇', mode: 'pers' },
  { id: 't3', name: 'Mașină închiriată', price: 45, icon: '🚗', mode: 'zi' },
  { id: 't4', name: 'Tren între orașe', price: 40, icon: '🚆', mode: 'pers' },
]

export const CAR_RENTAL = { ...TRANSPORT[2], cat: 'transport' }

export const CATS = {
  atractii: 'Atracții turistice',
  restaurante: 'Restaurante și gastronomie',
  transport: 'Opțiuni de transport',
}

export const MODE = { pers: 'pe persoană', zi: 'pe zi', unic: 'pe grup' }

const parse = (cat, line) => {
  const [name, price, icon, wiki] = line.split('|')
  return { id: cat + name, cat, name, price: Number(price), icon, mode: 'pers', wiki }
}

// Toate opțiunile afișate pentru o țară
export function buildPoiItems(code) {
  const d = DATA[code]
  if (!d) return []
  return [
    ...d.a.map((l) => parse('atractii', l)),
    ...d.r.map((l) => parse('restaurante', l)),
    ...TRANSPORT.map((t) => ({ ...t, cat: 'transport' })),
  ]
}
