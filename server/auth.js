import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(scryptCallback)
const lifetime = 12 * 60 * 60 * 1000
const windowMs = 15 * 60 * 1000

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = await scrypt(password, salt, 64)
  return `scrypt:${salt}:${hash.toString('hex')}`
}

export function installAuth(app, { username, passwordHash, origins, production = false, crossSite = false, now = Date.now }) {
  if (!username || !/^scrypt:[a-f0-9]{32}:[a-f0-9]{128}$/.test(passwordHash || '')) {
    throw new Error('Owner login is not configured. Run npm run auth:setup in server first.')
  }
  if (crossSite && !production) throw new Error('Cross-site cookies require production HTTPS.')
  const sessions = new Map()
  // A global budget also bounds attempts distributed across addresses and behind proxies.
  let attempts = 0
  let resetAt = now() + windowMs
  const name = production ? '__Host-sipori' : 'sipori_session'
  const cookieOptions = { httpOnly: true, secure: production, sameSite: crossSite ? 'none' : 'lax', path: '/' }
  function token(req) {
    return (req.headers.cookie || '').split(';').map(part => part.trim()).find(part => part.startsWith(`${name}=`))?.slice(name.length + 1)
  }
  function authenticated(req) {
    const current = now()
    for (const [key, expires] of sessions) if (expires <= current) sessions.delete(key)
    return sessions.has(token(req))
  }
  app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store')
    res.set('X-Robots-Tag', 'noindex, nofollow, noarchive')
    res.set('X-Content-Type-Options', 'nosniff')
    // CORS alone does not stop cross-site writes. Require an explicitly trusted
    // browser origin for every mutation, including login and logout.
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method) && !origins.includes(req.headers.origin)) {
      return res.status(403).json({ error: 'Request origin is not allowed.' })
    }
    next()
  })
  app.get('/api/auth/session', (req, res) => {
    res.json({ authenticated: authenticated(req) })
  })
  app.post('/api/auth/login', async (req, res, next) => {
    try {
      if (now() >= resetAt) { attempts = 0; resetAt = now() + windowMs }
      if (attempts >= 10) {
        res.set('Retry-After', String(Math.ceil((resetAt - now()) / 1000)))
        return res.status(429).json({ error: 'Too many login attempts. Try again in 15 minutes.' })
      }
      attempts++
      const { username: suppliedUser, password } = req.body || {}
      if (typeof suppliedUser !== 'string' || suppliedUser.length > 128 || typeof password !== 'string' || password.length > 1024) {
        return res.status(401).json({ error: 'Incorrect username or password.' })
      }
      const [, salt, expected] = passwordHash.split(':')
      const actual = await scrypt(password, salt, 64)
      const validPassword = timingSafeEqual(actual, Buffer.from(expected, 'hex'))
      if (!validPassword || suppliedUser !== username) return res.status(401).json({ error: 'Incorrect username or password.' })
      // One owner, one active session. A new login revokes the previous one.
      sessions.clear()
      const session = randomBytes(32).toString('hex')
      sessions.set(session, now() + lifetime)
      res.cookie(name, session, { ...cookieOptions, maxAge: lifetime })
      res.json({ authenticated: true })
    } catch (error) { next(error) }
  })
  app.post('/api/auth/logout', (req, res) => {
    sessions.delete(token(req))
    res.clearCookie(name, cookieOptions)
    res.sendStatus(204)
  })
  app.use('/api', (req, res, next) => {
    if (!authenticated(req)) return res.status(401).json({ error: 'Please log in to continue.' })
    next()
  })
}
