import type { Metadata } from "next";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Container } from "@/components/ui/Container";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Wedoura handles your data. Preview policy while the site is being built.",
};

const sections = [
  {
    heading: "What we collect",
    body: "Today, nothing: every form on this site is a screen and sends no data anywhere. When inquiries go live, we will collect only what you type into them: your name, contact details and message, passed to the vendor you chose.",
  },
  {
    heading: "What stays on your device",
    body: "Your shortlist is stored in your own browser's local storage and never leaves your device. Clearing your browser data clears it.",
  },
  {
    heading: "What we never do",
    body: "We do not sell your details, run third-party advertising trackers, or show your inquiries to anyone except the vendor you wrote to.",
  },
  {
    heading: "Questions",
    body: "Write to us from the contact page and a person will answer.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <div className="mx-auto max-w-prose">
          <MaskedHeading as="h1" className="font-serif text-h1" lines={[<>Privacy, plainly.</>]} />
          <Text tone="mute" className="mt-4">
            Preview policy while the site is being built; the real one arrives with the backend.
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
