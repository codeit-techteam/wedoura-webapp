import { Navbar } from "@/components/chrome/Navbar";
import { getCategories, getCities } from "@/lib/api";

/** Server wrapper: loads the categories and cities the navbar panels show. */
export async function SiteHeader() {
  const [categories, cities] = await Promise.all([getCategories(), getCities()]);
  return (
    <Navbar
      categories={categories.map(({ slug, name, shortName, cover }) => ({ slug, name, shortName, cover }))}
      cities={cities.map(({ slug, name }) => ({ slug, name }))}
    />
  );
}
