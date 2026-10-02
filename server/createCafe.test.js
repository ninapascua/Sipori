import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validateCafeDraft } from '../shared/cafeDraft.mjs'
import { createCafeWithDrink } from './cafesRepo.js'

const payload = { cafe: { name: 'New Cafe' }, drink: { name: 'Latte', type: 'matcha', price: 0, date: '2026-09-27', reorder: true, notes: '' } }
test('a cafe cannot be created without a valid first drink', () => {
  for (const drink of [undefined, {}, { ...payload.drink, name: ' ' }, { ...payload.drink, price: -1 }, { ...payload.drink, date: '2026-02-30' }]) {
    assert.throws(() => validateCafeDraft({ cafe: payload.cafe, drink }))
  }
  assert.equal(validateCafeDraft(payload).drink.rating, null)
})

test('dates reject PostgreSQL year zero and invalid leap days', () => {
  for (const date of ['0000-01-01', '2025-02-29', '2026-13-01']) {
    assert.throws(() => validateCafeDraft({ ...payload, drink: { ...payload.drink, date } }), /valid date/)
  }
  assert.equal(validateCafeDraft({ ...payload, drink: { ...payload.drink, date: '2024-02-29' } }).drink.date, '2024-02-29')
})
test('cafe and first drink commit together with linked IDs', async () => {
  const queries = []
  let released = false
  const result = await createCafeWithDrink({ connect: async () => ({ query: async (sql, values) => { queries.push({ sql, values }) }, release: () => { released = true } }) }, validateCafeDraft(payload))
  assert.equal(result.drink.cafeId, result.cafe.id)
  assert.equal(queries[0].sql, 'BEGIN')
  assert.equal(queries[2].values[1], result.cafe.id)
  assert.equal(queries.at(-1).sql, 'COMMIT')
  assert.ok(released)
})
test('failure saving the first drink rolls back the cafe', async () => {
  const queries = []
  let released = false
  await assert.rejects(createCafeWithDrink({ connect: async () => ({ query: async (sql) => {
    queries.push(sql)
    if (sql.startsWith('INSERT INTO drinks')) throw new Error('drink failed')
  }, release: () => { released = true } }) }, validateCafeDraft(payload)), /drink failed/)
  assert.equal(queries.at(-1), 'ROLLBACK')
  assert.ok(!queries.includes('COMMIT'))
  assert.ok(released)
})

 test('ratings are optional, bounded integers and persist with the first drink', async () => {
  for (const rating of [0, 6, 2.5, '5']) assert.throws(() => validateCafeDraft({ ...payload, drink: { ...payload.drink, rating } }))
  for (const rating of [null, 1, 5]) {
    const draft = validateCafeDraft({ ...payload, drink: { ...payload.drink, rating } })
    const queries = []
    const saved = await createCafeWithDrink({ connect: async () => ({ query: async (sql, values) => queries.push({ sql, values }), release() {} }) }, draft)
    assert.equal(saved.drink.rating, rating)
    assert.equal(queries[2].values[5], rating)
  }
})
