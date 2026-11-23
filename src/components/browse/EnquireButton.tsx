"use client";

import { cn } from "@/lib/cn";
import { useEnquiry } from "./enquiry-context";

interface Props {
  slug: string;
  name: string;
  variant?: "outline" | "solid";
  className?: string;
}

/** Small "Enquire" button on list cards that opens the EnquiryDrawer.
 *  Requires VendorsChrome to be an ancestor. */
export function EnquireButton({ slug, name, variant = "outline", className }: Props) {
  const { openEnquiry } = useEnquiry();
  return (
    <button
      type="button"
      onClick={() => openEnquiry({ slug, name })}
      className={cn(
        "tap inline-flex min-h-11 items-center justify-center font-sans text-button font-medium tracking-button uppercase transition-chrome",
        variant === "solid"
          ? "bg-ink px-6 text-ivory hover:bg-gold-deep"
          : "border border-ink px-5 text-ink hover:bg-ink hover:text-ivory",
        className,
      )}
    >
      Enquire
    </button>
  );
}
