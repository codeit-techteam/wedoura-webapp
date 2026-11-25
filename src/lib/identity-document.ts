import type { VendorIdType } from "@/data/types";

export const VENDOR_ID_TYPE_OPTIONS: { value: VendorIdType; label: string }[] = [
  { value: "masked_aadhaar", label: "Masked Aadhaar" },
  { value: "pan", label: "PAN card" },
  { value: "voter_id", label: "Voter ID" },
  { value: "passport", label: "Passport" },
  { value: "driving_licence", label: "Driving licence" },
];

export const VENDOR_ID_TYPE_LABEL: Record<VendorIdType, string> = {
  masked_aadhaar: "Masked Aadhaar",
  pan: "PAN card",
  voter_id: "Voter ID",
  passport: "Passport",
  driving_licence: "Driving licence",
};

/** Aadhaar and Voter ID need both sides; others are front only. */
export function idTypeNeedsBack(type: VendorIdType): boolean {
  return type === "masked_aadhaar" || type === "voter_id";
}

export const DOCUMENT_MAX_BYTES = 5 * 1024 * 1024;
export const DOCUMENT_ACCEPT = "image/jpeg,image/png,application/pdf,.jpg,.jpeg,.png,.pdf";

export function validateDocumentFile(file: File): string | null {
  const okType =
    file.type === "image/jpeg" ||
    file.type === "image/png" ||
    file.type === "application/pdf" ||
    /\.(jpe?g|png|pdf)$/i.test(file.name);
  if (!okType) return "Use a JPG, PNG or PDF file.";
  if (file.size > DOCUMENT_MAX_BYTES) return "Each file must be 5 MB or smaller.";
  return null;
}

export function formatDocumentBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}
