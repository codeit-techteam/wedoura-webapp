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
import { InquiryForm } from "@/components/profile/InquiryForm";
import { StickyActionBar } from "@/components/profile/StickyActionBar";
import { StickySubnav, type SubnavSection } from "@/components/profile/StickySubnav";
import { VenueTour } from "@/components/profile/VenueTour";
import { Accordion } from "@/components/ui/Accordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Label } from "@/components/ui/Label";
import { SaveButton } from "@/components/ui/SaveButton";
import { Text } from "@/components/ui/Text";
import type { CategoryFieldDef, VendorDetail, VendorSummary } from "@/data/types";
import { formatPrice } from "@/lib/format";

type Props = {
  vendor: VendorDetail;
  similar: VendorSummary[];
  /** The vendor's category field definitions; filled values become key facts. */
  categoryFields?: CategoryFieldDef[];
};

const PORTFOLIO_INITIAL = 12;

/** Room for the sticky navbar + subnav when jumping to a section anchor. */
const ANCHOR_OFFSET = "scroll-profile-anchor";

/** "mumbai-suburbs" -> "Mumbai Suburbs"; cities served arrive as slugs. */
function cityLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(" ");
}

/** The gold verification mark: a rosette with a check. A mark, never text. */
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

/**
 * The vendor profile: the most important page on the site, set like a
 * magazine feature. A full-bleed cover with the essentials over a quiet
 * gradient, a strip of inline key facts separated by hairlines, a sticky
 * section subnav, then the work in a wide column with a grouped
 * price-and-inquiry panel beside it from lg (the same panel sits after the
 * content on phones, where the bottom action bar takes over). Every section
 * renders only when the listing has content for it; films only with a real
 * clip. Venues get the capacity/spaces/360 section via `vendor.venue`.
 */
export function VendorProfile({ vendor, similar, categoryFields }: Props) {
  const startingPrice = formatPrice(vendor.startingPriceINR, vendor.priceUnit);
  // A poster alone is not a film; only real clips count.
  const films = vendor.films.filter((f) => f.previewSrc.length > 0 || f.fullSrc.length > 0);
  const whatsapp = vendor.contact.whatsapp;
  const whatsappHref = whatsapp ? `https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}` : undefined;

  // The vendor's category-specific values (coverage, venue type, cuisine …)
  // become key facts, labelled by the category's own field definitions.
  const fieldFacts = (categoryFields ?? []).map((def) => {
    const value = vendor.categoryValues[def.key];
    if (value === undefined || value === "" || value === false) return undefined;
    const display = value === true ? "Yes" : Array.isArray(value) ? value.join(", ") : String(value);
    return { label: def.label, value: display };
  });

  // The key-facts strip, from structured listing fields; only facts that exist.
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

  // Other cities the vendor covers, shown as a quiet line under the facts.
  const alsoServes = vendor.citiesServed.filter((slug) => slug !== vendor.baseCity).map(cityLabel);

  // The round mark on the hero; the first card photo stands in when unset.
  const avatar = vendor.avatar ?? vendor.cardPhotos[0];

  // Services and styles as quiet chips in the about section, deduplicated.
  const chips = [...new Set([...vendor.services, ...vendor.styles])];

  const sections: SubnavSection[] = [
    ...(vendor.portfolio.length ? [{ id: "portfolio", label: "Portfolio" }] : []),
    ...(vendor.venue ? [{ id: "venue", label: "The venue" }] : []),
    ...(vendor.albums.length ? [{ id: "albums", label: "Albums" }] : []),
    ...(films.length ? [{ id: "films", label: "Films" }] : []),
    ...(vendor.about.length ? [{ id: "about", label: "About" }] : []),
    ...(vendor.packages.length ? [{ id: "pricing", label: "Pricing" }] : []),
    ...(vendor.faqs.length ? [{ id: "faq", label: "FAQ" }] : []),
    { id: "inquiry", label: "Inquire" },
  ];

  return (
    <main className="pb-24 lg:pb-0">
      {/* Opener: fixed-height cover; the identity block sits in the scrimmed
          lower band, so it never fights the subject of the photograph. */}
      <section data-nav-dark className="relative -mt-nav flex h-[60svh] flex-col justify-end bg-ink text-white md:h-[72svh]">
        {vendor.cover && (
          <Photo photo={vendor.cover} sizes="100vw" mode="cover" priority quality={75} objectPosition="50% 45%" />
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/95 via-ink/45 to-ink/10" />
        <Container className="relative pb-10 md:pb-14">
          <Breadcrumb
            tone="white"
            items={[
              { label: "Vendors", href: "/vendors" },
              { label: vendor.categoryName, href: `/vendors?category=${vendor.category}` },
              { label: vendor.name },
            ]}
          />
          {avatar && (
            <span className="relative mt-6 block size-18 overflow-hidden rounded-full border border-white/80 md:mt-8">
              <Photo photo={avatar} mode="cover" sizes="72px" objectPosition="50% 30%" />
            </span>
          )}
          <MaskedHeading as="h1" className="mt-4 max-w-4xl font-serif text-hero" lines={[vendor.name]} />
          {vendor.tagline && <p className="mt-3 max-w-xl text-lead text-white/85">{vendor.tagline}</p>}
          <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-body-lg text-white/90">
            <span>{vendor.categoryName}</span>
            {vendor.verified && (
              <span className="inline-flex items-center gap-1.5 border border-gold/70 px-2.5 py-1">
                <VerifiedMark size={14} />
                <span className="label text-white">Verified</span>
              </span>
            )}
            <span aria-hidden="true" className="size-1 rounded-full bg-white/60" />
            <span>{vendor.cityName}</span>
            <span aria-hidden="true" className="size-1 rounded-full bg-white/60" />
            <span>{startingPrice}</span>
          </p>
        </Container>
      </section>

      {/* Key facts: inline stats, serif values under label captions, hairlines between. */}
      {facts.length > 0 && (
        <section aria-label="Key facts" className="border-b border-line bg-white">
          <Container className="py-7 md:py-10">
            <dl className="grid grid-cols-2 gap-y-7 md:grid-cols-4 md:gap-y-8">
              {facts.map((fact) => (
                <div
                  key={fact.label}
                  className="min-w-0 border-l border-line pr-4 pl-5 break-words odd:border-l-0 odd:pl-0 md:pl-8 md:odd:border-l md:odd:pl-8 md:nth-[4n+1]:border-l-0 md:nth-[4n+1]:pl-0"
                >
                  <dt className="label text-mute">{fact.label}</dt>
                  <dd className="mt-1.5 font-serif text-h3 leading-tight">{fact.value}</dd>
                </div>
              ))}
            </dl>
            {alsoServes.length > 0 && (
              <p className="hairline mt-8 pt-5 text-small text-mute">Also serves {alsoServes.join(", ")}.</p>
            )}
          </Container>
        </section>
      )}

      <StickySubnav sections={sections} />

      <Container>
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:items-start lg:gap-14 xl:gap-20">
          {/* The work, in a wide column. */}
          <div className="min-w-0">
            {vendor.portfolio.length > 0 && (
              <section id="portfolio" aria-label="Portfolio" className={`py-section-sm ${ANCHOR_OFFSET}`}>
                <MaskedHeading as="h2" className="font-serif text-h2" lines={["Portfolio"]} />
                <p className="mt-3 max-w-prose text-mute">
                  Recent work in natural light—the same frames you will see on your day.
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

            {vendor.venue && (
              <section id="venue" aria-label="The venue" className={`border-t border-line py-section-sm ${ANCHOR_OFFSET}`}>
                <MaskedHeading as="h2" className="font-serif text-h2" lines={["The venue"]} />
                <div className="mt-10 grid gap-10 md:grid-cols-[1fr_2fr] md:gap-14">
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
                  <div>
                    <Label>360° view</Label>
                    <div className="mt-4">
                      {vendor.venue.tour && vendor.venue.tour.length > 0 && vendor.cover ? (
                        <VenueTour spaces={vendor.venue.tour} still={vendor.cover} venueName={vendor.name} />
                      ) : (
                        <div className="border border-line bg-white p-6">
                          <p className="text-small text-mute">
                            A walk-through of the main spaces will sit here once the venue supplies it.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {vendor.albums.length > 0 && (
              <section id="albums" aria-label="Albums" className={`border-t border-line py-section-sm ${ANCHOR_OFFSET}`}>
                <MaskedHeading as="h2" className="font-serif text-h2" lines={["Albums"]} />
                <p className="mt-3 max-w-prose text-mute">Whole weddings, each one its own sequence.</p>
                <div className="mt-10">
                  <AlbumList albums={vendor.albums} />
                </div>
              </section>
            )}

            {films.length > 0 && (
              <section id="films" aria-label="Films" className={`border-t border-line py-section-sm ${ANCHOR_OFFSET}`}>
                <MaskedHeading as="h2" className="font-serif text-h2" lines={["Films"]} />
                <div className="mt-10 grid gap-2 md:grid-cols-2">
                  {films.map((film) => (
                    <FilmPreview key={film.id} film={film} sizes="(min-width: 64rem) 33vw, (min-width: 48rem) 50vw, 100vw" />
                  ))}
                </div>
              </section>
            )}

            {vendor.about.length > 0 && (
              <section id="about" aria-label="About" className={`border-t border-line py-section-sm ${ANCHOR_OFFSET}`}>
                <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)] md:gap-14">
                  <div>
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

            {vendor.packages.length > 0 && (
              <section id="pricing" aria-label="Pricing" className={`border-t border-line py-section-sm ${ANCHOR_OFFSET}`}>
                <MaskedHeading as="h2" className="font-serif text-h2" lines={["Pricing"]} />
                <p className="mt-3 max-w-prose text-mute">Starting points. Exact quotes come from {vendor.name}.</p>
                <ul className="mt-10 grid gap-2 md:grid-cols-3">
                  {vendor.packages.map((pkg, i) => (
                    <Reveal as="li" key={pkg.label} delay={i * 0.08} className="flex flex-col border border-line bg-white">
                      <div className="p-6 md:p-7">
                        <p className="font-serif text-h3">{pkg.label}</p>
                        <p className="mt-3 text-body-lg font-medium">{formatPrice(pkg.priceINR, pkg.unit)}</p>
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
                      {pkg.note && (
                        <p className="mt-auto border-t border-line px-6 py-5 text-small text-mute md:px-7">{pkg.note}</p>
                      )}
                    </Reveal>
                  ))}
                </ul>
              </section>
            )}

            {vendor.faqs.length > 0 && (
              <section
                id="faq"
                aria-label="Frequently asked questions"
                className={`border-t border-line py-section-sm ${ANCHOR_OFFSET}`}
              >
                <MaskedHeading as="h2" className="font-serif text-h2" lines={["Good to know"]} />
                <div className="mt-10">
                  <Accordion items={vendor.faqs} />
                </div>
              </section>
            )}
          </div>

          {/* Price, save, WhatsApp and a compact inquiry form beside the work
              from lg (sticky under the chrome); after it on phones, where the
              bottom action bar carries the same actions (one set of markup). */}
          <aside
            id="inquiry"
            aria-label="Price and inquiry"
            className={`no-scrollbar border-t border-line py-section-sm ${ANCHOR_OFFSET} lg:sticky lg:top-profile-sticky lg:z-10 lg:max-h-[calc(100svh-var(--profile-sticky-top)-1rem)] lg:self-start lg:overflow-y-auto lg:border-0 lg:py-0 lg:pt-4 lg:pb-section-sm`}
          >
            <div className="border border-line bg-white">
              <div className="p-6 md:p-8">
                <Label>Starting from</Label>
                <p className="mt-2 font-serif text-h2">{startingPrice}</p>
                <p className="mt-2 text-small text-mute">
                  {vendor.categoryName} · {vendor.cityName}
                </p>
              </div>
              <div className="border-t border-line p-6 md:p-8">
                <div className={`grid gap-2 ${whatsappHref ? "grid-cols-2" : "grid-cols-1"}`}>
                  <SaveButton
                    slug={vendor.slug}
                    name={vendor.name}
                    tone="ink"
                    withLabel
                    className="border border-line px-4 py-3 hover:border-ink"
                  />
                  {whatsappHref && (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`WhatsApp ${vendor.name}`}
                      className="tap inline-flex items-center justify-center gap-2 border border-line px-4 py-3 text-ink transition-chrome hover:border-ink"
                    >
                      <Icon name="whatsapp" size={20} />
                      <span className="label">WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
              <div className="border-t border-line p-6 md:p-8">
                <h2 className="font-serif text-h3">Write to {vendor.name}</h2>
                <p className="mt-2 text-small text-mute">Straight to the vendor. No middlemen, no call centre.</p>
                <div className="mt-6">
                  <InquiryForm vendorName={vendor.name} compact />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </Container>

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
