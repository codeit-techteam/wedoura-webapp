import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import { SaveButton } from "@/components/ui/SaveButton";
import type { VendorSummary } from "@/data/types";
import { formatPrice } from "@/lib/format";

type Props = {
  stay: VendorSummary;
  sizes?: string;
};

/**
 * A honeymoon hotel card (landing rail + stays directory). No ratings or
 * review figures: name, place, tagline and the open starting price only.
 */
export function StayCard({ stay, sizes = "(min-width: 64rem) 30vw, 82vw" }: Props) {
  const photo = stay.cardPhotos[0];
  const price = formatPrice(stay.startingPriceINR, stay.priceUnit);
  return (
    <article className="hcard">
      <div className="im zoom">
        {photo && (
          <Link href={`/honeymoon/stays/${stay.slug}`} aria-label={stay.name} className="absolute inset-0 block">
            <Photo photo={photo} mode="cover" sizes={sizes} />
          </Link>
        )}
        <span className="sv">
          <SaveButton slug={stay.slug} name={stay.name} tone="white" />
        </span>
      </div>
      <div className="t">
        <h3>
          <Link href={`/honeymoon/stays/${stay.slug}`}>{stay.name}</Link>
        </h3>
        <div className="ty cap">
          {stay.cityName}
          {stay.styles.length > 0 && ` · ${stay.styles[0]}`}
        </div>
        <p className="lv">{stay.tagline}</p>
        <div className="pr">
          <span>
            <b>{price}</b>
          </span>
          <Link href={`/honeymoon/stays/${stay.slug}`} className="lnk">
            View stay
          </Link>
        </div>
      </div>
    </article>
  );
}
