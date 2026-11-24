import type { Metadata } from "next";
import Link from "next/link";
import "@/styles/honeymoon.css";
import { StayCard } from "@/components/honeymoon/StayCard";
import { listHoneymoonMoods, listStays } from "@/lib/api";
import { pageMeta } from "@/lib/seo";
import { patchedHref, pickParams } from "@/lib/url";

export const metadata: Metadata = pageMeta({
  title: "Honeymoon stays",
  description: "Hotels and resorts we trust with a first week of marriage, picked room by room.",
  path: "/honeymoon/stays",
});

export default async function HoneymoonStaysPage({ searchParams }: PageProps<"/honeymoon/stays">) {
  const params = pickParams(await searchParams, ["mood"]);
  const mood = params.mood ?? "";
  const [moods, stays] = await Promise.all([listHoneymoonMoods(), listStays({ mood: mood || undefined })]);

  return (
    <main className="hm hm-page hm-list pb-section-sm">
      <header className="lhead">
        <span className="cap gold">Honeymoons by Wedoura</span>
        <h1>
          Stays <em>for two</em>
        </h1>
        <p className="lead">
          Hotels and resorts we trust with a first week of marriage. Rates are starting points — the hotel confirms the
          final rate for your dates.
        </p>
      </header>

      <nav className="tabs" aria-label="Filter stays by mood">
        <Link className={mood === "" ? "on" : ""} href={patchedHref("/honeymoon/stays", params, { mood: null })}>
          All moods
        </Link>
        {moods.map((m) => (
          <Link key={m} className={mood === m ? "on" : ""} href={patchedHref("/honeymoon/stays", params, { mood: m })}>
            {m}
          </Link>
        ))}
      </nav>

      {stays.length > 0 ? (
        <div className="vgrid">
          {stays.map((stay) => (
            <StayCard key={stay.slug} stay={stay} sizes="(min-width: 64rem) 30vw, 92vw" />
          ))}
        </div>
      ) : (
        <p className="vempty">
          No stays match that mood yet.{" "}
          <Link className="lnk" href="/honeymoon/stays">
            See every stay
          </Link>
        </p>
      )}

      <div className="more">
        <Link className="btn ghostb" href="/honeymoon#plan">
          Ask us to pick for you
        </Link>
      </div>
    </main>
  );
}
