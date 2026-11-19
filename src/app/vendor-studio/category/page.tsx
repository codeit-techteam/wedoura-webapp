"use client";

import { useEffect, useState } from "react";
import { Field, ScreenHeader, StudioCard, inputClass, selectClass } from "@/components/studio/Field";
import { SaveState } from "@/components/studio/autosave";
import { ScreenSkeleton, TagListInput, useListingForm } from "@/components/studio/screen";
import type { Category, CategoryFieldDef, CategorySlug, VenueDetails } from "@/data/types";
import { listAllCategories } from "@/lib/api";

type Form = {
  category: CategorySlug;
  services: string[];
  styles: string[];
  categoryValues: Record<string, string | string[] | number | boolean>;
  venue?: VenueDetails;
};

export default function CategoryPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    void listAllCategories().then(setCategories);
  }, []);

  const { form, apply, status, error } = useListingForm<Form>((l) => ({
    category: l.category,
    services: l.services,
    styles: l.styles,
    categoryValues: l.categoryValues,
    venue: l.venue,
  }));
  if (!form || categories.length === 0) return <ScreenSkeleton />;

  const active = categories.find((c) => c.slug === form.category);

  const setValue = (key: string, value: string | string[] | number | boolean | undefined) => {
    const categoryValues = { ...form.categoryValues };
    if (value === undefined || value === "") delete categoryValues[key];
    else categoryValues[key] = value;
    apply({ categoryValues }, { categoryValues });
  };

  const setVenue = (venue: VenueDetails | undefined) => apply({ venue }, { venue });
  const venue: VenueDetails = form.venue ?? { capacity: { min: 50, max: 200 }, spaces: [] };

  return (
    <div className="max-w-2xl">
      <ScreenHeader
        title="Category & services"
        text="Your main category drives the filters couples use; each category asks its own questions."
        right={<SaveState status={status} error={error} />}
      />
      <div className="mt-8 grid gap-6">
        <StudioCard title="Category">
        <Field id="ca-category" label="Main category">
          <select
            id="ca-category"
            value={form.category}
            onChange={(e) => {
              const category = e.target.value as CategorySlug;
              // Category values belong to the category that defined them.
              apply({ category, categoryValues: {} }, { category, categoryValues: {} });
            }}
            className={selectClass}
          >
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        </StudioCard>

        <StudioCard title="Services & styles">
        <div className="grid gap-6">
        <Field id="ca-services" label="Services" hint="What you offer, shown on your profile.">
          <TagListInput
            id="ca-services"
            values={form.services}
            onChange={(services) => apply({ services }, { services })}
            placeholder="e.g. Wedding photography"
          />
        </Field>

        <Field id="ca-styles" label="Styles" hint="Short words couples recognise, e.g. Editorial, Candid.">
          <TagListInput id="ca-styles" values={form.styles} onChange={(styles) => apply({ styles }, { styles })} placeholder="e.g. Editorial" />
        </Field>
        </div>
        </StudioCard>

        {/* Category-specific fields, generated from the definitions. */}
        {active && active.fields.length > 0 && (
          <StudioCard title={`${active.shortName} details`} text="Each category asks its own questions; these drive the filters couples use.">
            <div className="grid gap-6">
              {active.fields.map((def) => (
                <CategoryFieldInput key={def.key} def={def} value={form.categoryValues[def.key]} onChange={(v) => setValue(def.key, v)} />
              ))}
            </div>
          </StudioCard>
        )}

        {/* Venues: capacity, spaces and the 360° tour. */}
        {form.category === "venues" && (
          <StudioCard title="The venue">
            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-5">
                <Field id="ve-min" label="Capacity, from">
                  <input
                    id="ve-min"
                    type="number"
                    min={1}
                    value={venue.capacity.min}
                    onChange={(e) => setVenue({ ...venue, capacity: { ...venue.capacity, min: Number(e.target.value) || 0 } })}
                    className={inputClass}
                  />
                </Field>
                <Field id="ve-max" label="to">
                  <input
                    id="ve-max"
                    type="number"
                    min={1}
                    value={venue.capacity.max}
                    onChange={(e) => setVenue({ ...venue, capacity: { ...venue.capacity, max: Number(e.target.value) || 0 } })}
                    className={inputClass}
                  />
                </Field>
              </div>
              <Field id="ve-spaces" label="Spaces" hint="The areas couples can book, e.g. Sea lawn, Inner courtyard.">
                <TagListInput id="ve-spaces" values={venue.spaces} onChange={(spaces) => setVenue({ ...venue, spaces })} placeholder="e.g. Main courtyard" />
              </Field>
              <p className="text-small text-mute">
                The 360° walk-through is built on its own screen: upload 360° photos under Photos, then link them
                under 360 tour.
              </p>
            </div>
          </StudioCard>
        )}
      </div>
    </div>
  );
}

function CategoryFieldInput({
  def,
  value,
  onChange,
}: {
  def: CategoryFieldDef;
  value: string | string[] | number | boolean | undefined;
  onChange: (value: string | string[] | number | boolean | undefined) => void;
}) {
  const id = `cf-${def.key}`;
  if (def.input === "select") {
    return (
      <Field id={id} label={def.label}>
        <select id={id} value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value || undefined)} className={selectClass}>
          <option value="">Choose one</option>
          {(def.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </Field>
    );
  }
  if (def.input === "multiselect") {
    const current = Array.isArray(value) ? value : [];
    return (
      <Field id={id} label={def.label}>
        <ul className="grid grid-cols-2 gap-2">
          {(def.options ?? []).map((o) => (
            <li key={o}>
              <label className="tap flex cursor-pointer items-center gap-2.5 border border-line bg-white px-3 py-2.5 text-small has-checked:border-ink">
                <input
                  type="checkbox"
                  checked={current.includes(o)}
                  onChange={() => onChange(current.includes(o) ? current.filter((v) => v !== o) : [...current, o])}
                  className="size-4 accent-ink"
                />
                {o}
              </label>
            </li>
          ))}
        </ul>
      </Field>
    );
  }
  if (def.input === "number") {
    return (
      <Field id={id} label={def.label}>
        <input
          id={id}
          type="number"
          value={typeof value === "number" ? value : ""}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
          className={inputClass}
        />
      </Field>
    );
  }
  if (def.input === "toggle") {
    return (
      <label className="tap flex cursor-pointer items-center gap-3 text-body">
        <input id={id} type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-ink" />
        {def.label}
      </label>
    );
  }
  return (
    <Field id={id} label={def.label}>
      <input id={id} type="text" value={typeof value === "string" ? value : ""} onChange={(e) => onChange(e.target.value || undefined)} className={inputClass} />
    </Field>
  );
}

