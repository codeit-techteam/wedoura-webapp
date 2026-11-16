import { Navbar } from "@/components/chrome/Navbar";
import { getCategories, getCities, getSearchIndex } from "@/lib/api";

/** Server wrapper: loads what the navbar panels and search suggest from. */
export async function SiteHeader() {
  const [categories, cities, index] = await Promise.all([getCategories(), getCities(), getSearchIndex()]);
  return (
    <Navbar
      categories={categories.map(({ slug, name, shortName, cover }) => ({ slug, name, shortName, cover }))}
      cities={cities.map(({ slug, name }) => ({ slug, name }))}
      vendors={index.vendors.map(({ slug, name, citySlug }) => ({ slug, name, citySlug }))}
    />
  );
}
