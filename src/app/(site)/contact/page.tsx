import type { Metadata } from "next";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { ContactForm } from "@/components/profile/AuthForms";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Contact",
  description: "Write to the Wedoura team. We read everything.",
};

export default function ContactPage() {
  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:gap-20">
          <div>
            <MaskedHeading as="h1" className="font-serif text-h1" lines={["Say hello."]} />
            <p className="mt-5 max-w-sm text-mute">
              Questions, corrections, a vendor we should meet, or anything the FAQ did not answer. We reply
              within two working days.
            </p>
          </div>
          <ContactForm />
        </div>
      </Container>
    </main>
  );
}
