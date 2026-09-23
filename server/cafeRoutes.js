import * as cafes from './cafesRepo.js'

// Register before the catch-all 404 handler. Pass the pool in so these routes
// can be checked without starting the production server or touching live data.
export function registerCafeRoutes(app, pool) {
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
