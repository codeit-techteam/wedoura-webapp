import type { Metadata } from "next";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { absoluteUrl } from "@/lib/site-config";
import { WaitlistForm } from "./WaitlistForm";

export const metadata: Metadata = {
  title: "Soulmates",
  description:
    "A quieter way to meet someone serious about marriage. Soulmates is opening soon — join the waiting list with just a name and an email.",
  alternates: { canonical: absoluteUrl("/soulmates") },
};

const PRINCIPLES = [
  {
    title: "Introductions, not profiles",
    text: "No endless browsing and no public gallery of faces. When Soulmates opens, it makes a few considered introductions and leaves the rest to you.",
  },
  {
    title: "Private by design",
    text: "Nothing about you is published. You decide what to share, with whom, and when — and you can leave at any time.",
  },
  {
    title: "No forms about your worth",
    text: "We will never ask for a date of birth, an income figure or an identity document to put you on this list. A name and an email are enough.",
  },
];

export default function SoulmatesPage() {
  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <Label>Wedoura Soulmates</Label>
        <MaskedHeading
          as="h1"
          className="mt-3.5 max-w-3xl font-serif text-[clamp(2.75rem,5.2vw,4.75rem)] leading-[1.02] text-ink"
          lines={[
            <>
              A quieter way to <em>meet</em>
            </>,
          ]}
        />
        <p className="mt-5 max-w-[36em] text-[1.1875rem] leading-relaxed text-mute">
          Soulmates is where Wedoura begins before the wedding: thoughtful introductions for people who are
          serious about marriage. It is not open yet — leave your name and we will write to you the day it is.
        </p>
      </Container>

      <Container className="mt-12 md:mt-16">
        <div className="grid gap-12 md:grid-cols-[1.2fr_1fr] md:gap-20">
          <ul className="border-t border-line">
            {PRINCIPLES.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 0.08} className="border-b border-line py-6">
                <h2 className="font-serif text-h3 text-ink">{p.title}</h2>
                <p className="mt-2 max-w-prose text-body text-mute">{p.text}</p>
              </Reveal>
            ))}
          </ul>
          <div>
            <Label>The waiting list</Label>
            <h2 className="mt-3.5 font-serif text-h3 text-ink">
              Be there when it <em>opens</em>
            </h2>
            <div className="mt-6">
              <WaitlistForm />
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
