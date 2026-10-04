// Demo mode is an explicit build-time fallback; real owner data stays on the API.
export const USING_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'
const api = USING_MOCK_API ? import('./mockApi.js') : import('./httpApi.js')
const call = (name) => async (...args) => (await api)[name](...args)

export const listCafes = call('listCafes')
export const getCafe = call('getCafe')
export const listDrinks = call('listDrinks')
export const listDrinksByCafe = call('listDrinksByCafe')
export const getDrink = call('getDrink')
export const createCafeWithDrink = call('createCafeWithDrink')
export const createDrink = call('createDrink')
export const updateDrink = call('updateDrink')
export const deleteDrink = call('deleteDrink')
// AuthGate is mounted only in live mode.
export const getSession = call('getSession')
export const login = call('login')
export const logout = call('logout')
