import Link from "next/link";
import type { ReactNode } from "react";
import { VendorFilterChips, VendorFilters } from "@/components/browse/VendorFilters";
import { VendorsChrome } from "@/components/browse/VendorsChrome";
import { VendorsFindBar } from "@/components/browse/vendors/VendorsFindBar";
import { VendorsGridCard } from "@/components/browse/vendors/VendorsGridCard";
import { VendorsHelpCard } from "@/components/browse/vendors/VendorsHelpCard";
import { VendorsJoinBand } from "@/components/browse/vendors/VendorsJoinBand";
import { VendorsListEntry } from "@/components/browse/vendors/VendorsListEntry";
import { VendorsReveal } from "@/components/browse/vendors/VendorsReveal";
import { DemoVendorCards } from "@/components/profile/DemoVendorCards";
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
  pathname: string;
  params: ParamRecord;
  pinned?: { category?: string; city?: string };
  heading?: ReactNode[];
  intro?: string;
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

  let headingLines: React.ReactNode[];
  const lede =
    intro ??
    "Hand-picked photographers, planners, venues and more — with real work and open prices.";

  if (heading) {
    headingLines = heading;
  } else if (!activeCategorySlug) {
    headingLines = [
      <span key="headline">
        Find your <em>vendors</em>
      </span>,
    ];
  } else {
    const catName = activeCategory?.name ?? activeCategorySlug;
    const cityObj = allCities.find((c) => c.slug === activeCitySlug);
    if (activeCitySlug && cityObj) {
      headingLines = [
        <span key="headline">
          {catName} in <em>{cityObj.name}</em>
        </span>,
      ];
    } else {
      headingLines = [
        <span key="headline">
          {catName} <em>across India</em>
        </span>,
      ];
    }
  }

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

  const crumbCityName = activeCitySlug
    ? allCities.find((c) => c.slug === activeCitySlug)?.name
    : undefined;
  const locationTag = activeCitySlug
    ? (cities.find((c) => c.slug === activeCitySlug)?.name ?? crumbCityName ?? "")
    : null;

  const noun = activeCategory
    ? activeCategory.name.toLowerCase()
    : result.total === 1
      ? "vendor"
      : "vendors";
  const whereEm = locationTag ? `in ${locationTag}` : "across India";

  const clearHref = clearPathname ?? pathname;
  const progress = result.total > 0 ? Math.min(100, (result.items.length / result.total) * 100) : 0;

  return (
    <VendorsChrome>
      <main className="vendors-dir">
        <section className="vhead">
          <nav className="crumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">/</span>
            {activeCategorySlug ? (
              <>
                <Link href="/vendors">Vendors</Link>
                <span aria-hidden="true">/</span>
                {pinned.city && crumbCityName ? (
                  <>
                    <Link href={`/vendors?category=${activeCategorySlug}`}>
                      {activeCategory?.name ?? activeCategorySlug}
                    </Link>
                    <span aria-hidden="true">/</span>
                    <span aria-current="page">{crumbCityName}</span>
                  </>
                ) : (
                  <span aria-current="page">{activeCategory?.name ?? activeCategorySlug}</span>
                )}
              </>
            ) : (
              <span aria-current="page">Vendors</span>
            )}
          </nav>

          <h1>
            {headingLines.map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </h1>
          <p className="lead">{lede}</p>
        </section>

        <VendorsFindBar
          pathname="/vendors"
          params={{
            ...params,
            ...(activeCategorySlug ? { category: activeCategorySlug } : {}),
            ...(activeCitySlug ? { city: activeCitySlug } : {}),
          }}
          cities={allCities.map((c) => ({ slug: c.slug, name: c.name }))}
          categoryGroups={categoryGroups.map((g) => ({
            group: g.group,
            categories: g.categories.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon })),
          }))}
          categories={categories}
          city={activeCitySlug}
          category={activeCategorySlug}
          q={params.q}
        />

        <div className="vbody">
          <VendorFilters
            pathname={pathname}
            categoryPathname="/vendors"
            params={{
              ...params,
              ...(activeCategorySlug ? { category: activeCategorySlug } : {}),
              ...(activeCitySlug ? { city: activeCitySlug } : {}),
            }}
            total={result.total}
            activeCount={activeCount}
            categories={categories.map((c) => ({ slug: c.slug, name: c.name, count: c.count }))}
            pinnedCategory={pinned.category}
          />

          {comboLinks.length > 0 ? (
            <ul className="flex flex-wrap gap-x-6 gap-y-2 px-[var(--vd-side)] pt-6" aria-label={comboLabel}>
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
          ) : null}

          {fieldDefs.length > 0 ? (
            <div className="flex flex-wrap gap-3 px-[var(--vd-side)] pt-4">
              {fieldDefs.map((def) => {
                const value = params[def.key] ?? "";
                return (
                  <div key={def.key} className="flex flex-wrap items-center gap-2">
                    <span className="label text-mute">{def.label}:</span>
                    {(def.options ?? []).map((o) => (
                      <Link
                        key={o}
                        href={patchedHref(pathname, params, {
                          [def.key]: value === o ? null : o,
                          show: null,
                        })}
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
          ) : null}

          <div className="main">
            <div className="cline">
              {result.total > 0 ? (
                <p className="cnt" aria-live="polite">
                  {result.total} {noun} <em>{whereEm}</em>
                </p>
              ) : null}
              <VendorFilterChips
                pathname="/vendors"
                params={{
                  ...params,
                  ...(activeCategorySlug ? { category: activeCategorySlug } : {}),
                  ...(activeCitySlug ? { city: activeCitySlug } : {}),
                }}
                cityName={locationTag ?? undefined}
                categoryName={activeCategory?.name}
                pinnedCategory={pinned.category}
              />
            </div>

            <VendorsReveal className={view === "grid" ? "res grid" : "res"}>
              {result.items.length === 0 ? (
                <div className="none">
                  <h3>
                    No vendors match <em>yet</em>
                  </h3>
                  <p>
                    Try removing a filter, or ask our planners — we know more vendors than we list.
                  </p>
                  <Link href={clearHref} className="btn">
                    Clear all filters
                  </Link>
                </div>
              ) : view === "grid" ? (
                <>
                  {result.items.flatMap((vendor, i) => {
                    const card = (
                      <VendorsGridCard
                        key={vendor.slug}
                        vendor={vendor}
                        index={i}
                        priority={i < 3}
                      />
                    );
                    if (i === 2 && result.total >= 4) {
                      return [card, <VendorsHelpCard key="help" />];
                    }
                    return [card];
                  })}
                </>
              ) : (
                <>
                  {result.items.flatMap((vendor, i) => {
                    const card = (
                      <VendorsListEntry
                        key={vendor.slug}
                        vendor={vendor}
                        index={i}
                        priority={i < 3}
                      />
                    );
                    if (i === 2 && result.total >= 4) {
                      return [card, <VendorsHelpCard key="help" />];
                    }
                    return [card];
                  })}
                </>
              )}
            </VendorsReveal>

            <DemoListings
              category={activeCategorySlug}
              city={activeCitySlug}
              excludeSlugs={result.items.map((v) => v.slug)}
            />

            {result.total > result.items.length ? (
              <div className="morew">
                <div className="bar2">
                  <i style={{ width: `${progress}%` }} />
                </div>
                <p>
                  Showing {result.items.length} of {result.total}
                </p>
                <Link
                  href={patchedHref(pathname, params, { show: String(shown + PAGE) })}
                  scroll={false}
                  className="btn ghostb"
                >
                  Show more vendors
                </Link>
              </div>
            ) : null}
          </div>
        </div>

        <VendorsJoinBand />
      </main>
    </VendorsChrome>
  );
}

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
