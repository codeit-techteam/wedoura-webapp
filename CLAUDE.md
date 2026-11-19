# Wedoura frontend

Wedding vendor showcase for India. Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS v4, Motion.
Frontend only; a backend comes later. Full brief: `docs/reference/brief.md`. Progress: `docs/PROGRESS.md`.

## Commands

```
npm run dev          # http://localhost:3000  (styleguide at /styleguide)
npm run dev:seed     # same, with ~200 generated vendors (WEDOURA_SEED=1; src/data/seed.ts)
npm run build        # production build, run before calling a page done
npm run build:seed   # seeded production build; delete .next when flipping seed modes
npm run test         # vitest: mapping, lifecycle, paging, seed, schema, component tests (tests/)
npm run lint         # eslint .  (next lint no longer exists in Next 16)
npm run typecheck    # next typegen && tsc --noEmit
npm run photos       # regenerate src/data/photos.ts from public/photos + alt.json
npm run extract-reference  # regenerate docs/reference/extracted from the mockups
node scripts/screenshots-core.mjs  # core-page screenshots + behaviour checks (needs next start on 3001)
node scripts/audit.mjs     # full crawl + interactions + portal + SEO + keyboard + CLS (needs next start on 3001)
BASE_URL=http://localhost:3001 npm run screenshots  # docs/screenshots + keyboard/reduced-motion checks (needs a running server)
```

## Rules that matter

- **Never run `git commit` or `git push`.** The user commits and pushes themselves. Leave all work in the
  working tree.
- **Never open `docs/reference/*.html` whole.** They are 2 MB of base64 images. Use `docs/reference/extracted/`
  (`tokens.md`, `*.markup.html`, `*.css`, `*.js`). Mockups are for tone and section ideas; the brief wins on values.
- **Data flows one way.** Pages and components import content only from `@/lib/api` (async functions). Only
  `src/lib/api.ts` imports from `src/data`. ESLint enforces this; `@/data/types` is allowed anywhere.
- **The contract.** `src/data/types.ts` + `docs/api-contract.md` define what the backend must serve. Lists
  return `Paged<VendorSummary>`, profiles `VendorDetail`, never the raw `VendorListing`. **Public functions in
  api.ts only ever see `published` listings** — enforce lifecycle rules there, never in pages. Vendor-side
  calls live in `src/lib/vendor-api.ts` over the localStorage mock (`src/lib/mock-store.ts`); `/demo` is the
  admin stand-in (noindex, unlinked); `src/lib/demo-credentials.ts` (vendor@gmail.com / 123456) is deletable
  demo-ware. Prices are `priceINR` + `PriceUnit`, printed only through `formatPrice` (src/lib/format.ts).
- **Tokens only.** Colours, type sizes, tracking, easing and spacing live in `src/styles/tokens.css` and are used
  as Tailwind utilities (`bg-ivory`, `text-h2`, `tracking-label`, `ease-wedoura`, `py-section`). No hex values or
  magic numbers in components. Custom utilities: `label`, `nav-link`, `wordmark`, `hairline`, `tap`,
  `container-site` (1360px content width), `container-wide` (1920px, near full-bleed), `no-scrollbar`, `link-draw`
  (underline draws in), `transition-chrome` (0.3s chrome changes).
- **Photographs are shown whole.** Use `<Photo>` (next/image, blur placeholder, intrinsic aspect ratio). `mode="cover"`
  is only for hero and cover images. Every image needs `sizes` and alt text. Sizes come from the data, never guessed.
- **Two card layouts.** `<CardRow ratio="4/5">` gives every card in a row one aspect ratio, chosen per row; cards
  inside inherit it. Galleries use no ratio so each photo keeps its own proportions.
- **Design guardrails.** White and ivory backgrounds, ink text (#1a1816, muted #5f5a52). Gold (#A8864A) is for
  marks, rules, icons and the one italic `<em>` accent word per headline (`h1 em`/`h2 em` are gold automatically);
  small gold labels use `gold-deep` #8A6D3B (`Label tone="gold"`) so they pass contrast; gold never colours body
  text. Headlines are Cormorant Garamond 300 (400 for card/vendor names via `font-regular`), set large because the
  face runs small; body is Jost 400 (300 only for lead paragraphs 20px+, 500 for nav/buttons/labels in small caps
  with wide tracking). Square corners, hairlines, no shadows, no loud colour, no pop-ups, no auto-advancing
  carousels. Body text at least 17px and never below 16px; labels may be 12px, nothing under 12px; tap targets at
  least 44px (`tap`). Visible focus (gold outline) stays on.
- **No invented numbers.** No ratings, review counts or statistics. Placeholder content carries no "sample"
  labels or slugs; the footer note is the one flag that the site is being built.
- **Mobile first.** Design at 390px, then 768px (`md:`), then 1440px (`xl:`). Bottom nav on mobile.
- **Chrome.** The navbar is sticky and goes transparent with white text over any page element carrying
  `data-nav-dark` (CSS `:has()` rule in `globals.css`). A page with a full-bleed dark hero pulls it under the
  navbar with `-mt-nav`. Overlays (search, menu) use `useFocusTrap`; Escape closes every panel.
- **Forms are screens only.** Validate, show a success state, send nothing.
- **One component per pattern.** Cards, rails, tabs, filters, accordions, empty states and skeletons live in
  src/components/{cards,browse,ui}; never rebuild one inline. Tabs/filters/sort/search state lives in URL query
  params, so every state is linkable and back works. Saved state only through
  src/lib/saved.ts. Stale photos after replacing files? Delete .next/cache/images.
- **Lists are server-rendered.** A list page reads its `searchParams` prop, normalises it with `pickParams`
  (src/lib/url.ts), filters through `@/lib/api` and renders the cards itself. Controls get `pathname` + `params`
  as props and build hrefs with `patchedHref` (`UnderlineTabs` are links; `FilterSelect` and `LoadMore` patch
  `?param=` / `?show=`). Never read `useSearchParams` for list content: on a static route it bails the whole
  Suspense boundary out of the HTML. `useParamState` (src/lib/url-state.ts) is only for client-only screens
  (saved, studio). Collapsed content (FAQ answers, "See all" photos) stays in the markup and is hidden with CSS.
  Never render separate desktop and mobile copies of the same content; pinned sections upgrade one copy via
  `useIsDesktop()` (src/lib/media.ts).
- **Nothing ships the whole dataset.** Search suggestions come from `/api/search` (≤5/3/3, debounced in
  `SearchOverlay`); `/saved` fetches only its shortlisted slugs (`/api/vendors/by-slugs`, `/api/weddings/by-slugs`);
  the homepage is fixed-size (8 featured via `listFeatured`: featured → featuredOrder → `publishedAt` desc).
  Never pass a full vendor list to a client component. The vendor directory is `<VendorBrowse>`
  (src/components/browse), rendered bare by `/vendors` and pinned by `/vendors/[category]/[city]`
  (the `[slug]` segment doubles as the category; non-category slugs 404 there).
- **Scale testing.** `WEDOURA_SEED=1` (server-only env; `npm run dev:seed` / `build:seed` / `start:seed`)
  appends ~190 deterministic listings, 24 stories and 12 articles from `src/data/seed.ts`. Dynamic routes read
  the flag at request time, so `next start` needs it too, not just the build. The mock store always seeds from
  `sampleListings` only. Test list pages in both modes; delete `.next` when flipping.
- **SEO.** Every page sets a canonical (`absoluteUrl` from src/lib/site-config.ts — also the one config for
  site name, email and socials; empty social = hidden). JSON-LD builders live in src/lib/schema.ts (never
  aggregateRating/review/priceRange), rendered by `<JsonLd>`. app/sitemap.ts + app/robots.ts exclude
  /demo, /login, /vendor-studio, /saved, /styleguide; the studio layout is a server wrapper exporting noindex.

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
src/app            bare root layout + root 404; public routes live in (site)/ (chrome layout + template);
                   vendor-studio/ is the vendor portal (own client layout: guard + StudioShell, 15 screens)
src/components/ui  Heading, Label, Text, Button, Hairline, Container, Section, Icon
src/components/chrome  Navbar (+SiteHeader), VendorsPanel, SearchOverlay, MobileMenu, BottomBar, SiteFooter, Wordmark, Placeholder
src/components/media   Photo, PhotoCard, CardRow, FilmPreview, PhotoGrid (uncropped grid + viewer)
src/components/cards   VendorCard, StoryCard, ArticleCard, PhotoTile  (the one card per content type)
src/components/browse  Rail, UnderlineTabs (links), FilterBar+FilterSelect, BottomSheet, LoadMore (?show=),
                       SavedList (fetches its shortlist), VendorBrowse (THE vendor directory, bare + pinned)
src/components/seo     JsonLd (renders src/lib/schema.ts builders)
src/components/profile VendorProfile (cover, key facts, content column + sticky inquiry aside), StickySubnav,
                       StickyActionBar (below lg), InquiryForm (compact variant), AlbumList (large covers),
                       VenueTour (360), VendorSignupForm (one-step application), AuthForms (login+contact),
                       StudioGate (status-routed studio), DemoPanel (/demo admin stand-in)
src/components/home    HeroV2 (photo crossfade, or a muted looping film when public/films/hero.mp4+jpg exist),
                       HeroSearch, PartnerBand (editorial brand band, hidden with no active partner),
                       CategoryTiles, WeddingsScroller, FilmsShowcase, CityMosaic, RailProgress
src/components/studio  the portal: StudioShell (sidebar/drawer), StatusScreens, status badge, Field/ScreenHeader,
                       autosave (DirtyProvider + useListingAutosave + SaveState), screen helpers (useListingForm,
                       TagListInput, ReorderButtons), checklist, PhotoManager, PhotoPicker. Every portal field
                       maps to VendorListing; reads/writes only through vendor-api (hooks + updateMyListing).
src/components/motion  MotionProvider, Reveal, Parallax, PageTransition, PhotoViewer, SmoothScroll (Lenis),
                       MaskedHeading, ImageReveal
src/data           typed sample content (types.ts, photos.ts generated, partners.ts placeholder brand,
                   seed.ts behind WEDOURA_SEED)
src/app/api        search + by-slugs route handlers (contract: GET /search, ?slugs=)
tests/             vitest suites (api mapping/lifecycle/paging, seed, schema, component render)
src/lib            api.ts (public reads, published-only), vendor-api.ts (vendor/admin calls + reactive hooks),
                   listing-view.ts (THE listing→public mapper, pending-media filter; api, previews and the
                   demo overlay all use it), upload.ts (simulated uploads: ≥800px, data URLs, 12px blur),
                   mock-store.ts (localStorage mock db), demo-credentials.ts (deletable), format.ts
                   (formatPrice), url.ts (server-safe param/href helpers), url-state.ts (client hook),
                   media.ts (useIsDesktop, useMounted), motion.ts, cn.ts, saved.ts (shortlist store),
                   focus-trap.ts, site-config.ts (name/email/socials/absoluteUrl), schema.ts (JSON-LD)
src/styles         tokens.css, fonts.ts
public/photos      placeholder photographs + alt.json (replace, then npm run photos)
docs/screenshots   chrome captures from scripts/screenshots.mjs
```

## Definition of done

Lint, typecheck and `npm run test` pass, `npm run build` succeeds, the page works at 390px, and
`docs/PROGRESS.md` is updated at the end of every session (status per build step, session log, next up).
