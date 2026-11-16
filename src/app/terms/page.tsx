import type { Metadata } from "next";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Container } from "@/components/ui/Container";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Terms",
  description: "The terms for using Wedoura. Preview terms while the site is being built.",
};

const sections = [
  {
    heading: "What Wedoura is",
    body: "Wedoura is a showcase that introduces couples to wedding vendors. Bookings, contracts and payments happen directly between you and the vendor; we are not a party to them.",
  },
  {
    heading: "About the content",
    body: "Vendors own their photographs and films and confirm the work is theirs. Everything on this preview build is placeholder content and not an offer of any kind.",
  },
  {
    heading: "Fair use",
    body: "Browse, save and share as much as you like. Do not scrape the site, misrepresent vendors' work as your own, or use contact details for anything except planning a wedding.",
  },
  {
    heading: "Changes",
    body: "We will replace these preview terms with real ones, reviewed properly, before launch.",
  },
];

export default function TermsPage() {
  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <div className="mx-auto max-w-prose">
          <MaskedHeading as="h1" className="font-serif text-h1" lines={[<>The terms, briefly.</>]} />
          <Text tone="mute" className="mt-4">
            Preview terms while the site is being built; the real ones arrive before launch.
          </Text>
          {sections.map((section) => (
            <section key={section.heading} className="mt-10">
              <h2 className="font-serif text-h3">{section.heading}</h2>
              <Text tone="mute" className="mt-3">
                {section.body}
              </Text>
            </section>
          ))}
        </div>
      </Container>
    </main>
  );
}
