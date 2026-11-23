import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import type { HoneymoonPackage } from "@/data/types";
import { formatINR } from "@/lib/format";

/** The lowest collection price, shown as "from" everywhere. */
export function packageFromPrice(pkg: HoneymoonPackage): number | undefined {
  const prices = pkg.collections
    .map((c) => c.pricePerCoupleINR)
    .filter((p): p is number => p !== undefined);
  return prices.length ? Math.min(...prices) : undefined;
}

type Props = {
  pkg: HoneymoonPackage;
  /** Shown over the title, e.g. the agency name. */
  byline?: string;
};

/** A package row (landing + packages directory): photo, facts, open price. */
export function PackageRow({ pkg, byline }: Props) {
  const href = `/honeymoon/packages/${pkg.slug}`;
  const from = packageFromPrice(pkg);
  return (
    <article className="pk">
      <Link href={href} className="im zoom" aria-label={pkg.name}>
        <Photo photo={pkg.cover} mode="cover" sizes="(min-width: 64rem) 24vw, 100vw" />
      </Link>
      <div className="pt">
        <span className="cap gold">
          {byline ? `${byline} · ` : ""}
          {pkg.destination} · {pkg.nights} nights
        </span>
        <h3>
          <Link href={href}>{pkg.name}</Link>
        </h3>
        <p>{pkg.summary}</p>
        {pkg.inclusions.length > 0 && (
          <div className="inc">
            {pkg.inclusions.slice(0, 4).map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        )}
      </div>
      <div className="pc">
        {from !== undefined && (
          <>
            <b>{formatINR(from)}</b>
            <span>from, per couple</span>
          </>
        )}
        <Link className="rq" href={`${href}#enquire`}>
          Request to book
        </Link>
      </div>
    </article>
  );
}
