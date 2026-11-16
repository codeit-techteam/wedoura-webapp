import type { Metadata } from "next";
import { FilterBar, FilterSelect } from "@/components/browse/FilterBar";
import { LoadMore } from "@/components/browse/LoadMore";
import { VendorCard } from "@/components/cards/VendorCard";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { DemoVendorCards } from "@/components/profile/DemoVendorCards";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { BUDGET_BANDS, VENDOR_SORTS, budgetToRange, listAllCategories, listAllCities, listCategoriesWithCounts, listCitiesWithCounts, listVendors } from "@/lib/api";
import { clearedHref, patchedHref, pickParams } from "@/lib/url";

export const metadata: Metadata = {
  title: "Vendors",
  description:
    "Photographers, venues, makeup artists, decorators, caterers and musicians across India. Filter by category, city and budget.",
};

const PAGE = 8;
const BASE_KEYS = ["q", "category", "city", "budget", "sort"];
const PATHNAME = "/vendors";

export default async function VendorsPage({ searchParams }: PageProps<"/vendors">) {
  const sp = await searchParams;
  const [categories, cities] = await Promise.all([listCategoriesWithCounts(), listCitiesWithCounts()]);

  // Category-specific filters come from the active category's definitions.
  const baseParams = pickParams(sp, [...BASE_KEYS, "show"]);
  const activeCategory = categories.find((c) => c.slug === baseParams.category);
  const fieldDefs = activeCategory?.fields.filter((f) => f.filterable && f.options?.length) ?? [];
  const fieldKeys = fieldDefs.map((f) => f.key);
  const params = pickParams(sp, [...BASE_KEYS, "show", ...fieldKeys]);

  const shown = Math.max(PAGE, Number.parseInt(params.show ?? "", 10) || PAGE);
  const fields: Record<string, string> = {};
  for (const key of fieldKeys) if (params[key]) fields[key] = params[key];

  const result = await listVendors({
    q: params.q,
    category: params.category,
    city: params.city,
    ...budgetToRange(params.budget),
    sort: params.sort,
    page: 1,
    limit: shown,
    fields,
  });

  const activeCount =
    ["q", "category", "city", "budget"].filter((k) => params[k]).length + fieldKeys.filter((k) => params[k]).length;
  const count = `${result.total} vendor${result.total === 1 ? "" : "s"}`;

  return (
    <main>
      <Container className="pt-10 pb-8 md:pt-16 md:pb-10">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={["Every vendor, one place."]} />
        <p className="mt-4 max-w-prose text-mute">
          Filter by what you need, where you are marrying and what you want to spend.
        </p>
      </Container>

      <FilterBar
        count={count}
        activeCount={activeCount}
        clearHref={clearedHref(PATHNAME, params, [...BASE_KEYS, "show", ...fieldKeys])}
      >
        <FilterSelect
          param="category"
          label="Category"
          options={categories.map((c) => ({ value: c.slug, label: c.shortName }))}
          pathname={PATHNAME}
          params={params}
        />
        <FilterSelect
          param="city"
          label="City"
          options={cities.map((c) => ({ value: c.slug, label: c.name }))}
          allLabel="Anywhere"
          pathname={PATHNAME}
          params={params}
        />
        <FilterSelect
          param="budget"
          label="Budget"
          options={BUDGET_BANDS.map((b) => ({ value: b.value, label: b.label }))}
          allLabel="Any budget"
          pathname={PATHNAME}
          params={params}
        />
        <FilterSelect
          param="sort"
          label="Sort"
          options={VENDOR_SORTS.filter((s) => s.value !== "featured").map((s) => ({ value: s.value, label: s.label }))}
          allLabel="Featured first"
          pathname={PATHNAME}
          params={params}
        />
        {fieldDefs.map((def) => (
          <FilterSelect
            key={def.key}
            param={def.key}
            label={def.label}
            options={(def.options ?? []).map((o) => ({ value: o, label: o }))}
            allLabel="Any"
            pathname={PATHNAME}
            params={params}
          />
        ))}
      </FilterBar>

      <div className="container-wide py-10 md:py-14">
        {params.q && <p className="mb-8 font-serif text-h3">Results for &ldquo;{params.q}&rdquo;</p>}
        {result.items.length === 0 ? (
          <EmptyState
            title="No vendors match those filters yet."
            text="Try a wider budget, another city, or clear the filters to see everyone."
            action={{ label: "Clear all filters", href: PATHNAME }}
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
        <DemoListings category={params.category} city={params.city} excludeSlugs={result.items.map((v) => v.slug)} />
        <LoadMore
          shown={result.items.length}
          total={result.total}
          moreHref={patchedHref(PATHNAME, params, { show: String(shown + PAGE) })}
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
