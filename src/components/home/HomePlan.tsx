import Image from "next/image";
import { PlanningHelpForm } from "@/components/home/PlanningHelpForm";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";

export function HomePlan() {
  return (
    <section aria-label="Get a personalised shortlist" className="py-section bg-white">
      <Container>
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
          {/* Left: image */}
          <div className="relative order-2 aspect-4/5 overflow-hidden bg-ivory lg:order-1">
            <Image
              src="/ref/home/image-22.webp"
              alt="A couple at their wedding"
              fill
              className="object-cover"
              sizes="(min-width: 64rem) 50vw, 100vw"
              unoptimized
            />
          </div>

          {/* Right: form */}
          <div className="order-1 lg:order-2">
            <Label>Free planning help</Label>
            <h2 className="mt-3.5 font-serif text-[clamp(2.375rem,4.2vw,3.875rem)] leading-[1.04] text-ink">
              Tell us about your wedding, we’ll <em>shortlist</em> for you
            </h2>
            <p className="mt-4 mb-8 max-w-[32em] text-body text-mute">
              Share your date, city and budget, and our planning team will send you vendors that fit, within a
              day.
            </p>
            <PlanningHelpForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
