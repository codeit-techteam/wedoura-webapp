"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { getCoupleEmail } from "@/lib/couple-auth";
import { createInquiry } from "@/lib/vendor-api";

type Props = {
  vendorName: string;
  /** Required to write an Inquiry into the mock store. */
  vendorSlug: string;
  /** If set, a "Collection" select appears above the message field. */
  packageLabels?: string[];
  /** Single-column layout for the profile's side panel. */
  compact?: boolean;
};

type Values = {
  name: string;
  partner: string;
  whatsapp: string;
  date: string;
  city: string;
  collection: string;
  message: string;
};

const EMPTY: Values = {
  name: "",
  partner: "",
  whatsapp: "",
  date: "",
  city: "",
  collection: "",
  message: "",
};

function validate(values: Values): Partial<Record<keyof Values, string>> {
  const errors: Partial<Record<keyof Values, string>> = {};
  if (!values.name.trim()) errors.name = "Please add your names.";
  const digits = values.whatsapp.replace(/\D/g, "");
  if (digits.length < 8) errors.whatsapp = "Please add a WhatsApp or phone number so we can reach you.";
  if (!values.city.trim()) errors.city = "Where is the wedding?";
  return errors;
}

const field =
  "w-full border-b border-line bg-transparent pb-2 text-body text-ink outline-offset-4 placeholder:text-mute/60 focus:border-ink";

/**
 * Check-availability form. Validates, writes one Inquiry via createInquiry,
 * then shows a success state. Labels sit over hairline fields.
 */
export function InquiryForm({ vendorName, vendorSlug, packageLabels, compact = false }: Props) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const set = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validate(values);
    setErrors(next);
    setSubmitError("");
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    const messageParts = [
      values.message.trim(),
      values.collection ? `Collection: ${values.collection}` : "",
      values.partner.trim() ? `Partner: ${values.partner.trim()}` : "",
      values.date ? `Date: ${values.date}` : "",
    ].filter(Boolean);

    const result = await createInquiry({
      vendorSlug,
      name: values.name.trim(),
      whatsapp: values.whatsapp.trim(),
      city: values.city.trim(),
      message: messageParts.join("\n") || `Hi ${vendorName}, we would love to check availability.`,
      weddingMonth: values.date ? values.date.slice(0, 7) : undefined,
      coupleEmail: getCoupleEmail() ?? undefined,
    });
    setBusy(false);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className={cn(compact ? "py-6" : "py-4")} role="status">
        <p className={cn("font-serif italic text-ink", compact ? "text-h3" : "text-[1.5rem] leading-snug")}>
          Thank you, {values.name.trim()}. {vendorName} usually replies within a day.
        </p>
        <p className="mt-3 text-mute">Your enquiry is with them. Replies come on WhatsApp.</p>
        <Button
          variant="link"
          className="mt-6"
          onClick={() => {
            setValues(EMPTY);
            setSent(false);
          }}
        >
          Send another enquiry
        </Button>
      </div>
    );
  }

  const error = (key: keyof Values) =>
    errors[key] ? (
      <p id={`inq-${key}-error`} role="alert" className="mt-2 flex items-baseline gap-2 text-small text-ink">
        <span aria-hidden="true" className="h-px w-3 shrink-0 self-center bg-gold" />
        {errors[key]}
      </p>
    ) : null;

  const fieldProps = (key: keyof Values, helpId?: string) => ({
    "aria-invalid": errors[key] ? true : undefined,
    "aria-describedby": errors[key] ? `inq-${key}-error` : helpId,
    className: cn(field, "mt-3", errors[key] && "border-ink"),
  });

  return (
    <form onSubmit={onSubmit} noValidate className={cn("grid gap-y-6", !compact && "gap-x-10 gap-y-8 md:grid-cols-2")}>
      <div className={cn(!compact && "md:col-span-2")}>
        <label htmlFor="inq-name" className="label text-mute">
          Your names
        </label>
        <input
          id="inq-name"
          type="text"
          autoComplete="name"
          placeholder="Ananya & Kabir"
          value={values.name}
          onChange={set("name")}
          {...fieldProps("name")}
        />
        {error("name")}
      </div>
      <div>
        <label htmlFor="inq-whatsapp" className="label text-mute">
          WhatsApp or phone number
        </label>
        <input
          id="inq-whatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+91"
          value={values.whatsapp}
          onChange={set("whatsapp")}
          {...fieldProps("whatsapp")}
        />
        {error("whatsapp")}
      </div>
      <div>
        <label htmlFor="inq-date" className="label text-mute">
          Wedding date
        </label>
        <input id="inq-date" type="date" value={values.date} onChange={set("date")} {...fieldProps("date")} />
      </div>
      <div>
        <label htmlFor="inq-city" className="label text-mute">
          City or venue
        </label>
        <input
          id="inq-city"
          type="text"
          placeholder="Bengaluru"
          value={values.city}
          onChange={set("city")}
          {...fieldProps("city")}
        />
        {error("city")}
      </div>
      {packageLabels && packageLabels.length > 0 && (
        <div>
          <label htmlFor="inq-collection" className="label text-mute">
            Collection
          </label>
          <select
            id="inq-collection"
            value={values.collection}
            onChange={(e) => setValues((v) => ({ ...v, collection: e.target.value }))}
            className={cn(field, "mt-3")}
          >
            <option value="">Any / not sure yet</option>
            {packageLabels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className={cn(!compact && "md:col-span-2")}>
        <label htmlFor="inq-message" className="label text-mute">
          A note (optional)
        </label>
        <textarea
          id="inq-message"
          rows={compact ? 3 : 4}
          value={values.message}
          onChange={set("message")}
          placeholder="Tell us about your day."
          className={cn(field, "mt-3 resize-y")}
        />
      </div>
      {submitError ? (
        <p role="alert" className="text-small text-ink md:col-span-2">
          {submitError}
        </p>
      ) : null}
      <div className={cn(!compact && "md:col-span-2")}>
        <Button type="submit" disabled={busy}>
          {busy ? "Sending…" : "Check availability"}
        </Button>
        <p className="mt-4 text-small text-mute">Free to ask, with no obligation. Replies usually within a day.</p>
      </div>
    </form>
  );
}
