import type { Metadata } from "next";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { ContactForm } from "@/components/profile/AuthForms";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { SITE_EMAIL, absoluteUrl } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description: "Write to the Wedoura team. We read everything.",
  alternates: { canonical: absoluteUrl("/contact") },
};

export default function ContactPage() {
  return (
    <main className="pb-section-sm">
      <Container className="pt-10 md:pt-16">
        <div className="grid gap-12 md:grid-cols-[1fr_1.2fr] md:gap-20">
          <div>
            <Label>Contact</Label>
            <MaskedHeading
              as="h1"
              className="mt-3.5 font-serif text-h1"
              lines={[
                <>
                  Say <em>hello</em>.
                </>,
              ]}
            />
            <p className="mt-5 max-w-sm text-mute">
              Questions, corrections, a vendor we should meet, or anything the FAQ did not answer. We reply
              within two working days.
            </p>
            <div className="mt-10 border-t border-line pt-6">
              <Label>Email</Label>
              <p className="mt-2">
                <a href={`mailto:${SITE_EMAIL}`} className="link-draw text-body text-ink">
                  {SITE_EMAIL}
                </a>
              </p>
            </div>
          </div>
          <ContactForm />
        </div>
      </Container>
    </main>
  );
}
