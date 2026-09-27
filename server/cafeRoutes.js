import { validateCafeDraft } from '../shared/cafeDraft.mjs'
import * as cafes from './cafesRepo.js'

// Register before the catch-all 404 handler. Pass the pool in so these routes
// can be checked without starting the production server or touching live data.
export function registerCafeRoutes(app, pool) {
  app.post('/api/cafes/:id/drinks', async (request, response, next) => {
    let draft
    try { draft = validateCafeDraft({ cafe: { name: 'Existing cafe' }, drink: request.body }) }
    catch (error) { return response.status(400).json({ error: error.message }) }
    try {
      const drink = await cafes.createDrink(pool, request.params.id, draft.drink)
      if (!drink) return response.status(404).json({ error: 'Cafe not found' })
      response.status(201).json(drink)
    } catch (error) { next(error) }
  })
  app.post('/api/cafes', async (request, response, next) => {
    let draft
    try { draft = validateCafeDraft(request.body) }
    catch (error) { return response.status(400).json({ error: error.message }) }
    try { response.status(201).json(await cafes.createCafeWithDrink(pool, draft)) }
    catch (error) { next(error) }
  })
  app.get('/api/cafes', async (request, response, next) => {
    try {
      response.json(await cafes.listCafes(pool))
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/cafes/:id', async (request, response, next) => {
    try {
      const cafe = await cafes.getCafe(pool, request.params.id)
      if (!cafe) return response.status(404).json({ error: 'Cafe not found' })
      response.json(cafe)
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/drinks', async (request, response, next) => {
    try {
      response.json(await cafes.listDrinks(pool))
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/cafes/:id/drinks', async (request, response, next) => {
    try {
      response.json(await cafes.listDrinksByCafe(pool, request.params.id))
    } catch (error) {
      next(error)
    }
  })

  app.get('/api/drinks/:id', async (request, response, next) => {
    try {
      const drink = await cafes.getDrink(pool, request.params.id)
      if (!drink) return response.status(404).json({ error: 'Drink not found' })
      response.json(drink)
    } catch (error) {
      next(error)
    }
  })
}
