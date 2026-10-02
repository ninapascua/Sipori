export function validateCafeDraft(payload) {
  const cafe = payload?.cafe
  const drink = payload?.drink
  if (!cafe || typeof cafe.name !== 'string' || !cafe.name.trim() || cafe.name.trim().length > 120) throw new Error('Enter a cafe name of up to 120 characters.')
  if (!drink || typeof drink.name !== 'string' || !drink.name.trim() || drink.name.trim().length > 120) throw new Error('Add your first drink with a name of up to 120 characters.')
  if (!['matcha', 'hojicha'].includes(drink.type)) throw new Error('Choose a drink type.')
  if (typeof drink.price !== 'number' || !Number.isFinite(drink.price) || drink.price < 0 || drink.price > 99999999.99 || Math.abs(drink.price * 100 - Math.round(drink.price * 100)) > .00001) throw new Error('Enter a valid price with up to two decimal places.')
  if (typeof drink.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(drink.date) || drink.date.startsWith('0000-') || !Number.isFinite(Date.parse(drink.date)) || new Date(drink.date).toISOString().slice(0, 10) !== drink.date) throw new Error('Choose a valid date.')
  if (drink.rating != null && (!Number.isInteger(drink.rating) || drink.rating < 1 || drink.rating > 5)) throw new Error('Choose a rating from 1 to 5 stars.')
  if (typeof drink.reorder !== 'boolean') throw new Error('Choose whether you would reorder.')
  if (typeof drink.notes !== 'string' || drink.notes.length > 2000) throw new Error('Keep notes within 2,000 characters.')
  for (const item of [cafe, drink]) {
    if (item.photoUrl != null && (typeof item.photoUrl !== 'string' || item.photoUrl.length > 1500000 || (item.photoUrl !== '' && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(item.photoUrl)))) throw new Error('Choose a smaller PNG, JPG, or WebP image.')
  }
  return {
    cafe: { name: cafe.name.trim(), photoUrl: cafe.photoUrl || '' },
    drink: { name: drink.name.trim(), type: drink.type, price: drink.price, date: drink.date, reorder: drink.reorder, notes: drink.notes.trim(), photoUrl: drink.photoUrl || '', rating: drink.rating ?? null },
  }
}
