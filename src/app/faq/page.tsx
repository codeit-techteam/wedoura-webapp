import type { Metadata } from "next";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { getSiteFaq } from "@/lib/api";

export const metadata: Metadata = {
  title: "FAQs",
  description: "Questions couples ask us about finding, saving and contacting wedding vendors on Wedoura.",
};

export default async function FaqPage() {
  const faq = await getSiteFaq();
  return (
    <main className="pb-section">
      <Container className="pt-10 md:pt-16">
        <MaskedHeading as="h1" className="font-serif text-h1" lines={[<>Questions couples ask us.</>]} />
        <p className="mt-4 max-w-prose text-mute">
          Short answers. If yours is not here, write to us and a person will reply.
        </p>
      </Container>
      <Container className="mt-10 md:mt-14">
        <div className="max-w-prose">
          <Accordion items={faq} />
          <div className="mt-10">
            <Button href="/contact" variant="outline">
              Ask us something else
            </Button>
          </div>
        </div>
      </Container>
    </main>
  );
}
