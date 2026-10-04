export function selectMonthlyPhotos(drinks, month, random = Math.random) {
  const photos = drinks.filter((drink) => drink.date?.slice(0, 7) === month && typeof drink.photoUrl === 'string' && drink.photoUrl.trim())
  for (let index = photos.length - 1; index > 0; index--) {
    const other = Math.floor(random() * (index + 1))
    ;[photos[index], photos[other]] = [photos[other], photos[index]]
  }
  return photos.slice(0, 10)
}
