import express from 'express'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const defaultDirectory = fileURLToPath(new URL('../client/dist/', import.meta.url))

export function serveFrontend(app, directory = defaultDirectory) {
  // Local Vite development still works when no production frontend exists.
  if (!existsSync(directory)) return
  const serve = express.static(directory)
  app.use((req, res, next) => {
    // API errors must remain JSON, rather than returning frontend files.
    if (req.path === '/api' || req.path.startsWith('/api/')) return next()
    serve(req, res, next)
  })
}
