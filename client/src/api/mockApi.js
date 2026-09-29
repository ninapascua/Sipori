import { validateCafeDraft } from '../../../shared/cafeDraft.mjs'
// The simulated backend.
//
// Same function names, same return types, and the same shape of failure as
// httpApi.js, so your components cannot tell the difference. Data lives in the
// visitor's own browser and goes no further.
//
// This exists so the template's GitHub Pages link works on day one and so you
// can build the interface before your API is deployed. It is NOT a finished
// project. See content/extending-your-app page 3.

import seed from './seed.json'

const KEY = 'sipori:data'
const TOKYO_DEMO_VERSION = 'tokyo-six-drinks-v1'

function addTokyoSamples(data) {
  if (data.demoUpdates?.includes(TOKYO_DEMO_VERSION)) return false
  const ids = new Set(data.drinks.map((drink) => drink.id))
  data.drinks.push(...seed.drinks.filter((drink) => drink.id.startsWith('drink-tokyo-') && !ids.has(drink.id)))
  data.demoUpdates = [...(data.demoUpdates || []), TOKYO_DEMO_VERSION]
  return true
}

// A real network is not instant. Keeping this delay is what forces you to build
// a loading state now, while it is cheap, instead of discovering you need one
// the day you switch to the real API.
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

function read() {
  const stored = localStorage.getItem(KEY)
  if (stored) {
    try {
      const data = JSON.parse(stored)
      // Add new demo shops to existing browsers without replacing saved entries.
      const existingIds = new Set(data.cafes.map((cafe) => cafe.id))
      const addedCafes = seed.cafes.filter((cafe) => !existingIds.has(cafe.id))
      const addedSamples = addTokyoSamples(data)
      if (addedCafes.length > 0 || addedSamples) {
        data.cafes.push(...addedCafes)
        write(data)
      }
      return data
    } catch {
      // Corrupted storage. Start again rather than crashing the app.
      localStorage.removeItem(KEY)
    }
  }
  const initial = structuredClone(seed)
  addTokyoSamples(initial)
  write(initial)
  return initial
}

function write(data) {
  localStorage.setItem(KEY, JSON.stringify(data))
  return data
}

export async function listCafes() {
  await delay()

  return read().cafes
}

export async function getCafe(id) {
  await delay()

  const cafe = read().cafes.find(
    (cafe) => String(cafe.id) === String(id)
  )

  if (!cafe) {
    throw new Error('Cafe not found')
  }

  return cafe
}

export async function listDrinks() {
  await delay()

  return read()
    .drinks
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function listDrinksByCafe(cafeId) {
  await delay()

  return read()
    .drinks
    .filter((drink) => String(drink.cafeId) === String(cafeId))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function getDrink(id) {
  await delay()

  const drink = read().drinks.find(
    (drink) => String(drink.id) === String(id)
  )

  if (!drink) {
    throw new Error('Drink not found')
  }

  return drink
}

export async function createCafeWithDrink(payload) {
  const draft = validateCafeDraft(payload)
  await delay()
  const data = structuredClone(read())
  const cafe = { ...draft.cafe, id: `cafe-${crypto.randomUUID()}` }
  const drink = { ...draft.drink, id: `drink-${crypto.randomUUID()}`, cafeId: cafe.id }
  data.cafes.unshift(cafe)
  data.drinks.unshift(drink)
  try { write(data) } catch { throw new Error('Could not save. Browser storage may be full; try smaller images.') }
  return { cafe, drink }
}

export async function createDrink(cafeId, payload) {
  await delay()
  const data = structuredClone(read())
  const cafe = data.cafes.find((item) => item.id === cafeId)
  if (!cafe) throw new Error('Cafe not found')
  const draft = validateCafeDraft({ cafe: { name: cafe.name }, drink: payload })
  const drink = { ...draft.drink, id: `drink-${crypto.randomUUID()}`, cafeId }
  data.drinks.unshift(drink)
  try { write(data) } catch { throw new Error('Could not save. Browser storage may be full; try a smaller image.') }
  return drink
}

export async function updateDrink(id, payload) {
  const draft = validateCafeDraft({ cafe: { name: 'Existing cafe' }, drink: payload }).drink
  await delay()
  const data = structuredClone(read())
  const index = data.drinks.findIndex((drink) => drink.id === id)
  if (index < 0) throw new Error('Drink not found')
  data.drinks[index] = { ...data.drinks[index], ...draft }
  write(data)
  return data.drinks[index]
}

export async function deleteDrink(id) {
  await delay()
  const data = structuredClone(read())
  if (!data.drinks.some((drink) => drink.id === id)) throw new Error('Drink not found')
  data.drinks = data.drinks.filter((drink) => drink.id !== id)
  write(data)
}
