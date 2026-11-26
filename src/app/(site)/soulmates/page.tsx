import type { Metadata } from "next";
import Link from "next/link";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Soulmates",
  description:
    "A quieter way to meet someone serious about marriage. Create a profile, verify by hand, and receive a few thoughtful introductions each week.",
  path: "/soulmates",
});

const STEPS = [
  {
    n: "1",
    title: "A short call",
    text: "Someone from our team will call within a day to say hello and verify ID.",
  },
  {
    n: "2",
    title: "Your profile goes live",
    text: "Once verified, your profile appears with a ✓ badge, photos still private.",
  },
  {
    n: "3",
    title: "First introductions",
    text: "Each week we’ll suggest a few people who fit what you shared.",
  },
];

const PRIVATE = [
  {
    title: "First name and last initial only",
    text: "Other members never see your full surname until you choose to share more.",
  },
  {
    title: "Photos after mutual interest",
    text: "By default, members see your initial until you both say yes. You can also share photos with verified members only.",
  },
  {
    title: "Number, organisation and income stay private",
    text: "Our team sees them for verification. Members never do — contact opens only after mutual interest.",
  },
  {
    title: "Pause, hide or delete anytime",
    text: "You stay in control of whether your profile is visible, paused or gone.",
  },
];

const FAQS = [
  {
    q: "Who can join?",
    a: "Adults serious about marriage. You can create a profile for yourself, or a parent or sibling can create one with your knowledge and agreement.",
  },
  {
    q: "How does verification work?",
    a: "You upload an identity document (masked Aadhaar by default, or PAN, voter ID, passport or driving licence) and a mobile number for our team. We review by hand and call before your profile goes live.",
  },
  {
    q: "What is shared, and when?",
    a: "Other members see first name, last initial, city, profession and a short about. Photos follow your privacy choice. Phone numbers open only after both people say yes.",
  },
  {
    q: "What does it cost?",
    a: "Soulmates is free while in early access.",
  },
];

export default function SoulmatesPage() {
  return (
    <main className="bg-ivory pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <Label>Wedoura Soulmates</Label>
        <MaskedHeading
          as="h1"
          className="mt-3.5 max-w-3xl font-serif text-[clamp(2.75rem,5.2vw,4.75rem)] leading-[1.02] text-ink"
          lines={[
            <span key="headline">
              A quieter way to <em>meet</em>
            </span>,
          ]}
        />
        <p className="mt-5 max-w-[36em] text-[1.1875rem] leading-relaxed text-mute">
          Thoughtful introductions for people serious about marriage. No public gallery, no browsing —
          a few considered suggestions each week, after we verify your profile by hand.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/soulmates/create"
            className="inline-flex min-h-12 items-center justify-center border border-ink bg-ink px-8 font-sans text-[12.5px] font-medium tracking-[0.28em] text-ivory uppercase transition-colors hover:border-gold-deep hover:bg-gold-deep"
          >
            Create a profile
          </Link>
          <Link
            href="/login?next=/soulmates/me"
            className="inline-flex min-h-12 items-center justify-center border border-ink bg-transparent px-8 font-sans text-[12.5px] font-medium tracking-[0.28em] text-ink uppercase transition-colors hover:bg-ink hover:text-ivory"
          >
            Sign in
          </Link>
        </div>
      </Container>

      <Container className="mt-16 md:mt-24">
        <Label>How it works</Label>
        <h2 className="mt-3.5 max-w-2xl font-serif text-h2 text-ink">
          From a quiet application to a few careful <em>introductions</em>
        </h2>
        <ol className="mt-12 grid gap-10 border-t border-ink md:grid-cols-3 md:gap-12">
          {STEPS.map((step, i) => (
            <Reveal as="li" key={step.n} delay={i * 0.08} className="pt-7">
              <span className="font-serif text-[3.5rem] leading-none text-gold">{step.n}</span>
              <h3 className="mt-3.5 font-serif text-h3 text-ink">{step.title}</h3>
              <p className="mt-2 text-body text-mute">{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </Container>

      <section className="mt-16 bg-sand py-section-sm md:mt-24">
        <Container>
          <Label>Private by design</Label>
          <h2 className="mt-3.5 max-w-2xl font-serif text-h2 text-ink">
            What others see — and what they <em>never</em> see
          </h2>
          <ul className="mt-10 grid gap-0 border-t border-line md:grid-cols-2">
            {PRIVATE.map((item, i) => (
              <Reveal
                as="li"
                key={item.title}
                delay={i * 0.06}
                className="border-b border-line py-6 md:odd:border-r md:odd:pr-10 md:even:pl-10"
              >
                <h3 className="font-serif text-h3 text-ink">{item.title}</h3>
                <p className="mt-2 max-w-prose text-body text-mute">{item.text}</p>
              </Reveal>
            ))}
          </ul>
        </Container>
      </section>

      <Container className="mt-16 md:mt-24">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-16">
          <div>
            <Label>Created by family</Label>
            <h2 className="mt-3.5 font-serif text-h2 text-ink">
              Parents or siblings can start a <em>profile</em>
            </h2>
            <p className="mt-5 max-w-prose text-body text-mute">
              Many profiles begin with a parent or sibling. The person the profile is for must know
              about it and agree — we ask for that confirmation before you continue.
            </p>
          </div>
          <div className="border border-line bg-white p-7 md:p-9">
            <p className="font-sans text-[11.5px] font-medium tracking-[0.26em] text-gold-deep uppercase">
              Consent
            </p>
            <p className="mt-3 font-serif text-[1.35rem] leading-snug text-ink">
              “The person this profile is for knows about it and agrees.”
            </p>
            <p className="mt-4 text-body text-mute">
              Without that checkbox, a profile created for someone else cannot be submitted.
            </p>
          </div>
        </div>
      </Container>

      <Container className="mt-16 md:mt-24">
        <Label>Questions</Label>
        <h2 className="mt-3.5 font-serif text-h2 text-ink">
          A few things people <em>ask</em>
        </h2>
        <ul className="mt-10 border-t border-line">
          {FAQS.map((faq, i) => (
            <Reveal as="li" key={faq.q} delay={i * 0.05} className="border-b border-line py-6">
              <h3 className="font-serif text-h3 text-ink">{faq.q}</h3>
              <p className="mt-2 max-w-prose text-body text-mute">{faq.a}</p>
            </Reveal>
          ))}
        </ul>
      </Container>

      <Container className="mt-16 md:mt-24">
        <div className="border border-line bg-white px-6 py-12 text-center md:px-12 md:py-16">
          <Label>Begin</Label>
          <h2 className="mx-auto mt-3.5 max-w-xl font-serif text-h2 text-ink">
            Ready for a quieter way to <em>meet</em>?
          </h2>
          <p className="mx-auto mt-4 max-w-[32em] text-body text-mute">
            Create a profile in a few calm steps. Nothing is visible to other members until our team
            has verified it.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/soulmates/create"
              className="inline-flex min-h-12 items-center justify-center border border-ink bg-ink px-8 font-sans text-[12.5px] font-medium tracking-[0.28em] text-ivory uppercase transition-colors hover:border-gold-deep hover:bg-gold-deep"
            >
              Create a profile
            </Link>
            <Link
              href="/login?next=/soulmates/me"
              className="inline-flex min-h-12 items-center justify-center border-b border-gold pb-1 font-sans text-[12px] font-medium tracking-[0.26em] text-ink uppercase"
            >
              Sign in
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
