import type { VendorListing } from "@/data/types";
import { getCategoryDef } from "@/lib/api";

export interface ChecklistItem {
  key: string;
  label: string;
  done: boolean;
  href: string;
}

/** Completeness checklist driven by shared requirements + category fields. */
export function computeChecklist(listing: VendorListing): ChecklistItem[] {
  const cat = getCategoryDef(listing.category);
  const requiredFields = cat?.fields ?? [];

  const items: ChecklistItem[] = [
    {
      key: "identity",
      label: "Business name and tagline",
      done: Boolean(listing.name.trim() && listing.tagline.trim()),
      href: "/vendor-studio/profile#basics",
    },
    {
      key: "about",
      label: "About text",
      done: listing.about.length > 0,
      href: "/vendor-studio/profile#about",
    },
    {
      key: "photos",
      label: "12 portfolio photographs",
      done: listing.portfolio.length >= 12,
      href: "/vendor-studio/media",
    },
    {
      key: "cover",
      label: "Cover photo",
      done: Boolean(listing.cover),
      href: "/vendor-studio/media",
    },
    {
      key: "cards",
      label: "Three card photos",
      done: listing.cardPhotos.length >= 3,
      href: "/vendor-studio/media",
    },
    {
      key: "package",
      label: "At least one package or starting price",
      done: listing.packages.length > 0 || listing.startingPriceINR != null,
      href: "/vendor-studio/profile#pricing",
    },
    {
      key: "contact",
      label: "WhatsApp and email",
      done: Boolean(listing.contact.whatsapp && listing.contact.email),
      href: "/vendor-studio/profile#contact",
    },
  ];

  for (const field of requiredFields) {
    const value = listing.categoryValues[field.key];
    const done =
      value !== undefined &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0) &&
      value !== false;
    items.push({
      key: `cat-${field.key}`,
      label: field.label,
      done,
      href: "/vendor-studio/profile#category",
    });
  }

  if (listing.category === "venues") {
    items.push({
      key: "venue-spaces",
      label: "At least one venue space",
      done: Boolean(listing.venue?.spaceDetails?.length || listing.venue?.spaces?.length),
      href: "/vendor-studio/profile#venue",
    });
  }

  return items;
}

export function checklistProgress(items: ChecklistItem[]): { done: number; total: number; complete: boolean } {
  const done = items.filter((i) => i.done).length;
  return { done, total: items.length, complete: done === items.length && items.length > 0 };
}
