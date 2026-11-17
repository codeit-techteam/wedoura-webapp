"use client";

import { useState } from "react";
import { Field, ScreenHeader, StudioCard, inputClass, selectClass } from "@/components/studio/Field";
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

/** The per-package "what's included" bullets: add a line, remove, reorder. */
function InclusionsEditor({
  packageIndex,
  inclusions,
  onChange,
}: {
  packageIndex: number;
  inclusions: string[];
  onChange: (inclusions: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const id = `pk-incl-${packageIndex}`;

  const add = () => {
    const line = draft.trim();
    if (!line || inclusions.includes(line)) return;
    onChange([...inclusions, line]);
    setDraft("");
  };

  return (
    <Field
      id={id}
      label="What's included"
      hint="One line per item; couples see these as a check list on the package."
    >
      {inclusions.length > 0 && (
        <ul className="mb-3 divide-y divide-line border border-line" aria-label="Included in this package">
          {inclusions.map((line, i) => (
            <li key={`${line}-${i}`} className="flex items-center gap-3 px-3 py-2">
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-gold" />
              <span className="min-w-0 flex-1 text-small text-ink">{line}</span>
              <ReorderButtons
                index={i}
                total={inclusions.length}
                onMove={(from, to) => onChange(moveItem(inclusions, from, to))}
                label={line}
              />
              <button
                type="button"
                onClick={() => onChange(inclusions.filter((_, j) => j !== i))}
                aria-label={`Remove “${line}”`}
                className="label tap px-2 text-mute transition-chrome hover:text-ink"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <input
          id={id}
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="e.g. Two photographers for the full day"
          className={inputClass}
        />
        <button
          type="button"
          onClick={add}
          className="label tap shrink-0 border border-line px-4 text-ink transition-chrome hover:border-ink"
        >
          Add
        </button>
      </div>
    </Field>
  );
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
        text="Packages are shown as cards on your profile; the starting price appears on your card in lists."
        right={<SaveState status={status} error={error} />}
      />

      {form.packages.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No packages yet."
            text="One clear starting package is enough to go live. Name it, price it, and list what's included."
            action={{ label: "Add a package", onClick: add }}
            tone="white"
            className="border border-line"
          />
        </div>
      ) : (
        <ul className="mt-8 grid gap-6">
          {form.packages.map((pkg, i) => (
            <li key={i}>
              <StudioCard
                title={`Package ${i + 1}`}
                right={
                  <span className="flex items-center gap-2">
                    <ReorderButtons
                      index={i}
                      total={form.packages.length}
                      onMove={(f, t) => savePackages(moveItem(form.packages, f, t))}
                      label={pkg.label || "package"}
                    />
                    <button
                      type="button"
                      onClick={() => savePackages(form.packages.filter((_, j) => j !== i))}
                      className="label tap px-2 text-mute transition-chrome hover:text-ink"
                    >
                      Delete
                    </button>
                  </span>
                }
              >
                <div className="grid gap-5">
                  <Field
                    id={`pk-label-${i}`}
                    label="Package name"
                    error={pkg.label.trim() ? undefined : "Give the package a name."}
                  >
                    <input
                      id={`pk-label-${i}`}
                      type="text"
                      value={pkg.label}
                      onChange={(e) => update(i, { label: e.target.value })}
                      placeholder="e.g. One day, photography"
                      className={inputClass}
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field id={`pk-price-${i}`} label="Price, ₹">
                      <input
                        id={`pk-price-${i}`}
                        type="number"
                        min={0}
                        value={pkg.priceINR ?? ""}
                        disabled={pkg.unit === "on_request"}
                        onChange={(e) =>
                          update(i, { priceINR: e.target.value === "" ? undefined : Number(e.target.value) })
                        }
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
                  <Field
                    id={`pk-note-${i}`}
                    label="One-line summary"
                    hint="Shown under the package name, e.g. “Two photographers, edited gallery”."
                  >
                    <input
                      id={`pk-note-${i}`}
                      type="text"
                      value={pkg.note ?? ""}
                      onChange={(e) => update(i, { note: e.target.value || undefined })}
                      className={inputClass}
                    />
                  </Field>
                  <InclusionsEditor
                    packageIndex={i}
                    inclusions={pkg.inclusions ?? []}
                    onChange={(list) => update(i, { inclusions: list.length > 0 ? list : undefined })}
                  />
                  <p className="border-t border-line pt-3 text-small text-mute">
                    Shown as: {formatPrice(pkg.priceINR, pkg.unit)}
                  </p>
                </div>
              </StudioCard>
            </li>
          ))}
        </ul>
      )}

      {form.packages.length > 0 && (
        <button
          type="button"
          onClick={add}
          className="label tap mt-6 border border-ink px-5 py-2.5 text-ink transition-chrome hover:bg-ink hover:text-white"
        >
          Add a package
        </button>
      )}

      {/* Starting price */}
      <div className="mt-8">
        <StudioCard title="Starting price on your card">
          <label className="tap flex cursor-pointer items-center gap-3 text-body">
            <input
              type="checkbox"
              checked={derive}
              onChange={(e) => {
                setDerive(e.target.checked);
                if (e.target.checked) {
                  const low = cheapest(form.packages);
                  apply(
                    { startingPriceINR: low.priceINR, priceUnit: low.unit },
                    { startingPriceINR: low.priceINR, priceUnit: low.unit },
                  );
                }
              }}
              className="size-4 accent-ink"
            />
            Use the lowest package automatically
          </label>
          {!derive && (
            <div className="mt-5 grid grid-cols-2 gap-4">
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
          <p className="mt-5 border-t border-line pt-3 text-small text-mute">
            Couples see: {formatPrice(form.startingPriceINR, form.priceUnit)}
          </p>
        </StudioCard>
      </div>
    </div>
  );
}
