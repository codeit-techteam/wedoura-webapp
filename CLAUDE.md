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
```

## Rules that matter

- **Never open `docs/reference/*.html` whole.** They are 2 MB of base64 images. Use `docs/reference/extracted/`
  (`tokens.md`, `*.markup.html`, `*.css`, `*.js`). Mockups are for tone and section ideas; the brief wins on values.
- **Data flows one way.** Pages and components import content only from `@/lib/api` (async functions). Only
  `src/lib/api.ts` imports from `src/data`. ESLint enforces this; `@/data/types` is allowed anywhere.
- **Tokens only.** Colours, type sizes, tracking, easing and spacing live in `src/styles/tokens.css` and are used
  as Tailwind utilities (`bg-ivory`, `text-h2`, `tracking-label`, `ease-wedoura`, `py-section`). No hex values or
  magic numbers in components. Custom utilities: `label`, `hairline`, `tap`, `container-site`.
- **Photographs are shown whole.** Use `<Photo>` (next/image, blur placeholder, intrinsic aspect ratio). `mode="cover"`
  is only for hero and cover images. Every image needs `sizes` and alt text. Sizes come from the data, never guessed.
- **Design guardrails.** White and ivory backgrounds, ink text, gold only for small marks (fails AA as body text).
  Square corners, hairlines, no shadows, no loud colour, no pop-ups, no auto-advancing carousels.
  Body text at least 16px; tap targets at least 44px (`tap`). Visible focus (gold outline) stays on.
- **No invented numbers.** No ratings, review counts or statistics. Sample content says "(sample)" or "Sample copy".
- **Mobile first.** Design at 390px, then 768px (`md:`), then 1440px (`xl:`). Bottom nav on mobile.
- **Forms are screens only.** Validate, show a success state, send nothing.

## Motion (five patterns, use these, nothing else)

| # | Pattern | Component | Spec |
|---|---|---|---|
| 1 | Fade and rise on enter | `<Reveal>` | 24px, 0.9s, once, amount 0.2 |
| 2 | Slow zoom on hover or press | `<PhotoCard>` | scale 1.04, 1.2s |
| 3 | Parallax, covers and story openers only | `<Parallax>` | ±6% |
| 4 | Page and viewer transitions | `template.tsx` + `<PhotoViewer>` | fade 0.45s; shared `layoutId` |
| 5 | Film previews | `<FilmPreview>` | muted autoplay in view, pause off screen |

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
src/app            routes (layout, template, styleguide, ...)
src/components/ui  Heading, Label, Text, Button, Hairline, Container, Section
src/components/media   Photo, PhotoCard, FilmPreview
src/components/motion  MotionProvider, Reveal, Parallax, PageTransition, PhotoViewer
src/data           typed sample content (types.ts, photos.ts generated)
src/lib            api.ts (data access), motion.ts, cn.ts
src/styles         tokens.css, fonts.ts
public/photos      placeholder photographs + alt.json (replace, then npm run photos)
```

## Definition of done

Lint and typecheck pass, `npm run build` succeeds, the page works at 390px, and `docs/PROGRESS.md` is updated at
the end of every session (status per build step, session log, next up).
