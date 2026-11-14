# Wedoura frontend

Wedding vendor showcase for India. Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS v4, Motion.
Frontend only; a backend comes later. Full brief: `docs/reference/brief.md`. Progress: `docs/PROGRESS.md`.

## Commands

```
npm run dev          # http://localhost:3000  (styleguide at /styleguide)
npm run build        # production build, run before calling a page done
npm run lint         # eslint .  (next lint no longer exists in Next 16)
npm run typecheck    # next typegen && tsc --noEmit
npm run photos       # regenerate src/data/photos.ts from public/photos + alt.json
npm run extract-reference  # regenerate docs/reference/extracted from the mockups
BASE_URL=http://localhost:3001 npm run screenshots  # docs/screenshots + keyboard/reduced-motion checks (needs a running server)
```

## Rules that matter

- **Never run `git commit` or `git push`.** The user commits and pushes themselves. Leave all work in the
  working tree.
- **Never open `docs/reference/*.html` whole.** They are 2 MB of base64 images. Use `docs/reference/extracted/`
  (`tokens.md`, `*.markup.html`, `*.css`, `*.js`). Mockups are for tone and section ideas; the brief wins on values.
- **Data flows one way.** Pages and components import content only from `@/lib/api` (async functions). Only
  `src/lib/api.ts` imports from `src/data`. ESLint enforces this; `@/data/types` is allowed anywhere.
- **Tokens only.** Colours, type sizes, tracking, easing and spacing live in `src/styles/tokens.css` and are used
  as Tailwind utilities (`bg-ivory`, `text-h2`, `tracking-label`, `ease-wedoura`, `py-section`). No hex values or
  magic numbers in components. Custom utilities: `label`, `nav-link`, `wordmark`, `hairline`, `tap`,
  `container-site` (1680px), `container-wide` (1920px, near full-bleed), `no-scrollbar`, `link-draw`
  (underline draws in), `transition-chrome` (0.3s chrome changes).
- **Photographs are shown whole.** Use `<Photo>` (next/image, blur placeholder, intrinsic aspect ratio). `mode="cover"`
  is only for hero and cover images. Every image needs `sizes` and alt text. Sizes come from the data, never guessed.
- **Two card layouts.** `<CardRow ratio="4/5">` gives every card in a row one aspect ratio, chosen per row; cards
  inside inherit it. Galleries use no ratio so each photo keeps its own proportions.
- **Design guardrails.** White and ivory backgrounds, ink text. Gold is for marks, rules and icons only, never
  text, not even labels (3.5:1 on white). Headlines are Instrument Serif 400 (large, tracking tight); body is DM Sans 400 (500 for emphasis).
  Square corners, hairlines, no shadows, no loud colour, no pop-ups, no auto-advancing carousels.
  Body text at least 17px, nothing under 14px; tap targets at least 44px (`tap`). Visible focus (gold outline) stays on.
- **No invented numbers.** No ratings, review counts or statistics. Sample content says "(sample)" or "Sample copy".
- **Mobile first.** Design at 390px, then 768px (`md:`), then 1440px (`xl:`). Bottom nav on mobile.
- **Chrome.** The navbar is sticky and goes transparent with white text over any page element carrying
  `data-nav-dark` (CSS `:has()` rule in `globals.css`). A page with a full-bleed dark hero pulls it under the
  navbar with `-mt-nav`. Overlays (search, menu) use `useFocusTrap`; Escape closes every panel.
- **Forms are screens only.** Validate, show a success state, send nothing.

## Motion (these patterns, nothing else)

| # | Pattern | Component | Spec |
|---|---|---|---|
| 1 | Fade and rise on enter | `<Reveal>` | 24px, 0.9s, once, amount 0.2 |
| 2 | Slow zoom on hover or press | `<PhotoCard>`, photo tiles | scale 1.04, 1.2s |
| 3 | Parallax, covers and story openers only | `<Parallax>` | ±6% |
| 4 | Page and viewer transitions | `template.tsx` + `<PhotoViewer>` | fade 0.45s; shared `layoutId` |
| 5 | Film previews | `<FilmPreview>` | muted autoplay in view; poster breathes when no clip |
| 6 | Headline mask reveal | `<MaskedHeading>` | lines rise 110%→0, 0.8s, 90ms stagger |
| 7 | Image wipe reveal | `<ImageReveal>` | clip-path inset + scale 1.06→1, 1s, once |
| 8 | Scroll-linked pins (home only) | `WeddingsScroller`, `FilmsShowcase`, `HeroV2` | transform/opacity only; carousel or static fallback on touch and reduced motion |

Smooth scrolling is Lenis via `<SmoothScroll>` (root layout); it disables itself under reduced motion.
Only transform, opacity and clip-path are animated. Rails hide scrollbars (`no-scrollbar`) and show a thin
progress line (`RailProgress`).

Constants in `src/lib/motion.ts`; easing `cubic-bezier(0.2, 0.7, 0.2, 1)`. `MotionConfig reducedMotion="user"` in
the root layout plus the CSS media query switch motion off. Motion components are client components
(`"use client"`), import from `motion/react`.

## Next 16 notes

- `params` and `searchParams` are Promises; use the generated `PageProps<"/route/[slug]">` / `LayoutProps` helpers.
- `images.qualities` is `[60, 75, 90]`; pass only those to `quality`.
- Tailwind runs through `@tailwindcss/turbopack` (see `next.config.ts`); there is no PostCSS config.
- Server components by default. Add `"use client"` only where hooks, Motion or browser APIs are needed.

## Layout

```
src/app            routes (layout, template, styleguide, placeholders for every route in the brief)
src/components/ui  Heading, Label, Text, Button, Hairline, Container, Section, Icon
src/components/chrome  Navbar (+SiteHeader), VendorsPanel, SearchOverlay, MobileMenu, BottomBar, SiteFooter, Wordmark, Placeholder
src/components/media   Photo, PhotoCard, CardRow, FilmPreview
src/components/home    HeroSearch, CategoriesShowcase, VendorRail, WeddingsEditorial, FilmsBand, CitiesIndex, FaqAccordion
src/components/motion  MotionProvider, Reveal, Parallax, PageTransition, PhotoViewer, SmoothScroll (Lenis)
src/data           typed sample content (types.ts, photos.ts generated)
src/lib            api.ts (data access), motion.ts, cn.ts, saved.ts (shortlist store), focus-trap.ts
src/styles         tokens.css, fonts.ts
public/photos      placeholder photographs + alt.json (replace, then npm run photos)
docs/screenshots   chrome captures from scripts/screenshots.mjs
```

## Definition of done

Lint and typecheck pass, `npm run build` succeeds, the page works at 390px, and `docs/PROGRESS.md` is updated at
the end of every session (status per build step, session log, next up).
