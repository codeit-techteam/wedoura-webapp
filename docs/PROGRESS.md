# Wedoura frontend: progress

Update this file at the end of every session. Build order follows `docs/reference/brief.md`.

## Status by build step

| # | Step | Status |
|---|---|---|
| 1 | Foundations: scaffold, tokens, styleguide page, base components | ✅ Done (2026-11-14) |
| 2 | Navbar, mobile bar, footer | ⬜ |
| 3 | Homepage | ⬜ |
| 4 | Vendor profile | ⬜ |
| 5 | Vendor listing | ⬜ |
| 6 | Real weddings listing and story page | ⬜ |
| 7 | Blogs, gallery, honeymoon, saved, simple pages | ⬜ |
| 8 | Vendor signup, login and studio screens | ⬜ |
| 9 | Venue profile with the 360-degree view | ⬜ |
| 10 | Polish pass: motion, speed, accessibility, small screens | ⬜ |

## Session log

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
