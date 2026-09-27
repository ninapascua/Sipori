import { randomUUID } from 'node:crypto'

export async function createDrink(pool, cafeId, draft) {
  const drink = { ...draft, id: `drink-${randomUUID()}`, cafeId }
  const result = await pool.query(
    'INSERT INTO drinks (id, cafe_id, name, type, price, rating, reorder, notes, date, photo_url) SELECT $1,id,$3,$4,$5,NULL,$6,$7,$8,$9 FROM cafes WHERE id = $2 RETURNING id',
    [drink.id, cafeId, drink.name, drink.type, drink.price, drink.reorder, drink.notes, drink.date, drink.photoUrl],
  )
  return result.rows.length ? drink : null
}
// Keep database field names private to this layer. The HTTP and mock APIs
// both return camelCase fields, numeric prices, and YYYY-MM-DD dates.
// Values always use query parameters, never string interpolation.
const drinkColumns = `id, cafe_id AS "cafeId", name, type,
  price::double precision AS price, rating, reorder, notes,
  to_char(date, 'YYYY-MM-DD') AS date, photo_url AS "photoUrl"`

export async function listCafes(pool) {
  const result = await pool.query('SELECT id, name, photo_url AS "photoUrl" FROM cafes ORDER BY id')
  return result.rows
}

export async function getCafe(pool, id) {
  const result = await pool.query('SELECT id, name, photo_url AS "photoUrl" FROM cafes WHERE id = $1', [id])
  return result.rows[0] ?? null
}

export async function listDrinks(pool) {
  const result = await pool.query(`SELECT ${drinkColumns} FROM drinks ORDER BY date DESC, id`)
  return result.rows
}

export async function listDrinksByCafe(pool, cafeId) {
  const result = await pool.query(
    `SELECT ${drinkColumns} FROM drinks WHERE cafe_id = $1 ORDER BY date DESC, id`,
    [cafeId]
  )
  return result.rows
}

export async function getDrink(pool, id) {
  const result = await pool.query(`SELECT ${drinkColumns} FROM drinks WHERE id = $1`, [id])
  return result.rows[0] ?? null
}

export async function createCafeWithDrink(pool, draft) {
  const client = await pool.connect()
  const cafe = { ...draft.cafe, id: `cafe-${randomUUID()}` }
  const drink = { ...draft.drink, id: `drink-${randomUUID()}`, cafeId: cafe.id }
  try {
    await client.query('BEGIN')
    await client.query('INSERT INTO cafes (id, name, photo_url) VALUES ($1, $2, $3)', [cafe.id, cafe.name, cafe.photoUrl])
    await client.query('INSERT INTO drinks (id, cafe_id, name, type, price, rating, reorder, notes, date, photo_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', [drink.id, cafe.id, drink.name, drink.type, drink.price, null, drink.reorder, drink.notes, drink.date, drink.photoUrl])
    await client.query('COMMIT')
    return { cafe, drink }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally { client.release() }
}
