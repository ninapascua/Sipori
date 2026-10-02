import pg from 'pg'

// Fail at boot with one clear line, rather than with a mystery 500 an hour
// later. The commonest deployment mistake is setting a variable in .env on your
// laptop and never setting it in the host's dashboard.
if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL is not set. Locally: copy .env.example to .env and fill it in. ' +
    'On a host: add it in the dashboard, then redeploy.'
  )
  process.exit(1)
}

// Preserve the existing remote TLS setting until the host's CA is configured.
// Traffic is encrypted, but the server certificate is not verified. The current
// connection fails with SELF_SIGNED_CERT_IN_CHAIN when verification is enabled.
// Local/private databases can explicitly disable TLS (e.g. the Compose service).
const isLocal = ['localhost', '127.0.0.1', '[::1]'].includes(new URL(process.env.DATABASE_URL).hostname)
const useSsl = process.env.DATABASE_SSL === 'false' ? false : process.env.DATABASE_SSL === 'true' || !isLocal

export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false,
  max: 5,                          // free tiers allow far fewer than you think
  idleTimeoutMillis: 10_000,       // hand connections back quickly
  connectionTimeoutMillis: 5_000,  // fail fast rather than hanging the request
})

// A pool whose server goes away should say so once, loudly, not take the
// process down.
pool.on('error', (error) => {
  console.error('Unexpected database pool error:', error.message)
})
