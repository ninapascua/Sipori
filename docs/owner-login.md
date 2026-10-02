# Owner login

Sipori has one fixed owner account and no registration. All `/api` data routes
require a server session. The frontend no longer imports the mock API or seed
records, regardless of the old `VITE_USE_MOCK_API` setting.

## Local setup

1. In `server`, run `npm run auth:setup`. Enter your username and a password of
   at least 12 characters. Password input is hidden. The command writes the
   username and a salted scrypt hash into git-ignored `server/.env`, preserving
   existing database settings. Run it again to change credentials.
2. Start or restart the server with `npm run dev`.
3. Start the frontend as usual. A blank `VITE_API_BASE_URL` uses Vite's local
   proxy. An explicit URL must point to the running authenticated API.
4. Log in. Never put credentials in `client/.env`.

Missing credentials prevent the server from starting; there is no default password.

## Deployment

Set `OWNER_USERNAME` and `OWNER_PASSWORD_HASH` on the API host using the values
generated in `server/.env`. Set `NODE_ENV=production`, use HTTPS, and set
`CORS_ORIGINS` to the exact frontend origin (scheme and host, no path).
Deploy both the updated API and frontend. Old deployed bundles may still contain
previously public demo records; login cannot retract previously published data.

For Docker Compose, copy the generated owner settings into the root `.env`
alongside `POSTGRES_PASSWORD` and `CORS_ORIGINS`. Compose builds from the repository
root to include `shared/`, and disables database TLS only for its private `db`
service. A production frontend must reach the API through HTTPS.

The existing remote database connection uses encrypted TLS without certificate
verification. A verification check returned `SELF_SIGNED_CERT_IN_CHAIN`. Configure
a trusted database CA and enable verification in `server/db/pool.js` before
treating database transport security as complete.

Prefer serving frontend and API from the same site. If using different sites
(for example GitHub Pages and Render), set `AUTH_CROSS_SITE=true` on the API.
This uses `SameSite=None; Secure` cookies, which some browsers block as third-party
cookies. For reliable access in those browsers, use same-site hosting or a proxy.

Sessions are random, HttpOnly cookies with a 12-hour lifetime. Production cookies
are Secure and use the `__Host-` prefix. Logout revokes the session; a new login
revokes the previous session. Sessions and login limits are held in memory, so
server restarts log you out and reset the limit. Run one API instance; multiple
instances require a shared session and rate-limit store before scaling.

Login allows 10 attempts per 15 minutes globally, including successful attempts.
This bounds distributed guessing for this one-owner app, but someone can exhaust
the allowance and temporarily prevent login. Mutations require a trusted Origin
to prevent cross-site requests. API responses are marked `no-store`.

Unauthenticated crawlers can see the public login page and static artwork, but
cannot read private API records. Robots directives are supplementary, not access
control. Anything committed to a public repository remains public.

## Validation

Run `npm test` in `server`, and `npm run build` in `client`.
