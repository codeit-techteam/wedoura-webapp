"use client";

import Link from "next/link";
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
          <nav
            aria-label="Filter by category"
            className="mb-10 flex flex-wrap gap-x-[clamp(1.25rem,3vw,2.5rem)] gap-y-2 border-b border-line"
            role="tablist"
          >
            <button
              type="button"
              role="tab"
              aria-selected={!active}
              onClick={() => setActive("")}
              className={cn(
                "tap -mb-px min-h-11 border-b border-transparent pb-3.5 font-sans text-[0.78125rem] font-medium tracking-[0.24em] text-mute uppercase transition-colors hover:text-ink hover:border-gold",
                !active && "border-gold text-ink",
              )}
            >
              All
            </button>
            {tabs.map((tab) => (
              <button
                key={tab.slug}
                type="button"
                role="tab"
                aria-selected={active === tab.slug}
                onClick={() => setActive(active === tab.slug ? "" : tab.slug)}
                className={cn(
                  "tap -mb-px min-h-11 border-b border-transparent pb-3.5 font-sans text-[0.78125rem] font-medium tracking-[0.24em] text-mute uppercase transition-colors hover:text-ink hover:border-gold",
                  active === tab.slug && "border-gold text-ink",
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

        <div className="mt-14 flex justify-center md:mt-16">
          <Link
            href="/vendors"
            className="tap inline-flex min-h-12 items-center justify-center bg-ink px-9 font-sans text-button font-medium tracking-button text-ivory uppercase transition-chrome hover:bg-gold-deep"
          >
            See all vendors
          </Link>
        </div>
      </Container>
    </section>
  );
}
