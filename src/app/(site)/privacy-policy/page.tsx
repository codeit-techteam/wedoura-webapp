import type { Metadata } from "next";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { Text } from "@/components/ui/Text";
import { SITE_EMAIL } from "@/lib/site-config";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Privacy Policy",
  description: "What Wedoura collects, what stays on your device, and what we never do with your data.",
  path: "/privacy-policy",
});

const LAST_UPDATED = "16 November 2026";

const sections = [
  {
    heading: "Who we are",
    body: [
      "Wedoura is a showcase that introduces couples to wedding vendors across India. This policy explains what information passes through the site, where it lives and who can see it. It applies to everything under this domain.",
    ],
  },
  {
    heading: "Browsing",
    body: [
      "You can read everything on Wedoura without an account and without telling us who you are. We do not run third-party advertising trackers and we do not build profiles of visitors.",
      "Our hosting provider keeps ordinary technical logs (IP address, pages requested, time of request) to run and secure the service; we use them only in aggregate, to see what is slow or broken.",
    ],
  },
  {
    heading: "What stays on your device",
    body: [
      "Your shortlist of saved vendors and stories is stored in your own browser's local storage. It never leaves your device and we cannot see it. Clearing your browser data clears it.",
    ],
  },
  {
    heading: "When you write to a vendor",
    body: [
      "An inquiry form asks for your name, a way to reach you, your date and city, and your message. That is passed to the one vendor you chose and kept so they can reply; it is not shown to other vendors and it is not sold or shared with anyone else.",
      "Write to us if you want an inquiry deleted, and we will delete our copy and ask the vendor to delete theirs.",
    ],
  },
  {
    heading: "Vendor accounts",
    body: [
      "Vendors who list their business give us their business details, contact information and work. The listing content is published exactly as the vendor approves it; the contact phone number is never shown publicly. Account email addresses are used to sign in and to talk about the listing, nothing else.",
    ],
  },
  {
    heading: "Photographs",
    body: [
      "Photographs and films belong to the vendors and photographers who made them. Where a photograph needs a credit, the credit is stored with it and shown with the work.",
    ],
  },
  {
    heading: "What we never do",
    body: [
      "We do not sell your details. We do not run third-party advertising. We do not show your inquiries to anyone except the vendor you wrote to. We do not publish statistics we do not have.",
    ],
  },
  {
    heading: "Questions and requests",
    body: [
      `Write to ${SITE_EMAIL} or use the contact page for anything in this policy: a copy of what we hold about you, a correction, or deletion. A person reads and answers everything.`,
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <div className="mx-auto max-w-prose">
          <Label>Privacy</Label>
          <MaskedHeading
            as="h1"
            className="mt-3.5 font-serif text-h1"
            lines={[
              <span key="headline">
                Privacy, <em>plainly</em>.
              </span>,
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
