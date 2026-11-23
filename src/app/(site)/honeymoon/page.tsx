import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import "@/styles/honeymoon.css";
import { AddToPlanButton } from "@/components/honeymoon/AddToPlanButton";
import { HoneymoonFilm } from "@/components/honeymoon/HoneymoonFilm";
import { HoneymoonLandingPlanForm } from "@/components/honeymoon/HoneymoonLandingPlanForm";
import { HoneymoonSearch } from "@/components/honeymoon/HoneymoonSearch";
import { PackageRow } from "@/components/honeymoon/PackageRow";
import { PlanTray } from "@/components/honeymoon/PlanTray";
import { StayCard } from "@/components/honeymoon/StayCard";
import { PartnerBand } from "@/components/home/PartnerBand";
import { Photo } from "@/components/media/Photo";
import {
  listDestinations,
  listExperiences,
  listHoneymoonMoods,
  listHoneymoonPackages,
  listPartners,
  listStays,
} from "@/lib/api";
import { formatINR } from "@/lib/format";
import { absoluteUrl } from "@/lib/site-config";
import { patchedHref, pickParams } from "@/lib/url";

export const metadata: Metadata = {
  title: "Honeymoon",
  description:
    "Honeymoons planned around the two of you: five-star stays, slow itineraries and small moments, in India and overseas.",
  alternates: { canonical: absoluteUrl("/honeymoon") },
};

/** Which destination photo illustrates each mood card. */
const MOOD_COVERS: Record<string, string> = {
  Beach: "goa",
  Hills: "coorg",
  Heritage: "rajasthan",
  Backwaters: "kerala-backwaters",
  Overseas: "maldives",
};

const MOOD_LINES: Record<string, string> = {
  Beach: "Sand, sea and slow mornings",
  Hills: "Tea estates and log fires",
  Heritage: "Palaces, courtyards, old stories",
  Backwaters: "Houseboats and lake views",
  Overseas: "Islands and far-away cities",
};

export default async function HoneymoonPage({ searchParams }: PageProps<"/honeymoon">) {
  const params = pickParams(await searchParams, ["place", "mood", "where"]);
  if (params.place) redirect(`/honeymoon/${params.place}`);

  const mood = params.mood ?? "";
  const where = params.where ?? "";

  const [destinations, moods, allStays, experiences, partners] = await Promise.all([
    listDestinations(),
    listHoneymoonMoods(),
    listStays({ mood: mood || undefined }),
    listExperiences(mood || undefined),
    listPartners("honeymoon"),
  ]);

  const whereDest = destinations.find((d) => d.slug === where);
  const packages = await listHoneymoonPackages({
    mood: mood || undefined,
    destination: whereDest?.name,
  });

  const stays = whereDest
    ? allStays.filter((s) => s.cityName.toLowerCase().includes(whereDest.name.toLowerCase()))
    : allStays;

  const india = destinations.filter((d) => d.country === "India");
  const overseas = destinations.filter((d) => d.country !== "India");

  const heroPhoto = destinations.find((d) => d.slug === "maldives")?.cover ?? destinations[0]?.cover;
  const planPhoto = destinations.find((d) => d.slug === "kerala-backwaters")?.cover ?? destinations[0]?.cover;

  const filmSrc = existsSync(path.join(process.cwd(), "public", "films", "honeymoon.mp4"))
    ? "/films/honeymoon.mp4"
    : undefined;
  const filmPoster = existsSync(path.join(process.cwd(), "public", "films", "honeymoon.jpg"))
    ? "/films/honeymoon.jpg"
    : undefined;

  return (
    <main className="hm hm-page pb-section-sm">
      {/* Hero */}
      <section className="first">
        <div className="hero">
          <span className="cap gold">Honeymoons by Wedoura</span>
          <h1>
            The first trip of <em>the rest of your lives</em>
          </h1>
          <p className="lead">
            Five-star stays, slow itineraries and small moments planned around the two of you — in India and overseas.
          </p>
        </div>
        {heroPhoto && (
          <div className="heroimg">
            <Photo photo={heroPhoto} mode="cover" sizes="100vw" priority />
          </div>
        )}
        <div className="below">
          <HoneymoonSearch
            destinations={destinations.map((d) => ({ slug: d.slug, name: d.name, country: d.country }))}
            moods={moods}
            initialWhere={where}
            initialMood={mood}
          />
          <div className="chk">
            <span>Hand-picked stays</span>
            <span>One planner, start to finish</span>
            <span>No payment taken on Wedoura</span>
          </div>
        </div>
      </section>

      {/* Moods */}
      <section className="sec" aria-label="Honeymoon moods">
        <div className="hd">
          <div>
            <span className="cap gold">Begin with a feeling</span>
            <h2>
              What kind of <em>honeymoon</em>?
            </h2>
          </div>
        </div>
        <div className="moods">
          {moods.map((m) => {
            const cover = destinations.find((d) => d.slug === MOOD_COVERS[m])?.cover;
            return (
              <Link key={m} className="mood" href={`/honeymoon?mood=${encodeURIComponent(m)}#stay`}>
                {cover && (
                  <span className="im zoom block">
                    <Photo photo={cover} mode="cover" sizes="(min-width: 64rem) 19vw, 64vw" />
                  </span>
                )}
                <span className="t block">
                  <h3>{m}</h3>
                  {MOOD_LINES[m] && <p>{MOOD_LINES[m]}</p>}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Stays */}
      <section className="sec" id="stay">
        <div className="hd">
          <div>
            <span className="cap gold">Stays for two</span>
            <h2>
              Rooms worth <em>staying in</em>
            </h2>
            <p>
              Hotels and resorts we trust with a first week of marriage{whereDest ? ` — around ${whereDest.name}` : ""}.
            </p>
          </div>
          <Link className="lnk" href="/honeymoon/stays">
            All stays
          </Link>
        </div>
        <nav className="tabs" aria-label="Filter stays by mood">
          <Link className={mood === "" ? "on" : ""} href={`${patchedHref("/honeymoon", params, { mood: null })}#stay`}>
            All moods
          </Link>
          {moods.map((m) => (
            <Link key={m} className={mood === m ? "on" : ""} href={`${patchedHref("/honeymoon", params, { mood: m })}#stay`}>
              {m}
            </Link>
          ))}
        </nav>
        {stays.length > 0 ? (
          <div className="vgrid">
            {stays.map((stay) => (
              <StayCard key={stay.slug} stay={stay} />
            ))}
          </div>
        ) : (
          <p className="vempty">
            No stays match that mood{whereDest ? ` around ${whereDest.name}` : ""} yet.{" "}
            <Link className="lnk" href="/honeymoon#stay">
              See every stay
            </Link>
          </p>
        )}
      </section>

      {/* Film (only when a clip exists) */}
      {filmSrc && <HoneymoonFilm src={filmSrc} poster={filmPoster} label="A Wedoura honeymoon, on film" />}

      {/* Statement */}
      <section className="state">
        <p>
          The wedding was for everyone. <em>This one is just for the two of you.</em>
        </p>
      </section>

      {/* Packages */}
      <section className="sec" id="packages">
        <div className="hd">
          <div>
            <span className="cap gold">Planned end to end</span>
            <h2>
              Honeymoon <em>packages</em>
            </h2>
            <p>Flights to farewell dinner — one planner holds the whole trip, and you just show up.</p>
          </div>
          <Link className="lnk" href="/honeymoon/packages">
            All packages
          </Link>
        </div>
        {packages.length > 0 ? (
          <div className="pks">
            {packages.map((pkg) => (
              <PackageRow key={pkg.slug} pkg={pkg} />
            ))}
          </div>
        ) : (
          <p className="vempty">
            No packages match that yet.{" "}
            <Link className="lnk" href="/honeymoon/packages">
              See every package
            </Link>
          </p>
        )}
      </section>

      {/* Experiences */}
      {experiences.length > 0 && (
        <section className="sec" id="experiences">
          <div className="hd">
            <div>
              <span className="cap gold">Small moments, big memories</span>
              <h2>
                Moments <em>for two</em>
              </h2>
              <p>Add these to your plan and we’ll weave them into the trip where they fit best.</p>
            </div>
          </div>
          <div className="xps">
            {experiences.map((xp) => (
              <article className="xp" key={xp.slug}>
                {xp.cover && (
                  <div className="im zoom">
                    <Photo photo={xp.cover} mode="cover" sizes="(min-width: 64rem) 30vw, 46vw" />
                  </div>
                )}
                <div className="t">
                  <h3>{xp.name}</h3>
                  <p>{xp.description}</p>
                  <div className="row">
                    <span>{xp.priceFromINR ? `From ${formatINR(xp.priceFromINR)}` : "On request"}</span>
                    <AddToPlanButton slug={xp.slug} name={xp.name} priceFromINR={xp.priceFromINR} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="how" aria-label="How it works">
        <div className="hd">
          <div>
            <span className="cap gold">How it works</span>
            <h2>
              Three steps to <em>wheels up</em>
            </h2>
          </div>
        </div>
        <div className="steps">
          <div>
            <b>1</b>
            <h3>Tell us your dream</h3>
            <p>A mood, a month and a budget are enough. The form below takes two minutes.</p>
          </div>
          <div>
            <b>2</b>
            <h3>Get a plan made for two</h3>
            <p>One planner designs the trip with you — stays, days and the moments you picked.</p>
          </div>
          <div>
            <b>3</b>
            <h3>Pack and go</h3>
            <p>You confirm directly with the hotels and agencies. No payment is taken on Wedoura.</p>
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="sec" aria-label="Destinations">
        <div className="hd">
          <div>
            <span className="cap gold">Where to next</span>
            <h2>
              Destination <em>guides</em>
            </h2>
            <p>Full guides — what to do, where to stay, and how to keep the first week unhurried.</p>
          </div>
        </div>
        <div className="dest">
          <div>
            <span className="cap gold">In India</span>
            <div className="loc">
              {india.map((d) => (
                <Link key={d.slug} href={`/honeymoon/${d.slug}`}>
                  {d.name}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <span className="cap gold">Overseas</span>
            <div className="loc">
              {overseas.map((d) => (
                <Link key={d.slug} href={`/honeymoon/${d.slug}`}>
                  {d.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Planning form */}
      <section className="plan" id="plan">
        {planPhoto && (
          <div className="im">
            <Photo photo={planPhoto} mode="cover" sizes="(min-width: 64rem) 54vw, 100vw" />
          </div>
        )}
        <div className="fm">
          <span className="cap gold">Free planning help</span>
          <h2>
            Tell us <em>your dream</em>
          </h2>
          <p className="sub">Two minutes now, honeymoon ideas in your WhatsApp by tomorrow.</p>
          <HoneymoonLandingPlanForm moods={moods} />
        </div>
      </section>

      {/* Partner band (hidden with no active honeymoon partner) */}
      {partners[0] && (
        <div className="mt-section">
          <PartnerBand partner={partners[0]} />
        </div>
      )}

      {/* Join band */}
      <section className="join" aria-label="For hotels and travel agencies">
        <span className="cap">For hotels &amp; travel agencies</span>
        <h2>
          Host the <em>first trip</em> of their lives
        </h2>
        <p>If couples leave your property a little more in love, we’d like to list you.</p>
        <Link className="btn" href="/list-your-business">
          List your property
        </Link>
      </section>

      <PlanTray />
    </main>
  );
}
