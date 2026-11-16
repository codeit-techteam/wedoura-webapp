import type { Metadata } from "next";
import Link from "next/link";
import { CardRow } from "@/components/media/CardRow";
import { FilmPreview } from "@/components/media/FilmPreview";
import { Photo } from "@/components/media/Photo";
import { PhotoCard } from "@/components/media/PhotoCard";
import { Parallax } from "@/components/motion/Parallax";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Hairline } from "@/components/ui/Hairline";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
import { Text } from "@/components/ui/Text";
import { listFilms, listGalleryPhotos } from "@/lib/api";
import { ViewerDemo } from "./ViewerDemo";

export const metadata: Metadata = {
  title: "Styleguide",
  description: "Wedoura design foundations: colour, type, buttons, photo cards and motion.",
  robots: { index: false, follow: false },
};

const colours = [
  { name: "White", token: "white", hex: "#FFFFFF", role: "Page background" },
  { name: "Ivory", token: "ivory", hex: "#F6F2EA", role: "Alternate bands" },
  { name: "Ink", token: "ink", hex: "#161616", role: "Text, solid buttons" },
  { name: "Mute", token: "mute", hex: "#6B665D", role: "Secondary text, labels" },
  { name: "Line", token: "line", hex: "#DDD6C8", role: "Hairline rules" },
  { name: "Gold", token: "gold", hex: "#A8864A", role: "Marks, rules and icons only. 3.5:1 on white, so never text" },
];

const swatch: Record<string, string> = {
  white: "bg-white",
  ivory: "bg-ivory",
  ink: "bg-ink",
  mute: "bg-mute",
  line: "bg-line",
  gold: "bg-gold",
};

const motionList = [
  ["01", "Fade and rise", "Sections and cards rise 24px over 0.9s when they enter view, once.", "<Reveal>"],
  ["02", "Slow zoom", "Photos and cards scale to 1.04 on hover or press over 1.2s.", "<PhotoCard>"],
  ["03", "Parallax", "Cover images and story openers drift 6% as they cross the viewport.", "<Parallax>"],
  ["04", "Transitions", "Pages fade in; a thumbnail grows into the full-screen viewer.", "<PageTransition> <PhotoViewer>"],
  ["05", "Film previews", "Muted autoplay in view, paused off screen, with Watch the film.", "<FilmPreview>"],
];

function Specimen({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-3 border-t border-line py-6 md:grid-cols-[10rem_1fr] md:gap-8">
      <Label>{label}</Label>
      <div>{children}</div>
    </div>
  );
}

export default async function StyleguidePage() {
  const [gallery, films] = await Promise.all([listGalleryPhotos(1, 200), listFilms()]);
  const photos = gallery.items.map((i) => i.photo);
  const landscape = photos.filter((p) => p.width > p.height);
  const portrait = photos.filter((p) => p.height > p.width);
  const cover = landscape[0];
  const cards = [landscape[1], portrait[0], landscape[2]];
  const viewerPhotos = [landscape[3], portrait[1], landscape[4], portrait[2]];

  return (
    <main>
      <header className="border-b border-line">
        <Container className="py-section-sm">
          <Label>Wedoura foundations</Label>
          <Heading level={1} size="display" className="mt-4">
            Style<em>guide</em>
          </Heading>
          <Text variant="lead" tone="mute" className="mt-6 max-w-prose">
            Colour, type, spacing, buttons, photographs and the five motion patterns from the brief. Everything
            on the site is built from what is on this page.
          </Text>
          <nav aria-label="Sections" className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
            {["colour", "type", "spacing", "buttons", "photos", "motion"].map((id) => (
              <Link key={id} href={`#${id}`} className="label tap inline-flex items-center border-b border-line text-ink hover:border-gold">
                {id}
              </Link>
            ))}
          </nav>
        </Container>
      </header>

      {/* Colour */}
      <Section id="colour">
        <Container>
          <Reveal>
            <Label>01</Label>
            <Heading className="mt-3">Colour</Heading>
            <Text tone="mute" className="mt-4 max-w-prose">
              Mostly black and white. The photographs supply the colour. One accent, gold, for marks, rules and icons. It is never used for text, not even small labels.
            </Text>
          </Reveal>
          <ul className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-6">
            {colours.map((c, i) => (
              <Reveal as="li" key={c.token} delay={i * 0.06}>
                <div className={`aspect-4/5 border border-line ${swatch[c.token]}`} />
                <p className="mt-4 font-serif text-h3">{c.name}</p>
                <p className="mt-2 font-sans text-small text-mute">{c.hex}</p>
                <p className="mt-1 text-small text-mute">{c.role}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Type */}
      <Section id="type" tone="ivory">
        <Container>
          <Reveal>
            <Label>02</Label>
            <Heading className="mt-3">Type</Heading>
            <Text tone="mute" className="mt-4 max-w-prose">
              Instrument Serif, regular with one italic word for emphasis, set large and tight. DM Sans for body and
              labels: 400 everywhere, 500 for emphasis. Body text never drops below 17px; nothing is under 14px.
            </Text>
          </Reveal>
          <div className="mt-12">
            <Specimen label="Display">
              <Heading level={2} size="display">
                A day worth <em>remembering</em>.
              </Heading>
            </Specimen>
            <Specimen label="H1">
              <Heading level={2} size="h1">
                Photographers who <em>wait</em> for the moment
              </Heading>
            </Specimen>
            <Specimen label="H2">
              <Heading level={2} size="h2">
                Real weddings across <em>India</em>
              </Heading>
            </Specimen>
            <Specimen label="H3">
              <Heading level={3} size="h3">
                The Courtyard House, Goa
              </Heading>
            </Specimen>
            <Specimen label="Lead">
              <Text variant="lead" tone="mute" className="max-w-prose">
                A standfirst in the serif, a touch larger than body, for the first paragraph of a story.
              </Text>
            </Specimen>
            <Specimen label="Body">
              <Text className="max-w-prose">
                Body text is DM Sans 400, 17px on phones and 18px from tablets up, with a line height of 1.6.
                Paragraphs stay under 42rem so lines remain comfortable. The footer carries the one note that
                the site&apos;s content is placeholder while it is being built.
              </Text>
            </Specimen>
            <Specimen label="Small">
              <Text variant="small" tone="mute" className="max-w-prose">
                Captions and meta lines at 14px, muted.
              </Text>
            </Specimen>
            <Specimen label="Label">
              <div className="flex flex-wrap gap-x-10 gap-y-3">
                <Label tone="ink">Photography & Films</Label>
                <Label>Udaipur · Rajasthan</Label>
                <Label>Featured</Label>
              </div>
            </Specimen>
          </div>
        </Container>
      </Section>

      {/* Spacing */}
      <Section id="spacing">
        <Container>
          <Reveal>
            <Label>03</Label>
            <Heading className="mt-3">Spacing and rules</Heading>
            <Text tone="mute" className="mt-4 max-w-prose">
              Sections breathe with a clamp from 80px to 152px. Hairlines separate; the ink rule heads a section.
              Square corners everywhere, no shadows.
            </Text>
          </Reveal>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            <div>
              <Hairline tone="ink" />
              <Label className="mt-4">Ink rule, 1px</Label>
            </div>
            <div>
              <Hairline />
              <Label className="mt-4">Hairline, 1px #DDD6C8</Label>
            </div>
            <div>
              <div className="h-24 bg-ivory" />
              <Label className="mt-4">Ivory band</Label>
            </div>
          </div>
          <div className="mt-12 flex flex-wrap items-end gap-6">
            <div>
              <div className="h-6 w-gutter bg-line" />
              <Label className="mt-3">--spacing-gutter</Label>
            </div>
            <div>
              <div className="h-6 w-section-sm bg-line" />
              <Label className="mt-3">--spacing-section-sm</Label>
            </div>
            <div>
              <div className="h-6 w-section bg-line" />
              <Label className="mt-3">--spacing-section</Label>
            </div>
          </div>
        </Container>
      </Section>

      {/* Buttons */}
      <Section id="buttons" tone="ivory">
        <Container>
          <Reveal>
            <Label>04</Label>
            <Heading className="mt-3">Buttons</Heading>
            <Text tone="mute" className="mt-4 max-w-prose">
              Three kinds. Every one is at least 44px tall, uses the label style and changes colour over 0.3s.
            </Text>
          </Reveal>
          <div className="mt-12 grid gap-10 md:grid-cols-2">
            <div className="flex flex-wrap items-center gap-6">
              <Button>Send inquiry</Button>
              <Button variant="outline">Watch the film</Button>
              <Button variant="link">See all vendors</Button>
              <Button disabled>Disabled</Button>
            </div>
            <div className="relative overflow-hidden bg-ink p-8">
              <Photo photo={cover} sizes="(min-width: 768px) 50vw, 100vw" mode="cover" className="opacity-80" />
              <div className="relative flex flex-wrap items-center gap-6">
                <Button tone="white">List your business</Button>
                <Button variant="outline" tone="white">
                  Watch the film
                </Button>
                <Button variant="link" tone="white">
                  Full story
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Photo cards */}
      <Section id="photos">
        <Container>
          <Reveal>
            <Label>05</Label>
            <Heading className="mt-3">Photo cards</Heading>
            <Text tone="mute" className="mt-4 max-w-prose">
              Two layouts. A card row shares one aspect ratio across the row, chosen per row, so edges line up.
              Galleries use no ratio: every photograph is shown whole at its own proportions. Both load behind a
              blurred placeholder so nothing shifts. Hover or press for the slow zoom.
            </Text>
          </Reveal>

          <Label className="mt-14">Card row · 4/5 · three columns</Label>
          <CardRow ratio="4/5" columns={3} mobileColumns={2} className="mt-5">
            {cards.map((photo, i) => (
              <Reveal as="li" key={photo.id} delay={i * 0.08}>
                <PhotoCard
                  photo={photo}
                  sizes="(min-width: 48rem) 33vw, 50vw"
                  eyebrow="Photography & Films"
                  title="Aperture & Marigold"
                  meta="Udaipur"
                  href="#photos"
                />
              </Reveal>
            ))}
          </CardRow>

          <Label className="mt-14">Card row · 3/2 · two columns</Label>
          <CardRow ratio="3/2" columns={2} className="mt-5">
            {cards.slice(0, 2).map((photo, i) => (
              <Reveal as="li" key={photo.id} delay={i * 0.08}>
                <PhotoCard
                  photo={photo}
                  sizes="(min-width: 48rem) 50vw, 100vw"
                  eyebrow="Real wedding"
                  title="Three days by the lake"
                  meta="A. & R. · Udaipur"
                  href="#photos"
                />
              </Reveal>
            ))}
          </CardRow>

          <Label className="mt-14">Gallery · no ratio, each photo whole</Label>
          <ul className="mt-5 grid items-start gap-6 md:grid-cols-3">
            {cards.map((photo, i) => (
              <Reveal as="li" key={photo.id} delay={i * 0.08}>
                <PhotoCard
                  photo={photo}
                  sizes="(min-width: 48rem) 33vw, 100vw"
                  eyebrow={`${photo.width > photo.height ? "Landscape" : "Portrait"} · ${photo.width}×${photo.height}`}
                  href="#photos"
                />
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      {/* Motion */}
      <Section id="motion" tone="ivory">
        <Container>
          <Reveal>
            <Label>06</Label>
            <Heading className="mt-3">Motion</Heading>
            <Text tone="mute" className="mt-4 max-w-prose">
              Five patterns, one easing, nothing flashy. All of it switches off when the device asks for reduced
              motion. Easing: cubic-bezier(0.2, 0.7, 0.2, 1).
            </Text>
          </Reveal>
          <ol className="mt-12">
            {motionList.map(([n, title, text, component]) => (
              <li key={n} className="grid gap-2 border-t border-line py-6 md:grid-cols-[4rem_14rem_1fr_auto] md:gap-8">
                <Label>{n}</Label>
                <p className="font-serif text-h3">{title}</p>
                <Text tone="mute">{text}</Text>
                <code className="font-sans text-small text-mute">{component}</code>
              </li>
            ))}
          </ol>
        </Container>

        <Container className="mt-section-sm">
          <Label>01 · Fade and rise, 02 · Zoom, 04 · Thumbnail into viewer</Label>
          <Text tone="mute" className="mt-3 mb-8 max-w-prose">
            Scroll these in; they rise once. Hover for the zoom. Click one to open the full-screen viewer, then
            use the arrow keys, swipe, or press Escape.
          </Text>
          <ViewerDemo photos={viewerPhotos} />
        </Container>

        <div className="mt-section-sm">
          <Container>
            <Label>03 · Parallax, covers and story openers only</Label>
          </Container>
          <Parallax className="mt-6 h-[60vh] min-h-80 md:h-[70vh]">
            <Photo photo={cover} sizes="100vw" mode="cover" />
          </Parallax>
        </div>

        <Container className="mt-section-sm">
          <Label>05 · Film preview</Label>
          <Text tone="mute" className="mt-3 mb-8 max-w-prose">
            Plays muted while at least 60% visible and pauses when it leaves. Watch the film opens the full
            version. With no clip, the poster breathes instead; profiles hide films that have no clip.
          </Text>
          <div className="grid gap-8 md:grid-cols-2">
            {films.slice(0, 2).map((film) => (
              <FilmPreview key={film.id} film={film} sizes="(min-width: 768px) 50vw, 100vw" eyebrow="Wedding film" />
            ))}
          </div>
        </Container>

        <Container className="mt-section-sm">
          <Label>04 · Page transition</Label>
          <Text tone="mute" className="mt-3 max-w-prose">
            Every route fades and rises in over 0.45s through the root template.
          </Text>
          <Button href="/" variant="link" className="mt-6">
            Go to the homepage and back
          </Button>
        </Container>
      </Section>

      <footer className="border-t border-line">
        <Container className="flex flex-wrap items-center justify-between gap-4 py-8">
          <Label>Wedoura · Styleguide · Placeholder content throughout</Label>
          <Label>
            <Link href="/" className="hover:text-ink">
              Home
            </Link>
          </Label>
        </Container>
      </footer>
    </main>
  );
}
