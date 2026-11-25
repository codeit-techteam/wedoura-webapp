"use client";

import { useState } from "react";
import { VendorTile } from "@/components/cards/VendorTile";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { VendorSummary } from "@/data/types";
import { cn } from "@/lib/cn";

type Tab = { slug: string; label: string };

type Props = {
  vendors: VendorSummary[];
  tabs: Tab[];
};

export function HomeVendors({ vendors, tabs }: Props) {
  const [active, setActive] = useState<string>("");

  const shown = active ? vendors.filter((v) => v.category === active) : vendors;

  if (!vendors.length) return null;

  return (
    <section aria-label="Featured vendors" className="py-section bg-ivory">
      <Container>
        <SectionHeader
          label="Hand-picked for you"
          title={
            <>
              Popular <em>vendors</em>
            </>
          }
          href="/vendors"
          linkLabel="View all vendors"
        />

        {/* Category tabs */}
        {tabs.length > 0 && (
          <nav aria-label="Filter by category" className="mb-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActive("")}
              className={cn(
                "tap rounded-none border px-4 py-2 font-sans text-button font-medium tracking-button uppercase transition-colors",
                !active
                  ? "border-ink bg-ink text-ivory"
                  : "border-line bg-white text-ink hover:border-ink"
              )}
            >
              All
            </button>
            {tabs.map((tab) => (
              <button
                key={tab.slug}
                type="button"
                onClick={() => setActive(active === tab.slug ? "" : tab.slug)}
                className={cn(
                  "tap rounded-none border px-4 py-2 font-sans text-button font-medium tracking-button uppercase transition-colors",
                  active === tab.slug
                    ? "border-ink bg-ink text-ivory"
                    : "border-line bg-white text-ink hover:border-ink"
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        <ul className="grid grid-cols-1 gap-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((vendor) => (
            <li key={vendor.slug}>
              <VendorTile
                vendor={vendor}
                sizes="(min-width: 64rem) 33vw, (min-width: 40rem) 50vw, 100vw"
              />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
