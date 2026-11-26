import { Navbar } from "@/components/chrome/Navbar";
import { listCategoriesWithCounts, listCitiesWithCounts } from "@/lib/api";

/** Server wrapper: loads what the navbar panels and search suggest from.
 *  Everything here is published-vendors-only (enforced in the api). Vendor
 *  search suggestions come from /api/search as the visitor types, so the
 *  page payload stays the same at any vendor count. */
export async function SiteHeader() {
  const [categories, cities] = await Promise.all([listCategoriesWithCounts(), listCitiesWithCounts()]);
  return (
    <Navbar
      categories={categories.map(({ slug, name, shortName, cover }) => ({ slug, name, shortName, cover }))}
      cities={cities.map(({ slug, name }) => ({ slug, name }))}
    />
  );
}
