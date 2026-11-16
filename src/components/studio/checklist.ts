import type { VendorListing } from "@/data/types";

export interface ChecklistItem {
  key: string;
  label: string;
  done: boolean;
  href: string;
}

/** What a complete profile needs before it can be submitted for review. */
export function computeChecklist(listing: VendorListing): ChecklistItem[] {
  return [
    {
      key: "category",
      label: "Category and base city",
      done: Boolean(listing.category && listing.baseCity),
      href: "/vendor-studio/category",
    },
    { key: "about", label: "About text", done: listing.about.length > 0, href: "/vendor-studio/business" },
    {
      key: "portfolio",
      label: "12 portfolio photographs",
      done: listing.portfolio.length >= 12,
      href: "/vendor-studio/photos",
    },
    { key: "cover", label: "Cover photo", done: Boolean(listing.cover), href: "/vendor-studio/covers" },
    {
      key: "cards",
      label: "Three card photos",
      done: listing.cardPhotos.length >= 3,
      href: "/vendor-studio/covers",
    },
    { key: "package", label: "At least one package", done: listing.packages.length > 0, href: "/vendor-studio/pricing" },
    {
      key: "contact",
      label: "Contact details (WhatsApp and email)",
      done: Boolean(listing.contact.whatsapp && listing.contact.email),
      href: "/vendor-studio/contact",
    },
  ];
}

export function checklistProgress(items: ChecklistItem[]): { done: number; total: number; complete: boolean } {
  const done = items.filter((i) => i.done).length;
  return { done, total: items.length, complete: done === items.length };
}
