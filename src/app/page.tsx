import { CardRow } from "@/components/media/CardRow";
import { FilmPreview } from "@/components/media/FilmPreview";
import { Photo } from "@/components/media/Photo";
import { PhotoCard } from "@/components/media/PhotoCard";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
import { Text } from "@/components/ui/Text";
import { getCategories, getCities, getFeaturedVendors, getFilms, getPhoto, getPromises, getRealWeddings } from "@/lib/api";

/**
 * Temporary homepage: a full-screen photo hero and tall sections so the
 * navbar can be judged over a photo and while scrolling. The real homepage
 * (build step 3) replaces this with the sections listed in the brief.
 */
export default async function HomePage() {
  const [hero, categories, featured, weddings, films, promises, cities] = await Promise.all([
    getPhoto("p16"),
    getCategories(),
    getFeaturedVendors(),
    getRealWeddings(),
    getFilms(),
    getPromises(),
    getCities(),
  ]);
  const cityBySlug = new Map(cities.map((c) => [c.slug, c.name]));
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c.shortName]));

  return (
    <main>
      {/* data-nav-dark: the navbar goes transparent with white text over this. */}
      <section data-nav-dark className="relative -mt-nav flex min-h-dvh items-end bg-ink pb-bottombar text-white">
        {hero && <Photo photo={hero} sizes="100vw" mode="cover" priority objectPosition="50% 45%" />}
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/75 via-ink/10 to-ink/35" />
        <Container className="relative pt-section pb-section-sm">
          <Reveal>
            <Label tone="white" className="opacity-80">
              Wedding vendors across India
            </Label>
            <Heading level={1} size="display" className="mt-4 max-w-4xl">
              The work, <em>seen whole</em>.
            </Heading>
            <Text variant="lead" className="mt-6 max-w-prose text-white/85">
              Photographers, films, venues, makeup, decor, catering and music. Browse the work first, then write to
              the people behind it.
            </Text>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button href="/vendors" tone="white">
                Explore vendors
              </Button>
              <Button href="/real-weddings" variant="outline" tone="white">
                Real weddings
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>

      <Section>
        <Container>
          <Reveal>
            <Label>Categories</Label>
            <Heading className="mt-3">
              Six kinds of <em>vendor</em>
            </Heading>
          </Reveal>
          <CardRow ratio="4/5" columns={3} mobileColumns={2} className="mt-12">
            {categories.map((category, i) => (
              <Reveal as="li" key={category.slug} delay={i * 0.06}>
                <PhotoCard
                  photo={category.cover}
                  sizes="(min-width: 48rem) 33vw, 50vw"
                  href={`/vendors?category=${category.slug}`}
                  title={category.name}
                  meta={category.description}
                />
              </Reveal>
            ))}
          </CardRow>
        </Container>
      </Section>

      <Section tone="ivory">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-6 border-b border-ink pb-6">
            <div>
              <Label>Featured vendors</Label>
              <Heading className="mt-3">
                Chosen for the <em>work</em>
              </Heading>
            </div>
            <Button href="/vendors" variant="link">
              See all vendors
            </Button>
          </Reveal>
          <CardRow ratio="3/2" columns={3} className="mt-12">
            {featured.map((vendor, i) => (
              <Reveal as="li" key={vendor.slug} delay={i * 0.08}>
                <PhotoCard
                  photo={vendor.cover}
                  sizes="(min-width: 48rem) 33vw, 100vw"
                  href={`/vendors/${vendor.slug}`}
                  eyebrow={categoryBySlug.get(vendor.category)}
                  title={vendor.name}
                  meta={`${cityBySlug.get(vendor.city) ?? vendor.city} · ${vendor.tagline}`}
                />
              </Reveal>
            ))}
          </CardRow>
        </Container>
      </Section>

      <Section>
        <Container>
          <Reveal>
            <Label>Real weddings</Label>
            <Heading className="mt-3">
              Whole days, <em>told slowly</em>
            </Heading>
          </Reveal>
          <ul className="mt-12 grid items-start gap-x-6 gap-y-12 md:grid-cols-3">
            {weddings.map((wedding, i) => (
              <Reveal as="li" key={wedding.slug} delay={i * 0.08}>
                <PhotoCard
                  photo={wedding.cover}
                  sizes="(min-width: 48rem) 33vw, 100vw"
                  href={`/real-weddings/${wedding.slug}`}
                  eyebrow={cityBySlug.get(wedding.city)}
                  title={wedding.title}
                  meta={wedding.couple}
                />
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="ivory">
        <Container>
          <Reveal>
            <Label>Films</Label>
            <Heading className="mt-3">
              Ten seconds, then the <em>whole film</em>
            </Heading>
          </Reveal>
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {films.slice(0, 2).map((film) => (
              <Reveal key={film.id}>
                <FilmPreview film={film} sizes="(min-width: 48rem) 50vw, 100vw" eyebrow="Sample film" />
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section id="faq">
        <Container>
          <Reveal>
            <Label>Why Wedoura</Label>
            <Heading className="mt-3">
              Three <em>promises</em>
            </Heading>
          </Reveal>
          <ul className="mt-12 grid gap-10 border-t border-line pt-10 md:grid-cols-3">
            {promises.map((promise, i) => (
              <Reveal as="li" key={promise.title} delay={i * 0.08}>
                <p className="font-serif text-h3 leading-tight">{promise.title}</p>
                <Text tone="mute" className="mt-3 max-w-sm">
                  {promise.text}
                </Text>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>
    </main>
  );
}
