import type { Metadata } from "next";
import Link from "next/link";
import "@/styles/honeymoon.css";
import { PackageRow } from "@/components/honeymoon/PackageRow";
import { listHoneymoonMoods, listHoneymoonPackages } from "@/lib/api";
import { absoluteUrl } from "@/lib/site-config";
import { patchedHref, pickParams } from "@/lib/url";

export const metadata: Metadata = {
  title: "Honeymoon packages",
  description: "Honeymoons planned end to end — flights to farewell dinner, one planner holding the whole trip.",
  alternates: { canonical: absoluteUrl("/honeymoon/packages") },
};

export default async function HoneymoonPackagesPage({ searchParams }: PageProps<"/honeymoon/packages">) {
  const params = pickParams(await searchParams, ["mood"]);
  const mood = params.mood ?? "";
  const [moods, packages] = await Promise.all([
    listHoneymoonMoods(),
    listHoneymoonPackages({ mood: mood || undefined }),
  ]);

  return (
    <main className="hm hm-page hm-list pb-section-sm">
      <header className="lhead">
        <span className="cap gold">Honeymoons by Wedoura</span>
        <h1>
          Honeymoon <em>packages</em>
        </h1>
        <p className="lead">
          Trips planned end to end by agencies we trust. Every price is a starting point — your planner confirms the
          final quote, and no payment is taken on Wedoura.
        </p>
      </header>

      <nav className="tabs" aria-label="Filter packages by mood">
        <Link className={mood === "" ? "on" : ""} href={patchedHref("/honeymoon/packages", params, { mood: null })}>
          All moods
        </Link>
        {moods.map((m) => (
          <Link key={m} className={mood === m ? "on" : ""} href={patchedHref("/honeymoon/packages", params, { mood: m })}>
            {m}
          </Link>
        ))}
      </nav>

      {packages.length > 0 ? (
        <div className="pks">
          {packages.map((pkg) => (
            <PackageRow key={pkg.slug} pkg={pkg} />
          ))}
        </div>
      ) : (
        <p className="vempty">
          No packages match that mood yet.{" "}
          <Link className="lnk" href="/honeymoon/packages">
            See every package
          </Link>
        </p>
      )}

      <div className="more">
        <Link className="btn ghostb" href="/honeymoon#plan">
          Plan one from scratch instead
        </Link>
      </div>
    </main>
  );
}
