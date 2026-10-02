// All owner data goes through the authenticated Express API.

const BASE = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '')

async function request(path, options) {
  const response = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/api/auth/')) {
      window.dispatchEvent(new Event('sipori:unauthorized'))
    }
    // Try to use the API's own message; fall back to the status line.
    let message = `${response.status} ${response.statusText}`
    try {
      const body = await response.json()
      if (body?.error) message = body.error
    } catch {
      // The body was not JSON. The status line is all we have.
    }
    throw new Error(message)
  }

  return response.status === 204 ? null : response.json()
}

export const getSession = () => request('/api/auth/session')
export const login = (username, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
export const logout = () => request('/api/auth/logout', { method: 'POST' })

export const listCafes = () =>
  request('/api/cafes')

export const getCafe = (id) =>
  request(`/api/cafes/${encodeURIComponent(id)}`)

export const listDrinks = () =>
  request('/api/drinks')

export const listDrinksByCafe = (cafeId) =>
  request(`/api/cafes/${encodeURIComponent(cafeId)}/drinks`)

export const getDrink = (id) =>
  request(`/api/drinks/${encodeURIComponent(id)}`)

export const createCafeWithDrink = (draft) => request('/api/cafes', { method: 'POST', body: JSON.stringify(draft) })
export const createDrink = (cafeId, drink) => request(`/api/cafes/${encodeURIComponent(cafeId)}/drinks`, { method: 'POST', body: JSON.stringify(drink) })

export const updateDrink = (id, drink) => request(`/api/drinks/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(drink) })
export const deleteDrink = (id) => request(`/api/drinks/${encodeURIComponent(id)}`, { method: 'DELETE' })
