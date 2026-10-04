# Security checklist

## Secrets and credentials

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 1 | `.env` is gitignored and is not in the repository | Yes | `.gitignore` excludes `.env` and `.env.*` except examples; ignore checks passed for root/client/server `.env`, and no `.env` files are tracked. |
| 2 | A `.env.example` with placeholder values only is committed | Yes | Client and server `.env.example` files contain blank owner credentials and example values; the server database password is explicitly a development example. |
| 3 | No connection string, key, token or password is hardcoded in source, comments or commented-out code | No | Owner authentication uses environment variables, but `server/.env.example` contains a development connection string/password and comments contain example URLs; their past use as real credentials is unconfirmed. |
| 4 | Git history is clean: I searched `git log -p` for password, secret, api key and `postgres://` | No | Searched `git log -p --all` for password, secret, API-key variants, and PostgreSQL URLs; matches exist, so history has not been certified free of actual exposed credentials. |
| 5 | Any credential that was ever committed has been rotated | No | No rotation was verified; whether committed example/development credentials were ever used requires owner confirmation. |
| 6 | Production credentials live only in my hosting provider's environment settings | No | Server code reads credentials from environment variables, but production hosting settings were not inspected in this review. |

## GitHub Actions

The repository includes .github/workflows/deploy-pages.yml, which deploys the frontend only; owner login requires a separately configured API.

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 7 | No secret value is written literally in any workflow YAML file | Yes | `.github/workflows/deploy-pages.yml` contains no literal credentials; its API URL comes from a public repository variable. |
| 8 | Secrets are stored in repository Actions secrets and read with `${{ secrets.NAME }}` | N/A | The current Pages workflow requires no custom secrets; `VITE_API_BASE_URL` is public frontend configuration, and server credentials are not passed to the build. |
| 9 | No workflow step echoes, dumps or debug-prints a secret, and I opened a recent run's log to confirm | No | No explicit secret-printing step was found in the workflow, but a recent hosted run log was not opened. |
| 10 | Uploaded build artifacts contain no `.env`, key file or generated config | No | The workflow uploads only `client/dist`; the actual uploaded artifact has not been inspected for sensitive files. |
| 11 | Third-party actions are pinned to a commit SHA, not a moveable tag | No | Workflow actions use version tags such as `@v4` and `@v3`, rather than commit SHAs. |
| 12 | Secret scanning and push protection are enabled on the repository | No | Repository secret-scanning and push-protection settings were not verified. |

## Database

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 13 | Every query taking user input uses parameters, never string concatenation | Yes | `server/cafesRepo.js` passes user IDs and submitted values through SQL placeholders and separate parameter arrays; interpolated column lists are fixed strings. |
| 14 | The database is not open to the whole internet, or is reachable only by the app | No | Hosted database network restrictions were not verified. |
| 15 | The database user the app connects as has only the permissions it needs | No | The local example connects as `postgres`; a restricted production application role was not verified. |
| 16 | Seed and sample data is invented, not real people's data | No | Seed files contain cafe names and drink journal entries; their invented provenance and absence of real personal data need owner confirmation. |
| 17 | Debug, seed and reset routes are removed before going public | Yes | No HTTP seed/reset/debug routes were found; database setup is performed by local scripts. Public health/readiness routes return status, not journal records. |

## Access control

| # | Check | Yes / No / N/A | Evidence |
| --- | --- | --- | --- |
| 18 | The app has an access layer: Cloudflare Zero Trust, an app-level password, or a real login | Yes | `AuthGate` wraps the live frontend (the browser-only demo has no login) and `server/auth.js` enforces owner sessions on the API; the server fails startup without configured owner credentials. |
| 19 | If Supabase or Firebase: Row Level Security or security rules are on, and I tested it signed out | N/A | Although the README identifies Supabase as the database host, the app uses server-side `pg` connections behind Express authentication, not Supabase/Firebase client APIs or a browser database key; client security rules are not its access layer. |
| 20 | If Zero Trust: tjakoen.s@gmail.com is on the access policy. If an app password: the credentials are in my private workspace `project/README.md` | No | The app uses owner username/password login, not Zero Trust; the required private-workspace README credentials were not verified. The repository README contains setup instructions only. |
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
| 27 | No student number, personal email, phone number or home address in the repository or in commit messages | No | A complete privacy check of repository content and commit messages has not been completed; prior review also identified a personal email in Git author metadata. |
| 28 | No classmate's personal data in the repository | No | No obvious classmate records were identified, but the owner still needs to confirm data and image provenance. |
| 29 | Dependencies come from official registries, and `node_modules` is gitignored | Yes | Lockfiles use `registry.npmjs.org`; `node_modules/` is gitignored and no dependency-directory files are tracked. |
| 30 | Images, fonts and other assets are mine, licensed, or credited | No | Image/font ownership, licenses, and credits have not been fully verified and documented. |
| 31 | Repository visibility is deliberate, and I checked it after my last push | No | Current repository visibility was not checked on GitHub after the last push. |

## Anything I found and fixed

During my security review, I found that the error handler logged whole error objects, which could include sensitive request details, so I changed it to log only an error code or name and return safe responses for malformed or oversized JSON. I also fixed server-side date validation to reject year zero before it reaches PostgreSQL and updated the Docker/Compose configuration to include the shared validation files and required owner-login environment variables.

## Accepted limitation

The current remote database connection uses encrypted TLS with certificate verification disabled (rejectUnauthorized: false in server/db/pool.js). I am leaving this setting unchanged and accepting this limitation; certificate verification has not been fixed.

