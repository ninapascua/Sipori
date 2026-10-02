import assert from 'node:assert/strict'
import { once } from 'node:events'
import { test } from 'node:test'
import express from 'express'
import { hashPassword, installAuth } from './auth.js'

const origin = 'http://localhost:5173'
const password = 'test-only-owner-password'
const passwordHash = await hashPassword(password)
async function withAuth(check, options = {}) {
  const app = express()
  app.use(express.json())
  installAuth(app, { username: 'owner', passwordHash, origins: [origin], ...options })
  app.all('/api/private', (req, res) => res.json({ private: true }))
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const base = `http://127.0.0.1:${server.address().port}`
  const request = (path, { body, cookie, method = 'GET', site = origin } = {}) => fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json', Origin: site, ...(cookie ? { Cookie: cookie } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  })
  try { await check(request) }
  finally { await new Promise(resolve => server.close(resolve)) }
}
const login = request => request('/api/auth/login', { method: 'POST', body: { username: 'owner', password } })

test('configuration fails closed without owner credentials', () => {
  assert.throws(() => installAuth(express(), { origins: [origin] }), /not configured/)
})
test('all data methods require a real session; logout revokes it', async () => {
  await withAuth(async request => {
    for (const method of ['GET', 'POST', 'PUT', 'DELETE']) {
      assert.equal((await request('/api/private', { method })).status, 401)
    }
    assert.equal((await request('/api/private', { cookie: 'sipori_session=forged' })).status, 401)
    assert.deepEqual(await (await request('/api/auth/session')).json(), { authenticated: false })
    const response = await login(request)
    assert.equal(response.status, 200)
    const header = response.headers.get('set-cookie')
    assert.match(header, /HttpOnly/)
    assert.match(header, /SameSite=Lax/)
    const cookie = header.split(';')[0]
    const data = await request('/api/private', { cookie })
    assert.equal(data.status, 200)
    assert.equal(data.headers.get('cache-control'), 'no-store')
    assert.equal((await request('/api/private', { method: 'POST', cookie, site: 'https://evil.example' })).status, 403)
    assert.equal((await request('/api/auth/logout', { method: 'POST', cookie })).status, 204)
    assert.equal((await request('/api/private', { cookie })).status, 401)
  })
})
test('invalid credentials are generic and attempts are rate limited', async () => {
  await withAuth(async request => {
    for (let i = 0; i < 10; i++) {
      const response = await request('/api/auth/login', { method: 'POST', body: { username: i % 2 ? 'wrong' : 'owner', password: 'wrong' } })
      assert.equal(response.status, 401)
      assert.deepEqual(await response.json(), { error: 'Incorrect username or password.' })
    }
    const blocked = await login(request)
    assert.equal(blocked.status, 429)
    assert.ok(Number(blocked.headers.get('retry-after')) > 0)
  })
})
test('sessions expire, rotate on login, and production cookies are secure', async () => {
  let time = 1000
  await withAuth(async request => {
    const first = (await login(request)).headers.get('set-cookie')
    assert.match(first, /^__Host-sipori=/)
    assert.match(first, /Secure/)
    assert.match(first, /SameSite=None/)
    const second = (await login(request)).headers.get('set-cookie').split(';')[0]
    assert.equal((await request('/api/private', { cookie: first.split(';')[0] })).status, 401)
    assert.equal((await request('/api/private', { cookie: second })).status, 200)
    time += 12 * 60 * 60 * 1000
    assert.equal((await request('/api/private', { cookie: second })).status, 401)
    // The attempt window also resets.
    assert.equal((await login(request)).status, 200)
  }, { production: true, crossSite: true, now: () => time })
})
test('login requires a trusted origin', async () => {
  await withAuth(async request => {
    for (const site of ['', 'https://evil.example']) {
      assert.equal((await request('/api/auth/login', { method: 'POST', site, body: { username: 'owner', password } })).status, 403)
    }
  })
})
