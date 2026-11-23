"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Photo } from "@/components/media/Photo";
import { PhotoGrid } from "@/components/media/PhotoGrid";
import { KindWords } from "@/components/profile/KindWords";
import { StickyActionBar } from "@/components/profile/StickyActionBar";
import { StickySubnav, type SubnavSection } from "@/components/profile/StickySubnav";
import {
  VenueCapacityPlanner,
  type CapacityLayout,
} from "@/components/profile/VenueCapacityPlanner";
import { VenueEnquireForm } from "@/components/profile/VenueEnquireForm";
import { VenuePriceEstimate } from "@/components/profile/VenuePriceEstimate";
import { VenueTour, useTourLoadRequest } from "@/components/profile/VenueTour";
import { Container } from "@/components/ui/Container";
import { SaveButton } from "@/components/ui/SaveButton";
import type { VendorDetail, VendorSummary } from "@/data/types";
import { formatINR, formatPrice } from "@/lib/format";
import { resolveTour } from "@/lib/tour";
import "@/styles/venue-profile.css";

type Props = {
  vendor: VendorDetail;
  /** Reserved for a similar-venues rail; unused on the venue reference layout. */
  similar?: VendorSummary[];
};

const RULE_ICON: Record<"allowed" | "conditions" | "forbidden", { cls: string; mark: string; label: string }> = {
  allowed: { cls: "y", mark: "✓", label: "Allowed" },
  conditions: { cls: "c", mark: "!", label: "Allowed with conditions" },
  forbidden: { cls: "n", mark: "✕", label: "Not allowed" },
};

/** Last word in italic gold, matching the reference accent pattern. */
function withAccent(text: string): ReactNode {
  const parts = text.trim().split(/\s+/);
  if (parts.length < 2) return text;
  const last = parts.pop()!;
  return (
    <>
      {parts.join(" ")} <em>{last}</em>
    </>
  );
}

function capLabel(n: number | undefined): string {
  return n ? String(n) : "—";
}

/**
 * Venue profile matching the client venue-profile reference. Sections hide
 * when empty. Tour, capacity planner, estimate and enquire are client pieces.
 */
export function VenueProfile({ vendor }: Props) {
  const venue = vendor.venue;
  const startingPrice = formatPrice(vendor.startingPriceINR, vendor.priceUnit);
  const whatsapp = vendor.contact.whatsapp;
  const tour = venue ? resolveTour(venue.tour, vendor.portfolio) : null;
  const { loadRequest, requestScene } = useTourLoadRequest();

  const spaceDetails = useMemo(() => venue?.spaceDetails ?? [], [venue?.spaceDetails]);
  const roomTiers = venue?.roomTiers ?? [];
  const ruleItems = venue?.rules?.items ?? [];
  const overviewFacts = venue?.overviewFacts ?? [];
  const distances = venue?.location?.distances ?? [];
  const menus = venue?.food?.menus ?? [];
  const estimate = venue?.estimate;
  const testimonials = vendor.testimonials ?? [];
  const packages = vendor.packages;
  const portfolio = vendor.portfolio;

  const photoById = useMemo(() => {
    const map = new Map(portfolio.map((p) => [p.id, p]));
    return map;
  }, [portfolio]);

  const comingSoon = useMemo(
    () =>
      spaceDetails
        .filter((s) => !s.sceneId)
        .map((s) => ({
          name: s.name,
          posterSrc: (s.photoId && photoById.get(s.photoId)?.src) || vendor.cover?.src || "",
        }))
        .filter((s) => s.posterSrc),
    [spaceDetails, photoById, vendor.cover],
  );

  const defaultGuests = useMemo(() => {
    if (!venue) return 180;
    const mid = Math.round((venue.capacity.min + venue.capacity.max) / 2 / 10) * 10;
    return Math.min(venue.capacity.max, Math.max(venue.capacity.min, mid || 180));
  }, [venue]);

  const [guests, setGuests] = useState(defaultGuests);
  const [layout, setLayout] = useState<CapacityLayout>("ceremony");

  const hasOverview =
    vendor.about.length > 0 || overviewFacts.length > 0;
  const hasSpaces = spaceDetails.length > 0;
  const hasTour = Boolean(tour && tour!.scenes.length > 0);
  const hasCapacity = spaceDetails.length > 0;
  const hasStay = roomTiers.length > 0;
  const hasRules = ruleItems.length > 0;
  const hasPricing =
    packages.length > 0 ||
    Boolean(estimate && menus.some((m) => m.pricePerGuestINR != null));
  const hasGallery = portfolio.length > 0;
  const hasKindWords = testimonials.length > 0 || Boolean(vendor.press?.length);
  const hasReach = distances.length > 0 || Boolean(venue?.location?.address);

  const sections: SubnavSection[] = [
    ...(hasOverview ? [{ id: "overview", label: "Overview" }] : []),
    ...(hasSpaces ? [{ id: "spaces", label: "Spaces" }] : []),
    ...(hasTour ? [{ id: "tour", label: "360° tour" }] : []),
    ...(hasCapacity ? [{ id: "capacity", label: "Capacity" }] : []),
    ...(hasStay ? [{ id: "stay", label: "Stay" }] : []),
    ...(hasRules ? [{ id: "rules", label: "Food & rules" }] : []),
    ...(hasPricing ? [{ id: "pricing", label: "Prices" }] : []),
    ...(hasGallery ? [{ id: "gallery", label: "Gallery" }] : []),
    ...(hasKindWords ? [{ id: "kind-words", label: "Kind words" }] : []),
    ...(hasReach ? [{ id: "reach", label: "Getting there" }] : []),
    { id: "enquire", label: "Enquire" },
  ];

  const roomCountLabel =
    venue?.rooms?.count != null
      ? `${venue.rooms.count} rooms`
      : roomTiers.length
        ? roomTiers.map((r) => r.countLabel).join(" · ")
        : undefined;

  const spaceFact =
    spaceDetails.length > 0
      ? `${spaceDetails.length} space${spaceDetails.length === 1 ? "" : "s"}`
      : venue?.spaces?.length
        ? `${venue.spaces.length} spaces`
        : undefined;

  function openTourScene(sceneId: string) {
    requestScene(sceneId);
    document.getElementById("tour")?.scrollIntoView({ behavior: "smooth" });
  }

  if (!venue) {
    return null;
  }

  return (
    <div className="venue-profile pb-24 lg:pb-0">
      {vendor.cover && (
        <div className="hhero" data-nav-dark>
          <Photo
            photo={vendor.cover}
            mode="cover"
            sizes="100vw"
            priority
            quality={90}
          />
        </div>
      )}

      <section className="hname">
        <span className="vp-cap">
          {vendor.categoryName} · {vendor.cityName}
        </span>
        <h1>{withAccent(vendor.name)}</h1>
        {vendor.tagline ? <p className="lead">{vendor.tagline}</p> : null}
        <div className="hfacts">
          <span>
            <b>
              {venue.capacity.min} – {venue.capacity.max}
            </b>{" "}
            guests
          </span>
          {spaceFact ? (
            <span>
              <b>{spaceFact}</b>
              {spaceDetails.some((s) => s.setting === "outdoor") &&
              spaceDetails.some((s) => s.setting !== "outdoor")
                ? " · indoor & outdoor"
                : null}
            </span>
          ) : null}
          {roomCountLabel ? (
            <span>
              <b>{roomCountLabel}</b> on site
            </span>
          ) : null}
          {vendor.startingPriceINR != null ? (
            <span>
              From <b>{formatINR(vendor.startingPriceINR)}</b>{" "}
              {vendor.priceUnit === "per_day"
                ? "per day"
                : vendor.priceUnit === "per_event"
                  ? "per event"
                  : ""}
              *
            </span>
          ) : null}
        </div>
        <div className="hbtns">
          <a className="vp-btn" href="#enquire">
            Check availability
          </a>
          {hasTour ? (
            <a className="vp-lnk" href="#tour">
              Take the 360° tour
            </a>
          ) : null}
          {hasCapacity ? (
            <a className="vp-lnk" href="#capacity">
              Will we fit?
            </a>
          ) : null}
          <SaveButton slug={vendor.slug} name={vendor.name} tone="ink" withLabel />
        </div>
      </section>

      {sections.length > 1 ? <StickySubnav sections={sections} /> : null}

      {hasOverview && (
        <section className="sec" id="overview">
          <div className="ov">
            <div>
              <span className="vp-cap">The venue</span>
              <h2>{withAccent("Inside the venue")}</h2>
              {vendor.about.length > 0 && (
                <div className="body">
                  {vendor.about.map((p) => (
                    <p key={p.slice(0, 24)}>{p}</p>
                  ))}
                </div>
              )}
            </div>
            {overviewFacts.length > 0 && (
              <dl className="glance">
                {overviewFacts.map((f) => (
                  <div key={f.label}>
                    <dt>{f.label}</dt>
                    <dd>
                      {f.value}
                      {f.note ? <small>{f.note}</small> : null}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </section>
      )}

      {hasSpaces && (
        <section className="sec" id="spaces">
          <div className="hd">
            <div>
              <span className="vp-cap">Spaces</span>
              <h2>{withAccent("Places to celebrate")}</h2>
              <p>
                Each event of your wedding can have its own space. Capacities
                are for comfortable layouts, not packed rooms.
              </p>
            </div>
            {hasCapacity ? (
              <a className="vp-lnk" href="#capacity">
                Check what fits
              </a>
            ) : null}
          </div>
          <div className="spaces">
            {spaceDetails.map((s) => {
              const photo = s.photoId ? photoById.get(s.photoId) : undefined;
              return (
                <article key={s.name} className="sp">
                  <div className="im">
                    {photo ? (
                      <Photo
                        photo={photo}
                        mode="cover"
                        sizes="(min-width: 900px) 45vw, 100vw"
                      />
                    ) : null}
                    {s.sceneId && hasTour ? (
                      <button
                        type="button"
                        className="b360"
                        onClick={() => openTourScene(s.sceneId!)}
                      >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                          <ellipse cx="12" cy="12" rx="10" ry="4" />
                          <path d="M12 2v3M12 19v3" />
                        </svg>
                        360° view
                      </button>
                    ) : null}
                  </div>
                  <div className="t">
                    {s.kind ? <span className="kind">{s.kind}</span> : null}
                    <h3>{s.name}</h3>
                    {s.description ? <p>{s.description}</p> : null}
                    <dl className="cap3">
                      <div>
                        <dt>Ceremony</dt>
                        <dd>{capLabel(s.ceremony)}</dd>
                      </div>
                      <div>
                        <dt>Dinner</dt>
                        <dd>{capLabel(s.dinner)}</dd>
                      </div>
                      <div>
                        <dt>Standing</dt>
                        <dd>{capLabel(s.standing)}</dd>
                      </div>
                      <div>
                        <dt>Area</dt>
                        <dd>
                          {s.areaSqFt
                            ? s.areaSqFt.toLocaleString("en-IN")
                            : s.area ?? "—"}{" "}
                          {s.areaSqFt ? <small>sq ft</small> : null}
                        </dd>
                      </div>
                    </dl>
                    {s.bestFor && s.bestFor.length > 0 ? (
                      <div className="best">
                        {s.bestFor.map((b) => (
                          <span key={b}>{b}</span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {hasTour && tour && (
        <section className="tour sec" id="tour">
          <div className="hd">
            <div>
              <span className="vp-cap">360° tour</span>
              <h2>{withAccent("Walk the grounds")}</h2>
              <p>
                Drag to look around. It loads only when you tap, so the rest of
                the page stays fast.
              </p>
            </div>
          </div>
          <VenueTour
            tour={tour}
            still={vendor.cover}
            venueName={vendor.name}
            comingSoon={comingSoon}
            loadRequest={loadRequest}
          />
        </section>
      )}

      {hasCapacity && (
        <section className="sec" id="capacity">
          <div className="hd">
            <div>
              <span className="vp-cap">Will we fit?</span>
              <h2>
                Plan it by <em>guest count</em>
              </h2>
              <p>
                Move the slider and choose the kind of event. We&apos;ll show
                which spaces fit comfortably.
              </p>
            </div>
          </div>
          <VenueCapacityPlanner
            spaces={spaceDetails}
            minGuests={venue.capacity.min}
            maxGuests={venue.capacity.max}
            guests={guests}
            onGuestsChange={setGuests}
            layout={layout}
            onLayoutChange={setLayout}
          />
        </section>
      )}

      {venue.capacityNote ? (
        <section className="quote">
          <p>{venue.capacityNote}</p>
        </section>
      ) : null}

      {hasStay && (
        <section className="sec" id="stay">
          <div className="hd">
            <div>
              <span className="vp-cap">Where guests stay</span>
              <h2>
                Keep everyone <em>close</em>
              </h2>
              <p>
                Book every room on site for your family, and we&apos;ll hold
                rooms nearby for everyone else.
              </p>
            </div>
          </div>
          <div className="stay2">
            {roomTiers.map((tier) => (
              <div key={tier.name}>
                <b>{tier.countLabel}</b>
                <h3>{tier.name}</h3>
                {tier.description ? <p>{tier.description}</p> : null}
                {tier.rateFromINR != null ? (
                  <p className="rpr">
                    From <b>{formatINR(tier.rateFromINR)}</b> a night*
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      )}

      {hasRules && (
        <section className="sec" id="rules">
          <div className="hd">
            <div>
              <span className="vp-cap">Food &amp; rules</span>
              <h2>
                What&apos;s allowed, <em>plainly</em>
              </h2>
              <p>The questions every family asks, answered before you call.</p>
            </div>
          </div>
          <div className="rules">
            {ruleItems.map((r) => {
              const icon = RULE_ICON[r.status];
              return (
                <div key={r.title} className="rule">
                  <i className={icon.cls} aria-label={icon.label}>
                    {icon.mark}
                  </i>
                  <div>
                    <b>{r.title}</b>
                    <span>{r.detail}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="legend">
            <span>
              <i className="lg-y" />
              Allowed
            </span>
            <span>
              <i className="lg-c" />
              Allowed, with conditions
            </span>
            <span>
              <i className="lg-n" />
              Not allowed
            </span>
          </div>
        </section>
      )}

      {hasPricing && (
        <section className="sec" id="pricing">
          <div className="hd">
            <div>
              <span className="vp-cap">Prices</span>
              <h2>
                What it <em>costs</em>
              </h2>
              <p>
                Open prices, so you can plan before you talk to anyone.
                {estimate && menus.some((m) => m.pricePerGuestINR != null)
                  ? " Build a rough estimate on the right."
                  : null}
              </p>
            </div>
          </div>
          <div className="est">
            <div>
              {(packages.length > 0 ||
                menus.some((m) => m.pricePerGuestINR != null)) && (
                <div className="pkgs">
                  {packages.map((pkg) => (
                    <div key={pkg.label} className="pkg">
                      <div>
                        <b>{pkg.label}</b>
                        {pkg.note ? <span>{pkg.note}</span> : null}
                      </div>
                      <em>
                        {pkg.unit === "on_request" || pkg.priceINR == null
                          ? "On request"
                          : formatINR(pkg.priceINR)}
                        {pkg.unit !== "on_request" && pkg.priceINR != null ? (
                          <small>
                            {pkg.unit === "per_day"
                              ? "per day"
                              : pkg.unit === "per_plate"
                                ? "per guest"
                                : pkg.unit === "per_event"
                                  ? "per event"
                                  : "from"}
                          </small>
                        ) : null}
                      </em>
                    </div>
                  ))}
                  {menus.map((m) =>
                    m.pricePerGuestINR != null ? (
                      <div key={`menu-${m.name}`} className="pkg">
                        <div>
                          <b>{m.name} menu</b>
                          {m.note ? <span>{m.note}</span> : null}
                        </div>
                        <em>
                          {formatINR(m.pricePerGuestINR)}
                          <small>per guest</small>
                        </em>
                      </div>
                    ) : null,
                  )}
                </div>
              )}
              {(venue.peakMonths?.length ||
                venue.valueMonths?.length ||
                venue.closedMonths?.length) && (
                <div className="season">
                  {venue.peakMonths?.length ? (
                    <span>Peak: {venue.peakMonths.join(" – ")}</span>
                  ) : null}
                  {venue.valueMonths?.length ? (
                    <span>Value: {venue.valueMonths.join(", ")}</span>
                  ) : null}
                  {venue.closedMonths?.length ? (
                    <span>Closed: {venue.closedMonths.join(" – ")}</span>
                  ) : null}
                </div>
              )}
            </div>
            {estimate && menus.some((m) => m.pricePerGuestINR != null) ? (
              <VenuePriceEstimate
                estimate={estimate}
                menus={menus}
                guests={guests}
              />
            ) : null}
          </div>
        </section>
      )}

      {hasGallery && (
        <section className="sec" id="gallery">
          <div className="hd">
            <div>
              <span className="vp-cap">Gallery</span>
              <h2>{withAccent(`A wedding at ${vendor.name.split(/\s+/)[0] ?? vendor.name}`)}</h2>
              <p>Tap any photo to see it larger.</p>
            </div>
          </div>
          <Container>
            <PhotoGrid photos={portfolio} initialCount={12} sizes="(min-width: 768px) 33vw, 50vw" />
          </Container>
        </section>
      )}

      {hasKindWords && (
        <Container>
          <KindWords testimonials={testimonials} press={vendor.press} />
        </Container>
      )}

      {hasReach && (
        <section className="sec" id="reach">
          <div className="hd">
            <div>
              <span className="vp-cap">Getting there</span>
              <h2>
                Easy to <em>reach</em>
              </h2>
            </div>
            {venue.location?.mapUrl ? (
              <a
                className="vp-lnk"
                href={venue.location.mapUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open in Maps
              </a>
            ) : null}
          </div>
          {distances.length > 0 && (
            <div className="reach">
              {distances.map((d) => (
                <div key={d.label}>
                  <b>{d.value}</b>
                  <h3>{d.label}</h3>
                  {d.detail ? <p>{d.detail}</p> : null}
                </div>
              ))}
            </div>
          )}
          {venue.location?.address ? (
            <p className="addr">
              {venue.location.address}
              {vendor.cityName ? ` · ${vendor.cityName}` : null}
            </p>
          ) : null}
        </section>
      )}

      <section className="booksec" id="enquire">
        <div className="hd">
          <div>
            <span className="vp-cap">Check availability</span>
            <h2>
              Ask about your <em>dates</em>
            </h2>
            <p>
              Choose a month, tell us about your events, and the venue replies
              with open dates and a quote — usually within a day.
            </p>
          </div>
        </div>
        <VenueEnquireForm
          vendorSlug={vendor.slug}
          vendorName={vendor.name}
          cityName={vendor.cityName}
          cover={vendor.cover ?? vendor.cardPhotos[0]}
          eventOptions={estimate?.events ?? []}
          peakMonths={venue.peakMonths}
          valueMonths={venue.valueMonths}
          closedMonths={venue.closedMonths}
          defaultGuests={guests}
        />
      </section>

      <StickyActionBar
        slug={vendor.slug}
        name={vendor.name}
        startingPrice={startingPrice}
        whatsapp={whatsapp}
        inquireHref="#enquire"
      />
    </div>
  );
}
