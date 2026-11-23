import { Container } from "@/components/ui/Container";
import { formatPrice } from "@/lib/format";
import type { PriceUnit } from "@/data/types";

type Props = {
  yearsActive?: number;
  startingPriceINR?: number;
  priceUnit: PriceUnit;
  travels?: string;
  team?: string;
  verified: boolean;
};

/** At-a-glance trust strip under the cover. No ratings or review counts. */
export function ProfileGlance({ yearsActive, startingPriceINR, priceUnit, travels, team, verified }: Props) {
  const items: { value: string; label: string }[] = [];

  if (yearsActive) {
    items.push({ value: `${yearsActive} years`, label: "Experience" });
  }

  const priceStr = formatPrice(startingPriceINR, priceUnit);
  if (priceStr) {
    items.push({ value: priceStr, label: "Starting investment" });
  }

  if (travels) {
    items.push({ value: travels, label: "Travels to" });
  } else if (team) {
    items.push({ value: team, label: "The team" });
  }

  if (verified) {
    items.push({ value: "Wedoura Verified", label: "Identity and work checked" });
  }

  if (items.length === 0) return null;

  return (
    <section aria-label="At a glance" className="border-b border-line bg-white">
      <Container>
        <dl className="no-scrollbar -mx-gutter flex flex-nowrap items-stretch overflow-x-auto px-gutter md:mx-0 md:justify-between md:overflow-visible md:px-0">
          {items.map((item) => (
            <div
              key={item.label}
              className="min-w-[9rem] shrink-0 border-l border-line py-5 pr-6 pl-6 first:border-l-0 first:pl-0 md:min-w-0 md:flex-1 md:px-6 md:first:pl-0 lg:px-8"
            >
              <dd className="font-serif text-lead leading-tight md:text-h3">{item.value}</dd>
              <dt className="label mt-1.5 text-mute">{item.label}</dt>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
