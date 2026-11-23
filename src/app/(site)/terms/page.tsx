import type { Metadata } from "next";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { Text } from "@/components/ui/Text";
import { SITE_EMAIL } from "@/lib/site-config";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Terms",
  description: "The terms for using Wedoura, for couples browsing and for vendors who list their work.",
  path: "/terms",
});

const LAST_UPDATED = "16 November 2026";

const sections = [
  {
    heading: "What Wedoura is",
    body: [
      "Wedoura is a showcase that introduces couples to wedding vendors. We publish vendors' work, their pricing and a way to reach them. Bookings, contracts and payments happen directly between you and the vendor; we are not a party to them, we take no commission from couples, and we cannot enforce either side's promises.",
    ],
  },
  {
    heading: "Using the site",
    body: [
      "Browse, save and share as much as you like. Do not scrape the site, republish vendors' photographs without their permission, misrepresent their work as your own, or use contact details for anything except planning a wedding. We may block access that ignores this.",
    ],
  },
  {
    heading: "Vendors' content",
    body: [
      "Vendors own their photographs, films and words, and confirm to us that the work they upload is theirs and that they have the couple's permission to show it. If something on the site is yours and should not be, write to us and we will take it down while we sort it out.",
    ],
  },
  {
    heading: "Prices and accuracy",
    body: [
      "Prices shown are starting points set by each vendor, not quotes; the price you agree with a vendor is the one that counts. We check listings before publishing them but cannot guarantee every detail stays current. Nothing on Wedoura is professional advice.",
    ],
  },
  {
    heading: "For vendors",
    body: [
      "A listing must describe a real business, use work that is genuinely yours, and keep its prices honest. We review listings before they go live and may unpublish a listing that breaks these rules or draws credible complaints. You can ask for your listing and account to be removed at any time.",
    ],
  },
  {
    heading: "Liability",
    body: [
      "We run the site with care but provide it as it is. To the extent the law allows, we are not liable for what happens between you and a vendor, for a vendor's work or conduct, or for losses from relying on listing content. Nothing in these terms removes rights that consumer law gives you.",
    ],
  },
  {
    heading: "Changes and contact",
    body: [
      `We may update these terms as the service grows; the date above always shows the current version. Questions go to ${SITE_EMAIL} or the contact page.`,
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <div className="mx-auto max-w-prose">
          <Label>Terms</Label>
          <MaskedHeading
            as="h1"
            className="mt-3.5 font-serif text-h1"
            lines={[
              <>
                The terms, <em>briefly</em>.
              </>,
            ]}
          />
          <Text tone="mute" className="mt-4">
            Last updated {LAST_UPDATED}.
          </Text>
          {sections.map((section) => (
            <section key={section.heading} className="mt-10">
              <h2 className="font-serif text-h3">{section.heading}</h2>
              {section.body.map((paragraph) => (
                <Text key={paragraph.slice(0, 24)} tone="mute" className="mt-3">
                  {paragraph}
                </Text>
              ))}
            </section>
          ))}
        </div>
      </Container>
    </main>
  );
}
