// Keep database field names private to this layer. The HTTP and mock APIs
// both return camelCase fields, numeric prices, and YYYY-MM-DD dates.
// Values always use query parameters, never string interpolation.
const drinkColumns = `id, cafe_id AS "cafeId", name, type,
  price::double precision AS price, rating, reorder, notes,
  to_char(date, 'YYYY-MM-DD') AS date, photo_url AS "photoUrl"`

export async function listCafes(pool) {
  const result = await pool.query('SELECT id, name FROM cafes ORDER BY id')
  return result.rows
}

export async function getCafe(pool, id) {
  const result = await pool.query('SELECT id, name FROM cafes WHERE id = $1', [id])
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
