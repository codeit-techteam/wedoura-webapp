"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { FormSelect } from "@/components/ui/FormSelect";
import type { VendorIdType } from "@/data/types";
import { cn } from "@/lib/cn";
import {
  DOCUMENT_ACCEPT,
  DOCUMENT_MAX_BYTES,
  formatDocumentBytes,
  idTypeNeedsBack,
  validateDocumentFile,
  VENDOR_ID_TYPE_OPTIONS,
} from "@/lib/identity-document";

export type IdentityDraft = {
  type: VendorIdType;
  front: File | null;
  back: File | null;
  consent: boolean;
  consentAt?: string;
};

type Props = {
  value: IdentityDraft;
  onChange: (next: IdentityDraft) => void;
  errors?: Partial<Record<"type" | "front" | "back" | "consent", string>>;
  /** Hide the ID type select when re-uploading without changing type. */
  lockType?: boolean;
  className?: string;
};

function ImagePreview({ file }: { file: File }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="" className="h-full w-full object-cover" />;
}

function FileSlot({
  id,
  label,
  file,
  error,
  onPick,
  onClear,
}: {
  id: string;
  label: string;
  file: File | null;
  error?: string;
  onPick: (file: File) => void;
  onClear: () => void;
}) {
  const isPdf = Boolean(file && (file.type === "application/pdf" || /\.pdf$/i.test(file.name)));

  return (
    <div>
      <p className="label text-mute">{label}</p>
      <div className="mt-3 border border-line bg-white p-4">
        {file ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden bg-sand">
              {!isPdf ? (
                <ImagePreview file={file} />
              ) : (
                <span className="px-2 text-center text-small text-mute">PDF</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-body text-ink">{file.name}</p>
              <p className="mt-1 text-small text-mute">{formatDocumentBytes(file.size)}</p>
              <div className="mt-4 flex flex-wrap gap-4">
                <label className="tap cursor-pointer border-b border-gold pb-1 font-sans text-button font-medium tracking-[0.2em] uppercase">
                  Replace
                  <input
                    id={`${id}-replace`}
                    type="file"
                    accept={DOCUMENT_ACCEPT}
                    className="sr-only"
                    onChange={(e) => {
                      const next = e.target.files?.[0];
                      e.target.value = "";
                      if (next) onPick(next);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={onClear}
                  className="tap border-b border-line pb-1 font-sans text-button font-medium tracking-[0.2em] text-mute uppercase"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <label
            htmlFor={id}
            className="tap flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-line bg-ivory px-4 text-center"
          >
            <span className="font-sans text-button font-medium tracking-[0.2em] uppercase text-ink">
              Choose file
            </span>
            <span className="text-small text-mute">JPG, PNG or PDF · max {DOCUMENT_MAX_BYTES / (1024 * 1024)} MB</span>
            <input
              id={id}
              type="file"
              accept={DOCUMENT_ACCEPT}
              className="sr-only"
              onChange={(e) => {
                const next = e.target.files?.[0];
                e.target.value = "";
                if (next) onPick(next);
              }}
            />
          </label>
        )}
      </div>
      {error ? (
        <p className="mt-2 text-small text-ink" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Shared identity upload fields for signup and Settings re-upload.
 * Files stay in memory until submit stores them in IndexedDB.
 */
export function IdentityDocumentFields({ value, onChange, errors, lockType, className }: Props) {
  const baseId = useId();
  const needsBack = idTypeNeedsBack(value.type);
  const [localErrors, setLocalErrors] = useState<Partial<Record<"front" | "back", string>>>({});

  function setSide(side: "front" | "back", file: File | null) {
    if (!file) {
      setLocalErrors((e) => ({ ...e, [side]: undefined }));
      onChange({ ...value, [side]: null });
      return;
    }
    const err = validateDocumentFile(file);
    if (err) {
      setLocalErrors((e) => ({ ...e, [side]: err }));
      return;
    }
    setLocalErrors((e) => ({ ...e, [side]: undefined }));
    onChange({ ...value, [side]: file });
  }

  return (
    <div className={cn("grid gap-8", className)}>
      {!lockType ? (
        <div>
          <label htmlFor={`${baseId}-type`} className="label text-mute">
            ID type
          </label>
          <FormSelect
            id={`${baseId}-type`}
            value={value.type}
            options={VENDOR_ID_TYPE_OPTIONS}
            onChange={(type) => {
              const nextType = type as VendorIdType;
              onChange({
                ...value,
                type: nextType,
                back: idTypeNeedsBack(nextType) ? value.back : null,
              });
            }}
          />
          {errors?.type ? (
            <p className="mt-2 text-small text-ink" role="alert">
              {errors.type}
            </p>
          ) : null}
        </div>
      ) : null}

      {value.type === "masked_aadhaar" ? (
        <p className="max-w-prose text-small text-mute">
          Please upload a masked Aadhaar (only the last 4 digits visible). You can download one free from{" "}
          <a
            href="https://myaadhaar.uidai.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-gold pb-0.5 text-ink"
          >
            myaadhaar.uidai.gov.in
          </a>
          .
        </p>
      ) : null}

      <FileSlot
        id={`${baseId}-front`}
        label="Front"
        file={value.front}
        error={localErrors.front || errors?.front}
        onPick={(file) => setSide("front", file)}
        onClear={() => setSide("front", null)}
      />

      {needsBack ? (
        <FileSlot
          id={`${baseId}-back`}
          label="Back"
          file={value.back}
          error={localErrors.back || errors?.back}
          onPick={(file) => setSide("back", file)}
          onClear={() => setSide("back", null)}
        />
      ) : null}

      <label className="tap flex cursor-pointer items-start gap-3 py-1">
        <input
          type="checkbox"
          checked={value.consent}
          onChange={(e) =>
            onChange({
              ...value,
              consent: e.target.checked,
              consentAt: e.target.checked ? new Date().toISOString() : undefined,
            })
          }
          className="mt-1 size-4 shrink-0 accent-ink"
        />
        <span className="text-small text-mute">
          I agree that Wedoura may use this document only to verify my identity.
        </span>
      </label>
      {errors?.consent ? (
        <p className="-mt-6 text-small text-ink" role="alert">
          {errors.consent}
        </p>
      ) : null}
    </div>
  );
}
