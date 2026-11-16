"use client";

import { useEffect, useRef, useState } from "react";
import { Field, ScreenHeader, inputClass, selectClass } from "@/components/studio/Field";
import { SaveState } from "@/components/studio/autosave";
import { ScreenSkeleton, TagListInput, useListingForm } from "@/components/studio/screen";
import type { Category, CategoryFieldDef, CategorySlug, VenueDetails } from "@/data/types";
import { listAllCategories } from "@/lib/api";
import { processPhotoFile } from "@/lib/upload";

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
      <div className="mt-8 grid gap-7">
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

        {/* Category-specific fields, generated from the definitions. */}
        {active && active.fields.length > 0 && (
          <div className="border-t border-line pt-7">
            <p className="label text-mute">{active.shortName} details</p>
            <div className="mt-4 grid gap-7">
              {active.fields.map((def) => (
                <CategoryFieldInput key={def.key} def={def} value={form.categoryValues[def.key]} onChange={(v) => setValue(def.key, v)} />
              ))}
            </div>
          </div>
        )}

        {/* Venues: capacity, spaces and the 360° tour. */}
        {form.category === "venues" && (
          <div className="border-t border-line pt-7">
            <p className="label text-mute">The venue</p>
            <div className="mt-4 grid gap-7">
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
              <TourEditor venue={venue} onChange={setVenue} />
            </div>
          </div>
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

/** The 360° tour: named spaces with an equirectangular image each. */
function TourEditor({ venue, onChange }: { venue: VenueDetails; onChange: (venue: VenueDetails) => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const tour = venue.tour ?? [];

  const relink = (nodes: NonNullable<VenueDetails["tour"]>) =>
    nodes.map((n) => ({ ...n, links: nodes.filter((o) => o.id !== n.id).map((o) => o.id) }));

  async function addNode(file: File) {
    const trimmed = name.trim();
    if (!trimmed) {
      setMessage("Name the space first (e.g. The courtyard).");
      return;
    }
    const result = await processPhotoFile(file);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(null);
    const id = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || `space-${tour.length + 1}`;
    const next = relink([...tour, { id, name: trimmed, panorama: result.photo.src, links: [] }]);
    onChange({ ...venue, tour: next });
    setName("");
  }

  return (
    <Field id="ve-tour" label="360° tour" hint="One wide (equirectangular) image per space. Couples step between them on your profile.">
      {tour.length > 0 && (
        <ul className="mb-3 border-t border-line bg-white">
          {tour.map((node) => (
            <li key={node.id} className="flex items-center justify-between gap-4 border-b border-line px-3 py-2.5 text-small">
              {node.name}
              <button
                type="button"
                onClick={() => onChange({ ...venue, tour: relink(tour.filter((n) => n.id !== node.id)) })}
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
          id="ve-tour"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Space name, e.g. The lawn"
          className={inputClass}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="label tap shrink-0 border border-line px-4 text-ink transition-chrome hover:border-ink"
        >
          Add image
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          aria-label="Upload a 360 image"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void addNode(file);
            e.target.value = "";
          }}
        />
      </div>
      {message && (
        <p className="mt-2 text-small text-ink" role="alert">
          {message}
        </p>
      )}
    </Field>
  );
}
