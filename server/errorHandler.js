export function errorHandler(error, request, response, next) {
  if (response.headersSent) return next(error)
  response.set('Cache-Control', 'no-store')
  if (error.type === 'entity.parse.failed') return response.status(400).json({ error: 'Request body must be valid JSON.' })
  if (error.type === 'entity.too.large') return response.status(413).json({ error: 'Request is too large. Choose smaller images.' })
  if (error.status >= 400 && error.status < 500) return response.status(error.status).json({ error: 'Invalid request.' })
  // Do not log request bodies or whole error objects: they may contain passwords.
  console.error('Request failed:', error.code || error.name || 'Error')
  response.status(500).json({ error: 'Something went wrong on the server' })
}
