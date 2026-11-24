import Link from "next/link";
import type { ReactNode } from "react";
import { VendorFilters } from "@/components/browse/VendorFilters";
import { VendorListCard } from "@/components/browse/VendorListCard";
import { VendorsChrome } from "@/components/browse/VendorsChrome";
import { LoadMore } from "@/components/browse/LoadMore";
import { SearchPill } from "@/components/browse/SearchPill";
import { VendorTile } from "@/components/cards/VendorTile";
import { DemoVendorCards } from "@/components/profile/DemoVendorCards";
import { Container } from "@/components/ui/Container";
import { EmptyState } from "@/components/ui/EmptyState";
import { JoinBand } from "@/components/ui/JoinBand";
import {
  budgetToRange,
  listAllCategories,
  listAllCities,
  listCategoriesWithCounts,
  listCategoryCityPairs,
  listCategoryGroups,
  listCitiesWithCounts,
  listVendors,
} from "@/lib/api";
import { patchedHref, type ParamRecord } from "@/lib/url";

const PAGE = 6;

export type VendorBrowseProps = {
  /** The route rendering the directory; hrefs are patched onto it. */
  pathname: string;
  /** The picked query params. */
  params: ParamRecord;
  /** Filters fixed by the route (category-in-city pages); they are applied
   *  but not shown as removable filter controls. */
  pinned?: { category?: string; city?: string };
  heading?: ReactNode[];
  intro?: string;
  /** Clear-filters target (bare route). */
  clearPathname?: string;
};

/**
 * The one vendor directory. Async server component.
 * /vendors renders it bare; /vendors/[category]/[city] renders it pinned.
 */
export async function VendorBrowse({
  pathname,
  params,
  pinned = {},
  heading,
  intro,
  clearPathname,
}: VendorBrowseProps) {
  const [categories, cities, allCities, categoryGroups] = await Promise.all([
    listCategoriesWithCounts(),
    listCitiesWithCounts(),
    listAllCities(),
    listCategoryGroups(),
  ]);

  const activeCategorySlug = pinned.category ?? params.category;
  const activeCitySlug = pinned.city ?? params.city;

  const activeCategory = categories.find((c) => c.slug === activeCategorySlug);
  const fieldDefs = activeCategory?.fields.filter((f) => f.filterable && f.options?.length) ?? [];
  const fieldKeys = fieldDefs.map((f) => f.key);

  const shown = Math.max(PAGE, Number.parseInt(params.show ?? "", 10) || PAGE);

  const styles = params.style ? params.style.split(",").filter(Boolean) : [];
  const fields: Record<string, string> = {};
  for (const key of fieldKeys) if (params[key]) fields[key] = params[key];

  const result = await listVendors({
    q: params.q,
    category: activeCategorySlug,
    city: activeCitySlug,
    ...budgetToRange(params.budget),
    styles: styles.length ? styles : undefined,
    travels: params.travel === "1" ? true : undefined,
    featuredOnly: params.picks === "1" ? true : undefined,
    sort: params.sort,
    page: 1,
    limit: shown,
    fields,
  });

  const view = params.view === "grid" ? "grid" : "list";

  const activeCount =
    ["q", "category", "city", "budget", "style", "travel", "picks"].filter((k) => params[k]).length +
    fieldKeys.filter((k) => params[k]).length;

  // Determine H1 heading copy (React nodes so <em> works with MaskedHeading)
  let headingLines: React.ReactNode[];
  let lede: string;
  if (heading) {
    headingLines = heading;
    lede = intro ?? "Hand-picked photographers, planners, venues and more — with real work and open prices.";
  } else if (!activeCategorySlug) {
    headingLines = [
      <span key="headline">
        Find your <em>vendors</em>
      </span>,
    ];
    lede = "Hand-picked photographers, planners, venues and more — with real work and open prices.";
  } else {
    const catName = activeCategory?.name ?? activeCategorySlug;
    const allCitiesData = await listAllCities();
    const cityObj = allCitiesData.find((c) => c.slug === activeCitySlug);
    if (activeCitySlug && cityObj) {
      headingLines = [
        <span key="headline">
          {catName} in <em>{cityObj.name}</em>
        </span>,
      ];
      lede = `Based in or serving ${cityObj.name}.`;
    } else {
      headingLines = [
        <span key="headline">
          {catName} <em>across India</em>
        </span>,
      ];
      lede = activeCategory?.description ?? "Hand-picked vendors with real work and open prices.";
    }
  }

  // Category × city combo links
  let comboLinks: Awaited<ReturnType<typeof listCategoryCityPairs>> = [];
  let comboLabel = "";
  if (pinned.category && pinned.city) {
    comboLinks = (await listCategoryCityPairs()).filter(
      (p) => p.category === pinned.category && p.city !== pinned.city,
    );
    comboLabel = "The same category in other cities";
  } else if (!pinned.category && !pinned.city && Boolean(params.category) !== Boolean(params.city)) {
    comboLinks = (await listCategoryCityPairs()).filter((p) =>
      params.category ? p.category === params.category : p.city === params.city,
    );
    comboLabel = params.category ? "This category by city" : "This city by category";
  }

  // Breadcrumb city name (pinned category-in-city pages)
  const crumbCityName = activeCitySlug ? allCities.find((c) => c.slug === activeCitySlug)?.name : undefined;

  // Count line copy
  const locationTag = activeCitySlug
    ? cities.find((c) => c.slug === activeCitySlug)?.name ?? ""
    : null;

  return (
    <VendorsChrome>
      <main>
        {/* ---------------------------------------------------------------- hero (ivory, matches reference) */}
        <div className="bg-ivory">
          <Container className="pb-8 pt-10 md:pt-14 md:pb-10 xl:pt-16">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 font-sans text-[0.8125rem] text-mute">
                <li>
                  <Link href="/" className="transition-chrome hover:text-ink">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                {activeCategorySlug ? (
                  <>
                    <li>
                      <Link href="/vendors" className="transition-chrome hover:text-ink">
                        Vendors
                      </Link>
                    </li>
                    <li aria-hidden="true">/</li>
                    {pinned.city && crumbCityName ? (
                      <>
                        <li>
                          <Link
                            href={`/vendors?category=${activeCategorySlug}`}
                            className="transition-chrome hover:text-ink"
                          >
                            {activeCategory?.name ?? activeCategorySlug}
                          </Link>
                        </li>
                        <li aria-hidden="true">/</li>
                        <li aria-current="page" className="text-ink">
                          {crumbCityName}
                        </li>
                      </>
                    ) : (
                      <li aria-current="page" className="text-ink">
                        {activeCategory?.name ?? activeCategorySlug}
                      </li>
                    )}
                  </>
                ) : (
                  <li aria-current="page" className="text-ink">
                    Vendors
                  </li>
                )}
              </ol>
            </nav>

            <h1 className="max-w-3xl font-serif text-[clamp(2.75rem,5.2vw,4.75rem)] leading-[1.02] text-ink">
              {headingLines.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-5 max-w-[36em] text-[1.1875rem] leading-relaxed text-mute">{lede}</p>
          </Container>

          <div className="container-site pb-6">
            <SearchPill
              cities={allCities}
              categoryGroups={categoryGroups}
              city={activeCitySlug}
              category={activeCategorySlug}
              nameSearch
              q={params.q}
            />
          </div>
        </div>

        {/* ---------------------------------------------------------------- filter bar */}
        <VendorFilters
          pathname={pathname}
          params={params}
          total={result.total}
          activeCount={activeCount}
        />

        {/* ---------------------------------------------------------------- category × city combo links */}
        {comboLinks.length > 0 && (
          <Container className="pt-6 pb-2">
            <ul className="flex flex-wrap gap-x-6 gap-y-2" aria-label={comboLabel}>
              {comboLinks.map((pair) => (
                <li key={`${pair.category}-${pair.city}`}>
                  <Link
                    href={`/vendors/${pair.category}/${pair.city}`}
                    className="link-draw inline-flex tap items-center text-body text-mute transition-chrome hover:text-ink"
                  >
                    {params.category || pinned.category ? pair.cityName : pair.categoryName}
                    <span className="ml-2 text-small">({pair.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        )}

        {/* ---------------------------------------------------------------- category field filters */}
        {fieldDefs.length > 0 && (
          <Container className="pt-4 pb-2">
            <div className="flex flex-wrap gap-3">
              {fieldDefs.map((def) => {
                const value = params[def.key] ?? "";
                return (
                  <div key={def.key} className="flex flex-wrap items-center gap-2">
                    <span className="label text-mute">{def.label}:</span>
                    {(def.options ?? []).map((o) => (
                      <Link
                        key={o}
                        href={patchedHref(pathname, params, { [def.key]: value === o ? null : o, show: null })}
                        scroll={false}
                        className={`tap inline-flex items-center border px-3 py-1 text-small transition-chrome ${
                          value === o
                            ? "border-ink bg-ink text-ivory"
                            : "border-line text-mute hover:border-ink hover:text-ink"
                        }`}
                      >
                        {o}
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          </Container>
        )}

        {/* ---------------------------------------------------------------- results */}
        <div className="container-site py-10 md:py-14">
          {/* Count line */}
          {result.total > 0 && (
            <p className="mb-8 text-body text-mute" aria-live="polite">
              <span className="font-medium text-ink">
                {`${result.total} vendor${result.total === 1 ? "" : "s"}`}
              </span>
              {locationTag ? (
                <> in <em className="not-italic font-medium text-ink">{locationTag}</em></>
              ) : (
                <> across <em className="not-italic font-medium text-ink">India</em></>
              )}
              {params.q && (
                <> matching <em className="not-italic">&ldquo;{params.q}&rdquo;</em></>
              )}
            </p>
          )}

          {result.items.length === 0 ? (
            <EmptyState
              title="No vendors match yet"
              text="Try removing a filter…"
              action={{
                label: "Clear all filters",
                href: clearPathname ?? pathname,
              }}
            />
          ) : view === "grid" ? (
            /* ---- Grid view ---- */
            <ul className="grid grid-cols-2 gap-card-gap lg:grid-cols-3">
              {result.items.map((vendor, i) => (
                <li key={vendor.slug}>
                  <VendorTile
                    vendor={vendor}
                    sizes="(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 50vw"
                    priority={i < 3}
                  />
                </li>
              ))}
            </ul>
          ) : (
            /* ---- List view ---- */
            <ul className="flex flex-col divide-y divide-line">
              {result.items.map((vendor, i) => (
                <li key={vendor.slug} className="py-9 first:pt-0">
                  <VendorListCard vendor={vendor} index={i} priority={i < 3} />
                  {/* Editorial interrupter after item 3 (if ≥4 results) */}
                  {i === 2 && result.total >= 4 ? (
                    <div className="mt-10 border border-line bg-ivory px-8 py-10 text-center">
                      <p className="label text-gold-deep uppercase tracking-widest">Free planning help</p>
                      <p className="mt-3 font-serif text-h3 text-ink">
                        Not sure where to <em>start?</em>
                      </p>
                      <p className="mt-3 mx-auto max-w-xs text-body text-mute">
                        Tell us about your wedding and we&rsquo;ll put together a free shortlist just for you.
                      </p>
                      <Link
                        href="/#plan"
                        className="mt-6 inline-flex min-h-11 items-center justify-center border border-ink px-7 font-sans text-button font-medium tracking-button uppercase text-ink transition-chrome hover:bg-ink hover:text-ivory tap"
                      >
                        Get my free shortlist
                      </Link>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}

          {/* Demo overlay listings */}
          <DemoListings
            category={activeCategorySlug}
            city={activeCitySlug}
            excludeSlugs={result.items.map((v) => v.slug)}
          />

          {/* Show more */}
          {result.total > result.items.length && (
            <>
              <p className="mt-8 text-center text-small text-mute">
                Showing {result.items.length} of {result.total}
              </p>
              <div className="mt-4 text-center">
                <LoadMore
                  shown={result.items.length}
                  total={result.total}
                  moreHref={patchedHref(pathname, params, { show: String(shown + PAGE) })}
                  noun="vendors"
                />
              </div>
            </>
          )}
        </div>

        {/* ---------------------------------------------------------------- join band */}
        <JoinBand />
      </main>
    </VendorsChrome>
  );
}

/** Browser-local demo listings overlay. Gone with the backend. */
async function DemoListings({
  category,
  city,
  excludeSlugs,
}: {
  category?: string;
  city?: string;
  excludeSlugs: string[];
}) {
  const [allCategories, allCities] = await Promise.all([listAllCategories(), listAllCities()]);
  return (
    <DemoVendorCards
      excludeSlugs={excludeSlugs}
      category={category}
      city={city}
      categories={allCategories.map(({ slug, name }) => ({ slug, name }))}
      cities={allCities.map(({ slug, name }) => ({ slug, name }))}
    />
  );
}
