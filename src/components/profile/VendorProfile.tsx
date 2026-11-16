import { Rail } from "@/components/browse/Rail";
import { VendorCard, type VendorCardData } from "@/components/cards/VendorCard";
import { PhotoTile } from "@/components/cards/PhotoTile";
import { FilmPreview } from "@/components/media/FilmPreview";
import { Photo } from "@/components/media/Photo";
import { PhotoGrid } from "@/components/media/PhotoGrid";
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
import type { Vendor } from "@/data/types";

type Props = {
  vendor: Vendor;
  categoryName: string;
  cityName: string;
  similar: VendorCardData[];
};

const PORTFOLIO_INITIAL = 12;

/**
 * The vendor profile: the most important page on the site. A full-bleed
 * cover, a strip of key facts, then the work in a wide column with a sticky
 * price-and-inquiry panel beside it from lg (the same panel sits after the
 * content on phones, where the bottom action bar takes over). Venues get the
 * capacity/spaces/360 section via `vendor.venue`.
 */
export function VendorProfile({ vendor, categoryName, cityName, similar }: Props) {
  const isVenue = Boolean(vendor.venue);
  const startingPrice = vendor.pricing[0]?.price;
  // Films are shown only with a real clip; a poster alone is not a film.
  const films = vendor.films.filter((f) => f.previewSrc.length > 0 || f.fullSrc.length > 0);
  const whatsappHref = `https://wa.me/${vendor.whatsapp.replace(/[^0-9]/g, "")}`;

  const sections: SubnavSection[] = [
    { id: "portfolio", label: "Portfolio" },
    ...(isVenue ? [{ id: "venue", label: "The venue" }] : []),
    ...(vendor.albums.length ? [{ id: "albums", label: "Albums" }] : []),
    ...(films.length ? [{ id: "films", label: "Films" }] : []),
    { id: "about", label: "About" },
    { id: "pricing", label: "Pricing" },
    { id: "faq", label: "FAQ" },
    { id: "inquiry", label: "Inquire" },
  ];

  return (
    <main className="pb-24 lg:pb-0">
      {/* Opener: full-bleed cover with name, category, city and starting price. */}
      <section data-nav-dark className="relative -mt-nav flex min-h-[75vh] flex-col justify-end bg-ink text-white">
        <Photo photo={vendor.cover} sizes="100vw" mode="cover" priority quality={75} objectPosition="50% 45%" />
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/85 via-ink/25 to-ink/20" />
        <Container className="relative pb-10 md:pb-14">
          <Breadcrumb
            tone="white"
            items={[
              { label: "Vendors", href: "/vendors" },
              { label: categoryName, href: `/vendors?category=${vendor.category}` },
              { label: vendor.name },
            ]}
          />
          <MaskedHeading as="h1" className="mt-5 max-w-4xl font-serif text-hero" lines={[vendor.name]} />
          <p className="mt-4 text-body-lg text-white/90">
            {categoryName} · {cityName}
            {startingPrice ? ` · ${startingPrice}` : ""}
          </p>
          <p className="mt-2 max-w-xl text-body text-white/80">{vendor.tagline}</p>
        </Container>
      </section>

      {/* Key facts strip. */}
      <section aria-label="Key facts" className="border-b border-line bg-white">
        <Container>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-5 py-6 md:grid-cols-4 md:py-7">
            {vendor.keyFacts.map((fact) => (
              <div key={fact.label}>
                <dt className="label text-mute">{fact.label}</dt>
                <dd className="mt-1 font-serif text-h3">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <StickySubnav sections={sections} />

      <Container>
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(20rem,24rem)] lg:items-start lg:gap-14 xl:gap-20">
          {/* The work, in a wide column. */}
          <div className="min-w-0">
            <section id="portfolio" aria-label="Portfolio" className="py-section-sm">
              <Reveal>
                <PhotoGrid photos={vendor.portfolio} initialCount={PORTFOLIO_INITIAL} sizes="(min-width: 64rem) 22vw, (min-width: 48rem) 33vw, 50vw" />
              </Reveal>
            </section>

            {vendor.venue && (
              <section id="venue" aria-label="The venue" className="border-t border-line py-section-sm">
                <MaskedHeading as="h2" className="font-serif text-h2" lines={[<>The venue</>]} />
                <div className="mt-8 grid gap-10 md:grid-cols-[1fr_2fr] md:gap-14">
                  <div>
                    <Label>Capacity</Label>
                    <p className="mt-2 font-serif text-h3">
                      {vendor.venue.capacity.min} to {vendor.venue.capacity.max} guests
                    </p>
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
                  </div>
                  <div>
                    <Label>360° view</Label>
                    <div className="mt-4">
                      {vendor.venue.tour && vendor.venue.tour.length > 0 ? (
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
              <section id="albums" aria-label="Albums" className="border-t border-line py-section-sm">
                <MaskedHeading as="h2" className="font-serif text-h2" lines={[<>Albums</>]} />
                <p className="mt-3 max-w-prose text-mute">Whole weddings, each one its own sequence.</p>
                <div className="mt-8">
                  <AlbumList albums={vendor.albums} />
                </div>
              </section>
            )}

            {films.length > 0 && (
              <section id="films" aria-label="Films" className="border-t border-line py-section-sm">
                <MaskedHeading as="h2" className="font-serif text-h2" lines={[<>Films</>]} />
                <div className="mt-8 grid gap-2 md:grid-cols-2">
                  {films.map((film) => (
                    <FilmPreview key={film.id} film={film} sizes="(min-width: 64rem) 33vw, (min-width: 48rem) 50vw, 100vw" />
                  ))}
                </div>
              </section>
            )}

            <section id="about" aria-label="About" className="border-t border-line py-section-sm">
              <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(14rem,18rem)] md:gap-14">
                <div>
                  <MaskedHeading as="h2" className="font-serif text-h2" lines={[<>About {vendor.name}</>]} />
                  <div className="mt-6 flex max-w-prose flex-col gap-4">
                    {vendor.about.map((paragraph) => (
                      <Text key={paragraph.slice(0, 24)} tone="mute">
                        {paragraph}
                      </Text>
                    ))}
                  </div>
                </div>
                <Reveal delay={0.1}>
                  <div className="relative overflow-hidden bg-ivory">
                    <Photo photo={vendor.aboutPhoto} sizes="(min-width: 48rem) 18rem, 100vw" />
                  </div>
                </Reveal>
              </div>
            </section>

            <section id="pricing" aria-label="Pricing" className="border-t border-line py-section-sm">
              <MaskedHeading as="h2" className="font-serif text-h2" lines={[<>Pricing</>]} />
              <p className="mt-3 max-w-prose text-mute">Starting points. Exact quotes come from {vendor.name}.</p>
              <ul className="mt-8 grid gap-2 md:grid-cols-3">
                {vendor.pricing.map((line, i) => (
                  <Reveal as="li" key={line.label} delay={i * 0.08} className="flex flex-col justify-between gap-6 bg-ivory p-6 md:p-7">
                    <div>
                      <p className="font-serif text-h3">{line.label}</p>
                      {line.note && <p className="mt-2 text-small text-mute">{line.note}</p>}
                    </div>
                    <p className="text-body-lg font-medium">{line.price}</p>
                  </Reveal>
                ))}
              </ul>
            </section>

            <section id="faq" aria-label="Frequently asked questions" className="border-t border-line py-section-sm">
              <MaskedHeading as="h2" className="font-serif text-h2" lines={[<>Good to know</>]} />
              <div className="mt-8">
                <Accordion items={vendor.faq} />
              </div>
            </section>
          </div>

          {/* Price, save, WhatsApp and a compact inquiry form. Sticky beside the
              work from lg; after it on phones (one set of markup). */}
          <aside
            id="inquiry"
            aria-label="Price and inquiry"
            className="border-t border-line py-section-sm lg:sticky lg:top-[calc(var(--nav-h)+4rem)] lg:border-0 lg:py-0 lg:pt-section-sm"
          >
            <div className="border border-line bg-white p-6 md:p-8">
              <Label>Starting from</Label>
              <p className="mt-1 font-serif text-h2">{startingPrice ?? "On request"}</p>
              <p className="mt-2 text-small text-mute">
                {categoryName} · {cityName}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2">
                <SaveButton
                  slug={vendor.slug}
                  name={vendor.name}
                  tone="ink"
                  withLabel
                  className="border border-line px-4 py-3 hover:border-ink"
                />
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
              </div>
              <div className="mt-8 border-t border-line pt-8">
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
            <MaskedHeading as="h2" className="font-serif text-h2" lines={[<>You might also like</>]} />
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

      <StickyActionBar slug={vendor.slug} name={vendor.name} startingPrice={startingPrice} whatsapp={vendor.whatsapp} />
    </main>
  );
}
