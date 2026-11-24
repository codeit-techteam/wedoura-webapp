"use client";

import { Field, inputClass, selectClass } from "@/components/studio/Field";
import { TagListInput } from "@/components/studio/screen";
import type { CategoryFieldDef } from "@/data/types";

type Props = {
  field: CategoryFieldDef;
  value: string | string[] | number | boolean | undefined;
  onChange: (value: string | string[] | number | boolean | undefined) => void;
};

/** Renders one category-definition field (toggle, select, tags, number, text). */
export function CategoryFieldInput({ field, value, onChange }: Props) {
  const id = `cat-${field.key}`;

  if (field.input === "toggle") {
    return (
      <label className="tap flex cursor-pointer items-center gap-3 py-2">
        <input
          id={id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked || undefined)}
          className="size-4 accent-ink"
        />
        <span className="text-[length:var(--text-dash-body)] text-ink">{field.label}</span>
      </label>
    );
  }

  if (field.input === "select" && field.options) {
    return (
      <Field id={id} label={field.label}>
        <select
          id={id}
          className={selectClass}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value || undefined)}
        >
          <option value="">Not set</option>
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </Field>
    );
  }

  if (field.input === "multiselect") {
    const values = Array.isArray(value) ? value.map(String) : [];
    return (
      <Field id={id} label={field.label} hint={field.options?.length ? `Suggestions: ${field.options.join(", ")}` : undefined}>
        <TagListInput id={id} values={values} onChange={(next) => onChange(next.length ? next : undefined)} />
      </Field>
    );
  }

  if (field.input === "number") {
    return (
      <Field id={id} label={field.label}>
        <input
          id={id}
          className={inputClass}
          inputMode="numeric"
          value={typeof value === "number" ? String(value) : typeof value === "string" ? value : ""}
          onChange={(e) => {
            const raw = e.target.value;
            if (!raw.trim()) onChange(undefined);
            else if (/^\d+$/.test(raw)) onChange(Number(raw));
            else onChange(raw);
          }}
        />
      </Field>
    );
  }

  return (
    <Field id={id} label={field.label}>
      <input
        id={id}
        className={inputClass}
        value={typeof value === "string" || typeof value === "number" ? String(value) : ""}
        onChange={(e) => onChange(e.target.value.trim() || undefined)}
      />
    </Field>
  );
}
