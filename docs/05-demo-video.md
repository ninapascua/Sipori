# Demo video

Screen recorded on the deployed site, in my own voice.

**Link:** [Sipori Presentation Demo Video](https://drive.google.com/drive/folders/1ekUwIKaVc59PJDiRf3HAXA72kOFYK8p2?usp=sharing)

## Structure

| **Part** | **What it shows** |
| --- | --- |
| Intro and problem | What Sipori is: a full-stack personal cafe journal for matcha and hojicha lovers. Photos alone do not capture the price, rating, reorder choice, or personal thoughts, so Sipori keeps those details together. |
| Home | The cafe's I have visited, their drink counts and average ratings, cafe search, and adding a cafe with its first drink. |
| Open a cafe | The drinks I have tried at a cafe, drink search, and the matcha and hojicha filters. |
| Open a drink | The drink's photo, name, price, date, rating, whether I would order it again, and personal notes. |
| Add, edit, and delete | Adding and editing drink entries, then deleting a drink. Deleting the last drink also removes its cafe so no cafe's are left empty. |
| Scrapbook | This month's drink photos arranged as a visual collection, making it easier to look back on and share my matcha and hojicha experiences online. |
| Tech behind Sipori | React and Vite for the frontend, Node and Express for the backend, PostgreSQL hosted on Supabase for the database, and Render for deployment. |
| AI segment | How I used ChatGPT and Codex for planning, implementation, debugging, and code refinement. ChatGPT guided the Supabase setup and backend connection, while I applied, reviewed, and tested the steps myself. |
| Code I understand | [`server/cafesRepo.js`](../server/cafesRepo.js) opened to explain `createCafeWithDrink`: one connection, unique IDs linking the café and drink, parameterized inserts, `BEGIN`, `COMMIT`, `ROLLBACK`, and releasing the connection. The transaction saves the cafe and its first drink together or undoes both if an insert fails. |
| Challenges and lessons | Connecting the frontend, backend, and database, keeping cafe and drink data consistent, and making sure database changes appear correctly in the interface. |
| What I would do differently and what's next | Planning the application structure and data earlier. Future additions include user registration, more scrapbook customization, and personal insights such as favorite cafe's, spending, and drink preferences. |

## Before recording

- [x] Open the site a few minutes early so the Render API is awake, and log in before the walkthrough.
- [x] Record the **deployed** URL [sipori.onrender.com](https://sipori.onrender.com/#/), not `localhost`.
- [x] Close other tabs, with no personal messages, other students' names, or `.env` file open in the editor.
- [x] Prepare realistic café and drink entries, including matcha and hojicha, ratings, and notes. Include photos dated this month for the scrapbook, and have the new café and drink details ready.
- [x] Prepare a disposable drink for the delete demonstration and open `server/cafesRepo.js` at `createCafeWithDrink` for the code explanation.
- [x] Do one full practice run against the 3-5 minute target. If something breaks, restart the recording instead of narrating the bug.

## Fallback

1. **Demo mode build.** Prepare a client build with `VITE_USE_MOCK_API=true` to use Sipori's sample data and browser-local changes if the deployed API is unavailable.
2. **Screenshots.** Use the desktop and phone high-fidelity screenshots and supplemental implementation screenshots linked in [02-mockup.md](02-mockup.md).
