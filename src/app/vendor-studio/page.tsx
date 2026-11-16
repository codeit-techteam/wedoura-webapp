import type { Metadata } from "next";
import { Suspense } from "react";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { StudioScreens } from "@/components/profile/StudioScreens";
import { Container } from "@/components/ui/Container";
import { getCategories, getCities, getVendors } from "@/lib/api";

export const metadata: Metadata = {
  title: "Vendor Studio",
  description: "Where vendors will manage their profile, portfolio, pricing and inquiries.",
};

export default async function VendorStudioPage() {
  const [vendors, categories, cities] = await Promise.all([getVendors(), getCategories(), getCities()]);
  const vendor = vendors.find((v) => v.featured) ?? vendors[0];
  const cityName = cities.find((c) => c.slug === vendor.city)?.name ?? vendor.city;
  const categoryName = categories.find((c) => c.slug === vendor.category)?.name ?? vendor.category;

  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={[<>Vendor Studio.</>]} />
        <p className="mt-4 max-w-prose text-mute">
          Screens only until the backend arrives, shown with {vendor.name}&apos;s profile.
        </p>
      </Container>
      <Container className="mt-10">
        <Suspense fallback={null}>
          <StudioScreens vendor={vendor} cityName={cityName} categoryName={categoryName} />
        </Suspense>
      </Container>
    </main>
  );
}
