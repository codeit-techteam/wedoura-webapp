import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import "@/styles/honeymoon.css";
import { ItineraryAccordion } from "@/components/honeymoon/ItineraryAccordion";
import { PackageBooking } from "@/components/honeymoon/PackageBooking";
import { packageFromPrice } from "@/components/honeymoon/PackageRow";
import { Photo } from "@/components/media/Photo";
import { PhotoGrid } from "@/components/media/PhotoGrid";
import { StickySubnav, type SubnavSection } from "@/components/profile/StickySubnav";
import { Accordion } from "@/components/ui/Accordion";
import type { Experience } from "@/data/types";
import { getExperience, getHoneymoonPackage, getPhoto, getVendor, listHoneymoonPackages } from "@/lib/api";
import { formatINR } from "@/lib/format";
import { absoluteUrl } from "@/lib/site-config";

export async function generateStaticParams() {
  const packages = await listHoneymoonPackages();
  return packages.map((pkg) => ({ slug: pkg.slug }));
}

export async function generateMetadata({ params }: PageProps<"/honeymoon/packages/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const pkg = await getHoneymoonPackage(slug);
  if (!pkg) return {};
  return {
    title: `${pkg.name} — honeymoon package`,
    description: pkg.summary,
    alternates: { canonical: absoluteUrl(`/honeymoon/packages/${pkg.slug}`) },
  };
}

export default async function HoneymoonPackagePage({ params }: PageProps<"/honeymoon/packages/[slug]">) {
  const { slug } = await params;
  const pkg = await getHoneymoonPackage(slug);
  if (!pkg) notFound();

  const [agency, moments, stayPhotos] = await Promise.all([
    pkg.vendorSlug ? getVendor(pkg.vendorSlug) : undefined,
    Promise.all((pkg.momentSlugs ?? []).map((s) => getExperience(s))).then(
      (list) => list.filter(Boolean) as Experience[],
    ),
    Promise.all(
      (pkg.stays ?? []).map(async (s) => (s.photoId ? await getPhoto(s.photoId) : undefined)),
    ),
  ]);

  const from = packageFromPrice(pkg);
  const sections: SubnavSection[] = [
    { id: "overview", label: "Overview" },
    pkg.itinerary.length > 0 && { id: "days", label: "Day by day" },
    pkg.stays && pkg.stays.length > 0 && { id: "stays", label: "Stays" },
    moments.length > 0 && { id: "moments", label: "Moments" },
    pkg.collections.length > 0 && { id: "prices", label: "Prices" },
    pkg.gallery && pkg.gallery.length > 0 && { id: "gallery", label: "Gallery" },
    { id: "enquire", label: "Request to book" },
  ].filter(Boolean) as SubnavSection[];

  return (
    <main className="hm hm-package pb-section-sm">
      <div className="hhero">
        <Photo photo={pkg.cover} mode="cover" sizes="100vw" priority />
      </div>

      <header className="hname">
        <span className="cap gold">{pkg.heroEyebrow ?? `Honeymoon package · ${pkg.destination}`}</span>
        <h1>{pkg.name}</h1>
        <p className="lead">{pkg.summary}</p>
        <div className="hfacts">
          <span>
            <b>{pkg.nights}</b> nights{pkg.days ? ` · ${pkg.days} days` : ""}
          </span>
          <span>
            <b>{pkg.destination}</b>
          </span>
          {agency && (
            <span>
              By <b>{agency.name}</b>
            </span>
          )}
          {from !== undefined && (
            <span>
              From <b>{formatINR(from)}</b> per couple
            </span>
          )}
        </div>
        <div className="hbtns">
          <a className="btn" href="#enquire">
            Request to book
          </a>
          <a className="lnk" href="#days">
            See the days
          </a>
        </div>
      </header>

      <StickySubnav sections={sections} />

      {/* Overview */}
      {Boolean(pkg.overview?.length || pkg.glance?.length) && (
        <section className="sec ov" id="overview">
          <div>
            <span className="cap gold">The trip</span>
            {pkg.overviewHeadline && <h2>{pkg.overviewHeadline}</h2>}
            <div className="body">
              {pkg.overview?.map((p) => (
                <p key={p.slice(0, 32)}>{p}</p>
              ))}
            </div>
          </div>
          {pkg.glance && pkg.glance.length > 0 && (
            <dl className="glance">
              {pkg.glance.map((g) => (
                <div key={g.label}>
                  <dt>{g.label}</dt>
                  <dd>{g.value}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      )}

      {/* Route */}
      {pkg.routeLabel && (
        <section className="sec route" aria-label="Route">
          <div className="rbar">
            <span className="cap">The route</span>
            <p>{pkg.routeLabel}</p>
          </div>
        </section>
      )}

      {/* Day by day */}
      {pkg.itinerary.length > 0 && (
        <section className="sec" id="days">
          <div className="hd">
            <div>
              <span className="cap gold">Day by day</span>
              <h2>
                How the days <em>unfold</em>
              </h2>
            </div>
          </div>
          <ItineraryAccordion days={pkg.itinerary} />
        </section>
      )}

      {/* Stays */}
      {pkg.stays && pkg.stays.length > 0 && (
        <section className="sec" id="stays">
          <div className="hd">
            <div>
              <span className="cap gold">Where you sleep</span>
              <h2>
                The <em>stays</em>
              </h2>
            </div>
          </div>
          <div className="stays">
            {pkg.stays.map((stay, i) => {
              const photo = stayPhotos[i];
              const body = (
                <>
                  {photo && (
                    <span className="im zoom block">
                      <Photo photo={photo} mode="cover" sizes="(min-width: 64rem) 45vw, 92vw" />
                    </span>
                  )}
                  <span className="t block">
                    {stay.nights !== undefined && (
                      <span className="cap gold">
                        {stay.nights} {stay.nights === 1 ? "night" : "nights"}
                      </span>
                    )}
                    <h3>{stay.name}</h3>
                    {stay.description && <p>{stay.description}</p>}
                  </span>
                </>
              );
              return (
                <article className="stay" key={stay.name}>
                  {stay.staySlug ? <Link href={`/honeymoon/stays/${stay.staySlug}`}>{body}</Link> : body}
                </article>
              );
            })}
          </div>
          <p className="staynote">Hotels are confirmed at booking; a similar stay steps in when one is full.</p>
        </section>
      )}

      {/* Included / not included */}
      {(pkg.inclusions.length > 0 || pkg.exclusions.length > 0) && (
        <section className="sec incl" aria-label="What is included">
          {pkg.inclusions.length > 0 && (
            <div>
              <h3>Included</h3>
              <ul>
                {pkg.inclusions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
          {pkg.exclusions.length > 0 && (
            <div className="no">
              <h3>Not included</h3>
              <ul>
                {pkg.exclusions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Moments + (prices, gallery, know, faq) + request to book */}
      <PackageBooking pkg={pkg} moments={moments}>
        {pkg.collections.length > 0 && (
          <section className="sec" id="prices">
            <div className="hd">
              <div>
                <span className="cap gold">Three ways to take it</span>
                <h2>
                  The <em>collections</em>
                </h2>
              </div>
            </div>
            <div className="tiers">
              {pkg.collections.map((c) => (
                <article className="tier" key={c.name}>
                  <span className="cap gold">{pkg.nights} nights</span>
                  <h3>{c.name}</h3>
                  {c.pricePerCoupleINR !== undefined && (
                    <p className="tp">
                      <b>{formatINR(c.pricePerCoupleINR)}</b>
                      from, per couple
                    </p>
                  )}
                  {c.note && <p className="tnote">{c.note}</p>}
                  <a className="btn ghostb" href="#enquire">
                    Request this
                  </a>
                </article>
              ))}
            </div>
            <p className="pnote">Prices are starting points for two, and move with season and availability.</p>
          </section>
        )}

        {pkg.gallery && pkg.gallery.length > 0 && (
          <section className="sec" id="gallery">
            <div className="hd">
              <div>
                <span className="cap gold">From past trips</span>
                <h2>
                  The <em>gallery</em>
                </h2>
              </div>
            </div>
            <div className="itin">
              <PhotoGrid photos={pkg.gallery} initialCount={6} />
            </div>
          </section>
        )}

        {pkg.goodToKnow.length > 0 && (
          <section className="sec know" aria-label="Good to know">
            <div className="hd">
              <div>
                <span className="cap gold">Before you book</span>
                <h2>
                  Good to <em>know</em>
                </h2>
              </div>
            </div>
            <ul>
              {pkg.goodToKnow.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {pkg.faqs && pkg.faqs.length > 0 && (
          <section className="sec itin" aria-label="Questions">
            <div className="hd">
              <div>
                <span className="cap gold">Questions</span>
                <h2>
                  Asked <em>often</em>
                </h2>
              </div>
            </div>
            <Accordion items={pkg.faqs} />
          </section>
        )}
      </PackageBooking>
    </main>
  );
}
