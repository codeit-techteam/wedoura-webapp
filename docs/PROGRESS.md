# Wedoura frontend: progress

Update this file at the end of every session. Build order follows `docs/reference/brief.md`.

## Status by build step

| # | Step | Status |
|---|---|---|
| 1 | Foundations: scaffold, tokens, styleguide page, base components | ✅ Done (2026-11-14) |
| 2 | Navbar, mobile bar, footer | ✅ Done (2026-11-14) |
| 3 | Homepage | ✅ Done (2026-11-14) |
| 4 | Vendor profile | ✅ Done (2026-11-14) |
| 5 | Vendor listing | ✅ Done (2026-11-14) |
| 6 | Real weddings listing and story page | ✅ Done (2026-11-14) |
| 7 | Blogs, gallery, honeymoon, saved, simple pages | ✅ Done (2026-11-14) |
| 8 | Vendor signup, login and studio screens | ✅ Done (2026-11-14) |
| 9 | Venue profile with the 360-degree view | ✅ Done (2026-11-14, placeholder imagery) |
| 10 | Polish pass: motion, speed, accessibility, small screens | ✅ Done (2026-11-14, see docs/AUDIT.md) |

## Session log

### 2026-11-16 · Round 5: the complete vendor portal at /vendor-studio

Done:
- **Contract additions** (types first, then UI): `VendorListing.reviewNote` (admin note for
  changes_requested) and `pendingMediaIds` (photos/films added while published, hidden publicly until
  approved), `Album.date`, `Inquiry.status` (new/replied/closed). docs/api-contract.md documents them plus
  PATCH /me/inquiries/{id}, POST /admin/listings/{id}/request-changes and /approve-media.
- **Route groups.** Public routes moved into `src/app/(site)/` with the chrome layout (SiteHeader, footer,
  BottomBar, page template); the root layout is bare (fonts, providers, noscript); the root 404 carries its
  own chrome. `/vendor-studio/` has its own client layout: route guard (logged out → /login; applied/
  rejected/suspended → status screens) around `StudioShell` — dense left sidebar on desktop, top bar with a
  focus-trapped slide-in menu at 390px, business name, status badge, View preview, sign out.
- **Fifteen screens**, every field mapping to `VendorListing`, all reads/writes through vendor-api (no
  direct store access in components): overview (status explained, 7-item checklist with progress and quick
  links, review-note callout, recent inquiries), business, category & services (inputs generated from
  `Category.fields`; venues get capacity/spaces/360 tour), locations, photos (`PhotoManager`: drag-drop +
  picker upload with simulated progress, ≥800px validation with clear rejections, reorder by drag and
  keyboard, alt text, bulk delete, pending chips), cover & card photos (`PhotoPicker` + live `VendorCard`
  and cover previews via the shared mapper), albums, films (file ≤8MB or link + poster), pricing (packages
  with units, starting price derived from the cheapest or set directly), FAQs, contact (phone marked
  never-public), inquiries (status chips, detail, WhatsApp reply link), preview (the real `VendorProfile`
  from the draft, pending media included, under a banner), submit (gated on the checklist), account
  (screen-only). Autosave (800ms debounce, Saving→Saved→error indicator, quota errors surfaced),
  beforeunload + nav-confirm dirty guard, skeletons and designed empty states throughout.
- **Shared mapper.** `src/lib/listing-view.ts` (`listingToSummary`/`listingToDetail` with a pending-media
  filter) now backs api.ts, the portal previews and the overlay — a vendor's saved data is exactly what the
  public site renders. `src/lib/upload.ts` simulates uploads (downscale to 1200px data URLs, 12px blur like
  scripts/photos.mjs).
- **Closing the loop.** `/vendors/[slug]` falls back to `DemoPublicProfile` for slugs unknown to the static
  dataset (store-published demo listings render through `VendorProfile`; known-but-unpublished slugs still
  hard-404); `/vendors` appends `DemoVendorCards` after the server grid. Both are marked demo-ware.
  `updateMyListing` diffs media while published into `pendingMediaIds`; /demo gained Request changes (with
  note), Approve N pending, and public links on published rows.
- **Verification.** Lint, typecheck, build (53 pages). A 34-check Puppeteer run as vendor@gmail.com: route
  guard, every screen filled (including a rejected undersized upload and ten real ones), autosave indicators,
  7/7 checklist, submit → in_review, /demo request-changes note round-trip, publish, the public profile and
  /vendors card showing exactly the entered data, a new photo pending (hidden publicly) then approved
  (visible), no 390px overflow, the slide-in menu. Round-4 public HTML checks all still pass. Screenshots in
  docs/screenshots/portal/ (overview, photos, pricing at 390 and 1440).

Decisions / gotchas:
- The demo overlay returns HTTP 200 with a client-side 404 for truly unknown vendor slugs (server cannot see
  the browser store); known unpublished slugs keep the server 404. The /vendors count line excludes demo
  listings. Both seams are documented in the contract and vanish with the backend.
- Stale `.next/dev` types after moving routes into the group break typecheck; delete `.next` once.
- In Puppeteer, clicks that depend on React state must be sequential ticks, and the pre-seeded demo
  cover/cards mean pickers toggle OFF on the first click.

Known gaps / next up:
- Admin "suspend account" and a real changes_requested flow for media-only edits; search/home overlay for
  demo listings; backend.

### 2026-11-16 · Round 4: data contract, vendor lifecycle, signup/login, /demo

Done:
- **Contract (`src/data/types.ts`).** `AccountStatus` (applied/approved/rejected/suspended), `ListingStatus`
  (draft/in_review/changes_requested/published/unpublished), `PriceUnit` (per_event/per_day/per_plate/
  on_request), `VendorAccount`, `VendorApplication`, `VendorListing` (structured team/yearsActive/travels/
  citiesServed/services/styles/categoryValues/packages/contact; admin-only status/featured/featuredOrder/
  verified), `Package`, `Contact` (phone never public), `VenueDetails`, `Inquiry`, `CategoryFieldDef`
  (per-category extra fields with filterable flags), and the two public shapes: `VendorSummary` (all lists)
  and `VendorDetail` (profile only). The old `Vendor`/`PriceLine`/keyFacts are gone.
- **Public api rewritten (`src/lib/api.ts`).** Every function mirrors one endpoint (docs/api-contract.md) and
  filters through one `published()` helper — **the published-only rule lives in the api, not in pages**.
  `listVendors` returns `Paged<VendorSummary>` with q/category/city (base or served)/minPrice/maxPrice/sort/
  page/limit plus category-specific field filters; price bounds skip per_plate and on_request listings.
  `getVendor`/`getVenue` → `VendorDetail`; `listFeatured`, `listSimilar`, `listCategoriesWithCounts`/
  `listCitiesWithCounts` (only values with a published vendor — they feed tiles, tabs, selects, navbar,
  search, gallery tabs), `listFilms`, `listGalleryPhotos`, `listWeddings`/`listArticles` (same paged
  pattern), `listAllCategories`/`listAllCities` for forms. The six copies of the card-mapping code are gone;
  `budgetToRange` gives the bands clear edges (<1L, 1–<5L, ≥5L).
- **Sample data.** 12 listings migrated; two unpublished on purpose (`kohl-and-rose` in_review,
  `baraat-collective` draft) so the rule is visible: they 404, appear in no list/search/gallery, and their
  wedding credits render as plain names (credits link only to published slugs). Bengaluru is covered via
  `citiesServed`. Cards show category and `formatPrice` ("From ₹1,50,000 per event", "₹2,200 per plate").
- **Mock store + vendor api.** `src/lib/mock-store.ts` (one localStorage blob, `saved.ts` pattern; the empty
  store seeds slim rows for the sample listings) and `src/lib/vendor-api.ts` (async, fetch-swappable):
  submitApplication (duplicate email rejected), login/logout, getMyAccount, getMyListing, updateMyListing,
  submitListingForReview, listMyInquiries, and the demo admin calls (approve creates the empty draft listing,
  reject with note, publish, unpublish, reset). `src/lib/demo-credentials.ts` (clearly marked, delete with
  the backend) makes vendor@gmail.com / 123456 always log into a pre-seeded approved account with a partly
  filled draft listing.
- **Signup + login + studio.** /list-your-business is one short form matching `VendorApplication` (business,
  category, base city, contact, WhatsApp, email, password, one work link, consent) with a success screen
  pointing at /login. /login checks the store; /vendor-studio renders by status via `StudioGate`: logged-out
  prompt, under-review, rejection note, suspended, or the approved shell (listing status chip, checklist
  derived from listing content, Submit for review). `StudioScreens` deleted (full portal next session).
- **/demo.** Noindex, linked from nowhere: applications (approve / reject-with-note) and listings
  (publish/unpublish) over the mock store, plus reset. The panel states the limitation: public pages are
  server-rendered from the static dataset, so demo status changes show in /demo and the studio only.
- **Also.** Vendors navbar panel compacted to ~300px (160px tiles, names beneath, same animation).
  `MaskedHeading` inserts a space between line spans ("Why couples choose Wedoura." reads correctly in text
  and accessible names). Homepage films section hidden while no clip exists. Profile sections render only
  with content; WhatsApp buttons hidden without a number. Audit script stale checks fixed (footer /faq,
  single-form signup, studio gate, Show more = 10, link-not-button).
- **Verification.** Lint, typecheck, build pass (8 vendor + 2 venue profiles prerendered; the unpublished two
  absent). HTML checks: unpublished vendors appear on no public page and 404; category filters
  (`?category=catering-cakes&cuisine=Coastal` → 1 vendor) and budget bands work server-side; headlines carry
  their spaces; /demo is noindexed. Browser flow: apply → /demo approve → login → studio draft → submit →
  in_review → publish/unpublish; applied sees "under review"; rejected sees the note; demo login works;
  wrong password errors. Panel screenshot in docs/screenshots/round-3/vendors-panel-compact-1440.png.

Decisions / gotchas:
- Wedding credits may carry unpublished vendors' names in story data (shown unlinked); the rule is about
  listings, links and lists, not erasing names from stories.
- The mock store's empty state *is* the seed (no write-on-read); `useHydrated()` gates studio/demo so
  signed-in screens never flash logged-out.
- Puppeteer note: text typed before hydration stays in the DOM while React state stays empty — drive React
  inputs with the native value setter + `input` event in scripts.

Known gaps / next up:
- The full studio portal: edit the listing (photos, about, packages, FAQs) through `updateMyListing`.
- changes_requested exists in the contract but /demo has no "request changes" button yet; suspension flow
  likewise contract-only.
- Real film clips, real 360s, logo; backend to replace api.ts internals, vendor-api.ts and the mock store.

### 2026-11-16 · Round 3: server rendering, hero, vendor profile, why band

Done:
- **Server rendering (step 10 follow-up).** Every list page now reads the `searchParams` prop in its server
  component, filters through `@/lib/api` and renders the cards as server markup: `/vendors` (filters, count,
  grid, `?show=` paging), `/blogs`, `/gallery`, `/honeymoon` (`?place=` detail), `/real-weddings` (all six
  stories) and the homepage featured grid (`?category=`). Root cause was `useSearchParams()` in client
  browser components inside `<Suspense>`, which bails static prerendering out to the fallback. The browser
  components (`VendorBrowser`, `BlogBrowser`, `GalleryWall`, `DestinationExplorer`, `WeddingBrowser`,
  `FeaturedTabs`) are gone. `UnderlineTabs` are real links; `FilterSelect`/`LoadMore` take the current params as
  props and patch the URL (`src/lib/url.ts` holds the hook-free helpers, `url-state.ts` the client hook for the
  saved/studio screens). These routes are now dynamic (ƒ) in the build, as expected.
- **FAQ answers always in the markup.** `Accordion` renders every panel and animates `grid-template-rows`
  instead of mounting on open. A `<noscript>` style in the root layout undoes the motion components' hidden
  initial states so the server HTML is visible without JS.
- **One set of markup per breakpoint.** `CategoryTiles` is a single list (snap rail → hover-widen row via a
  `--grow` variable). `WeddingsScroller` and `FilmsShowcase` render one copy: the carousel on the server and
  small screens, upgraded to the pinned variant from `md` through `useIsDesktop()` (`src/lib/media.ts`).
- **Hero, smaller.** New tokens `--text-hero` (≈42px at 390 → 80px cap), `--text-sublead` (18–20px),
  `--text-caption` (13px, hero quick links only, at the client's request), `--container-hero-search` (880px).
  The search bar is one 64px row, left-aligned under the headline.
- **Cards.** `VendorCard` is 4:5; grids are 2 / 3 (`lg`) / 4 (`min-[80rem]`) across on the homepage (capped at
  eight) and `/vendors`.
- **Vendor profile redesign.** Cover opener → key-facts strip → sticky subnav → a wide content column with a
  sticky price/Save/WhatsApp/compact-inquiry `<aside>` from `lg` (the same aside sits after the content on
  phones; `StickyActionBar` is now `lg:hidden`). Portfolio shows 12 with a "See all" expander (`PhotoGrid
  initialCount`; every photo stays in the HTML), albums are large covers, about has an `aboutPhoto`, pricing is
  three cards, FAQ has every answer. Films render only when a clip exists, so the section is hidden everywhere
  until clips land in `public/films`.
- **Data.** All 12 vendors have ≥12 portfolio photos, 3 albums (4–6 photos), 3 price lines, 4 key facts and an
  about photo, reusing p01–p46. Every "Sample copy / answer / story / article / pricing / film" marker is gone
  from data and UI; the footer note is the one remaining flag. Slugs lost their `sample` markers (7 vendors,
  6 weddings, 3 blogs, 3 film ids) with 308 redirects in `next.config.ts`; scripts updated.
- **Why band.** "Why couples choose Wedoura": three numbered points with title and sentence beside the tall
  haldi photograph (p35), `Reveal`/`ImageReveal` like the other sections.
- **Also.** `/faq` page (footer link works from every page); the signup step list is a plain `<ul>` so browser
  markers cannot double the written numbers; all four steps verified in the browser.
- **Verification.** Lint, typecheck, build pass. A scratch script fetched 15 pages as raw HTML (scripts and
  React comments stripped) and found every expected card, filter option, story and collapsed FAQ answer, no
  sample labels, and the four redirects. Screenshots in `docs/screenshots/round-3/` (hero, why, vendor profile
  at 390 and 1440): no console errors, no horizontal overflow.

Decisions / gotchas:
- Client components still server-render; the only bailout is `useSearchParams` on a statically prerendered
  route. Reading `searchParams` in the page makes the route dynamic, which is fine for in-memory data.
- When checking server HTML, strip `<script>` (the RSC payload carries props even for client-only content) and
  `<!-- -->` (React splits adjacent text nodes) before searching.
- Shortlists saved under old slugs in localStorage will drop silently (sample data only).

Known gaps / next up:
- Real film clips (the films section and a working player return automatically), real 360 photos, logo.
- The homepage films showcase still shows breathing posters; decide whether to hide it until clips exist.

### 2026-11-16 · Vendors filter strap

Done:
- **Filter strip UI.** Replaced native `<select>` in `FilterSelect` with custom listboxes (ported
  menus on desktop, bottom sheet on mobile). One open filter at a time via `FilterBar` context.
- **Shorter strap.** `min-h-14`, tighter `py-2` cells, compact count/Clear aside. Active filter uses
  ivory background. Real Weddings standalone city filter keeps a compact trigger + sheet outside
  `FilterBar`.

### 2026-11-16 · Search overlay + hero scroll

Done:
- **Search overlay** restyled to match the hero search bar: ivory field, bordered
  row (icon + input + Search button), suggestion panel and city/category cards.
- **Hero scroll jitter:** removed scroll-linked scale on the photo layer (was
  compounding with Ken Burns under Lenis); dropped vertical parallax on copy;
  eased opacity via a spring on scroll progress.

### 2026-11-16 · Hero gap + serif descenders

Done:
- **Hero white gap.** Navbar hairline (`border-b`) sat outside `h-nav`, so the header
  was 1px taller than `--nav-h` and heroes with `-mt-nav` left a white strip above the
  image. `h-nav` now lives on the `<header>` (border-box); the inner row is `h-full`.
- **Clipped “g” (Instrument Serif descenders).** Display/h1/h2 line-heights were ≤1.02
  and `<MaskedHeading>` clipped lines with `overflow-hidden`. Raised serif line-heights
  in `tokens.css`, gave mask lines `pb/mb` room for ~0.3em descent, and dropped
  `leading-none` / `leading-tight` overrides on serif titles (cards, search, albums, etc.).

### 2026-11-14 · Session 6: remaining pages, 360° tour, full audit (steps 7–10)

Done:
- **Pages, all on existing shared components.** /blogs (category tabs + ArticleCards) and /blogs/[slug]
  (prose column, large images, share, related); /gallery (uncropped wall, category filter, viewer with a
  "By {vendor}" link — PhotoGrid/PhotoViewer gained an optional per-photo `links` map); /honeymoon
  (PhotoTile grid, linkable `?place=` detail panel with highlights); /saved (Vendors | Stories tabs — the
  saved store now holds both kinds, `story:`-prefixed; StoryCard gained the save overlay); /list-your-
  business (pitch with a live example VendorCard + four-step `VendorSignupForm` with per-step validation
  and success screen); /login + /contact (`AuthForms`); /vendor-studio (`StudioScreens`: profile, cover
  picks, albums, films, pricing, sample inquiries, all URL-tabbed); /about, /privacy-policy, /terms
  (prose, marked sample); a designed full-bleed 404. `Placeholder.tsx` deleted — nothing placeholder-shaped
  remains.
- **360° tour.** Photo Sphere Viewer 5.15.1 (core + virtual tour + gyroscope), loaded only when "Step
  inside" is tapped on a still; arrows between three named spaces, a space strip, drag, gyroscope,
  full screen, fade transitions. Both venues have tour data. Imagery is three clearly captioned
  placeholder equirects in `public/360/` (README says what to supply).
- **Audit (docs/AUDIT.md).** `scripts/audit.mjs`: crawls all 35 pages at 1440 and 390 (status, title,
  overflow, image dimensions, console), exercises every interactive pattern, keyboard/focus, and a
  layout-shift probe — 37/37 pass, no console errors, CLS ≈ 0.0001 everywhere. Lighthouse: 100/100/100
  a11y/best-practices/SEO on home, profile and story; perf 77/80/86 under mobile throttling after fixes
  (hero SSR-visible first slide, zoom settles inward instead of growing the LCP element, covers at q75).

Known gaps / next up (also in AUDIT.md):
- Real equirectangular 360 photos, real film clips, client logo; backend to make forms live.
- Replace sample legal copy before launch.

### 2026-11-14 · Session 5: shared components, finished navbar, core pages (steps 4–6)

Done:
- **Component audit.** Every repeating pattern now exists exactly once, props- and data-driven; the homepage was
  refactored onto the shared set with no visual change. The system:
  - `cards/`: `VendorCard` (photo-cycling, save), `StoryCard` (large/small), `ArticleCard`, `PhotoTile`.
  - `browse/`: `Rail` (snap + hidden scrollbar + progress line + arrows), `UnderlineTabs` (URL-param driven,
    sliding underline), `FilterBar`+`FilterSelect` (desktop row / mobile `BottomSheet`), `LoadMore`,
    `VendorBrowser`, `WeddingBrowser`, `SavedList`.
  - `ui/`: `SaveButton`, `SectionHeader`, `Accordion` (replaces FaqAccordion), `EmptyState`, `Skeleton` +
    `SkeletonCardGrid`, `Breadcrumb`, `ShareButtons`.
  - `media/PhotoGrid`: uncropped masonry columns opening the shared `PhotoViewer`.
  - `profile/`: `VendorProfile`, `StickySubnav` (scrollspy), `StickyActionBar`, `InquiryForm`, `AlbumList`.
- **Shared behaviour.** `src/lib/url-state.ts` (`useParamState`, `useClearParams`): tabs, filters, sort and
  search all read/write URL query params — states are linkable, back works. One saved store feeds every save
  button, the navbar count and /saved. Filter/tab swaps crossfade (0.25s) with a skeleton when pending; every
  list has a designed empty state.
- **Navbar finished.** Active-page underline (was already in), Saved live count, and search with live
  suggestions (vendors → profile, cities and categories → filtered /vendors) from a `getSearchIndex()` data
  call, keyboard navigable; submit still lands on /vendors?q=.
- **Pages.** /vendors (sticky filter bar: category/city/budget/sort, result count, 4-across grid, load more,
  bottom-sheet filters on phones; category and city views are the same page with params); /vendors/[slug]
  (full-bleed cover, scrollspy subnav, uncropped portfolio with viewer, albums as own sequences, films, about
  + key facts, pricing, FAQ, validated inquiry form with success state, sticky price/Save/WhatsApp/inquiry
  bar, similar-vendors rail); /venues/[slug] (same profile + capacity, spaces tiles and a 360° placeholder;
  /vendors/[venue] redirects here); /real-weddings (featured story, style tabs + city filter, grid, load
  more); /real-weddings/[slug] (parallax opener, chapters with photographs at mixed sizes, the film when
  linked, "The team" credits linking to profiles, share buttons, more-stories rail); /saved.
- **Data.** `startingPriceINR` on all vendors (budget bands under ₹1L / ₹1–5L / over ₹5L), `style` + optional
  `filmId` on weddings, 3 new stories (6 total, all cities covered), api gains q/budget/sort filtering,
  `getSimilarVendors`, `getWeddingStyles`, `getSearchIndex`, `getFilm`.
- **Verification.** Lint, typecheck, build pass (39 static pages). `scripts/screenshots-core.mjs`: 6 full-page
  screenshots in `docs/screenshots/core/` plus 12 behaviour checks (URL filters, select→URL, save→navbar
  count, subnav, viewer, search suggestions) — all pass, no console errors, no horizontal overflow.

Decisions / gotchas:
- Next's image-optimizer cache (`.next/cache/images`) survives rebuilds and served session-2 photos for reused
  filenames (p04/p07/p14). Deleted once; noted in CLAUDE.md.
- /vendors stays a static page; filtering runs client-side over the full sample set with the URL as the source
  of truth. Swap the inner filtering for an api/server call when the backend lands.
- Venue vendors prerender only under /venues/[slug]; /vendors/[slug] redirects on demand.
- Profile scrollspy falls back to the first section near the top of the page.

Known gaps / next up:
- Step 7: blogs, gallery, honeymoon and the simple pages (ArticleCard and PhotoGrid are ready for them).
- Step 8 forms (vendor signup, login, studio); reuse `InquiryForm` patterns.
- Real 360° embed decision for step 9; real film clips still pending.

### 2026-11-14 · Session 4: design overhaul (type, layout, motion) — homepage v2

Done:
- Typography: Instrument Serif replaces Cormorant (regular weight, tracking −0.02em, display up to 120px,
  section titles up to 72px); DM Sans replaces Jost (400, 500 for emphasis; body 17/18px). Nothing under 14px;
  nav links 15px; labels 14px with reduced tracking; muted text darkened to #4A4640. Container is 1680px with
  24→40px gutters; photo bands use the 1920px near-full-bleed container. Styleguide copy updated.
- Homepage v2, photo-dominant, one headline per section: crossfading three-photo hero with slow zoom, line-mask
  headline, search and category quick links, content easing back on scroll; six full-width category tiles that
  widen on hover (snap carousel on phones); featured vendors as category tabs (sliding underline) over a
  near-edge grid of 3/4 cards with save buttons and hover photo-cycling; real weddings as a pinned horizontal
  scroll with a progress line (swipe carousel on phones/reduced motion); films dark section where the first
  film grows to near full-screen while pinned; six-city photo mosaic with uneven tiles; slim three-line Why
  band; three large blog cards; FAQ; List-your-business band.
- Motion: `MaskedHeading` (line-by-line mask reveal), `ImageReveal` (clip-path wipe + settle), `RailProgress`
  (thin line replacing hidden scrollbars, `no-scrollbar`), `link-draw` underline draw-in; transform, opacity
  and clip-path only; carousels/static fallbacks under reduced motion.
- Data: 5 new sample vendors (12 total, every category ≥2); "(sample)" stripped from names, prices, couples and
  film titles (the footer note remains); the remote flower clip removed — films are poster-only (`previewSrc`/
  `fullSrc` empty, components hide the player and let the poster breathe) until real clips land in
  `public/photos/incoming`.
- Bug fixed during verification: `FilmPreview`'s `sr-only` figcaption (absolutely positioned) resolved against
  the page root because the figure was unpositioned, silently widening the root scroll area by 277px at 390px.
  The figure is now `relative`, and `overflow-x: clip` on html/body guards against rail leaks without breaking
  `position: sticky`.

Decisions:
- Pinned sections render their desktop variant only from `md` and fall back to carousels under reduced motion.
- Full-page screenshots flatten the pinned sections into blank stretches; that is a capture artifact, not a
  layout gap. This session captures only `docs/screenshots/home-v2/home-full-{390,1440}.png` by design.
- Old home components (CategoriesShowcase, VendorRail, WeddingsEditorial, FilmsBand, CitiesIndex) deleted.

Known gaps / next up:
- Step 4, the vendor profile; `/vendors` must read `category`, `city` and `q`.
- Real film clips and the client's logo; restyle pass over the inner placeholder pages with the new type.
- The screenshot suite's non-home checks still reference v1 behaviours (vendors-panel capture etc.) and should
  be re-run and pruned next session.

### 2026-11-14 · Session 3: photographs, copy, git hygiene and the homepage

Done:
- Git: the three local commits were rewritten to remove the Claude attribution trailer (nothing was pushed;
  authorship unchanged). `.claude/settings.json` sets `includeCoAuthoredBy: false`, and CLAUDE.md now says
  Claude never commits or pushes; the user does both.
- Photographs: all 17 generic placeholders replaced with 46 Indian wedding photographs (p01–p46) from Unsplash
  and Pexels, each reviewed before use: ceremonies (mandaps, pheras, haldi, Bengali rites), portraits, decor,
  venues (fort and palace courtyards, poolside, seaside) and details (mehndi, jewellery, garlands).
  `alt.json` entries are now `{ alt, credit }`; `scripts/photos.mjs` passes `credit` through and `Photo` has an
  optional `credit` field. Sources and licences are tabled in `public/photos/README.md`. All sample data
  re-pointed to fitting photos (venue vendor gets venues, decor gets mandaps, and so on); the Iceland honeymoon
  destination became Rajasthan to fit the photo set.
- Copy: every visible line rewritten in a plain, warm voice for couples. "The work, seen whole", "Made for
  your phone" and similar design-language lines are gone from the hero, promises, footer, metadata and
  styleguide. Promises are now: see the real work first; talk to the person, not a desk; no made-up numbers.
- Homepage (step 3), ten sections, each with its own composition: full-screen hero with a bottom-left headline
  over a corner gradient (focal point per photo via `objectPosition`), a Where/Who/Search bar docked at the
  hero's base routing to `/vendors?city=&category=`, and a small scroll cue; categories as a serif index that
  crossfades a photograph on hover/focus (snap-scroll cards on phones); featured vendors as a drag-and-snap
  rail of triptychs with arrow buttons from `md`; real weddings as one cover story (parallax, headline
  overlapping the image edge, photographer credit) plus two offset stories; a films band on ink (the one dark
  section) with previews that play muted in view; cities as a serif list with a pointer-following photo
  (two-column grid on phones); Why Wedoura as three numbered statements beside the haldi photograph with a
  caption and credit line; the blog as a hairline editorial list; an FAQ accordion (`id="faq"`, smooth
  height animation, first use of `getSiteFaq`); and a full-width List-your-business band.
- Motion: Lenis 1.3.27 smooth scrolling driven from Motion's frame loop (`SmoothScroll` in the root layout);
  Lenis ≥1.3.26 disables itself under reduced motion, `anchors: true` keeps `/#faq` working. Reveals stagger
  inside sections; parallax only on the wedding cover; `--text-mega` token added for the footer's oversized
  WEDOURA wordmark, which now closes the page.
- Screenshots: `scripts/screenshots.mjs` gained a home session (full pages at 390/1440 plus one capture per
  section into `docs/screenshots/home/`, overflow and FAQ checks). Page loads now wait for `load` instead of
  `networkidle0` because the sample film URL can hold connections open. 43/43 checks pass, no console errors.

Decisions:
- Hero photo is p23 (palace terraces, quiet sky top-left) with `objectPosition "64% 38%"`; legibility comes
  from a bottom-up gradient plus a left-edge gradient rather than one full-frame wash.
- Photos are served at 2000px on the long edge, JPEG quality 80 (mozjpeg), portraits capped at 2400px tall.
- Films still use the CC0 flower clip for preview and full film; posters are now venue photographs, so the
  playing preview will not match its poster until real clips arrive.

Known gaps / next up:
- Step 4, the vendor profile. `/vendors` (step 5) must read `category`, `city` and `q` — the hero search,
  vendors panel, cities and categories sections all link with those params.
- Real film clips (about 10 s, local files); logo file from the client.
- The styleguide still shows the old card samples; refresh it when components settle.

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
