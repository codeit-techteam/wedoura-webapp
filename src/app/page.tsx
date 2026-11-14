import Link from "next/link";
import { CategoriesShowcase } from "@/components/home/CategoriesShowcase";
import { CitiesIndex } from "@/components/home/CitiesIndex";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { FilmsBand } from "@/components/home/FilmsBand";
import { HeroSearch } from "@/components/home/HeroSearch";
import { VendorRail, type RailVendor } from "@/components/home/VendorRail";
import { WeddingsEditorial } from "@/components/home/WeddingsEditorial";
import { Photo } from "@/components/media/Photo";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import { Section } from "@/components/ui/Section";
import { Text } from "@/components/ui/Text";
import {
  getBlogPosts,
  getCategories,
  getCities,
  getFeaturedVendors,
  getFilms,
  getPhoto,
  getPromises,
  getRealWeddings,
  getSiteFaq,
} from "@/lib/api";

const monthYear = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" });

export default async function HomePage() {
  const [hero, tallPhoto, bandPhoto, categories, cities, featured, weddings, films, promises, posts, faq] =
    await Promise.all([
      getPhoto("p23"),
      getPhoto("p35"),
      getPhoto("p31"),
      getCategories(),
      getCities(),
      getFeaturedVendors(),
      getRealWeddings(),
      getFilms(),
      getPromises(),
      getBlogPosts(),
      getSiteFaq(),
    ]);
  const cityNames = Object.fromEntries(cities.map((c) => [c.slug, c.name]));
  const categoryNames = Object.fromEntries(categories.map((c) => [c.slug, c.shortName]));

  const railVendors: RailVendor[] = featured.map((vendor) => ({
    slug: vendor.slug,
    name: vendor.name,
    cityName: cityNames[vendor.city] ?? vendor.city,
    category: categoryNames[vendor.category] ?? vendor.category,
    startingPrice: vendor.pricing[0]?.price,
    photos: vendor.bestPhotos,
  }));

  return (
    <main>
      {/* 1 · Hero: full-screen photograph, headline bottom left, search docked at the base. */}
      <section data-nav-dark className="relative -mt-nav flex min-h-dvh flex-col justify-end bg-ink pb-bottombar text-white">
        {hero && (
          <Photo photo={hero} sizes="100vw" mode="cover" priority quality={90} objectPosition="64% 38%" />
        )}
        {/* Legibility: one gradient rising from the base, one from the text corner. */}
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/25 to-transparent" />
        <div
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-2/3 bg-linear-to-r from-ink/55 to-transparent"
        />
        <Container className="relative pb-10 md:pb-14">
          <Reveal>
            <h1 className="max-w-3xl font-serif text-display font-light text-balance">
              Your wedding, in <em>good hands</em>.
            </h1>
            <p className="mt-5 max-w-xl font-serif text-lead text-white/85">
              Photographers, venues, makeup artists, decorators, caterers and musicians across India. See their
              real work, then talk to them directly.
            </p>
          </Reveal>
          <Reveal delay={0.15} className="mt-10">
            <HeroSearch
              cities={cities.map((c) => ({ slug: c.slug, name: c.name }))}
              categories={categories.map((c) => ({ slug: c.slug, name: c.shortName }))}
            />
          </Reveal>
        </Container>
        <div aria-hidden="true" className="scroll-cue absolute right-6 bottom-40 hidden xl:block">
          <span className="label text-white/70">Scroll</span>
        </div>
      </section>

      {/* 2 · Categories: serif index with crossfading photograph. */}
      <Section aria-label="Vendor categories">
        <Container>
          <Reveal className="max-w-2xl">
            <Heading className="text-balance">
              Six kinds of people make a wedding. <em>Meet all of them here.</em>
            </Heading>
          </Reveal>
          <div className="mt-14">
            <CategoriesShowcase categories={categories} />
          </div>
        </Container>
      </Section>

      {/* 3 · Featured vendors: a rail of triptychs. */}
      <Section tone="ivory" aria-label="Featured vendors">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <Label>Featured this month</Label>
              <Heading className="mt-3">Vendors whose work we keep coming back to</Heading>
            </div>
            <Button href="/vendors" variant="link">
              See all vendors
            </Button>
          </Reveal>
        </Container>
        <Container width="wide" className="mt-14">
          <Reveal>
            <VendorRail vendors={railVendors} />
          </Reveal>
        </Container>
      </Section>

      {/* 4 · Real weddings: cover story and two offset stories. */}
      <Section aria-label="Real weddings">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <Heading className="max-w-xl">
              Real weddings, told the way they <em>happened</em>
            </Heading>
            <Button href="/real-weddings" variant="link">
              All stories
            </Button>
          </Reveal>
          <div className="mt-14">
            <WeddingsEditorial weddings={weddings} cityNames={cityNames} />
          </div>
        </Container>
      </Section>

      {/* 5 · Films: the one dark band. */}
      <FilmsBand films={films} />

      {/* 6 · Cities: serif index, photo follows the pointer. */}
      <Section aria-label="Browse by city">
        <Container>
          <Reveal className="mb-14 max-w-xl">
            <Label>Where are you marrying?</Label>
            <Heading className="mt-3">Start with your city</Heading>
          </Reveal>
          <Reveal>
            <CitiesIndex cities={cities} />
          </Reveal>
        </Container>
      </Section>

      {/* 7 · Why Wedoura: one tall photograph, three numbered statements. */}
      <Section tone="ivory" aria-label="Why Wedoura">
        <Container>
          <div className="grid items-center gap-14 md:grid-cols-2 xl:gap-24">
            <Reveal>
              {tallPhoto && (
                <figure>
                  <Photo photo={tallPhoto} sizes="(min-width: 48rem) 44vw, 100vw" />
                  {tallPhoto.credit && (
                    <figcaption className="mt-3 text-small text-mute">
                      {tallPhoto.alt}. Photograph by {tallPhoto.credit}.
                    </figcaption>
                  )}
                </figure>
              )}
            </Reveal>
            <div>
              <Reveal>
                <Heading size="h2">Why couples use Wedoura</Heading>
              </Reveal>
              <ol className="mt-10">
                {promises.map((promise, i) => (
                  <Reveal as="li" key={promise.title} delay={i * 0.1} className="border-t border-line py-8">
                    <div className="flex gap-6">
                      <span aria-hidden="true" className="font-serif text-h3 leading-none text-mute">
                        0{i + 1}
                      </span>
                      <div>
                        <p className="font-serif text-h3 leading-tight">{promise.title}</p>
                        <Text tone="mute" className="mt-3 max-w-md">
                          {promise.text}
                        </Text>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </Container>
      </Section>

      {/* 8 · From the blog: an editorial list with hairlines. */}
      <Section aria-label="From the blog">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <Heading>Worth reading before you book</Heading>
            <Button href="/blogs" variant="link">
              All articles
            </Button>
          </Reveal>
          <ul className="mt-12">
            {posts.slice(0, 3).map((post, i) => (
              <Reveal as="li" key={post.slug} delay={i * 0.08} className="border-t border-line last:border-b">
                <Link
                  href={`/blogs/${post.slug}`}
                  className="group grid items-center gap-x-8 gap-y-4 py-7 outline-offset-4 md:grid-cols-[11rem_1fr_9rem]"
                >
                  <p className="text-small text-mute">
                    {monthYear.format(new Date(post.date))}
                    <span className="mx-2" aria-hidden="true">
                      ·
                    </span>
                    {post.category}
                  </p>
                  <h3 className="font-serif text-h3 leading-snug transition-colors duration-300 ease-wedoura group-hover:text-mute">
                    {post.title}
                  </h3>
                  <div className="relative hidden aspect-4/3 overflow-hidden md:block">
                    <Photo
                      photo={post.cover}
                      mode="cover"
                      sizes="9rem"
                      className="transition-transform duration-1200 ease-wedoura group-hover:scale-104"
                    />
                  </div>
                </Link>
              </Reveal>
            ))}
          </ul>
        </Container>
      </Section>

      {/* 9 · FAQ. The footer links here. */}
      <Section tone="ivory" id="faq" aria-label="Frequently asked questions">
        <Container>
          <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
            <Reveal>
              <Heading size="h2">Questions couples ask us</Heading>
              <Text tone="mute" className="mt-4 max-w-sm">
                Anything else, write to us from the contact page.
              </Text>
            </Reveal>
            <Reveal delay={0.1}>
              <FaqAccordion items={faq} />
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* 10 · List your business: full-width photograph and one button. */}
      <section
        aria-label="List your business"
        className="relative flex min-h-96 items-end overflow-hidden bg-ink py-section-sm text-white md:min-h-128"
      >
        {bandPhoto && <Photo photo={bandPhoto} sizes="100vw" mode="cover" objectPosition="50% 35%" />}
        <div aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/20 to-transparent" />
        <Container className="relative">
          <Reveal className="max-w-xl">
            <Heading size="h2">You do beautiful work. Let couples see it.</Heading>
            <p className="mt-4 text-body text-white/85">
              A Wedoura profile is your portfolio, your pricing and a direct line to couples. No middlemen.
            </p>
            <div className="mt-8">
              <Button href="/list-your-business" tone="white">
                List your business
              </Button>
            </div>
          </Reveal>
        </Container>
      </section>
    </main>
  );
}
