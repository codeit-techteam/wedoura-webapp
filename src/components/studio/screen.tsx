"use client";

import { useEffect, useRef, useState } from "react";
import { inputClass } from "@/components/studio/Field";
import { useListingAutosave } from "@/components/studio/autosave";
import { Skeleton } from "@/components/ui/Skeleton";
import type { VendorListing } from "@/data/types";
import { useMyListing } from "@/lib/vendor-api";

/**
 * The screen pattern: local form state seeded once from the listing, edits
 * applied locally and queued through autosave.
 */
export function useListingForm<T>(pick: (listing: VendorListing) => T) {
  const listing = useMyListing();
  const [form, setFormState] = useState<T | null>(null);
  const seeded = useRef(false);
  const pickRef = useRef(pick);

  useEffect(() => {
    pickRef.current = pick;
  });

  useEffect(() => {
    if (listing && !seeded.current) {
      seeded.current = true;
      setFormState(pickRef.current(listing));
    }
  }, [listing]);

  const autosave = useListingAutosave();

  /** Update local state and queue the matching listing patch in one go. */
  const apply = (next: Partial<T>, patch: Partial<VendorListing>) => {
    setFormState((f) => (f === null ? f : { ...f, ...next }));
    autosave.schedule(patch);
  };

  return { listing, form, setForm: setFormState, apply, ...autosave };
}

/** Quiet placeholder while the store hydrates. */
export function ScreenSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <Skeleton className="h-9 w-1/3" />
      <Skeleton className="h-28 w-full" />
      <Skeleton className="h-28 w-3/4" />
    </div>
  );
}

/** Chips with an add input: services, styles, venue spaces. */
export function TagListInput({
  id,
  values,
  onChange,
  placeholder,
}: {
  id: string;
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const value = draft.trim();
    if (!value || values.includes(value)) return;
    onChange([...values, value]);
    setDraft("");
  };
  return (
    <div>
      {values.length > 0 && (
        <ul className="mb-2 flex flex-wrap gap-2">
          {values.map((value) => (
            <li key={value} className="flex items-center gap-2 border border-line bg-white px-3 py-1.5 text-small">
              {value}
              <button
                type="button"
                onClick={() => onChange(values.filter((v) => v !== value))}
                aria-label={`Remove ${value}`}
                className="text-mute transition-chrome hover:text-ink"
              >
                ×
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
          placeholder={placeholder}
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
    </div>
  );
}

/** Up/down reorder buttons used by list editors. */
export function ReorderButtons({
  index,
  total,
  onMove,
  label,
}: {
  index: number;
  total: number;
  onMove: (from: number, to: number) => void;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onMove(index, index - 1)}
        disabled={index === 0}
        aria-label={`Move ${label} up`}
        className="tap inline-flex items-center justify-center text-mute transition-chrome hover:text-ink disabled:opacity-30"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() => onMove(index, index + 1)}
        disabled={index === total - 1}
        aria-label={`Move ${label} down`}
        className="tap inline-flex items-center justify-center text-mute transition-chrome hover:text-ink disabled:opacity-30"
      >
        ↓
      </button>
    </span>
  );
}

export function moveItem<T>(list: T[], from: number, to: number): T[] {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
