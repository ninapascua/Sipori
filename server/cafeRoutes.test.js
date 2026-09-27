import assert from 'node:assert/strict'
import { once } from 'node:events'
import { test } from 'node:test'
import express from 'express'
import { registerCafeRoutes } from './cafeRoutes.js'

// Exercise real HTTP routing with a controlled pool. This does not replace
// running schema.sql and seed.sql against PostgreSQL for integration testing.
async function withApi(query, check) {
  const app = express()
  app.use(express.json())
  registerCafeRoutes(app, { query })
  app.use((error, request, response, next) => {
    response.status(500).json({ error: 'Something went wrong on the server' })
  })
  const server = app.listen(0, '127.0.0.1')
  try {
    await once(server, 'listening')
    await check(`http://127.0.0.1:${server.address().port}`)
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  }
}

test('adding a drink links it to the cafe and rejects invalid or missing records', async () => {
  const draft = { name: 'Latte', type: 'matcha', price: 160, date: '2026-09-27', reorder: true, notes: '' }
  const post = (base, body) => fetch(`${base}/api/cafes/cafe-1/drinks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  await withApi(async (sql, values) => {
    assert.equal(values[1], 'cafe-1')
    return { rows: [{ id: values[0] }] }
  }, async base => {
    const response = await post(base, draft)
    assert.equal(response.status, 201)
    const drink = await response.json()
    assert.equal(drink.cafeId, 'cafe-1')
    assert.equal(drink.name, 'Latte')
    assert.equal(drink.rating, null)
  })
  await withApi(async () => { throw new Error('Validation must run before the query') }, async base => {
    assert.equal((await post(base, { ...draft, price: -1 })).status, 400)
  })
  await withApi(async () => ({ rows: [] }), async base => {
    assert.equal((await post(base, draft)).status, 404)
  })
})

test('all five client endpoints return their expected response shape', async () => {
  const cafe = { id: 'cafe-1', name: 'Matcha Tokyo' }
  const drink = {
    id: 'drink-1', cafeId: 'cafe-1', name: 'Matcha Latte', type: 'matcha',
    price: 160, rating: 4, reorder: true, notes: '', date: '2026-09-18', photoUrl: '',
  }
  for (const [path, row, expected, parameters] of [
    ['/api/cafes', cafe, [cafe], undefined],
    ['/api/cafes/cafe-1', cafe, cafe, ['cafe-1']],
    ['/api/drinks', drink, [drink], undefined],
    ['/api/cafes/cafe-1/drinks', drink, [drink], ['cafe-1']],
    ['/api/drinks/drink-1', drink, drink, ['drink-1']],
  ]) {
    await withApi(async (sql, values) => {
      assert.deepEqual(values, parameters)
      return { rows: [row] }
    }, async base => {
      const response = await fetch(base + path)
      assert.equal(response.status, 200, path)
      assert.deepEqual(await response.json(), expected)
    })
  }
})

test('missing details return 404 and empty lists remain arrays', async () => {
  await withApi(async () => ({ rows: [] }), async base => {
    for (const [path, message] of [
      ['/api/cafes/missing', 'Cafe not found'],
      ['/api/drinks/missing', 'Drink not found'],
    ]) {
      const response = await fetch(base + path)
      assert.equal(response.status, 404)
      assert.deepEqual(await response.json(), { error: message })
    }
    for (const path of ['/api/cafes', '/api/drinks', '/api/cafes/missing/drinks']) {
      const response = await fetch(base + path)
      assert.equal(response.status, 200)
      assert.deepEqual(await response.json(), [])
    }
  })
})

test('database failures reach the error handler on every endpoint', async () => {
  await withApi(async () => { throw new Error('private database details') }, async base => {
    for (const path of ['/api/cafes', '/api/cafes/cafe-1', '/api/drinks', '/api/cafes/cafe-1/drinks', '/api/drinks/drink-1']) {
      const response = await fetch(base + path)
      assert.equal(response.status, 500)
      assert.deepEqual(await response.json(), { error: 'Something went wrong on the server' })
    }
  })
})

test('untrusted IDs are passed as SQL parameters', async () => {
  const id = "x' OR '1'='1"
  await withApi(async (sql, values) => {
    assert.ok(!sql.includes(id))
    assert.deepEqual(values, [id])
    return { rows: [] }
  }, async base => {
    const response = await fetch(`${base}/api/cafes/${encodeURIComponent(id)}`)
    assert.equal(response.status, 404)
  })
})
