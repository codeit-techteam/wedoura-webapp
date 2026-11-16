import Link from "next/link";
import { FilterBar, FilterSelect } from "@/components/browse/FilterBar";
import { LoadMore } from "@/components/browse/LoadMore";
import { VendorCard } from "@/components/cards/VendorCard";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { DemoVendorCards } from "@/components/profile/DemoVendorCards";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  BUDGET_BANDS,
  VENDOR_SORTS,
  budgetToRange,
  listAllCategories,
  listAllCities,
  listCategoriesWithCounts,
  listCategoryCityPairs,
  listCitiesWithCounts,
  listVendors,
} from "@/lib/api";
import { clearedHref, patchedHref, type ParamRecord } from "@/lib/url";

const PAGE = 8;
const BASE_KEYS = ["q", "category", "city", "budget", "sort"];

export type VendorBrowseProps = {
  /** The route rendering the directory; hrefs are patched onto it. */
  pathname: string;
  /** The picked query params (q, category, city, budget, sort, show, fields). */
  params: ParamRecord;
  /** Filters fixed by the route (category-in-city pages); they are applied
   *  but not rendered as selects. */
  pinned?: { category?: string; city?: string };
  heading: string[];
  intro: string;
  /** Clear-filters target (the bare route). */
  clearPathname?: string;
};

/**
 * The one vendor directory: /vendors renders it bare, the
 * /vendors/[category]/[city] pages render it pinned. Server component;
 * every control writes the URL.
 */
export async function VendorBrowse({ pathname, params, pinned = {}, heading, intro, clearPathname }: VendorBrowseProps) {
  const [categories, cities] = await Promise.all([listCategoriesWithCounts(), listCitiesWithCounts()]);

  const activeCategorySlug = pinned.category ?? params.category;
  const activeCitySlug = pinned.city ?? params.city;

  // Category-specific filters come from the active category's definitions.
  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);
  const fieldDefs = activeCategory?.fields.filter((f) => f.filterable && f.options?.length) ?? [];
  const fieldKeys = fieldDefs.map((f) => f.key);

  const shown = Math.max(PAGE, Number.parseInt(params.show ?? "", 10) || PAGE);
  const fields: Record<string, string> = {};
  for (const key of fieldKeys) if (params[key]) fields[key] = params[key];

  const result = await listVendors({
    q: params.q,
    category: activeCategorySlug,
    city: activeCitySlug,
    ...budgetToRange(params.budget),
    sort: params.sort,
    page: 1,
    limit: shown,
    fields,
  });

  const activeCount =
    ["q", "category", "city", "budget"].filter((k) => params[k]).length + fieldKeys.filter((k) => params[k]).length;
  const count = `${result.total} vendor${result.total === 1 ? "" : "s"}`;

  // Pretty category-in-city links. On /vendors with exactly one of
  // category/city picked, the matching pairs; on a pinned page, the same
  // category's other cities, so the cluster interlinks.
  let comboLinks: Awaited<ReturnType<typeof listCategoryCityPairs>> = [];
  let comboLabel = "";
  if (pinned.category && pinned.city) {
    comboLinks = (await listCategoryCityPairs()).filter((p) => p.category === pinned.category && p.city !== pinned.city);
    comboLabel = "The same category in other cities";
  } else if (!pinned.category && !pinned.city && Boolean(params.category) !== Boolean(params.city)) {
    comboLinks = (await listCategoryCityPairs()).filter((p) =>
      params.category ? p.category === params.category : p.city === params.city,
    );
    comboLabel = params.category ? "This category by city" : "This city by category";
  }

  return (
    <main>
      <Container className="pt-10 pb-8 md:pt-16 md:pb-10">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={heading} />
        <p className="mt-4 max-w-prose text-mute">{intro}</p>
      </Container>

      <FilterBar
        count={count}
        activeCount={activeCount}
        clearHref={clearedHref(clearPathname ?? pathname, params, [...BASE_KEYS, "show", ...fieldKeys])}
      >
        {!pinned.category && (
          <FilterSelect
            param="category"
            label="Category"
            options={categories.map((c) => ({ value: c.slug, label: c.shortName }))}
            pathname={pathname}
            params={params}
          />
        )}
        {!pinned.city && (
          <FilterSelect
            param="city"
            label="City"
            options={cities.map((c) => ({ value: c.slug, label: c.name }))}
            allLabel="Anywhere"
            pathname={pathname}
            params={params}
          />
        )}
        <FilterSelect
          param="budget"
          label="Budget"
          options={BUDGET_BANDS.map((b) => ({ value: b.value, label: b.label }))}
          allLabel="Any budget"
          pathname={pathname}
          params={params}
        />
        <FilterSelect
          param="sort"
          label="Sort"
          options={VENDOR_SORTS.filter((s) => s.value !== "featured").map((s) => ({ value: s.value, label: s.label }))}
          allLabel="Featured first"
          pathname={pathname}
          params={params}
        />
        {fieldDefs.map((def) => (
          <FilterSelect
            key={def.key}
            param={def.key}
            label={def.label}
            options={(def.options ?? []).map((o) => ({ value: o, label: o }))}
            allLabel="Any"
            pathname={pathname}
            params={params}
          />
        ))}
      </FilterBar>

      {comboLinks.length > 0 && (
        <Container className="pt-6">
          <ul className="flex flex-wrap gap-x-6 gap-y-2" aria-label={comboLabel}>
            {comboLinks.map((pair) => (
              <li key={`${pair.category}-${pair.city}`}>
                <Link href={`/vendors/${pair.category}/${pair.city}`} className="link-draw inline-flex tap items-center text-body text-mute transition-chrome hover:text-ink">
                  {params.category || pinned.category ? pair.cityName : pair.categoryName}
                  <span className="ml-2 text-small">({pair.count})</span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      )}

      <div className="container-wide py-10 md:py-14">
        {params.q && <p className="mb-8 font-serif text-h3">Results for &ldquo;{params.q}&rdquo;</p>}
        {result.items.length === 0 ? (
          <EmptyState
            title="No vendors match those filters yet."
            text="Try a wider budget, another city, or clear the filters to see everyone."
            action={{ label: "Clear all filters", href: clearPathname ?? pathname }}
          />
        ) : (
          <ul className="grid grid-cols-2 gap-2 gap-y-8 lg:grid-cols-3 min-[80rem]:grid-cols-4">
            {result.items.map((vendor, i) => (
              <li key={vendor.slug}>
                <VendorCard vendor={vendor} priority={i < 4} />
              </li>
            ))}
          </ul>
        )}
        <DemoListings
          category={activeCategorySlug}
          city={activeCitySlug}
          excludeSlugs={result.items.map((v) => v.slug)}
        />
        <LoadMore
          shown={result.items.length}
          total={result.total}
          moreHref={patchedHref(pathname, params, { show: String(shown + PAGE) })}
          noun="vendors"
        />
      </div>
    </main>
  );
}

/** Listings published through /demo live in the browser's store; this
 *  appends their cards after the server grid. Gone with the backend. */
async function DemoListings({ category, city, excludeSlugs }: { category?: string; city?: string; excludeSlugs: string[] }) {
  const [categories, cities] = await Promise.all([listAllCategories(), listAllCities()]);
  return (
    <DemoVendorCards
      excludeSlugs={excludeSlugs}
      category={category}
      city={city}
      categories={categories.map(({ slug, name }) => ({ slug, name }))}
      cities={cities.map(({ slug, name }) => ({ slug, name }))}
    />
  );
}
