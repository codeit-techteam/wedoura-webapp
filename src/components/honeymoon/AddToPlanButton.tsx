"use client";

import { togglePlan, usePlan } from "@/lib/honeymoon-plan";

type Props = {
  slug: string;
  name: string;
  priceFromINR?: number;
};

/** "Add to my plan" toggle on an experience card (landing page). */
export function AddToPlanButton({ slug, name, priceFromINR }: Props) {
  const plan = usePlan();
  const on = plan.some((i) => i.slug === slug);
  return (
    <button
      type="button"
      className={`ad${on ? " on" : ""}`}
      aria-pressed={on}
      onClick={() => togglePlan({ slug, name, priceFromINR })}
    >
      {on ? "Added" : "Add to my plan"}
    </button>
  );
}
