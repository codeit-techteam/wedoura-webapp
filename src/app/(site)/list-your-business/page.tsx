import type { Metadata } from "next";
import { VendorCard } from "@/components/cards/VendorCard";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Reveal } from "@/components/motion/Reveal";
import { VendorSignupForm } from "@/components/profile/VendorSignupForm";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { getPromises, listAllCategories, listAllCities, listFeatured } from "@/lib/api";

export const metadata: Metadata = {
  title: "List Your Business",
  description: "Show your work to couples who are looking. A Wedoura profile is your portfolio, pricing and a direct line.",
};

export default async function ListYourBusinessPage() {
  const [categories, cities, promises, featured] = await Promise.all([
    listAllCategories(),
    listAllCities(),
    getPromises(),
    listFeatured(undefined, 1),
  ]);
  const example = featured[0];

  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <MaskedHeading
          as="h1"
          className="font-serif text-h1"
          lines={["You do beautiful work.", "Let couples see it."]}
        />
        <p className="mt-4 max-w-prose text-mute">
          A profile on Wedoura is your portfolio, your pricing and a direct line to couples planning weddings
          across India.
        </p>
      </Container>

      <Container className="mt-14">
        <div className="grid items-center gap-12 md:grid-cols-[1fr_1.4fr] md:gap-20">
          {example && (
            <Reveal>
              <div className="max-w-sm">
                <VendorCard vendor={example} sizes="(min-width: 48rem) 30vw, 90vw" />
                <p className="mt-3 text-small text-mute">This is how your profile appears to couples.</p>
              </div>
            </Reveal>
          )}
          <ul>
            {promises.map((promise, i) => (
              <Reveal as="li" key={promise.title} delay={i * 0.08} className="border-t border-line py-6 last:border-b">
                <p className="font-serif text-h3">{promise.title}</p>
                <p className="mt-2 max-w-md text-mute">{promise.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </Container>

      <section className="mt-16 bg-ivory py-section-sm" aria-label="Create your profile">
        <Container>
          <Label>Create your profile</Label>
          <MaskedHeading as="h2" className="mt-3 font-serif text-h2" lines={["One short form."]} />
          <p className="mt-4 max-w-prose text-mute">
            We review every application by hand, then you build your profile in the studio.
          </p>
          <div className="mt-8 max-w-3xl">
            <VendorSignupForm
              categories={categories.map((c) => ({ value: c.slug, label: c.name }))}
              cities={cities.map((c) => ({ value: c.slug, label: c.name }))}
            />
          </div>
        </Container>
      </section>
    </main>
  );
}
