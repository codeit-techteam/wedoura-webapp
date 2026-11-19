import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import type { Partner } from "@/data/types";

/**
 * A quiet editorial band for one brand partnership, directly after the hero.
 * Small gold label, the brand as logo or serif wordmark, one large image and
 * one line. The homepage hides it when listPartners("home") is empty.
 */
export function PartnerBand({ partner }: { partner: Partner }) {
  const body = (
    <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16 xl:gap-24">
      <Reveal>
        <Label as="p" tone="gold">
          In partnership with
        </Label>
        {partner.logo ? (
          <span className="mt-6 block w-44 md:w-52">
            <Photo photo={partner.logo} sizes="208px" />
          </span>
        ) : (
          <p className="mt-6 font-serif text-h2 text-ink">{partner.name}</p>
        )}
        <p className="mt-5 max-w-prose font-serif text-h3 text-ink">{partner.headline}</p>
        <p className="mt-3 max-w-prose text-body text-mute">{partner.line}</p>
      </Reveal>
      <Reveal delay={0.1}>
        <div className="relative aspect-4/3 overflow-hidden bg-white">
          <Photo photo={partner.image} mode="cover" sizes="(min-width: 48rem) 50vw, 100vw" />
        </div>
      </Reveal>
    </div>
  );

  return (
    <aside aria-label={`In partnership with ${partner.name}`} className="border-b border-line bg-ivory">
      <Container className="py-section-sm">
        {partner.href ? (
          <Link href={partner.href} className="block" target="_blank" rel="noopener">
            {body}
          </Link>
        ) : (
          body
        )}
      </Container>
    </aside>
  );
}
