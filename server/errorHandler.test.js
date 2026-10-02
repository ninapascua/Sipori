import assert from 'node:assert/strict'
import { once } from 'node:events'
import { test } from 'node:test'
import express from 'express'
import { errorHandler } from './errorHandler.js'

test('malformed and oversized JSON return safe client errors without logging bodies', async () => {
  const app = express()
  app.use(express.json({ limit: '1kb' }))
  app.post('/api/auth/login', (req, res) => res.sendStatus(204))
  app.use(errorHandler)
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const original = console.error
  const logs = []
  console.error = (...args) => logs.push(args)
  try {
    for (const [body, status, message] of [
      ['{"password":"private-test-value",', 400, 'Request body must be valid JSON.'],
      [JSON.stringify({ password: 'x'.repeat(2048) }), 413, 'Request is too large. Choose smaller images.'],
    ]) {
      const response = await fetch(`http://127.0.0.1:${server.address().port}/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body,
      })
      assert.equal(response.status, status)
      assert.deepEqual(await response.json(), { error: message })
      assert.equal(response.headers.get('cache-control'), 'no-store')
    }
    assert.deepEqual(logs, [])
  } finally {
    console.error = original
    await new Promise(resolve => server.close(resolve))
  }
})
