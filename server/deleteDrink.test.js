import assert from 'node:assert/strict'
import { test } from 'node:test'
import { deleteDrink } from './cafesRepo.js'

function database({ remaining = 0, missing = false, fail = false } = {}) {
  const queries = []
  let released = false
  return {
    queries,
    get released() { return released },
    connect: async () => ({
      async query(sql, values) {
        queries.push(sql)
        if (sql.startsWith('SELECT c.id')) {
          assert.match(sql, /FOR UPDATE OF c/)
          assert.deepEqual(values, ['drink-1'])
          return { rows: missing ? [] : [{ id: 'cafe-1' }] }
        }
        if (sql.startsWith('DELETE FROM drinks')) return { rows: [{ id: 'drink-1' }] }
        if (sql.startsWith('DELETE FROM cafes')) {
          assert.match(sql, /NOT EXISTS/)
          assert.deepEqual(values, ['cafe-1'])
          if (fail) throw new Error('Database failure')
          return { rows: remaining ? [] : [{ id: 'cafe-1' }] }
        }
        return { rows: [] }
      },
      release() { released = true },
    }),
  }
}

test('last drink removes its shop; other drinks keep the shop', async () => {
  for (const remaining of [0, 2]) {
    const pool = database({ remaining })
    assert.deepEqual(await deleteDrink(pool, 'drink-1'), { deletedDrinkId: 'drink-1', deletedCafeId: remaining ? null : 'cafe-1' })
    assert.equal(pool.queries.at(-1), 'COMMIT')
    assert.ok(pool.released)
  }
})
test('missing drinks do not delete a shop', async () => {
  const pool = database({ missing: true })
  assert.equal(await deleteDrink(pool, 'drink-1'), null)
  assert.ok(!pool.queries.some(sql => sql.startsWith('DELETE')))
  assert.equal(pool.queries.at(-1), 'ROLLBACK')
  assert.ok(pool.released)
})
test('shop deletion failure rolls back the drink deletion', async () => {
  const pool = database({ fail: true })
  await assert.rejects(deleteDrink(pool, 'drink-1'), /Database failure/)
  assert.equal(pool.queries.at(-1), 'ROLLBACK')
  assert.ok(!pool.queries.includes('COMMIT'))
  assert.ok(pool.released)
})
