import type { PriceUnit } from "@/data/types";

const UNIT_LABEL: Record<PriceUnit, string> = {
  per_event: "per event",
  per_day: "per day",
  per_plate: "per plate",
  on_request: "",
};

/** "₹1,50,000" in the Indian grouping. */
export function formatINR(amount: number): string {
  return `₹${new Intl.NumberFormat("en-IN").format(amount)}`;
}

/** "4:32" or "1:04:08" from a duration in seconds. */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * The one way a price is written: "From ₹1,50,000 per event",
 * "₹2,200 per plate", or "On request".
 */
export function formatPrice(priceINR: number | undefined, unit: PriceUnit): string {
  if (unit === "on_request" || priceINR === undefined) return "On request";
  const base = `${formatINR(priceINR)} ${UNIT_LABEL[unit]}`;
  // Per-plate prices are exact; the others are starting points.
  return unit === "per_plate" ? base : `From ${base}`;
}

/**
 * Compact homepage card price: "From ₹1.5L", "From ₹85,000", or "On request".
 * No unit — the Popular vendors reference shows lakhs only.
 */
export function formatPriceLakh(priceINR: number | undefined, unit: PriceUnit): string {
  if (unit === "on_request" || priceINR === undefined) return "On request";
  if (priceINR >= 100_000) {
    const lakh = priceINR / 100_000;
    const label = Number.parseFloat(lakh.toFixed(1)).toString();
    return `From ₹${label}L`;
  }
  return `From ${formatINR(priceINR)}`;
}
