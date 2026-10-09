# Security checklist

## Secrets and credentials

Statuses distinguish verified checks from pending work: **No** means incomplete or not yet verified, and **N/A** means the item does not apply. The evidence column records the checks and their results.

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 1 | `.env` is gitignored and is not in the repository | Yes | `.gitignore` excludes `.env` and `.env.*` except examples; ignore checks passed for root/client/server `.env`, and no `.env` files are tracked. |
| 2 | A `.env.example` with placeholder values only is committed | Yes | Client and server `.env.example` files contain blank owner credentials and example values; the server database password is explicitly a development example. |
| 3 | No connection string, key, token or password is hardcoded in source, comments or commented-out code | Yes | Committed connection strings and passwords are example values only, not real credentials. |
| 4 | Git history is clean: `git log -p` was searched for password, secret, api key and `postgres://` | Yes | Git history search results contain example values and no exposed real credentials. |
| 5 | Any credential that was ever committed has been rotated | N/A | No real credentials were committed, so credential rotation is not applicable. |
| 6 | Production credentials live only in the hosting provider's environment settings | Yes | Production credentials are stored only in the hosting provider's environment settings. |

## GitHub Actions

The repository includes .github/workflows/deploy-pages.yml, which deploys the frontend only; owner login requires a separately configured API.

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 7 | No secret value is written literally in any workflow YAML file | Yes | `.github/workflows/deploy-pages.yml` contains no literal credentials; its API URL comes from a public repository variable. |
| 8 | Secrets are stored in repository Actions secrets and read with `${{ secrets.NAME }}` | N/A | The current Pages workflow requires no custom secrets; `VITE_API_BASE_URL` is public frontend configuration, and server credentials are not passed to the build. |
| 9 | No workflow step echoes, dumps or debug-prints a secret, and a recent run's log was checked | Yes | A recent GitHub Actions run log contains no echoed, dumped, or debug-printed secrets. |
| 10 | Uploaded build artifacts contain no `.env`, key file or generated config | Yes | The uploaded build artifact contains no `.env` files, private keys, or sensitive generated configuration. |
| 11 | Third-party actions are pinned to a commit SHA, not a moveable tag | No | Rechecked `.github/workflows/deploy-pages.yml`: checkout, setup-node, upload-pages-artifact, and deploy-pages use version tags rather than commit SHAs. |
| 12 | Secret scanning and push protection are enabled on the repository | Yes | GitHub secret scanning and push protection are enabled for the repository. |

## Database

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 13 | Every query taking user input uses parameters, never string concatenation | Yes | `server/cafesRepo.js` passes user IDs and submitted values through SQL placeholders and separate parameter arrays; interpolated column lists are fixed strings. |
| 14 | The database is not open to the whole internet, or is reachable only by the app | Yes | The hosted database has network restrictions and is not open to the whole internet. |
| 15 | The database user the app connects as has only the permissions it needs | No | The deployed DATABASE_URL was checked in Render and uses the administrative postgres role rather than a restricted application role. |
| 16 | Seed and sample data is invented, not real people's data | Yes | Seed and sample data is invented and contains no real people's personal data. |
| 17 | Debug, seed and reset routes are removed before going public | Yes | No HTTP seed/reset/debug routes were found; database setup is performed by local scripts. Public health/readiness routes return status, not journal records. |

## Access control

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 18 | The app has an access layer: Cloudflare Zero Trust, an app-level password, or a real login | Yes | `AuthGate` wraps the live frontend (the browser-only demo has no login) and `server/auth.js` enforces owner sessions on the API; the server fails startup without configured owner credentials. |
| 19 | If Supabase or Firebase: Row Level Security or security rules are on and were tested signed out | N/A | Although the README identifies Supabase as the database host, the app uses server-side `pg` connections behind Express authentication, not Supabase/Firebase client APIs or a browser database key; client security rules are not its access layer. |
| 20 | If Zero Trust: tjakoen.s@gmail.com is on the access policy. If an app password: the credentials are in the private workspace `project/README.md` | Yes | App login credentials are provided in the private workspace `project/README.md`, separate from the public repository. |
| 21 | The gate covers every route, including the ones that only change data | Yes | Authentication is installed before every cafe/drink read and write route, including POST/PUT/DELETE. Login/session/logout and health/readiness routes are deliberately public; static frontend assets remain public. Demo mode is intentionally public and uses only browser-local sample data. |
| 22 | The credentials for the gate are environment variables, not in source | Yes | `OWNER_USERNAME` and `OWNER_PASSWORD_HASH` are read from server environment variables; `auth:setup` writes a salted scrypt hash to ignored `server/.env`, and client configuration contains no owner password. |

## Input and output

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 23 | Input from the user is validated on the server, not only in the browser | Yes | Create/edit routes call `shared/cafeDraft.mjs` on the server to validate names, type, price, dates, rating, reorder flag, notes, and photo data; JSON bodies are limited to 4 MB. |
| 24 | User-supplied text is escaped when rendered, so it cannot inject markup or script | Yes | User text is rendered through React JSX; no `dangerouslySetInnerHTML` or `innerHTML` use was found in `client/src`. |
| 25 | Error responses do not expose stack traces, file paths or connection details | Yes | `server/errorHandler.js` returns safe request errors and generic server errors, without stacks or connection details; logs use error codes/names rather than request bodies. |
| 26 | CORS is not a wildcard on routes that change data | Yes | `server/server.js` uses an explicit `CORS_ORIGINS` allowlist with credentials; `server/auth.js` also rejects mutations with missing/untrusted Origin headers. |

## Repository and privacy

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 27 | No student number, personal email, phone number or home address in the repository or in commit messages | Yes | The repository and commit messages contain no student numbers, personal emails, phone numbers, or home addresses. |
| 28 | No classmate's personal data in the repository | Yes | The repository contains no classmates' personal data. |
| 29 | Dependencies come from official registries, and `node_modules` is gitignored | Yes | Lockfiles use `registry.npmjs.org`; `node_modules/` is gitignored and no dependency-directory files are tracked. |
| 30 | Images, fonts and other assets are original, licensed, or credited | Yes | Images, fonts, and other assets are original, licensed, or credited. |
| 31 | Repository visibility is deliberate and was checked after the last push | Yes | Repository visibility was checked after the last push and matches the intended setting. |

## Findings and fixes

The error handler previously logged whole error objects, which could include sensitive request details. It now logs only an error code or name and returns safe responses for malformed or oversized JSON. Server-side date validation rejects year zero before it reaches PostgreSQL. Docker/Compose configuration includes the shared validation files and required owner-login environment variables.

## Accepted limitation

The remaining No items are workflow SHA pinning (item 11) and a restricted production database role (item 15).

The remote database connection uses encrypted TLS with certificate verification disabled (`rejectUnauthorized: false` in `server/db/pool.js`). This remains an accepted limitation; certificate verification has not been fixed.
