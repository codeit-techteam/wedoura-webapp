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
import { Accordion } from "@/components/ui/Accordion";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { Text } from "@/components/ui/Text";
import type { Vendor } from "@/data/types";

type Props = {
  vendor: Vendor;
  categoryName: string;
  cityName: string;
  similar: VendorCardData[];
};

/** The vendor profile: the most important page on the site. Venues get the
 *  extra capacity/spaces/360 section via `vendor.venue`. */
export function VendorProfile({ vendor, categoryName, cityName, similar }: Props) {
  const isVenue = Boolean(vendor.venue);
  const startingPrice = vendor.pricing[0]?.price;

  const sections: SubnavSection[] = [
    { id: "portfolio", label: "Portfolio" },
    ...(isVenue ? [{ id: "venue", label: "The venue" }] : []),
    ...(vendor.albums.length ? [{ id: "albums", label: "Albums" }] : []),
    ...(vendor.films.length ? [{ id: "films", label: "Films" }] : []),
    { id: "about", label: "About" },
    { id: "pricing", label: "Pricing" },
    { id: "faq", label: "FAQ" },
    { id: "inquiry", label: "Inquire" },
  ];

  return (
    <main className="pb-24 md:pb-20">
      {/* Cover */}
      <section data-nav-dark className="relative -mt-nav flex min-h-[75vh] flex-col justify-end bg-ink text-white">
        <Photo photo={vendor.cover} sizes="100vw" mode="cover" priority quality={90} objectPosition="50% 45%" />
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
          <MaskedHeading as="h1" className="mt-5 max-w-4xl font-serif text-display" lines={[vendor.name]} />
          <p className="mt-4 text-body text-white/90">
            {categoryName} · {cityName}
            {startingPrice ? ` · ${startingPrice}` : ""}
          </p>
          <p className="mt-2 max-w-xl text-body text-white/80">{vendor.tagline}</p>
        </Container>
      </section>

      <StickySubnav sections={sections} />

      {/* Portfolio */}
      <section id="portfolio" aria-label="Portfolio" className="py-section-sm">
        <Container width="wide">
          <Reveal>
            <PhotoGrid photos={vendor.portfolio} />
          </Reveal>
        </Container>
      </section>

      {/* Venue extras */}
      {vendor.venue && (
        <section id="venue" aria-label="The venue" className="bg-ivory py-section-sm">
          <Container>
            <MaskedHeading as="h2" className="font-serif text-h2" lines={[<>The venue</>]} />
            <div className="mt-8 grid gap-10 md:grid-cols-[1fr_2fr] md:gap-16">
              <div>
                <Label>Capacity</Label>
                <p className="mt-2 font-serif text-h3">
                  {vendor.venue.capacity.min} to {vendor.venue.capacity.max} guests
                </p>
                <div className="mt-8 border border-line bg-white p-6">
                  <Label>360° view</Label>
                  <p className="mt-2 text-small text-mute">
                    A walk-through of the main spaces will sit here once the venue supplies it.
                  </p>
                </div>
              </div>
              <div>
                <Label>Spaces</Label>
                <ul className="mt-4 grid grid-cols-2 gap-2">
                  {vendor.venue.spaces.map((space, i) => (
                    <li key={space} className="relative aspect-4/3">
                      <PhotoTile
                        photo={vendor.portfolio[i % vendor.portfolio.length]}
                        title={space}
                        sizes="(min-width: 48rem) 30vw, 50vw"
                        titleClassName="text-lead p-4"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Albums */}
      {vendor.albums.length > 0 && (
        <section id="albums" aria-label="Albums" className="py-section-sm">
          <Container>
            <MaskedHeading as="h2" className="font-serif text-h2" lines={[<>Albums</>]} />
            <div className="mt-8">
              <AlbumList albums={vendor.albums} />
            </div>
          </Container>
        </section>
      )}

      {/* Films */}
      {vendor.films.length > 0 && (
        <section id="films" aria-label="Films" className="bg-ink py-section-sm text-white">
          <Container>
            <MaskedHeading as="h2" className="font-serif text-h2" lines={[<>Films</>]} />
            <div className="mt-8 grid gap-2 md:grid-cols-2">
              {vendor.films.map((film) => (
                <FilmPreview key={film.id} film={film} sizes="(min-width: 48rem) 50vw, 100vw" />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* About */}
      <section id="about" aria-label="About" className="py-section-sm">
        <Container>
          <div className="grid gap-10 md:grid-cols-[2fr_1fr] md:gap-20">
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
            <dl className="h-fit border-t border-line">
              {vendor.keyFacts.map((fact) => (
                <div key={fact.label} className="flex items-baseline justify-between gap-6 border-b border-line py-3">
                  <dt className="label text-mute">{fact.label}</dt>
                  <dd className="text-right text-body">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      {/* Pricing */}
      <section id="pricing" aria-label="Pricing" className="bg-ivory py-section-sm">
        <Container>
          <MaskedHeading as="h2" className="font-serif text-h2" lines={[<>Pricing</>]} />
          <ul className="mt-8 border-t border-ink/20">
            {vendor.pricing.map((line) => (
              <li key={line.label} className="flex flex-wrap items-baseline justify-between gap-x-10 gap-y-1 border-b border-ink/20 py-4">
                <div>
                  <p className="font-serif text-h3">{line.label}</p>
                  {line.note && <p className="mt-1 text-small text-mute">{line.note}</p>}
                </div>
                <p className="text-body font-medium">{line.price}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-small text-mute">Sample pricing while the site is being built. Exact quotes come from the vendor.</p>
        </Container>
      </section>

      {/* FAQ */}
      <section id="faq" aria-label="Frequently asked questions" className="py-section-sm">
        <Container>
          <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
            <MaskedHeading as="h2" className="font-serif text-h2" lines={[<>Good to know</>]} />
            <Accordion items={vendor.faq} />
          </div>
        </Container>
      </section>

      {/* Inquiry */}
      <section id="inquiry" aria-label="Send an inquiry" className="bg-ivory py-section-sm">
        <Container>
          <div className="grid gap-10 md:grid-cols-[1fr_2fr]">
            <div>
              <MaskedHeading as="h2" className="font-serif text-h2" lines={[<>Write to</>, <>{vendor.name}</>]} />
              <p className="mt-4 max-w-xs text-mute">
                Your message goes straight to the vendor. No middlemen, no call centre.
              </p>
            </div>
            <InquiryForm vendorName={vendor.name} />
          </div>
        </Container>
      </section>

      {/* Similar vendors */}
      {similar.length > 0 && (
        <section aria-label="Similar vendors" className="py-section-sm">
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
