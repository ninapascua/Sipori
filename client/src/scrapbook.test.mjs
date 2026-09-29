import assert from 'node:assert/strict'
import { test } from 'node:test'
import { selectMonthlyPhotos } from './scrapbook.mjs'

test('scrapbook selects at most ten unique photos from the requested month without changing saved drinks', () => {
  const drinks = Array.from({ length: 14 }, (_, id) => ({ id, date: '2026-09-12', photoUrl: `photo-${id}` }))
  drinks.push({ id: 20, date: '2026-08-12', photoUrl: 'old' }, { id: 21, date: '2026-09-12', photoUrl: '' })
  const original = structuredClone(drinks)
  const selected = selectMonthlyPhotos(drinks, '2026-09', () => .2)
  assert.equal(selected.length, 10)
  assert.equal(new Set(selected.map(drink => drink.id)).size, 10)
  assert.ok(selected.every(drink => drink.id < 14))
  assert.deepEqual(drinks, original)
  assert.equal(selectMonthlyPhotos(drinks, '2026-08').length, 1)
  assert.deepEqual(selectMonthlyPhotos(drinks, '2026-07'), [])
})
