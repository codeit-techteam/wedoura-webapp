"use client";

import { useState } from "react";
import { Field, ScreenHeader, inputClass, selectClass } from "@/components/studio/Field";
import { SaveState } from "@/components/studio/autosave";
import { ReorderButtons, ScreenSkeleton, moveItem, useListingForm } from "@/components/studio/screen";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Package, PriceUnit, VendorListing } from "@/data/types";
import { formatPrice } from "@/lib/format";

const UNITS: { value: PriceUnit; label: string }[] = [
  { value: "per_event", label: "Per event" },
  { value: "per_day", label: "Per day" },
  { value: "per_plate", label: "Per plate" },
  { value: "on_request", label: "On request" },
];

type Form = { packages: Package[]; startingPriceINR?: number; priceUnit: PriceUnit };

/** The cheapest priced package, for the derived starting price. */
function cheapest(packages: Package[]): { priceINR?: number; unit: PriceUnit } {
  const priced = packages.filter((p) => p.unit !== "on_request" && p.priceINR !== undefined);
  if (priced.length === 0) return { unit: "on_request" };
  const low = priced.reduce((a, b) => ((a.priceINR ?? 0) <= (b.priceINR ?? 0) ? a : b));
  return { priceINR: low.priceINR, unit: low.unit };
}

export default function PricingPage() {
  const { form, apply, status, error } = useListingForm<Form>((l) => ({
    packages: l.packages,
    startingPriceINR: l.startingPriceINR,
    priceUnit: l.priceUnit,
  }));
  const [derive, setDerive] = useState(true);
  if (!form) return <ScreenSkeleton />;

  const savePackages = (packages: Package[]) => {
    const patch: Partial<VendorListing> = { packages };
    let next: Partial<Form> = { packages };
    if (derive) {
      const low = cheapest(packages);
      patch.startingPriceINR = low.priceINR;
      patch.priceUnit = low.unit;
      next = { ...next, startingPriceINR: low.priceINR, priceUnit: low.unit };
    }
    apply(next, patch);
  };

  const update = (index: number, patch: Partial<Package>) =>
    savePackages(form.packages.map((p, i) => (i === index ? { ...p, ...patch } : p)));

  const add = () => savePackages([...form.packages, { label: "", unit: "per_event" }]);

  return (
    <div className="max-w-3xl">
      <ScreenHeader
        title="Pricing"
        text="Packages are shown as three cards on your profile; the starting price appears on your card in lists."
        right={<SaveState status={status} error={error} />}
      />

      {form.packages.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No packages yet." text="One clear starting package is enough to go live." action={{ label: "Add a package", onClick: add }} tone="white" />
        </div>
      ) : (
        <ul className="mt-8 grid gap-4">
          {form.packages.map((pkg, i) => (
            <li key={i} className="grid gap-4 border border-line bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <Field id={`pk-label-${i}`} label="Package name" className="min-w-0 flex-1">
                  <input id={`pk-label-${i}`} type="text" value={pkg.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="e.g. One day, photography" className={inputClass} />
                </Field>
                <div className="flex shrink-0 items-center gap-2 pt-7">
                  <ReorderButtons index={i} total={form.packages.length} onMove={(f, t) => savePackages(moveItem(form.packages, f, t))} label={pkg.label || "package"} />
                  <button type="button" onClick={() => savePackages(form.packages.filter((_, j) => j !== i))} className="label tap px-2 text-mute transition-chrome hover:text-ink">
                    Delete
                  </button>
                </div>
              </div>
              <Field id={`pk-note-${i}`} label="What is included" hint="One short line, e.g. “Two photographers, edited gallery”.">
                <input id={`pk-note-${i}`} type="text" value={pkg.note ?? ""} onChange={(e) => update(i, { note: e.target.value || undefined })} className={inputClass} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field id={`pk-price-${i}`} label="Price, ₹">
                  <input
                    id={`pk-price-${i}`}
                    type="number"
                    min={0}
                    value={pkg.priceINR ?? ""}
                    disabled={pkg.unit === "on_request"}
                    onChange={(e) => update(i, { priceINR: e.target.value === "" ? undefined : Number(e.target.value) })}
                    className={inputClass + " disabled:opacity-40"}
                  />
                </Field>
                <Field id={`pk-unit-${i}`} label="Unit">
                  <select
                    id={`pk-unit-${i}`}
                    value={pkg.unit}
                    onChange={(e) => {
                      const unit = e.target.value as PriceUnit;
                      update(i, { unit, priceINR: unit === "on_request" ? undefined : pkg.priceINR });
                    }}
                    className={selectClass}
                  >
                    {UNITS.map((u) => (
                      <option key={u.value} value={u.value}>
                        {u.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <p className="text-small text-mute">Shown as: {formatPrice(pkg.priceINR, pkg.unit)}</p>
            </li>
          ))}
        </ul>
      )}

      {form.packages.length > 0 && (
        <button type="button" onClick={add} className="label tap mt-5 border border-ink px-5 py-2.5 text-ink transition-chrome hover:bg-ink hover:text-white">
          Add a package
        </button>
      )}

      {/* Starting price */}
      <div className="mt-10 border border-line bg-white p-5">
        <p className="label text-mute">Starting price on your card</p>
        <label className="tap mt-3 flex cursor-pointer items-center gap-3 text-body">
          <input
            type="checkbox"
            checked={derive}
            onChange={(e) => {
              setDerive(e.target.checked);
              if (e.target.checked) {
                const low = cheapest(form.packages);
                apply({ startingPriceINR: low.priceINR, priceUnit: low.unit }, { startingPriceINR: low.priceINR, priceUnit: low.unit });
              }
            }}
            className="size-4 accent-ink"
          />
          Use the lowest package automatically
        </label>
        {!derive && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <Field id="sp-price" label="Starting price, ₹">
              <input
                id="sp-price"
                type="number"
                min={0}
                value={form.startingPriceINR ?? ""}
                onChange={(e) => {
                  const startingPriceINR = e.target.value === "" ? undefined : Number(e.target.value);
                  apply({ startingPriceINR }, { startingPriceINR });
                }}
                className={inputClass}
              />
            </Field>
            <Field id="sp-unit" label="Unit">
              <select
                id="sp-unit"
                value={form.priceUnit}
                onChange={(e) => {
                  const priceUnit = e.target.value as PriceUnit;
                  apply({ priceUnit }, { priceUnit });
                }}
                className={selectClass}
              >
                {UNITS.map((u) => (
                  <option key={u.value} value={u.value}>
                    {u.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        )}
        <p className="mt-4 text-small text-mute">Couples see: {formatPrice(form.startingPriceINR, form.priceUnit)}</p>
      </div>
    </div>
  );
}
