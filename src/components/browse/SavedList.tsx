"use client";

import { VendorCard, type VendorCardData } from "@/components/cards/VendorCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { useSaved } from "@/lib/saved";

type Props = { vendors: VendorCardData[] };

/** The /saved page body: the shared store resolved against all vendors. */
export function SavedList({ vendors }: Props) {
  const saved = useSaved();
  const shown = vendors.filter((v) => saved.includes(v.slug));

  if (shown.length === 0) {
    return (
      <EmptyState
        title="Nothing saved yet."
        text="Tap the bookmark on any vendor and they will wait for you here."
        action={{ label: "Browse vendors", href: "/vendors" }}
      />
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-2 gap-y-8 xl:grid-cols-4">
      {shown.map((vendor) => (
        <li key={vendor.slug}>
          <VendorCard vendor={vendor} />
        </li>
      ))}
    </ul>
  );
}
