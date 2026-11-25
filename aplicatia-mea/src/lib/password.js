// ATENȚIE: este doar o funcție de demonstrație pentru proiectul școlar, NU securitate reală.
// Într-o aplicație adevărată parolele se verifică pe server (bcrypt/argon2), nu în browser.
export function hashPassword(s) {
  let h = 5381
  for (const c of s) h = ((h << 5) + h + c.charCodeAt(0)) >>> 0
  return h.toString(36)
}
