import { Rail } from "@/components/browse/Rail";
import { VendorCard } from "@/components/cards/VendorCard";
import { PhotoTile } from "@/components/cards/PhotoTile";
import { FilmPreview } from "@/components/media/FilmPreview";
import { Photo } from "@/components/media/Photo";
import { PhotoGrid } from "@/components/media/PhotoGrid";
import { ImageReveal } from "@/components/motion/ImageReveal";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Reveal } from "@/components/motion/Reveal";
import { AlbumList } from "@/components/profile/AlbumList";
import { FounderBand } from "@/components/profile/FounderBand";
import { InquiryForm } from "@/components/profile/InquiryForm";
import { InsideStories } from "@/components/profile/InsideStories";
import { InterviewBlock } from "@/components/profile/InterviewBlock";
import { KindWords } from "@/components/profile/KindWords";
import { ShareProfileButton } from "@/components/profile/ShareProfileButton";
import { StickyActionBar } from "@/components/profile/StickyActionBar";
import { StickySubnav, type SubnavSection } from "@/components/profile/StickySubnav";
import { FilmYouTube } from "@/components/profile/FilmYouTube";
import { VenueTour } from "@/components/profile/VenueTour";
import { cn } from "@/lib/cn";
import { resolveTour } from "@/lib/tour";
import { Accordion } from "@/components/ui/Accordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { SaveButton } from "@/components/ui/SaveButton";
import { Text } from "@/components/ui/Text";
import type { CategoryFieldDef, Film, VendorDetail, VendorSummary } from "@/data/types";
import { formatPrice } from "@/lib/format";

type Props = {
  vendor: VendorDetail;
  similar: VendorSummary[];
  /** The vendor's category field definitions; filled values become key facts. */
  categoryFields?: CategoryFieldDef[];
};

const PORTFOLIO_INITIAL = 12;

/** "mumbai-suburbs" -> "Mumbai Suburbs" */
function cityLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

/** The gold verification mark. */
function VerifiedMark({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0 text-gold"
    >
      <path d="M12 2.8 14.3 5l3.2-.4.8 3.1 2.8 1.7-1.2 3 1.2 3-2.8 1.7-.8 3.1-3.2-.4L12 21.9 9.7 19.8l-3.2.4-.8-3.1-2.8-1.7 1.2-3-1.2-3 2.8-1.7.8-3.1 3.2.4z" />
      <path d="m8.7 12.4 2.3 2.3 4.3-4.9" />
    </svg>
  );
}

/** A small gold check for package inclusions. */
function InclusionMark() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-1 shrink-0 text-gold"
    >
      <path d="m4.5 12.5 5 5 10-11" />
    </svg>
  );
}

/** Returns true when a film has something to show or play. */
function filmPlayable(f: Film): boolean {
  return Boolean(f.youtubeUrl || f.previewSrc || f.fullSrc);
}

/**
 * The vendor profile: rebuilt to match the reference design. A full-bleed
 * cover with a mast bar, a trust/at-a-glance strip, sticky chip-nav, then
 * sections in order: inside the stories → portfolio → venue → albums →
 * kind words → about → voices → founder → pricing → films → faq → inquire.
 * Every section hides when empty. Desktop and mobile share one set of markup;
 * the sticky bottom bar carries the mobile actions.
 */
export function VendorProfile({ vendor, similar, categoryFields }: Props) {
  const startingPrice = formatPrice(vendor.startingPriceINR, vendor.priceUnit);
  const films = vendor.films.filter(filmPlayable);
  const whatsapp = vendor.contact.whatsapp;
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}` : undefined;

  const tour = vendor.venue ? resolveTour(vendor.venue.tour, vendor.portfolio) : null;

  // Category-specific key facts
  const fieldFacts = (categoryFields ?? []).map((def) => {
    const value = vendor.categoryValues[def.key];
    if (value === undefined || value === "" || value === false) return undefined;
    const display = value === true ? "Yes" : Array.isArray(value) ? value.join(", ") : String(value);
    return { label: def.label, value: display };
  });

  const facts = [
    ...(vendor.venue
      ? [
          { label: "Location", value: vendor.cityName },
          { label: "Capacity", value: `${vendor.venue.capacity.min} to ${vendor.venue.capacity.max} guests` },
          vendor.team ? { label: "Run by", value: vendor.team } : undefined,
        ]
      : [
          { label: "Based in", value: vendor.cityName },
          vendor.travels ? { label: "Travels", value: vendor.travels } : undefined,
          vendor.team ? { label: "Team", value: vendor.team } : undefined,
          vendor.yearsActive ? { label: "Years active", value: `${vendor.yearsActive} years` } : undefined,
        ]),
    vendor.styles.length > 0 ? { label: "Style", value: vendor.styles.join(", ") } : undefined,
    ...fieldFacts,
  ].filter((f): f is { label: string; value: string } => f !== undefined);

  const alsoServes = vendor.citiesServed.filter((slug) => slug !== vendor.baseCity).map(cityLabel);
  const avatar = vendor.avatar ?? vendor.cardPhotos[0];
  const chips = [...new Set([...vendor.services, ...vendor.styles])];
  const packageLabels = vendor.packages.map((p) => p.label);

  // Build subnav: only sections that have content
  const sections: SubnavSection[] = [
    ...(vendor.albums.length ? [{ id: "inside", label: "Stories" }] : []),
    ...(vendor.portfolio.length ? [{ id: "portfolio", label: "Portfolio" }] : []),
    ...(vendor.venue ? [{ id: "venue", label: "The venue" }] : []),
    ...(vendor.albums.length ? [{ id: "albums", label: "Albums" }] : []),
    ...((vendor.testimonials?.length || vendor.press?.length)
      ? [{ id: "kind-words", label: "Kind words" }]
      : []),
    ...(vendor.about.length ? [{ id: "about", label: "About" }] : []),
    ...(vendor.interview ? [{ id: "voices", label: "Voices" }] : []),
    ...(vendor.founder ? [{ id: "founder", label: "Founder" }] : []),
    ...(vendor.packages.length ? [{ id: "pricing", label: "Pricing" }] : []),
    ...(films.length ? [{ id: "films", label: "Films" }] : []),
    ...(vendor.faqs.length ? [{ id: "faq", label: "FAQ" }] : []),
    { id: "inquire", label: "Inquire" },
  ];

  return (
    <main className="pb-24 lg:pb-0">
      {/* ── Cover ──────────────────────────────────────────────────────── */}
      <section
        data-nav-dark
        className="relative -mt-nav bg-ink text-white"
      >
        {/* Mast bar: meta left / name center / inquire right */}
        <div className="relative z-10 border-b border-white/10">
          <Container className="flex items-center justify-between gap-4 py-4 md:py-5">
            {/* Left: breadcrumb / meta */}
            <div className="min-w-0 flex-1">
              <Breadcrumb
                tone="white"
                items={[
                  { label: "Vendors", href: "/vendors" },
                  { label: vendor.categoryName, href: `/vendors?category=${vendor.category}` },
                  { label: vendor.name },
                ]}
              />
            </div>
            {/* Right: share */}
            <ShareProfileButton
              title={vendor.name}
              className="tap shrink-0 inline-flex items-center gap-1.5 border border-white/30 px-4 py-2 text-white transition-chrome hover:border-white"
            />
          </Container>
        </div>

        {/* Hero image */}
        <div className="relative flex h-[62svh] flex-col justify-end md:h-[75svh]">
          {vendor.cover && (
            <Photo photo={vendor.cover} sizes="100vw" mode="cover" priority quality={75} objectPosition="50% 45%" />
          )}
          <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/95 via-ink/40 to-ink/10" />

          <Container className="relative pb-10 md:pb-14">
            {avatar && (
              <span className="relative block size-18 overflow-hidden rounded-full border border-white/80 mb-5 md:mb-6">
                <Photo photo={avatar} mode="cover" sizes="72px" objectPosition="50% 30%" />
              </span>
            )}
            <MaskedHeading as="h1" className="max-w-4xl font-serif text-hero" lines={[vendor.name]} />
            {vendor.tagline && (
              <p className="mt-3 max-w-xl text-lead text-white/85">{vendor.tagline}</p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-body-lg text-white/90">
              <span>{vendor.categoryName}</span>
              {vendor.verified && (
                <span className="inline-flex items-center gap-1.5 border border-gold/70 px-2.5 py-1">
                  <VerifiedMark size={14} />
                  <span className="label text-white">Verified</span>
                </span>
              )}
              <span aria-hidden="true" className="size-1 rounded-full bg-white/60" />
              <span>{vendor.cityName}</span>
              {startingPrice && (
                <>
                  <span aria-hidden="true" className="size-1 rounded-full bg-white/60" />
                  <span>{startingPrice}</span>
                </>
              )}
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#inquire"
                className="label tap inline-flex items-center gap-2 bg-white px-5 py-3 text-ink transition-chrome hover:bg-ivory"
              >
                Inquire ⟶
              </a>
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`WhatsApp ${vendor.name}`}
                  className="tap inline-flex items-center gap-2 border border-white/40 px-4 py-2.5 text-white transition-chrome hover:border-white"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 20l1.3-3.9A8 8 0 1112 20a8 8 0 01-4-1.1z" />
                    <path d="M9 9.5c.3 1.6 1.9 3.6 3.9 4.4l1.2-1.1 1.9.9c-.2 1-.9 1.6-1.9 1.6-3.1 0-6.6-3.4-6.6-6.5 0-1 .7-1.7 1.6-1.9l.9 1.9z" />
                  </svg>
                  <span className="label">WhatsApp</span>
                </a>
              )}
            </div>
          </Container>
        </div>
      </section>

      {/* ── Trust / at-a-glance strip ───────────────────────────────────── */}
      {facts.length > 0 && (
        <section aria-label="Key facts" className="border-b border-line bg-white">
          <Container className="py-7 md:py-10">
            <dl className="no-scrollbar -mx-gutter flex flex-nowrap items-start gap-0 overflow-x-auto px-gutter md:mx-0 md:justify-between md:gap-2 md:overflow-visible md:px-0">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="min-w-[8.75rem] max-w-[11rem] shrink-0 border-l border-line py-1 pr-4 pl-4 first:border-l-0 first:pl-0 md:min-w-0 md:max-w-none md:flex-1 md:px-5 md:first:pl-0 lg:px-6"
                >
                  <dt className="label whitespace-nowrap text-mute">{fact.label}</dt>
                  <dd className="mt-1.5 font-serif text-lead leading-snug md:text-h3">{fact.value}</dd>
                </div>
              ))}
            </dl>
            {alsoServes.length > 0 && (
              <p className="hairline mt-8 pt-5 text-small text-mute">Also serves {alsoServes.join(", ")}.</p>
            )}
          </Container>
        </section>
      )}

      {/* ── Chip subnav ────────────────────────────────────────────────── */}
      <StickySubnav sections={sections} />

      {/* ── #inside: album cover carousel ──────────────────────────────── */}
      {vendor.albums.length > 0 && (
        <Container className="py-section-sm">
          <InsideStories albums={vendor.albums} />
        </Container>
      )}

      {/* ── Main content column ────────────────────────────────────────── */}
      <Container>
        {/* ── #portfolio ───────────────────────────────────────────────── */}
        {vendor.portfolio.length > 0 && (
          <section id="portfolio" aria-label="Portfolio" className="scroll-profile-anchor border-t border-line py-section-sm">
            <Label className="mb-4">Portfolio</Label>
            <MaskedHeading as="h2" className="font-serif text-h2" lines={["Frames we still think about"]} />
            <p className="mt-3 max-w-prose text-mute">
              Recent work in natural light — the same frames you will see on your day.
            </p>
            <div className="mt-10">
              <Reveal>
                <PhotoGrid
                  photos={vendor.portfolio}
                  columns={3}
                  initialCount={PORTFOLIO_INITIAL}
                  sizes="(min-width: 64rem) 22vw, (min-width: 48rem) 33vw, 50vw"
                />
              </Reveal>
            </div>
          </section>
        )}

        {/* ── #venue ───────────────────────────────────────────────────── */}
        {vendor.venue && (
          <section id="venue" aria-label="The venue" className="scroll-profile-anchor border-t border-line py-section-sm">
            <MaskedHeading as="h2" className="font-serif text-h2" lines={["The venue"]} />
            <div className={cn("mt-10 grid gap-10 md:gap-14", tour && vendor.cover && "md:grid-cols-[1fr_2fr]")}>
              <div>
                <Label>Capacity</Label>
                <p className="mt-2 font-serif text-h3">
                  {vendor.venue.capacity.min} to {vendor.venue.capacity.max} guests
                </p>
                {vendor.portfolio.length > 0 && (
                  <div className="mt-8">
                    <Label>Spaces</Label>
                    <ul className="mt-4 grid grid-cols-2 gap-2">
                      {vendor.venue.spaces.map((space, i) => (
                        <li key={space} className="relative aspect-4/3">
                          <PhotoTile
                            photo={vendor.portfolio[i % vendor.portfolio.length]}
                            title={space}
                            sizes="(min-width: 48rem) 15vw, 50vw"
                            titleClassName="text-lead p-4"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {tour && vendor.cover && (
                <div>
                  <Label>360° view</Label>
                  <div className="mt-4">
                    <VenueTour tour={tour} still={vendor.cover} venueName={vendor.name} />
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── #albums: Wedding stories ──────────────────────────────────── */}
        {vendor.albums.length > 0 && (
          <section id="albums" aria-label="Wedding stories" className="scroll-profile-anchor border-t border-line py-section-sm">
            <Label className="mb-4">Stories</Label>
            <MaskedHeading as="h2" className="font-serif text-h2" lines={["Wedding stories"]} />
            <p className="mt-3 max-w-prose text-mute">Open a story to read it frame by frame.</p>
            <div className="mt-10">
              <AlbumList albums={vendor.albums} />
            </div>
          </section>
        )}

        {/* ── #kind-words ──────────────────────────────────────────────── */}
        {((vendor.testimonials?.length ?? 0) > 0 || (vendor.press?.length ?? 0) > 0) && (
          <KindWords
            testimonials={vendor.testimonials ?? []}
            press={vendor.press}
          />
        )}

        {/* ── #about ───────────────────────────────────────────────────── */}
        {vendor.about.length > 0 && (
          <section id="about" aria-label="About" className="scroll-profile-anchor border-t border-line py-section-sm">
            <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)] md:gap-14">
              <div>
                <Label className="mb-4">About the studio</Label>
                <MaskedHeading as="h2" className="font-serif text-h2" lines={[`About ${vendor.name}`]} />
                <div className="mt-6 flex max-w-prose flex-col gap-4">
                  {vendor.about.map((paragraph) => (
                    <Text key={paragraph.slice(0, 24)} tone="mute">
                      {paragraph}
                    </Text>
                  ))}
                </div>
                {chips.length > 0 && (
                  <ul aria-label="Services and styles" className="mt-8 flex flex-wrap gap-2">
                    {chips.map((chip) => (
                      <li key={chip} className="border border-line px-3.5 py-2 text-small text-ink">
                        {chip}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {vendor.aboutPhoto && (
                <ImageReveal delay={0.1}>
                  <div className="relative overflow-hidden bg-ivory">
                    <Photo photo={vendor.aboutPhoto} sizes="(min-width: 48rem) 18rem, 100vw" />
                  </div>
                </ImageReveal>
              )}
            </div>
          </section>
        )}

        {/* ── #voices: Interview ───────────────────────────────────────── */}
        {vendor.interview && <InterviewBlock interview={vendor.interview} />}
      </Container>

      {/* ── #founder: full-bleed strip ───────────────────────────────────── */}
      {vendor.founder && <FounderBand founder={vendor.founder} vendorName={vendor.name} />}

      <Container>
        {/* ── #pricing ─────────────────────────────────────────────────── */}
        {vendor.packages.length > 0 && (
          <section id="pricing" aria-label="Pricing" className="scroll-profile-anchor border-t border-line py-section-sm">
            <Label className="mb-4">Pricing</Label>
            <MaskedHeading as="h2" className="font-serif text-h2" lines={["Collections, priced openly"]} />
            <p className="mt-3 max-w-prose text-mute">
              Starting prices, shown openly. Every collection includes a pre-wedding call and a private gallery.
            </p>
            <ul className="mt-10 grid gap-2 md:grid-cols-3">
              {vendor.packages.map((pkg, i) => (
                <Reveal
                  as="li"
                  key={pkg.label}
                  delay={i * 0.08}
                  className={cn(
                    "flex flex-col border bg-white",
                    pkg.featured ? "border-gold" : "border-line",
                  )}
                >
                  {pkg.featured && (
                    <div className="border-b border-gold bg-gold/10 px-6 py-2 md:px-7">
                      <span className="label italic text-gold-deep">Most booked</span>
                    </div>
                  )}
                  <div className="p-6 md:p-7">
                    <p className="font-serif text-h3">{pkg.label}</p>
                    <p className="mt-3 text-body-lg font-medium">{formatPrice(pkg.priceINR, pkg.unit)}</p>
                    {pkg.note && <p className="mt-2 text-small text-mute">{pkg.note}</p>}
                  </div>
                  {pkg.inclusions && pkg.inclusions.length > 0 && (
                    <ul aria-label={`What ${pkg.label} includes`} className="flex flex-col gap-3 border-t border-line p-6 md:p-7">
                      {pkg.inclusions.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-small text-ink">
                          <InclusionMark />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Reveal>
              ))}
            </ul>
          </section>
        )}

        {/* ── #films ───────────────────────────────────────────────────── */}
        {films.length > 0 && (
          <section id="films" aria-label="Films" className="scroll-profile-anchor border-t border-line py-section-sm">
            <Label className="mb-4">Films</Label>
            <MaskedHeading as="h2" className="font-serif text-h2" lines={["Wedding films"]} />
            <p className="mt-3 max-w-prose text-mute">Made to be watched again and again.</p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {films.map((film) =>
                film.youtubeUrl ? (
                  <FilmYouTube
                    key={film.id}
                    film={film}
                    sizes="(min-width: 64rem) 33vw, (min-width: 48rem) 50vw, 100vw"
                  />
                ) : (
                  <FilmPreview
                    key={film.id}
                    film={film}
                    sizes="(min-width: 64rem) 33vw, (min-width: 48rem) 50vw, 100vw"
                  />
                ),
              )}
            </div>
          </section>
        )}

        {/* ── #faq ─────────────────────────────────────────────────────── */}
        {vendor.faqs.length > 0 && (
          <section id="faq" aria-label="Frequently asked questions" className="scroll-profile-anchor border-t border-line py-section-sm">
            <Label className="mb-4">Good to know</Label>
            <MaskedHeading as="h2" className="font-serif text-h2" lines={["Questions, answered"]} />
            <div className="mt-10">
              <Accordion items={vendor.faqs} />
            </div>
          </section>
        )}
      </Container>

      {/* ── #inquire: full-width check availability section ──────────────── */}
      <section id="inquire" aria-label="Check availability" className="scroll-profile-anchor border-t border-line">
        <div className="grid md:grid-cols-[1fr_1fr] lg:grid-cols-[2fr_3fr]">
          {vendor.cover && (
            <div className="relative hidden min-h-[30rem] md:block">
              <Photo photo={vendor.cover} mode="cover" sizes="(min-width: 48rem) 40vw, 0vw" quality={60} />
            </div>
          )}
          <div className="bg-parchment px-6 py-12 md:px-10 md:py-14 lg:px-16">
            <Label className="mb-4">Check availability</Label>
            <h2 className="font-serif text-[clamp(2.375rem,4.2vw,3.875rem)] leading-[1.04] text-ink">
              Tell us your <em>date</em>
            </h2>
            <p className="mt-4 mb-8 max-w-[32em] text-mute">
              Free to ask, with no obligation. Replies usually within a day.
            </p>
            <div className="flex items-center gap-3 mb-8">
              <SaveButton slug={vendor.slug} name={vendor.name} tone="ink" withLabel className="border border-line px-4 py-3 hover:border-ink" />
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`WhatsApp ${vendor.name}`}
                  className="tap inline-flex items-center gap-2 border border-line px-4 py-3 text-ink transition-chrome hover:border-ink"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 20l1.3-3.9A8 8 0 1112 20a8 8 0 01-4-1.1z" />
                    <path d="M9 9.5c.3 1.6 1.9 3.6 3.9 4.4l1.2-1.1 1.9.9c-.2 1-.9 1.6-1.9 1.6-3.1 0-6.6-3.4-6.6-6.5 0-1 .7-1.7 1.6-1.9l.9 1.9z" />
                  </svg>
                  <span className="label">WhatsApp</span>
                </a>
              )}
            </div>
            <InquiryForm
              vendorName={vendor.name}
              vendorSlug={vendor.slug}
              packageLabels={vendor.packages.length > 0 ? packageLabels : undefined}
            />
          </div>
        </div>
      </section>

      {/* ── Similar vendors rail ──────────────────────────────────────────── */}
      {similar.length > 0 && (
        <section aria-label="Similar vendors" className="border-t border-line py-section-sm">
          <Container>
            <MaskedHeading as="h2" className="font-serif text-h2" lines={["You might also like"]} />
            <div className="mt-8">
              <Rail label="Similar vendors" itemClassName="w-3/4 sm:w-2/5 xl:w-[23%]">
                {similar.map((v) => (
                  <VendorCard key={v.slug} vendor={v} sizes="(min-width: 48rem) 24vw, 72vw" />
                ))}
              </Rail>
            </div>
          </Container>
        </section>
      )}

      <StickyActionBar
        slug={vendor.slug}
        name={vendor.name}
        startingPrice={startingPrice}
        whatsapp={vendor.contact.whatsapp}
      />
    </main>
  );
}
