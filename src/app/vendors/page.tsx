import type { Metadata } from "next";
import { FilterBar, FilterSelect } from "@/components/browse/FilterBar";
import { LoadMore } from "@/components/browse/LoadMore";
import { VendorCard, type VendorCardData } from "@/components/cards/VendorCard";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { BUDGET_BANDS, VENDOR_SORTS, getCategories, getCities, getVendors } from "@/lib/api";
import { clearedHref, patchedHref, pickParams } from "@/lib/url";

export const metadata: Metadata = {
  title: "Vendors",
  description:
    "Photographers, venues, makeup artists, decorators, caterers and musicians across India. Filter by category, city and budget.",
};

const PAGE = 8;
const FILTER_KEYS = ["q", "category", "city", "budget", "sort"];
const PATHNAME = "/vendors";

export default async function VendorsPage({ searchParams }: PageProps<"/vendors">) {
  const params = pickParams(await searchParams, [...FILTER_KEYS, "show"]);
  const [vendors, categories, cities] = await Promise.all([
    getVendors({
      q: params.q,
      category: params.category,
      city: params.city,
      budget: params.budget,
      sort: params.sort,
    }),
    getCategories(),
    getCities(),
  ]);
  const cityNames = new Map(cities.map((c) => [c.slug, c.name]));

  const shown = Math.max(PAGE, Number.parseInt(params.show ?? "", 10) || PAGE);
  const visible = vendors.slice(0, shown);
  const cards: VendorCardData[] = visible.map((v) => ({
    slug: v.slug,
    name: v.name,
    category: v.category,
    cityName: cityNames.get(v.city) ?? v.city,
    startingPrice: v.pricing[0]?.price,
    photos: v.bestPhotos,
  }));

  const activeCount = FILTER_KEYS.filter((k) => k !== "sort" && params[k]).length;
  const count = `${vendors.length} vendor${vendors.length === 1 ? "" : "s"}`;

  return (
    <main>
      <Container className="pt-10 pb-8 md:pt-16 md:pb-10">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={[<>Every vendor, one place.</>]} />
        <p className="mt-4 max-w-prose text-mute">
          Filter by what you need, where you are marrying and what you want to spend.
        </p>
      </Container>

      <FilterBar
        count={count}
        activeCount={activeCount}
        clearHref={clearedHref(PATHNAME, params, [...FILTER_KEYS, "show"])}
        className="sticky top-0 z-30 md:top-nav"
      >
        <FilterSelect
          param="category"
          label="Category"
          options={categories.map((c) => ({ value: c.slug, label: c.shortName }))}
          pathname={PATHNAME}
          params={params}
          className="md:w-48"
        />
        <FilterSelect
          param="city"
          label="City"
          options={cities.map((c) => ({ value: c.slug, label: c.name }))}
          allLabel="Anywhere"
          pathname={PATHNAME}
          params={params}
          className="md:w-40"
        />
        <FilterSelect
          param="budget"
          label="Budget"
          options={BUDGET_BANDS.map((b) => ({ value: b.value, label: b.label }))}
          allLabel="Any budget"
          pathname={PATHNAME}
          params={params}
          className="md:w-44"
        />
        <FilterSelect
          param="sort"
          label="Sort"
          options={VENDOR_SORTS.filter((s) => s.value !== "featured").map((s) => ({ value: s.value, label: s.label }))}
          allLabel="Featured first"
          pathname={PATHNAME}
          params={params}
          className="md:w-48"
        />
      </FilterBar>

      <div className="container-wide py-10 md:py-14">
        {params.q && <p className="mb-8 font-serif text-h3">Results for &ldquo;{params.q}&rdquo;</p>}
        {cards.length === 0 ? (
          <EmptyState
            title="No vendors match those filters yet."
            text="Try a wider budget, another city, or clear the filters to see everyone."
            action={{ label: "Clear all filters", href: PATHNAME }}
          />
        ) : (
          <ul className="grid grid-cols-2 gap-2 gap-y-8 lg:grid-cols-3 min-[80rem]:grid-cols-4">
            {cards.map((vendor, i) => (
              <li key={vendor.slug}>
                <VendorCard vendor={vendor} priority={i < 4} />
              </li>
            ))}
          </ul>
        )}
        <LoadMore
          shown={cards.length}
          total={vendors.length}
          moreHref={patchedHref(PATHNAME, params, { show: String(shown + PAGE) })}
          noun="vendors"
        />
      </div>
    </main>
  );
}
