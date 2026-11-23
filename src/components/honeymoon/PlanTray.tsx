"use client";

import { clearPlan, usePlan } from "@/lib/honeymoon-plan";
import { formatINR } from "@/lib/format";

/**
 * The fixed plan tray: appears once at least one moment is in the plan,
 * counts the picks and links to the planning form.
 */
export function PlanTray() {
  const plan = usePlan();
  const total = plan.reduce((sum, item) => sum + (item.priceFromINR ?? 0), 0);
  return (
    <div className={`hm-tray${plan.length > 0 ? " on" : ""}`} role="status" aria-live="polite">
      <span>
        <b>{plan.length}</b> {plan.length === 1 ? "moment" : "moments"} in your plan
        {total > 0 && (
          <>
            {" "}
            · from <b>{formatINR(total)}</b>
          </>
        )}
      </span>
      <button type="button" className="tx" onClick={clearPlan}>
        Clear
      </button>
      <a href="#plan">Send to planner</a>
    </div>
  );
}
