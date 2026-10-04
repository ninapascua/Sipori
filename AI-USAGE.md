# AI usage

Sipori was built with substantial AI assistance using ChatGPT and Codex (OpenAI).
AI helped write and revise frontend components, CSS, backend authentication,
validation, tests, and deployment configuration. I directed the product and visual
choices, requested revisions, and carried out the hosting setup. This is not a
claim that I independently wrote every file committed under my GitHub account.


## 1. How I used AI

### 2026-09-23 â€” Initial project setup

- **Tool:** ChatGPT (OpenAI).
- **What I asked for:** I shared my existing Sipori project plan, design decisions, course requirements, and the provided final project template. I asked for help organizing the initial development steps.
- **What it gave back:** A checklist covering running the template, personalizing it for Sipori, retaining the initial demo API structure, deploying the starter version, and documenting progress.
- **What I kept, what I changed, and why:** As recorded in my original entry, the concept, planned screens, user flow, visual direction, and technology requirements existed before this conversation. I used the course template and START-HERE.md as the starting point. Demo mode was later removed from the active app when private owner login was added.
- **Commit:** [Original documentation entry](https://github.com/ninapascua/Sipori/commit/386b7e2042ca143bf1e57e39d62a221982e8a138).

### 2026-09-27 - Creating the add-shop modal from my wireframes

- **Tool:** Codex (OpenAI).
- **What I asked for:** I asked AI to help create the modals as closely as possible to my high-fidelity wireframes.
- **What it gave back:** An initial implementation of the add-shop modal and its styling, including the cafe-name input, image selection and preview, and modal controls.
- **What I kept, what I changed, and why:** I used the AI-generated implementation as a starting point, then polished it myself to bring the result closer to my wireframes. The wireframes guided the design rather than leaving the visual direction entirely to AI.
- **Commit:** [Add-shop modal](https://github.com/ninapascua/Sipori/commit/bdcc6e57070fd8cabe82f2b6fa7d6e872e9c04d1).

### 2026-09-27 - Building the cafe page from my wireframe

- **Tool:** Codex (OpenAI).
- **What I asked for:** As I recall, I asked AI to help build the cafe page as closely as possible to my high-fidelity wireframe, following the same approach as the modals.
- **What it gave back:** An initial cafe-page implementation and styling. The linked commit introduced CafePage.jsx, navigation to a selected cafe, and the associated drink display and add-drink flow.
- **What I kept, what I changed, and why:** I used the implementation as a starting point and polished the result myself to better match my intended design. The wireframe provided the visual direction, and I reviewed the output rather than treating the first version as final.
- **Commit:** [Cafe route and drink view](https://github.com/ninapascua/Sipori/commit/0409e06b7c3b76c7eeafbdcb154e874daa47ed92).

### 2026-09-30 - Finalizing the frontend and responsiveness

- **Tool:** Codex (OpenAI).
- **What I asked for:** I asked AI to point out parts of the frontend that could break or behave incorrectly, including when the screen size changed. I worked on the polishing myself and asked for guidance when I could not resolve something on my own.
- **What it gave back:** Feedback on potential frontend problems and guidance for addressing them. Both AI and I contributed to polishing the frontend.
- **What I kept, what I changed, and why:** I used the feedback to guide my own revisions and worked with AI on issues I could not fix independently. The aim was to preserve my intended design while making the frontend more reliable and responsive.
- **Commit:** [Finalized the frontend and responsiveness](https://github.com/ninapascua/Sipori/commit/78d5324a6b3d77233c1c1888492fce908389024f).

### 2026-10-02 â€” Single-owner login

- **Tool:** Codex (OpenAI).
- **What I asked for:** A fixed username and password for one owner, with no registration, to prevent unauthenticated crawlers from reading the journal.
- **What it gave back:** A server-side password hashing, session cookies, logout, login rate limiting, protected API routes, a local credential setup command, and authentication tests.
- **What I kept, what I changed, and why:** I kept the one-owner design instead of adding multi-user accounts. Credentials belong on the server, and the browser-only mock API was disabled so it could not bypass the private API. The protection blocks unauthenticated access generally; it does not identify AI crawlers specifically.
- **Commit:** [Owner authentication](https://github.com/ninapascua/Sipori/commit/78a69a672f301ebf82633fcde453d0bc28bd9fc3).

### 2026-10-03 â€” Code review and deployment preparation

- **Tool:** Codex (OpenAI).
- **What I asked for:** A review of the project files and a check of deployment readiness.
- **What it gave back:** Fixes for Docker's shared-file paths and environment settings, safer request-error handling, URL encoding, date validation, tests, and compatible dependency security fixes. It also checked database connectivity and required columns without changing journal records.
- **What I kept, what I changed, and why:** I kept the fixes that addressed concrete problems. The assistant reported successful tests, builds, and clean dependency audits at that time. Docker itself was not run because it was unavailable. Remaining security checks are recorded in SECURITY-CHECKLIST.md.
- **Commit:** [Review fixes and configuration](https://github.com/ninapascua/Sipori/commit/d07fcadbc0e8455bd1a444d5a74965c7f382cddd).

### 2026-10-03 â€” Delete empty shops

- **Tool:** Codex (OpenAI).
- **What I asked for:** Automatically delete a shop when its last drink is deleted, warn before doing so.
- **What it gave back:** A transaction that deletes the drink and conditionally deletes its empty shop, a confirmation warning, a response identifying the deleted shop, and frontend state updates.
- **What I kept, what I changed, and why:** I kept the explicit â€œdelete drink and shopâ€ confirmation and the rule that shops with other drinks remain. The backend decides whether the shop is empty rather than relying only on the visible cards.
- **Commit:** [Empty-shop deletion](https://github.com/ninapascua/Sipori/commit/8e1c7937d840192123a371f75f8803eb4588ede3).

## 2. Where the AI got it wrong

### Case 1 - Deployment configuration used the wrong file paths

* **What it gave me:** While preparing the project for deployment, AI reviewed the Docker and environment configuration and initially worked with file paths that did not completely match the structure of my project.
* **What was wrong with it:** Sipori has files shared between the client and server, so the Docker build needs access to the correct directories. A configuration can look correct but still fail when Docker builds from a different context or cannot find a shared file.
* **What I did instead:** I checked the suggested configuration against my actual project structure and corrected the Docker shared-file paths and environment settings before keeping the deployment configuration.
* **Commit:** https://github.com/ninapascua/Sipori/commit/d07fcadbc0e8455bd1a444d5a74965c7f382cddd

### Case 2 - A frontend revision left the wordmark missing

* **What it gave me:** During the later frontend and deployment revisions, a change left the Sipori wordmark asset missing from the frontend build.
* **What was wrong with it:** The frontend still depended on the asset, so the build could not be treated as finished even though the rest of the changes looked correct.
* **What I did instead:** I traced the problem back to the missing asset, restored the wordmark, and rebuilt the frontend. I kept checking the project after later changes instead of assuming that an AI-generated revision worked because the code itself looked reasonable.
* **Related commit:** https://github.com/ninapascua/Sipori/commit/d07fcadbc0e8455bd1a444d5a74965c7f382cddd


## 3. Who wrote what

### Written by me

#### CafÃ© and drink behavior

- **File:** `client/src/App.jsx` and related cafÃ© and drink components.
- **Commit:** [https://github.com/ninapascua/Sipori/commit/0409e06b7c3b76c7eeafbdcb154e874daa47ed92](https://github.com/ninapascua/Sipori/commit/0409e06b7c3b76c7eeafbdcb154e874daa47ed92)
- **What it does and why it is built this way:** I worked on and revised the behavior connecting the cafÃ© and drink screens. A cafÃ© can be selected to show its drinks, and the application keeps track of what the user is currently viewing so it can show the correct page and update after changes. I also worked on the add and edit flows while testing how the frontend behaved.

#### Design and frontend revisions

- **File:** `client/src/styles.css`, with related changes in `client/src/App.jsx` and frontend components.
- **Commit:** [https://github.com/ninapascua/Sipori/commit/78d5324a6b3d77233c1c1888492fce908389024f](https://github.com/ninapascua/Sipori/commit/78d5324a6b3d77233c1c1888492fce908389024f)
- **What it does and why it is built this way:** I worked on the frontend styling and revisions based on the wireframes and visual direction I had made for Sipori. I changed CSS, spacing, sizing, images, layout, and some JSX while adjusting the pages to match my design and work better at different screen sizes. The responsive rules change parts of the layout when there is less screen space instead of keeping the desktop layout and letting it become squeezed.

#### Interface content and visual assets

- **File:** `client/src/assets/`, `client/src/styles.css`, and related frontend components.
- **Commit:** [https://github.com/ninapascua/Sipori/commit/78d5324a6b3d77233c1c1888492fce908389024f](https://github.com/ninapascua/Sipori/commit/78d5324a6b3d77233c1c1888492fce908389024f)
- **What it does and why it is built this way:** I worked on the visual content used throughout Sipori, including choosing and preparing artwork and deciding how it should appear in the interface. I also worked on interface text, labels, buttons, and other small details so that the finished pages stayed consistent with the style of my wireframes. The assets are kept separately from the components so they can be reused across the application, while the CSS controls how they are sized and positioned at different screen sizes. These details were important because Sipori was designed to feel like a personal journal rather than a generic database interface.

My own coding was spread across the project rather than contained in one feature. I wrote or modified frontend JSX and CSS, responsive styling, feature behavior, debugging fixes, project content, and some API, backend, and deployment code. AI assistance and my own changes are mixed together in several commits, so I do not claim that every line in the files above was independently written by me.

### The AI-written part I understand best

- **File:** `client/src/App.jsx`,  `client/src/components/`, `client/src/api/`, `server/cafeRoutes.js`, `server/cafesRepo.js`, and the authentication-related server files.
- **Commit:** [https://github.com/ninapascua/Sipori/commit/0409e06b7c3b76c7eeafbdcb154e874daa47ed92](https://github.com/ninapascua/Sipori/commit/78a69a672f301ebf82633fcde453d0bc28bd9fc3)[https://github.com/ninapascua/Sipori/commit/8e1c7937d840192123a371f75f8803eb4588ede3]
- **What it does and why we kept it:** I understand the overall flow of Sipori and how the main parts work together. The React frontend controls what the user sees and keeps track of the current cafÃ©, drink, and page state. When data needs to be loaded or changed, the frontend sends requests through the API instead of changing the database directly. The Express backend receives those requests, checks authentication and input where required, and uses the repository/database code to read or update PostgreSQL. I also understand the main cafÃ© and drink flows. Adding or editing information sends the changes to the backend and the frontend updates after the request succeeds. Deleting a drink also involves backend logic that checks whether its cafÃ© has any drinks left and removes the cafÃ© when it becomes empty. The single-owner authentication protects the private API so the journal is not openly readable without logging in. I kept these parts because they provide the main structure and behavior the application needs, and I tested and reviewed them throughout development.

