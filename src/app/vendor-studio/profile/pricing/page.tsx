"use client";

import { useState } from "react";
import { Field, inputClass, selectClass } from "@/components/studio/Field";
import { RepeatableList } from "@/components/studio/RepeatableList";
import { SectionCard } from "@/components/studio/SectionCard";
import { StudioDrawer } from "@/components/studio/StudioDrawer";
import { ScreenSkeleton, useListingForm } from "@/components/studio/screen";
import type { Package, PriceUnit } from "@/data/types";
import { formatPrice } from "@/lib/format";
import { publicProfileHref } from "@/lib/studio-profile-nav";

type Form = {
  startingPriceINR: string;
  priceUnit: PriceUnit;
  packages: Package[];
};

const emptyPackage = (unit: PriceUnit): Package => ({
  label: "New collection",
  priceINR: undefined,
  unit,
  note: "",
  inclusions: [],
});

export default function ProfilePricingPage() {
  const { listing, form, apply } = useListingForm<Form>((l) => ({
    startingPriceINR: l.startingPriceINR != null ? String(l.startingPriceINR) : "",
    priceUnit: l.priceUnit,
    packages: l.packages,
  }));

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Package | null>(null);
  const [inclusionsText, setInclusionsText] = useState("");

  if (!form || !listing) return <ScreenSkeleton />;

  function openEdit(index: number) {
    const pkg = form!.packages[index];
    setDraft({ ...pkg });
    setInclusionsText((pkg.inclusions ?? []).join("\n"));
    setEditIndex(index);
  }

  function openAdd() {
    setDraft(emptyPackage(form!.priceUnit));
    setInclusionsText("");
    setEditIndex(-1);
  }

  function closeDrawer() {
    setEditIndex(null);
    setDraft(null);
  }

  function saveDrawer() {
    if (!draft || editIndex === null) return;
    const inclusions = inclusionsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const pkg: Package = { ...draft, inclusions: inclusions.length ? inclusions : undefined };
    const packages =
      editIndex === -1
        ? [...form!.packages, pkg]
        : form!.packages.map((p, i) => (i === editIndex ? pkg : p));
    apply({ packages }, { packages });
    closeDrawer();
  }

  return (
    <SectionCard
      title="Pricing"
      help="Starting price and collections couples can book from."
      shownOnProfile={listing.packages.length > 0 || listing.startingPriceINR != null}
      seeOnProfileHref={publicProfileHref(listing, "pricing")}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Field id="pf-price" label="Starting price (INR)">
          <input
            id="pf-price"
            className={inputClass}
            inputMode="numeric"
            value={form.startingPriceINR}
            onChange={(e) => {
              const startingPriceINR = e.target.value;
              apply(
                { startingPriceINR },
                { startingPriceINR: /^\d+$/.test(startingPriceINR) ? Number(startingPriceINR) : undefined },
              );
            }}
          />
        </Field>
        <Field id="pf-unit" label="Priced per">
          <select
            id="pf-unit"
            className={selectClass}
            value={form.priceUnit}
            onChange={(e) =>
              apply({ priceUnit: e.target.value as PriceUnit }, { priceUnit: e.target.value as PriceUnit })
            }
          >
            <option value="per_event">Event</option>
            <option value="per_day">Day</option>
            <option value="per_plate">Guest</option>
            <option value="on_request">On request</option>
          </select>
        </Field>
      </div>

      <div className="mt-8">
        <p className="label text-mute">Collections</p>
        <RepeatableList
          items={form.packages}
          getId={(pkg, i) => `pkg-${i}-${pkg.label}`}
          onReorder={(packages) => apply({ packages }, { packages })}
          onDelete={(index) => {
            const packages = form.packages.filter((_, i) => i !== index);
            apply({ packages }, { packages });
          }}
          onUndoDelete={(item, index) => {
            const packages = [...form.packages];
            packages.splice(index, 0, item);
            apply({ packages }, { packages });
          }}
          renderRow={(pkg) => (
            <div>
              <p className="font-serif text-h4 text-ink">{pkg.label || "Untitled collection"}</p>
              <p className="mt-1 text-[length:var(--text-dash-help)] text-mute">
                {pkg.priceINR != null ? formatPrice(pkg.priceINR, pkg.unit) : "Price on request"}
                {pkg.featured ? " · Most booked" : ""}
              </p>
            </div>
          )}
          onEdit={(_, index) => openEdit(index)}
          addLabel="+ Add collection"
          onAdd={openAdd}
          emptyTitle="No collections yet"
        />
      </div>

      <StudioDrawer
        title={editIndex === -1 ? "Add collection" : "Edit collection"}
        open={editIndex !== null && draft !== null}
        onClose={closeDrawer}
        footer={
          <button type="button" className="studio-btn bg-ink text-ivory" onClick={saveDrawer}>
            Save collection
          </button>
        }
      >
        {draft ? (
          <div className="grid gap-4">
            <Field id="pkg-label" label="Name">
              <input
                id="pkg-label"
                className={inputClass}
                value={draft.label}
                onChange={(e) => setDraft({ ...draft, label: e.target.value })}
              />
            </Field>
            <Field id="pkg-price" label="Price (INR)">
              <input
                id="pkg-price"
                className={inputClass}
                inputMode="numeric"
                value={draft.priceINR ?? ""}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    priceINR: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
              />
            </Field>
            <Field id="pkg-unit" label="Priced per">
              <select
                id="pkg-unit"
                className={selectClass}
                value={draft.unit}
                onChange={(e) => setDraft({ ...draft, unit: e.target.value as PriceUnit })}
              >
                <option value="per_event">Event</option>
                <option value="per_day">Day</option>
                <option value="per_plate">Guest</option>
                <option value="on_request">On request</option>
              </select>
            </Field>
            <Field id="pkg-note" label="Note">
              <input
                id="pkg-note"
                className={inputClass}
                value={draft.note ?? ""}
                onChange={(e) => setDraft({ ...draft, note: e.target.value })}
              />
            </Field>
            <Field id="pkg-incl" label="Inclusions" hint="One line each.">
              <textarea
                id="pkg-incl"
                rows={4}
                className={inputClass + " resize-y"}
                value={inclusionsText}
                onChange={(e) => setInclusionsText(e.target.value)}
              />
            </Field>
            <label className="flex items-center gap-2 text-small text-ink">
              <input
                type="checkbox"
                checked={Boolean(draft.featured)}
                onChange={(e) => setDraft({ ...draft, featured: e.target.checked })}
              />
              Mark as most booked
            </label>
          </div>
        ) : null}
      </StudioDrawer>
    </SectionCard>
  );
}