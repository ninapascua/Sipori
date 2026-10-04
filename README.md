# Sipori

*A little space for your sips.*

Sipori is a private cafe journal for a single owner to record, rate, and look back on matcha and hojicha drinks.

**Live site:** [sipori.onrender.com](https://sipori.onrender.com/#/)

**API:** [Backend health check](https://sipori-api.onrender.com/healthz)

**Demo video:** Not yet available.

Live mode requires owner login. Demo mode opens a separate browser-only sample journal without login. There is no public registration or default password. Configure your own credentials with `npm run auth:setup` in `server/`.

**Screenshot:** To be added. 

## What it does

- Create a cafe together with its first drink, with optional cafe and drink photos, then add more drinks to that cafe.
- Record a drink's matcha or hojicha type, price, optional 1–5 star rating, reorder choice, notes, and date.
- Search cafes by name and drinks by name within a cafe. Filter drinks by matcha or hojicha, and view each cafe's drink count and average based on rated drinks.
- Open, edit, and delete drink entries. Deleting a cafe's last drink also deletes the cafe after a warning and confirmation.
- Display up to ten drink photos from the current month in a scrapbook, with a shuffle control.
- Use responsive layouts for desktop and phone screens, with a private owner login and logout.

## Built with

React and Vite on the frontend, Express on Node.js for the API, and PostgreSQL for storage. The frontend and backend are configured as separate services on Render, and the database is hosted on Supabase. A GitHub Pages frontend workflow is also included in the repository.

## Demo mode

Demo mode is a fallback for showing the interface when the API is unavailable. It uses sample cafe/drink records and saves changes in your browser's localStorage. It requires no server, database, or owner login, and displays a visible demo notice.

| `VITE_USE_MOCK_API` | What happens |
| --- | --- |
| `true` | Browser-only demo: sample data and localStorage, independent of the private journal. |
| `false` or unset | Live mode: owner login and the Express/PostgreSQL API. |

The switch is chosen at build time. An API error in live mode shows an error; it does not automatically switch data sources. To use the fallback, build or run with `VITE_USE_MOCK_API=true`. Demo changes stay in that browser and are never synced to the live database. Clear the site's browser storage to reset its sample journal.

GitHub Pages serves frontend files only; the live API and database must run separately.

## Running it yourself

Install Node.js with npm and have a local or hosted PostgreSQL database available. Use a currently supported Node.js release compatible with the project's Node 20-or-later requirement. The commands below use PowerShell and start from the repository root.

For the browser-only demo, run these commands from the repository root:

```powershell
cd client
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
# Set VITE_USE_MOCK_API=true in client/.env.
npm run dev
```

Open `http://localhost:5173`. For the full live stack, set `VITE_USE_MOCK_API=false` and follow the steps below.

**1. Configure the backend.** Open a fresh terminal at the repository root:

```powershell
cd server
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Edit `server/.env` and set `DATABASE_URL` to your PostgreSQL connection string. Set `NODE_ENV=development`, `AUTH_CROSS_SITE=false`, and `CORS_ORIGINS=http://localhost:5173` for local use. For a local PostgreSQL database without TLS, also set `DATABASE_SSL=false`. These copy commands preserve an existing `.env`.

**2. Set your owner login, apply the schema, and start the API.**

```powershell
npm run auth:setup
npm run db:schema
npm run dev
```

The setup command asks for a username and a password of at least 12 characters and stores a salted scrypt password hash in `server/.env`. Skip `auth:setup` if your existing owner credentials are already configured; running it again replaces them. The schema command creates or updates the required tables without seeding sample journal entries. Run `npm run db:seed` separately if you want sample cafe/drink records in a development database. The API normally runs at `http://localhost:3000`.

**3. Start the frontend in a second terminal, from the repository root.**

```powershell
cd client
npm ci
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
```

Before starting the client, set these values in `client/.env`:

```dotenv
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=
```

Then run `npm run dev` in that client terminal. The blank API URL uses Vite's local `/api` proxy to the backend. Open `http://localhost:5173` and log in with the credentials you created. Restart Vite whenever you change its environment settings.

**4. Check the API and project.** From the repository root:

```powershell
curl.exe http://localhost:3000/healthz
curl.exe http://localhost:3000/readyz
npm test --prefix server
npm run build --prefix client
```

`/healthz` checks the API process; `/readyz` checks database connectivity. Data endpoints such as `/api/cafes` require an authenticated session and return HTTP 401 when accessed without one.

## Environment variables

Local `.env` files are ignored by Git. The example files contain setup guidance; configure production values directly on the host.

| Name | Where | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Server | PostgreSQL connection string; contains credentials. |
| `DATABASE_SSL` | Server | Optional TLS switch; `false` is for a private local database without TLS. |
| `CORS_ORIGINS` | Server | Comma-separated allowed frontend origins, without paths or trailing slashes. |
| `OWNER_USERNAME` | Server | The single owner's username. |
| `OWNER_PASSWORD_HASH` | Server | Salted scrypt hash generated by `npm run auth:setup`. |
| `NODE_ENV` | Server | `development` locally; `production` on the host. |
| `AUTH_CROSS_SITE` | Server | `true` for cross-site HTTPS frontend/API deployments; `false` locally or when serving frontend and API from the same origin. |
| `PORT` | Server | Supplied by the hosting platform; defaults to 3000 locally. |
| `VITE_USE_MOCK_API` | Client, build time | Exact `true` enables demo mode; `false` or unset uses the live API. |
| `VITE_API_BASE_URL` | Client, build time | Public API base URL; blank uses the same origin, with Vite proxying `/api` during local development. |
| `VITE_BASE_PATH` | Client, build time | `/` for Render; the repository path for GitHub project Pages. |

Every `VITE_` value is public in the built frontend. Never place passwords, password hashes, or database connection strings there.

## Deploying


| Setting | Value |
| --- | --- |
| Build command | `npm ci --prefix server && npm ci --prefix client --include=dev && npm run build --prefix client` |
| Start command | `npm start --prefix server` |
| Health check path | `/healthz` |
| `NODE_ENV` | `production` |
| `VITE_USE_MOCK_API` | `false` |
| `VITE_BASE_PATH` | `/` |
| `VITE_API_BASE_URL` | Remove or leave empty |
| `AUTH_CROSS_SITE` | `false` |
| `CORS_ORIGINS` | `https://sipori-api.onrender.com` for the existing API service |

Keep the existing database and owner credentials. After deploying, open `https://sipori-api.onrender.com/#/` to use the combined website and API. 

**Current separate-service setup — backend on Render:** create a Node Web Service connected to this repository. Leave the root directory blank so the service can access both `server/` and `shared/`.

| Setting | Value |
| --- | --- |
| Build command | `npm ci --prefix server` |
| Start command | `npm start --prefix server` |
| Health check path | `/healthz` |

Set the server environment variables in Render. Use `NODE_ENV=production`, the real database connection and owner settings, and the exact frontend origin in `CORS_ORIGINS`. Apply `server/db/schema.sql` to a new database before use. Keep the API on one instance while sessions and rate limits are stored in memory.

For a separate demo fallback deployment, set `VITE_USE_MOCK_API=true` on the frontend and rebuild. Keep the live frontend set to `false`.

**Frontend on Render:** create a Static Site connected to the same repository, with the root directory left blank.

| Setting | Value |
| --- | --- |
| Build command | `npm ci --prefix client --include=dev && npm run build --prefix client` |
| Publish directory | `client/dist` |
| `VITE_USE_MOCK_API` | `false` for live mode; `true` for a demo fallback deployment |
| `VITE_API_BASE_URL` | The HTTPS backend URL, without a trailing slash |
| `VITE_BASE_PATH` | `/` |

After Render assigns the frontend URL, update the backend's `CORS_ORIGINS` to match. Set `AUTH_CROSS_SITE=true` when the frontend and API are on different sites. Browsers can block those cross-site session cookies; the current iPhone login issue is why the same-origin setup above is planned. Rebuild the frontend after changing its build-time environment variables, and redeploy the backend after changing its configuration. Test login, logout, and journal operations on the live frontend.

**Alternative frontend on GitHub Pages:** the workflow is in [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml). Select GitHub Actions as the Pages source, add `VITE_API_BASE_URL` as a repository Actions variable, and run the workflow. It sets the repository base path automatically. Update the backend's allowed origin to the GitHub Pages origin, without the repository path. Set the repository variable `VITE_USE_MOCK_API=true` to publish the demo fallback, or `false` for live mode, then rebuild. This workflow deploys only the frontend.

## Project structure

```text
client/
  src/App.jsx             Main screens and application state
  src/api/                Live HTTP client and browser-only demo API
  src/components/         Login, cafe forms, drink details, and scrapbook
  src/assets/             Project artwork
  src/styles.css          Theme and responsive layouts
  public/                 Static public files
server/
  auth.js                 Owner login, sessions, and rate limiting
  frontend.js             Serves the built client for same-origin hosting
  setup-auth.js           Local credential setup
  cafeRoutes.js           Cafe and drink endpoints
  cafesRepo.js            Parameterized queries and transactions
  db/                     Connection pool, schema, and database scripts
  *.test.js               Backend tests
shared/cafeDraft.mjs       Cafe and drink validation
.github/workflows/        GitHub Pages frontend deployment
docs/                     Planning, progress, and security documentation
AI-USAGE.md               AI assistance record
SECURITY-CHECKLIST.md      Security checks and accepted limitations
```

## Architecture

The browser loads the React frontend from Render and sends requests to the Express API, hosted separately on Render, using an HttpOnly session cookie. Express authenticates requests, validates incoming entries, and accesses the Supabase-hosted PostgreSQL database through `pg` and parameterized queries. Creating a cafe with its first drink and deleting a cafe's last drink use transactions so the related changes succeed or roll back together. Database credentials and password verification remain on the server; sessions expire after 12 hours and are revoked on logout or a new login.

## What I would do next

- Deploy the same-origin setup and verify iPhone login, then persist sessions and rate limits so backend restarts do not discard them.
- Add registration and separate private journals for each account, with database ownership checks and account recovery.
- Let users browse previous scrapbook months and move photos to dedicated image storage as journals grow.

## Author

[ninapascua](https://github.com/ninapascua)

**Course and section:** To be added.

## AI use

[![Built with AI assistance](https://img.shields.io/badge/built%20with-AI%20assistance-0b5fff)](AI-USAGE.md)

ChatGPT and Codex (OpenAI) were used substantially for implementation, troubleshooting, code review, tests, and deployment guidance across the frontend and backend. I supplied the concept, wireframes, visual direction, and requirements, and worked on revisions and testing. See [AI-USAGE.md](AI-USAGE.md) for the detailed record and commit references.

## Licence

MIT. See [LICENSE](LICENSE).




