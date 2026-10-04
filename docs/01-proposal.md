# Proposal

## App name

Sipori

## What the app is for

Sipori is a personal log where a matcha and hojicha lover keeps track of the cafes they have visited and the drinks they tried, with photos, ratings, and notes, so they can remember what was worth ordering again and look back at this month's drinks as a scrapbook.

## Who is it for

It is for someone who tries matcha and hojicha drinks from different cafes and forgets which ones were worth ordering again—in this case, me. When I open it, I am logging a drink I just finished, checking what was good at a cafe before ordering, or looking back at what I drank this month. Sipori remains a single-owner journal, but the live version now requires my configured username and password. There is no public registration.

## Sections or routes

| # | Section / route | What it is for |
| --- | --- | --- |
| 1 | Owner login | Checks my session and lets me log in before opening the live journal. This is an access screen, not a separate hash route. |
| 2 | Cafes / home (`#/`) | Shows cafe cards with a photo or fallback, name, drink count, and average rating; includes cafe-name search and Add Shop. |
| 3 | Cafe page (`#/cafes/:cafeId`) | Shows one cafe's drinks, name search, All/Matcha/Hojicha filters, and Add Drink. Opening a drink shows its details and edit/delete controls. |
| 4 | Scrapbook (`#/scrapbook`) | Shows up to ten drink photos dated in the current month as a decorated collage, with captions, shuffle, and an empty state. |

## Popups

| Popup or interaction | Opened from | What it is for |
| --- | --- | --- |
| Add cafe dialog | Add Shop on the Cafes page | Cafe name and optional photo, followed by the first-drink step. The cafe and first drink are saved together. |
| Add drink dialog | Add Drink on a cafe page, or the first-drink step | Photo, date, matcha/hojicha type, name, price, optional rating, reorder choice, and notes. |
| Drink detail view | A drink card on a cafe page | Full recorded text details and edit/delete actions. This is a view within the cafe page rather than a separate modal. |
| Edit drink dialog | Edit in drink details | Reuses the drink form with saved values. |
| Delete confirmation | Delete in drink details | Asks before deletion and warns when deleting the cafe's last drink will also remove the cafe. |

**Stretch feature from my original proposal:** the scrapbook was the first feature I planned to cut if time ran short. I completed the current-month version. A month selector for earlier months and opening drink details from scrapbook photos remain stretch goals.

## State: what data does the app hold?

In live mode, cafes and drinks are stored in PostgreSQL and served by Express. React loads them after login and updates its state after successful add, edit, or delete requests. In demo mode, sample records and changes stay in the browser's localStorage.

| Data | Shape or value | Where it lives | Changes when |
| --- | --- | --- | --- |
| cafes | `[{ id, name, photoUrl }]` | App state; PostgreSQL in live mode | Data loads, a cafe and first drink are created, or an empty cafe is removed after deletion. |
| drinks | `[{ id, cafeId, name, type, price, rating, reorder, notes, date, photoUrl }]` | App state; PostgreSQL in live mode | Data loads or a drink is added, edited, or deleted. Rating can be null. |
| status / error | loading, ready, or error; an error value | App | Loading succeeds or fails. |
| search / type | Search text; all, matcha, or hojicha | App / CafePage | I type or select a filter. |
| route / selected drink | Hash route; selected drink ID | App / CafePage | I navigate or open/close a drink detail view. |
| addingCafe / addingDrink / editing | Boolean flags | App / DrinkDetail | I open or close a form. |
| form values / step / busy | Cafe/drink fields, photo data URLs, cafe/drink step, save status | AddCafeModal | I enter values, choose an image, change steps, or save. |
| month / shuffle | Current local month; shuffle counter | Scrapbook | The current month is derived from the date; shuffle changes when I press its button. There is no month selector. |
| authentication state | checking, logged-out, or authenticated | AuthGate; session token in an HttpOnly cookie | Session checks, login, logout, or expiry. |


## What each screen contains

**Screen: Owner login**

- Sipori wordmark and illustrated stars.
- Username and password fields, a login button, and checking/submitting/error states.
- After login, a logout control in the main interface.

**Screen: Cafes / home**

- Cafes title, cafe-name search, and navigation.
- Cafe cards with photos or fallbacks, names, drink counts, and average ratings.
- Add Shop control, plus loading, error/retry, and no-match/empty states.

**Screen: Cafe page**

- Cafe name, back control, Add Drink, search, and All/Matcha/Hojicha filters.
- Drink cards showing a photo or fallback, name, rating, type, price, date, reorder choice, and notes.
- A drink detail view with edit/delete controls, plus no-match and error states.

**Popup: Add cafe / first drink**

- Cafe name, image control, and Cancel/Next.
- The drink form follows within the same dialog; saving creates both records together.

**Popup: Add or edit drink**

- Image control and fields for date, type, name, optional star rating, price, reorder, and notes.
- Discard/Save, validation feedback, and a busy state during saving.

**Interaction: Delete confirmation**

- A confirmation message with Keep Drink/Delete Drink controls.
- An explicit warning when deleting the last drink will also delete the cafe.

**Screen: Scrapbook**

- Current-month label and shuffle control.
- Up to ten tilted photo cards with drink-name captions and decorative artwork.
- Loading, error/retry, and an empty-month message linking back to cafes.
- Phone layouts adapt the arrangement for smaller screens.

## One risk

My original main risk was connecting React to Express/PostgreSQL, handling photos, and saving a cafe together with its first drink. Those flows now work through a shared API interface, server validation, and database transactions. A current issue is phone login: PC testing worked, but my iPhone reported a cookie-settings message. A same-origin hosting option is prepared locally and still needs deployment and retesting. Sessions and login limits reset on API restart, and photos can consume database or browser-storage quota.

## What changed from the original proposal

| Original plan | Current implementation or deferred work |
| --- | --- |
| Single-user journal with no login | Still one owner, now protected by username/password login, sessions, and logout. Registration is future work. |
| Plain routes such as /cafe/:cafeId | Hash navigation: #/, #/cafes/:cafeId, and #/scrapbook. |
| Separate Add Cafe and Add Drink modals | One reusable dialog with cafe/first-drink steps; the drink step also supports existing cafes and editing. |
| Drink details open as a modal from cafe cards or scrapbook photos | Details open within the cafe page; scrapbook photos do not open details. |
| Scrapbook might be cut | Current-month scrapbook completed with up to ten photos and shuffle. Past-month browsing remains deferred. |
| FormData/multer uploads, storing a file URL | Validated base64 image data URLs stored in cafe/drink records. Dedicated image storage is future work. |
| Required drink rating | Optional 1–5 star rating; unrated drinks do not contribute to cafe averages. |
| Case-insensitive unique cafe names | Not enforced by the current schema; duplicate names are possible. |
| Planned backend connection | Main website completed and deployed by October 3, 2026, using Render and Supabase. |

## The parts most likely to drift

- **Core features.** Cafe/drink logging, search/filtering, edit/delete, owner login, and the current-month scrapbook are implemented. Deferred work includes earlier-month scrapbook browsing and opening details from scrapbook photos. Future expansion includes registration/private user journals, photo storage, insights, and exports.
- **Where each piece is hosted.** The documented frontend is [sipori.onrender.com](https://sipori.onrender.com/#/), the Express API is [sipori-api.onrender.com](https://sipori-api.onrender.com/healthz), and PostgreSQL is hosted on Supabase. 
- **The date demo mode goes off.** The main website was completed and deployed by October 3; the exact first switch-off date is not recorded. False or unset VITE_USE_MOCK_API uses live mode. Exact true enables a separate sample-data/localStorage fallback. Changing modes requires a restart/rebuild; live errors do not automatically enable demo mode.
- **Risks.** The original API, first-drink handoff, and scrapbook concerns have reduced through implementation and local tests. Phone login, process-local sessions/login limits, storage usage, and the changes needed for future multi-user ownership remain work to address.
