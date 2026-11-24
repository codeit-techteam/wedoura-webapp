import type {
  Inquiry,
  InquiryCloseReason,
  InquirySource,
  InquiryStatus,
} from "@/data/types";

export const INQUIRY_STATUS_LABEL: Record<InquiryStatus, string> = {
  new: "New",
  replied: "Replied",
  booked: "Booked",
  closed: "Closed",
};

export const INQUIRY_CLOSE_LABEL: Record<InquiryCloseReason, string> = {
  not_available: "Not available",
  budget: "Budget",
  no_response: "No response",
  booked_elsewhere: "Booked elsewhere",
};

export const INQUIRY_SOURCE_LABEL: Record<InquirySource, string> = {
  vendor_profile: "Profile form",
  venue_profile: "Venue form",
  shortlist: "Shortlist",
  package_book: "Book now",
};

/** Map legacy pipeline fields onto the current Inquiry shape. */
export function normalizeInquiry(raw: Partial<Inquiry> & Record<string, unknown>): Inquiry {
  const stage = typeof raw.stage === "string" ? raw.stage : undefined;
  let status: InquiryStatus = "new";
  if (raw.status === "booked" || stage === "booked") status = "booked";
  else if (raw.status === "closed" || stage === "lost") status = "closed";
  else if (raw.status === "replied" || stage === "contacted" || stage === "quote_sent") status = "replied";
  else if (raw.status === "new") status = "new";

  const source =
    raw.source === "vendor_profile" ||
    raw.source === "venue_profile" ||
    raw.source === "shortlist" ||
    raw.source === "package_book"
      ? raw.source
      : "vendor_profile";

  const createdAt = typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString();
  const updatedAt = typeof raw.updatedAt === "string" ? raw.updatedAt : createdAt;

  return {
    id: String(raw.id ?? ""),
    listingId: String(raw.listingId ?? ""),
    name: String(raw.name ?? ""),
    partner: typeof raw.partner === "string" ? raw.partner : undefined,
    whatsapp: String(raw.whatsapp ?? ""),
    email: typeof raw.email === "string" ? raw.email : undefined,
    date: typeof raw.date === "string" ? raw.date : undefined,
    weddingMonth: typeof raw.weddingMonth === "string" ? raw.weddingMonth : undefined,
    city: String(raw.city ?? ""),
    guests: typeof raw.guests === "number" ? raw.guests : undefined,
    budget: typeof raw.budget === "string" ? raw.budget : undefined,
    message: String(raw.message ?? ""),
    collection: typeof raw.collection === "string" ? raw.collection : undefined,
    source,
    status,
    closeReason:
      raw.closeReason === "not_available" ||
      raw.closeReason === "budget" ||
      raw.closeReason === "no_response" ||
      raw.closeReason === "booked_elsewhere"
        ? raw.closeReason
        : undefined,
    notes: typeof raw.notes === "string" ? raw.notes : undefined,
    coupleEmail: typeof raw.coupleEmail === "string" ? raw.coupleEmail : undefined,
    createdAt,
    updatedAt,
  };
}

/** Wedding date / month line for lists and WhatsApp prefill. */
export function inquiryWeddingLabel(inquiry: Inquiry): string {
  if (inquiry.date) {
    try {
      return new Date(inquiry.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return inquiry.date;
    }
  }
  if (inquiry.weddingMonth) {
    const [y, m] = inquiry.weddingMonth.split("-").map(Number);
    if (y && m) {
      return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    }
    return inquiry.weddingMonth;
  }
  return "—";
}

/** Polite WhatsApp opener using the couple's name and date. */
export function inquiryWhatsAppMessage(inquiry: Inquiry, vendorName: string): string {
  const datePart =
    inquiryWeddingLabel(inquiry) !== "—"
      ? ` about your wedding (${inquiryWeddingLabel(inquiry)})`
      : "";
  return `Hi ${inquiry.name}, thank you for your enquiry${datePart}. This is ${vendorName} on Wedoura — happy to help with your wedding plans.`;
}
