import { Label } from "@/components/ui/Label";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Reveal } from "@/components/motion/Reveal";
import type { Testimonial } from "@/data/types";

type Props = {
  testimonials: Testimonial[];
  press?: string[];
};

/**
 * Kind words: vendor-entered couple testimonials ("Kind words", never
 * "verified reviews") plus publication names. Neither section is shown
 * when empty.
 */
export function KindWords({ testimonials, press }: Props) {
  const hasPress = press && press.length > 0;
  if (testimonials.length === 0 && !hasPress) return null;

  return (
    <section id="kind-words" aria-label="Kind words" className="scroll-profile-anchor border-t border-line py-section-sm">
      <Label className="mb-4">Kind words</Label>
      <MaskedHeading as="h2" className="font-serif text-h2" lines={["What couples say"]} />

      {testimonials.length > 0 && (
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={i} delay={i * 0.08} as="figure" className="flex flex-col border border-line bg-white p-6 md:p-8">
              <blockquote className="flex-1 font-serif text-lead italic leading-relaxed text-ink before:content-['\u201C'] after:content-['\u201D']">
                {t.quote}
              </blockquote>
              <figcaption className="mt-5 border-t border-line pt-4">
                <p className="label text-ink">{t.couple}</p>
                {t.location && <p className="mt-0.5 text-small text-mute">{t.location}</p>}
              </figcaption>
            </Reveal>
          ))}
        </div>
      )}

      {hasPress && (
        <div className="mt-10 border-t border-line pt-8">
          <Label className="mb-4 text-mute">As seen in</Label>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {press!.map((name) => (
              <li key={name} className="font-serif text-lead italic text-mute">
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
