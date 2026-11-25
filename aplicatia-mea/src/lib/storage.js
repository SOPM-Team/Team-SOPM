// Citire/scriere sigură în localStorage (JSON). Nu aruncă erori dacă storage-ul e blocat sau plin.
export function readStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) ?? fallback
  } catch {
    return fallback
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage plin sau blocat: aplicația merge mai departe fără persistență */
  }
}

export function removeStorage(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignorat */
  }
}
