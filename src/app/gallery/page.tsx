import type { Metadata } from "next";
import { Suspense } from "react";
import { GalleryWall, type WallItem } from "@/components/browse/GalleryWall";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Container } from "@/components/ui/Container";
import { getCategories, getGalleryItems } from "@/lib/api";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photographs from weddings across India, each linked to the people who made it.",
};

export default async function GalleryPage() {
  const [items, categories] = await Promise.all([getGalleryItems(), getCategories()]);

  const wall: WallItem[] = items.map((item) => ({
    photo: item.photo,
    category: item.category,
    link: item.vendor ? { href: `/vendors/${item.vendor.slug}`, label: `By ${item.vendor.name}` } : undefined,
  }));
  const usedCategories = new Set(wall.map((w) => w.category).filter(Boolean));

  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={[<>The wall.</>]} />
        <p className="mt-4 max-w-prose text-mute">
          Every photograph on Wedoura, whole and uncropped. Tap one to see it full screen and meet the vendor
          behind it.
        </p>
      </Container>
      <Container width="wide" className="mt-10">
        <Suspense fallback={null}>
          <GalleryWall
            items={wall}
            categories={categories
              .filter((c) => usedCategories.has(c.slug))
              .map((c) => ({ value: c.slug, label: c.shortName }))}
          />
        </Suspense>
      </Container>
    </main>
  );
}
