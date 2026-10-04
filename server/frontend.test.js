import assert from 'node:assert/strict'
import { once } from 'node:events'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import express from 'express'
import { serveFrontend } from './frontend.js'
import { hashPassword, installAuth } from './auth.js'

test('one origin serves the frontend and authenticates API requests with a same-site cookie', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'sipori-frontend-'))
  let server
  try {
    await writeFile(join(directory, 'index.html'), '<html>Sipori frontend</html>')
    await writeFile(join(directory, 'app.js'), 'console.log("Sipori")')
    const app = express()
    app.use(express.json())
    const origins = []
    installAuth(app, { username: 'owner', passwordHash: await hashPassword('test-password'), origins })
    app.get('/api/cafes', (req, res) => res.json([]))
    serveFrontend(app, directory)
    app.use((req, res) => res.status(404).json({ error: 'No such route' }))
    server = app.listen(0, '127.0.0.1')
    await once(server, 'listening')
    const base = `http://127.0.0.1:${server.address().port}`
    origins.push(base)
    assert.match(await (await fetch(base + '/')).text(), /Sipori frontend/)
    assert.match(await (await fetch(base + '/app.js')).text(), /console.log/)
    assert.equal((await fetch(base + '/api/cafes')).status, 401)
    const login = await fetch(base + '/api/auth/login', {
      method: 'POST', headers: { Origin: base, 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'owner', password: 'test-password' }),
    })
    assert.equal(login.status, 200)
    const cookie = login.headers.get('set-cookie')
    assert.match(cookie, /SameSite=Lax/)
    const headers = { Cookie: cookie.split(';')[0] }
    assert.deepEqual(await (await fetch(base + '/api/cafes', { headers })).json(), [])
    const missing = await fetch(base + '/api/missing', { headers })
    assert.equal(missing.status, 404)
    assert.match(missing.headers.get('content-type'), /application\/json/)
  } finally {
    if (server) await new Promise(resolve => server.close(resolve))
    await rm(directory, { recursive: true, force: true })
  }
})
