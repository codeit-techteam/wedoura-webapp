import type { Metadata } from "next";
import { FilterSelect } from "@/components/browse/FilterBar";
import { LoadMore } from "@/components/browse/LoadMore";
import { UnderlineTabs } from "@/components/browse/UnderlineTabs";
import { StoryCard } from "@/components/cards/StoryCard";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { listCitiesWithCounts, listWeddings, listWeddingStyles } from "@/lib/api";
import { patchedHref, pickParams } from "@/lib/url";

export const metadata: Metadata = {
  title: "Real Weddings",
  description: "Whole weddings across India, told the way they happened, with the people who made them.",
};

const PAGE = 6;
const PATHNAME = "/real-weddings";

export default async function RealWeddingsPage({ searchParams }: PageProps<"/real-weddings">) {
  const params = pickParams(await searchParams, ["style", "city", "show"]);
  const [allWeddings, filtered, styles, cities] = await Promise.all([
    listWeddings(),
    listWeddings({ style: params.style, city: params.city }),
    listWeddingStyles(),
    listCitiesWithCounts(),
  ]);
  const cityNames = Object.fromEntries(cities.map((c) => [c.slug, c.name]));
  const featured = allWeddings.items.find((w) => w.featured) ?? allWeddings.items[0];
  const rest = filtered.items.filter((w) => w.slug !== featured?.slug);

  const shown = Math.max(PAGE, Number.parseInt(params.show ?? "", 10) || PAGE);
  const visible = rest.slice(0, shown);

  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={[<>Real weddings, start to finish.</>]} />
      </Container>

      {featured && (
        <Container width="wide" className="mt-8 md:mt-10">
          <Reveal>
            <StoryCard wedding={featured} cityName={cityNames[featured.city]} sizes="100vw" variant="large" />
          </Reveal>
        </Container>
      )}

      <Container className="mt-12 md:mt-16">
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <UnderlineTabs
            param="style"
            label="Wedding styles"
            allLabel="All styles"
            tabs={styles.map((s) => ({ value: s.toLowerCase(), label: s }))}
            pathname={PATHNAME}
            params={params}
            className="min-w-0 flex-1"
          />
          <FilterSelect
            param="city"
            label="City"
            options={cities.map((c) => ({ value: c.slug, label: c.name }))}
            allLabel="Anywhere"
            pathname={PATHNAME}
            params={params}
            className="w-40"
          />
        </div>

        <div className="mt-10">
          {visible.length === 0 ? (
            <EmptyState
              title="No stories in that corner yet."
              text="Try another style or city, or read everything."
              action={{ label: "Show all stories", href: PATHNAME }}
            />
          ) : (
            <ul className="grid grid-cols-1 gap-2 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((wedding) => (
                <li key={wedding.slug}>
                  <StoryCard
                    wedding={wedding}
                    cityName={cityNames[wedding.city]}
                    sizes="(min-width: 48rem) 33vw, 100vw"
                    variant="small"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
        <LoadMore
          shown={visible.length}
          total={rest.length}
          moreHref={patchedHref(PATHNAME, params, { show: String(shown + PAGE) })}
          noun="stories"
        />
      </Container>
    </main>
  );
}
