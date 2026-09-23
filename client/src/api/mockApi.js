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

// A real network is not instant. Keeping this delay is what forces you to build
// a loading state now, while it is cheap, instead of discovering you need one
// the day you switch to the real API.
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms))

function read() {
  const stored = localStorage.getItem(KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      // Corrupted storage. Start again rather than crashing the app.
      localStorage.removeItem(KEY)
    }
  }
  localStorage.setItem(KEY, JSON.stringify(seed))
  return seed
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
