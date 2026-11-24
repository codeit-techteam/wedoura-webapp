import { HomeCategories } from "@/components/home/HomeCategories";
import { HomeCities } from "@/components/home/HomeCities";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeHow } from "@/components/home/HomeHow";
import { HomeJournal } from "@/components/home/HomeJournal";
import { HomeMoments } from "@/components/home/HomeMoments";
import { HomePlan } from "@/components/home/HomePlan";
import { HomeStatement } from "@/components/home/HomeStatement";
import { HomeVendors } from "@/components/home/HomeVendors";
import { HomeWeddings } from "@/components/home/HomeWeddings";
import { HomeWorlds } from "@/components/home/HomeWorlds";
import { PartnerBand } from "@/components/home/PartnerBand";
import { JoinBand } from "@/components/ui/JoinBand";
import {
  listAllCities,
  listArticles,
  listCategoriesWithCounts,
  listCategoryGroups,
  listCitiesWithCounts,
  listFeatured,
  listPartners,
  listWeddings,
} from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  ...pageMeta({
    title: "Luxury wedding vendors, venues and honeymoons in India",
    description:
      "Hand-picked photographers, venues, planners, makeup artists and more across India. Prices shown openly. Connect directly with the vendors you love.",
    path: "/",
  }),
  title: { absolute: "Wedoura · Luxury wedding vendors, venues and honeymoons in India" },
};

export default async function HomePage() {
  const [categoryGroups, cities, citiesWithCounts, featured, weddingsPage, articlesPage, partners, categoriesWithCounts] =
    await Promise.all([
      listCategoryGroups(),
      listAllCities(),
      listCitiesWithCounts(),
      listFeatured(undefined, 8),
      listWeddings({ page: 1, limit: 2 }),
      listArticles({ limit: 3 }),
      listPartners("home"),
      listCategoriesWithCounts(),
    ]);

  const weddings = weddingsPage.items;
  const articles = articlesPage.items;
  const partner = partners[0];

  // Category groups shaped for SearchPill
  const searchGroups = categoryGroups.map((g) => ({
    group: g.group,
    categories: g.categories.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon })),
  }));

  // City options shaped for SearchPill
  const cityOptions = cities.map((c) => ({ slug: c.slug, name: c.name }));

  // Tabs for the vendor section: categories that have featured vendors
  const featuredCatSlugs = new Set(featured.map((v) => v.category));
  const vendorTabs = categoriesWithCounts
    .filter((c) => featuredCatSlugs.has(c.slug))
    .map((c) => ({ slug: c.slug, label: c.shortName }));

  return (
    <main>
      {/* 1 · Hero */}
      <HomeHero cities={cityOptions} categoryGroups={searchGroups} />

      {/* 2 · Partner band (hidden when no active partner) */}
      {partner && <PartnerBand partner={partner} />}

      {/* 3 · Category tiles */}
      <HomeCategories />

      {/* 4 · Video moments */}
      <HomeMoments />

      {/* 5 · Statement */}
      <HomeStatement />

      {/* 6 · How it works */}
      <HomeHow />

      {/* 7 · Real weddings (hidden when empty) */}
      <HomeWeddings weddings={weddings} />

      {/* 8 · Featured vendors */}
      <HomeVendors vendors={featured} tabs={vendorTabs} />

      {/* 9 · Planning help form */}
      <HomePlan />

      {/* 10 · Three worlds */}
      <HomeWorlds />

      {/* 11 · Journal */}
      <HomeJournal articles={articles} />

      {/* 12 · Join band */}
      <JoinBand />

      {/* 13 · City pills */}
      <HomeCities cities={citiesWithCounts} />
    </main>
  );
}
