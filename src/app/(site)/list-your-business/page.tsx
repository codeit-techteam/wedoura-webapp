import type { Metadata } from "next";
import { VendorSignupForm } from "@/components/profile/VendorSignupForm";
import { listAllCategories, listAllCities, listFeatured } from "@/lib/api";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "List Your Business",
  description: "Show your work to couples who are looking. A Wedoura profile is your portfolio, pricing and a direct line.",
  path: "/list-your-business",
});

export default async function ListYourBusinessPage() {
  const [categories, cities, featured] = await Promise.all([
    listAllCategories(),
    listAllCities(),
    listFeatured(undefined, 1),
  ]);
  const example = featured[0];
  const previewImage = example?.cardPhotos[0]?.src;

  return (
    <main className="pb-section-sm">
      <VendorSignupForm
        categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
        cities={cities.map((c) => ({ value: c.slug, label: c.name }))}
        previewImage={previewImage}
      />
    </main>
  );
}
