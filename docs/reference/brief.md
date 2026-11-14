# Wedoura frontend: project brief

## What this is
Wedoura is a wedding vendor showcase for India. Photographers, videographers, venues and other vendors present their work; couples browse and send inquiries. This project rebuilds the website frontend from scratch. The existing site is wedoura.com.

## Scope
- Frontend only. A separate backend will be built later and will serve this site and a mobile app.
- All content comes from typed mock data in `src/data`, read only through functions in `src/lib/api.ts`. Pages never import mock data directly, so the backend can replace that one module later.
- Forms (inquiry, vendor signup, login) are screens only for now: validate input, show a success state, send nothing.
- Fully responsive. The mobile web experience matters most. Design at 390px first, then 768px, then 1440px.

## What the client wants
- A clean, modern, premium, magazine-like site. Mostly black and white, with the photographs supplying the colour.
- Big photographs shown whole. Cropped photos on the current site were named as a fault.
- Neat typography, plenty of white space, nothing crowded.
- Smooth, subtle motion: a slight zoom on hover or touch, gentle movement on scroll, smooth page and photo transitions. apple.com is the reference for smoothness. Not flashy, not heavy.
- Short film previews that play muted when scrolled into view (about 10 seconds), with a "Watch the film" button for the full film.
- Vendor profiles that work as a portfolio: the work is visible at once, without extra clicks.
- A 360-degree view for venues only.
- Audience: young couples on phones. Pages must be fast and easy to browse.

## What to avoid
- Looking like wezoree.com. It is an inspiration only; do not copy its layout, badges or icons.
- Loud colour, the old gold-and-orange theme, drop shadows, busy pages.
- Forced square crops of photographs.
- Invented statistics, ratings or review counts presented as real. Sample content must be obviously sample.
- Pop-ups, auto-advancing carousels, heavy animation.
- Extra features beyond the list below.

## Design system
- Backgrounds: white `#FFFFFF`; warm ivory `#F6F2EA` for alternate bands.
- Text: near-black `#161616`; muted `#6B665D`. Hairlines `#DDD6C8`.
- One accent: gold `#A8864A`, for small marks only. Check contrast before using it for text.
- Headlines: Cormorant Garamond (light and regular, italic for one emphasised word).
- Body and labels: Jost (300 to 500). Small uppercase labels with wide letter-spacing.
- Square corners on photos, hairline rules, no shadows.
- Body text at least 16px on mobile; tap targets at least 44px.
- The three HTML files in `docs/reference` are the client's own mockups. Use them for tone, type, spacing and section ideas. Do not copy them line by line.

## Motion (use these, consistently)
1. Fade and rise when a section or card enters view (about 24px, 0.9s, once).
2. Slow zoom on hover or press for photos and cards (scale about 1.04).
3. Gentle parallax on cover images and story openers only.
4. Smooth transitions between pages and from a thumbnail into the full-screen photo viewer.
5. Film previews: muted autoplay in view, paused off screen.
All motion switches off when the device asks for reduced motion.

## Photographs
- Store width and height for every image; layouts follow each photo's aspect ratio.
- Use next/image with responsive sizes and a blurred placeholder.
- Full-screen viewer with swipe, arrow keys and close on Escape.
- Use good placeholder wedding photographs for now, kept in one folder so they are easy to replace.

## Navigation
- Desktop navbar: left: Vendors (opens the six categories), Real Weddings, Blogs, Honeymoon. Centre: Wedoura logo. Right: search, Saved, "List Your Business" button.
- Mobile: logo, menu button, and a bottom bar with Home, Vendors, Real Weddings, Saved.

## Vendor categories
Photography & Films, Venues, Makeup & Beauty, Decor & Styling, Catering & Cakes, Entertainment & Music.

## Homepage sections, in order
1. Hero: full-screen film or photo, headline, "where and who" search.
2. Categories: six large photo tiles.
3. Featured vendors: big cards showing each vendor's three best photos.
4. Real weddings: one cover story and two smaller ones.
5. Films: a row of previews that play in view.
6. Browse by city.
7. Why Wedoura: three short promises, no statistics.
8. From the blog: three articles.
9. FAQ.
10. "List your business" band.
11. Footer.

## Pages
| Route | Page |
|---|---|
| `/` | Home |
| `/vendors` | All categories and vendors, with category and city filters |
| `/vendors/[slug]` | Vendor profile: cover, key facts, portfolio, albums, films, about, pricing, FAQ, inquiry form, sticky WhatsApp and inquiry bar |
| `/venues/[slug]` | Venue profile: as above plus capacity and the 360-degree view |
| `/real-weddings`, `/real-weddings/[slug]` | Listing and story page with chapters, photos and vendor credits |
| `/blogs`, `/blogs/[slug]` | Listing and article |
| `/gallery` | Photo wall with the full-screen viewer |
| `/honeymoon` | Destinations |
| `/saved` | Shortlist kept on the device |
| `/list-your-business` | Vendor pitch and signup form (screen only) |
| `/login`, `/vendor-studio` | Screens only |
| `/about`, `/contact`, `/privacy-policy`, `/terms` | Simple pages |

## Quality bar
- Server-rendered pages with proper titles, descriptions and share images.
- Semantic HTML, visible keyboard focus, alt text on every image.
- No layout shift while images load.
- Lint and typecheck pass before any page is called done.

## Build order
1. Foundations: scaffold, tokens, styleguide page, base components.
2. Navbar, mobile bar, footer.
3. Homepage.
4. Vendor profile.
5. Vendor listing.
6. Real weddings listing and story page.
7. Blogs, gallery, honeymoon, saved, and the simple pages.
8. Vendor signup, login and studio screens.
9. Venue profile with the 360-degree view.
10. Polish pass: motion, speed, accessibility, small screens.
