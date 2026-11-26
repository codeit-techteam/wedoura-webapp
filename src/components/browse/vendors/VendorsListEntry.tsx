"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EnquireButton } from "@/components/browse/EnquireButton";
import { VendorsHeartButton } from "@/components/browse/vendors/VendorsHeartButton";
import { Photo } from "@/components/media/Photo";
import type { VendorSummary } from "@/data/types";
import { formatINR } from "@/lib/format";

type Props = {
  vendor: VendorSummary;
  index: number;
  priority?: boolean;
};

function VerifiedSeal() {
  return (
    <svg viewBox="0 0 24 24" aria-label="Verified" role="img">
      <title>Verified</title>
      <path d="M12 2l2.4 2.1 3.2-.4 1.2 3 .2 3.2L22 12l-2.1 2.4.4 3.2-3 1.2-3.2.2L12 22l-2.4-2.1-3.2.4-1.2-3-.2-3.2L2 12l2.1-2.4-.4-3.2 3-1.2 3.2-.2L12 2z" />
      <path d="M8.5 12.2l2.2 2.2 4.8-4.8" fill="none" stroke="#FAF7F2" strokeWidth="1.6" />
    </svg>
  );
}

function unitLabel(unit: VendorSummary["priceUnit"]) {
  if (unit === "per_day") return "Per day";
  if (unit === "per_event") return "Per event";
  if (unit === "per_plate") return "Per plate";
  return "On request";
}

/**
 * List-view vendor entry for /vendors only — numbered header, facts, film strip.
 */
export function VendorsListEntry({ vendor, index, priority }: Props) {
  const strip = vendor.stripPhotos.length > 0 ? vendor.stripPhotos : vendor.cardPhotos;
  const scroller = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const travels =
    Boolean(vendor.travels?.trim()) ||
    vendor.citiesServed.some((c) => c !== vendor.citySlug);

  function syncEnds() {
    const el = scroller.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 4);
  }

  useEffect(() => {
    syncEnds();
    const el = scroller.current;
    if (!el) return;
    el.addEventListener("scroll", syncEnds, { passive: true });
    window.addEventListener("resize", syncEnds);
    return () => {
      el.removeEventListener("scroll", syncEnds);
      window.removeEventListener("resize", syncEnds);
    };
  }, [strip.length]);

  function scrollBy(dir: -1 | 1) {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.75, 480), behavior: "smooth" });
  }

  const serial = String(index + 1).padStart(2, "0");
  const price =
    vendor.startingPriceINR != null && vendor.priceUnit !== "on_request"
      ? formatINR(vendor.startingPriceINR)
      : "On request";
  const photoCount = vendor.photoCount || strip.length;

  return (
    <article className="ix rv">
      <div className="ixh">
        <span className="no" aria-hidden="true">
          {serial}
        </span>
        <div className="ixn">
          <span className="kick">
            {vendor.categoryName}
            {vendor.featured ? <b>Wedoura pick</b> : null}
          </span>
          <h3>
            <Link href={`/vendors/${vendor.slug}`}>
              {vendor.name}
              {vendor.verified ? <VerifiedSeal /> : null}
            </Link>
          </h3>
        </div>
        <dl className="facts">
          <div>
            <dt>Based in</dt>
            <dd>
              {vendor.cityName}
              <small>{travels ? "Travels anywhere" : "Local weddings"}</small>
            </dd>
          </div>
          {vendor.yearsActive != null && vendor.yearsActive > 0 ? (
            <div>
              <dt>Experience</dt>
              <dd>
                {vendor.yearsActive} {vendor.yearsActive === 1 ? "year" : "years"}
              </dd>
            </div>
          ) : null}
          <div>
            <dt>Starting at</dt>
            <dd>
              {price}
              <small>{unitLabel(vendor.priceUnit)}</small>
            </dd>
          </div>
        </dl>
        <div className="ixa">
          <VendorsHeartButton slug={vendor.slug} name={vendor.name} />
          <EnquireButton slug={vendor.slug} name={vendor.name} variant="solid" className="btn" />
        </div>
      </div>

      {strip.length > 0 ? (
        <div className="fs">
          <div className="fsr" ref={scroller}>
            {strip.map((photo, i) => {
              const landscape = photo.width >= photo.height;
              return (
                <Link
                  key={photo.id}
                  href={`/vendors/${vendor.slug}`}
                  className={landscape ? "l" : "p"}
                  tabIndex={-1}
                  aria-hidden={i > 0 ? true : undefined}
                >
                  <Photo
                    photo={photo}
                    mode="cover"
                    sizes="(min-width: 64rem) 28vw, 70vw"
                    priority={priority && i === 0}
                    className="h-full w-full"
                  />
                </Link>
              );
            })}
            <Link href={`/vendors/${vendor.slug}`} className="end">
              <b>
                See all <em>{photoCount}</em> photos
              </b>
              <span>View profile</span>
            </Link>
          </div>
          <button
            type="button"
            className="fsn pv"
            aria-label="Previous photos"
            disabled={atStart}
            onClick={() => scrollBy(-1)}
          >
            ‹
          </button>
          <button
            type="button"
            className="fsn nx"
            aria-label="Next photos"
            disabled={atEnd}
            onClick={() => scrollBy(1)}
          >
            ›
          </button>
        </div>
      ) : null}

      <footer className="ixf">
        <div>
          {vendor.tagline ? <p className="ds">{vendor.tagline}</p> : null}
          {vendor.styles.length > 0 ? (
            <p className="tg">
              {vendor.styles.map((s, i) => (
                <span key={s}>
                  {i > 0 ? <i>/</i> : null}
                  {s}
                </span>
              ))}
            </p>
          ) : null}
        </div>
        <div>
          <Link href={`/vendors/${vendor.slug}`} className="lnk">
            View profile
          </Link>
        </div>
      </footer>
    </article>
  );
}
