# Design system

**Colour.**

The theme uses CSS custom properties in [styles.css](../client/src/styles.css).

| Token | Hex | Use |
| --- | --- | --- |
| --bg | #F2EBDB | Cream page background |
| --fg, --line, --error-line | #350B0C | Dark brown text and borders |
| --muted, --accent | #203814 | Dark green text and controls |
| --card, --warn-line | #96A272 | Sage card/accent colour |
| --pink, --error-bg | #FBC1C8 | Pink accents/error background |

The Sipori color palette was tested for **WCAG color-contrast accessibility**. Dark brown (`#350B0C`) has a contrast ratio of **14.67:1** against light cream (`#F2EBDB`), **6.39:1** against light green (`#96A272`), and **11.26:1** against light pink (`#FBC1C8`). Dark green (`#203814`) has a contrast ratio of **10.8:1** against light cream (`#F2EBDB`), **4.7:1** against light green (`#96A272`), and **8.28:1** against light pink (`#FBC1C8`). All six combinations meet the **WCAG AA minimum contrast ratio of 4.5:1 for normal text**, while four combinations also meet the stricter **WCAG AAA requirement of 7:1**. This helps ensure that Sipori's text and interface elements remain readable and accessible for users with visual impairments.

**Type.**

[client/index.html](../client/index.html) loads Buenard (400/700) and Luxurious Script from Google Fonts.

| Role | Implemented treatment |
| --- | --- |
| Body and controls | Buenard with Georgia/serif fallback; base 16px, line-height 1.6 |
| General headings | h1 1.9rem; h2 1.15rem; h3 1.05rem, with component overrides |
| Login title | 1.65rem; line-height 1.25 |
| Decorative form headings | Luxurious Script; drink heading clamp(2.2rem, 3vw, 3rem) |
| Scrapbook month | Luxurious Script; clamp(22px, 2.5vw, 36px) |

Font sizes vary with viewport width through clamp() and media queries. The current CSS does not have a centralized named type scale.

**Spacing.** One scale, and stick to it. Numbers chosen at random per component
is the single most common reason a student project looks unfinished.

The CSS mixes rem, px, percentages, and clamp() values. Common small gaps/padding use values such as 8, 12, 16, and 24px, but I have not implemented one formal spacing-token scale. The main app uses a maximum width of 1456px and responsive page gutters. Most phone layout rules switch below 600px; scrapbook rules also use a 650px breakpoint, and login uses 760px.

**Components.**

| Component | Normal/interactive states in code |
| --- | --- |
| AuthGate | Session checking, logged out, submitting, authenticated, login errors, logout |
| Cafe cards | Image/name/count/rating; hover/focus shadow; selectable cafe |
| AddCafeModal | Native dialog, cafe/first-drink steps, edit mode, validation errors, busy save |
| Add controls | Illustrated star controls with hover/focus artwork |
| DrinkDetail | Display/edit, busy state, delete confirmation, last-drink warning |
| Search/filter controls | Search text, selected type, disabled controls during relevant transitions |
| Scrapbook | Loading, error/retry, empty month, photos, shuffle disabled with fewer than two photos |

Global :focus-visible uses a 2px green outline with a 2px offset. Some components override focus with outlines, shadows, or artwork. The native dialog restores focus on close and focuses the drink heading when changing steps. Reduced-motion media queries adjust animation/transition behavior. Full keyboard, screen-reader, and visual contrast checks are still required before claiming accessibility compliance.

**States.**

In Sipori, login has checking, submitting, authenticated, and error states. Cafe/drink views have loading, empty/no-match, error/retry, and populated states. The scrapbook has loading, error, empty-current-month, and photo states; shuffle is disabled with fewer than two photos. Demo mode displays its own notice.

## In code

Sipori uses CSS custom properties and component selectors in [styles.css](../client/src/styles.css), with fonts loaded in [client/index.html](../client/index.html). It does not use Tailwind or a component library. Responsive layouts use media queries and clamp(), and animations include reduced-motion rules.


