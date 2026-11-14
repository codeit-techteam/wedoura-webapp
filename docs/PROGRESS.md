# Wedoura frontend: progress

Update this file at the end of every session. Build order follows `docs/reference/brief.md`.

## Status by build step

| # | Step | Status |
|---|---|---|
| 1 | Foundations: scaffold, tokens, styleguide page, base components | ✅ Done (2026-11-14) |
| 2 | Navbar, mobile bar, footer | ✅ Done (2026-11-14) |
| 3 | Homepage | ⬜ |
| 4 | Vendor profile | ⬜ |
| 5 | Vendor listing | ⬜ |
| 6 | Real weddings listing and story page | ⬜ |
| 7 | Blogs, gallery, honeymoon, saved, simple pages | ⬜ |
| 8 | Vendor signup, login and studio screens | ⬜ |
| 9 | Venue profile with the 360-degree view | ⬜ |
| 10 | Polish pass: motion, speed, accessibility, small screens | ⬜ |

## Session log

### 2026-11-14 · Session 2: foundation fixes and site chrome

Done:
- Part A: body text Jost 400 under `md`, 300 above. Gold removed from all text (labels, section numbers); it is
  now marks, rules and icons only, and the styleguide says so. `<CardRow ratio>` added: every card in a row shares
  one aspect ratio, inherited by `<PhotoCard>`; galleries keep mixed ratios. Container verified centred at 1920px
  (1360px wide, equal margins); a `container-wide` (1600px) variant exists for photo bands.
- Navbar: sticky, transparent with white text over `data-nav-dark` heroes (CSS `:has()`), solid white with a
  hairline once scrolled, hides on scroll down and returns on scroll up, all 0.3s on the Wedoura easing.
  Text wordmark in the serif with wide tracking, swappable for a logo file in `Wordmark.tsx`.
- Vendors panel: six category photo tiles plus See all vendors. Opens on hover (mouse only) and click;
  ArrowDown and Tab enter it; Escape closes and refocuses the button; closes on outside click and focus-out.
- Search overlay: large input with cities and categories as quick links; routes to `/vendors?q=`, `?city=`,
  `?category=`. Focus-trapped, Escape closes and returns focus.
- Mobile: wordmark + menu button; full-screen menu with large serif links rising in sequence, the six
  categories, search, saved, login and List Your Business; fixed bottom bar (Home, Vendors, Real Weddings,
  Saved) with active state, count badge and safe-area padding (`viewportFit: cover`).
- Footer with the three link columns, social icons, copyright and a sample-content note.
- Temporary homepage (full-screen hero + five tall sections) and placeholder pages for every route in the
  brief, dynamic ones prerendered from the sample data with 404s for unknown slugs.
- `scripts/screenshots.mjs` captures `docs/screenshots/*` at 390 and 1440 and runs 19 behaviour checks
  (hide/show on scroll, hover/keyboard/Escape for each panel, focus return, reduced motion, overflow, 44px targets,
  container centring). All pass with no console errors.

Decisions:
- Shortlist store (`src/lib/saved.ts`) is localStorage + `useSyncExternalStore`; the count shows only when > 0.
- Saved and List Your Business are desktop-only in the top bar; on phones they live in the menu and bottom bar.
- Social links point at the networks’ home pages until the client gives handles.
- Dev indicator badge appears in dev-server captures; final screenshots are taken from `next start`.

Known gaps / next up:
- Step 3, the real homepage: hero with where-and-who search, featured vendors with three photos each, real
  weddings cover + two, films row, browse by city, promises, blog, FAQ, List your business band.
- Vendors panel tiles use `?category=` links; the `/vendors` page (step 5) must read `category`, `city` and `q`.
- Logo file from the client; more Indian wedding placeholder photographs.

### 2026-11-14 · Session 1: foundations

Done:
- Scaffolded Next.js 16.4.6 (App Router, Turbopack, `src/`, TypeScript, ESLint flat config), Tailwind 4.3.3 via
  `@tailwindcss/turbopack`, Motion 14.14, React 19.3. Git initialised on `main`.
- Extracted the three client mockups into `docs/reference/extracted/` (markup, CSS, JS, `tokens.md`) with a
  rerunnable script. Originals were never read whole.
- Design tokens in `src/styles/tokens.css` (brief values; Tailwind namespaces reset so only Wedoura tokens exist),
  fonts via `next/font` (Cormorant Garamond 300/400 + italic, Jost 300/400/500), base styles in `globals.css`.
- Data layer: `src/data/types.ts`, sample content (6 categories, 6 cities, 7 vendors incl. one venue, 3 real
  weddings, 3 blog posts, 4 destinations, 3 films, FAQ, promises), generated `photos.ts` with real dimensions and
  blur placeholders, and `src/lib/api.ts` as the only data entry point (ESLint rule enforces it).
- Base components: Heading, Label, Text, Button, Hairline, Container, Section, Photo, PhotoCard, FilmPreview,
  MotionProvider, Reveal, Parallax, PageTransition (root `template.tsx`), PhotoViewer.
- `/styleguide` showing colour, type, spacing, buttons, photo cards and all five motion patterns.
- `CLAUDE.md` and this file.

Decisions:
- Cache Components and React Compiler left off for now (static sample data; revisit in the polish pass).
- 17 placeholder photographs from Unsplash in `public/photos/` (Unsplash licence, not for production). Only two
  show Indian weddings; the rest are generic. Replace before any client review.
- Sample film clip is the MDN CC0 `flower.mp4`; real previews should be about 10 s, muted, in a local folder.
- Page transitions use a Motion fade through `template.tsx`, not React ViewTransition yet.
- Verified at 390px and 1440px with headless Chrome: no horizontal overflow, no console errors. On this machine
  port 3000 is held by another process, so `next dev` runs on http://localhost:3001.

Known gaps / next up:
- Step 2: Navbar (Vendors mega-menu with six categories, centre logo, search, Saved, List Your Business),
  mobile bottom bar, footer. Needs a Wedoura wordmark or logo asset from the client.
- More Indian wedding placeholder photographs; a venue 360 asset or embed decision for step 9.
- `/saved` will need a small client store (localStorage) in step 7.
