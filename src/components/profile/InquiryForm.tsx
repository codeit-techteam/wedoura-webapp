"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Props = { vendorName: string };

type Values = {
  name: string;
  partner: string;
  whatsapp: string;
  date: string;
  city: string;
  message: string;
};

const EMPTY: Values = { name: "", partner: "", whatsapp: "", date: "", city: "", message: "" };

function validate(values: Values): Partial<Record<keyof Values, string>> {
  const errors: Partial<Record<keyof Values, string>> = {};
  if (!values.name.trim()) errors.name = "Please tell us your name.";
  if (!/^(\+91)?[ -]?[6-9]\d{9}$/.test(values.whatsapp.replace(/\s/g, "")))
    errors.whatsapp = "A 10-digit Indian mobile number, with or without +91.";
  if (!values.city.trim()) errors.city = "Where is the wedding?";
  if (!values.message.trim() || values.message.trim().length < 10)
    errors.message = "A line or two about your day helps the vendor reply well.";
  return errors;
}

const field =
  "w-full border-b border-line bg-transparent pb-2 text-body text-ink outline-offset-4 placeholder:text-mute/60 focus:border-ink";

/**
 * The inquiry form. Screen only: validates, shows a success state, sends
 * nothing anywhere yet.
 */
export function InquiryForm({ vendorName }: Props) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [sent, setSent] = useState(false);

  const set = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = validate(values);
    setErrors(next);
    if (Object.keys(next).length === 0) setSent(true);
  }

  if (sent) {
    return (
      <div className="bg-ivory px-8 py-14 md:px-12" role="status">
        <p className="font-serif text-h2">Sent. {vendorName} will reply to you directly.</p>
        <p className="mt-4 max-w-prose text-mute">
          Nothing was actually sent; forms go live with the backend. This screen shows the success state.
        </p>
        <Button
          variant="link"
          className="mt-6"
          onClick={() => {
            setValues(EMPTY);
            setSent(false);
          }}
        >
          Send another inquiry
        </Button>
      </div>
    );
  }

  const error = (key: keyof Values) =>
    errors[key] ? (
      <p className="mt-2 text-small text-ink" role="alert">
        {errors[key]}
      </p>
    ) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-x-10 gap-y-8 md:grid-cols-2">
      <div>
        <label htmlFor="inq-name" className="label text-mute">
          Your name
        </label>
        <input id="inq-name" type="text" autoComplete="name" value={values.name} onChange={set("name")} className={cn(field, "mt-3")} />
        {error("name")}
      </div>
      <div>
        <label htmlFor="inq-partner" className="label text-mute">
          Partner&apos;s name (optional)
        </label>
        <input id="inq-partner" type="text" value={values.partner} onChange={set("partner")} className={cn(field, "mt-3")} />
      </div>
      <div>
        <label htmlFor="inq-whatsapp" className="label text-mute">
          WhatsApp number
        </label>
        <input
          id="inq-whatsapp"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+91"
          value={values.whatsapp}
          onChange={set("whatsapp")}
          className={cn(field, "mt-3")}
        />
        {error("whatsapp")}
      </div>
      <div>
        <label htmlFor="inq-date" className="label text-mute">
          Wedding date (if you have one)
        </label>
        <input id="inq-date" type="date" value={values.date} onChange={set("date")} className={cn(field, "mt-3")} />
      </div>
      <div>
        <label htmlFor="inq-city" className="label text-mute">
          City
        </label>
        <input id="inq-city" type="text" value={values.city} onChange={set("city")} className={cn(field, "mt-3")} />
        {error("city")}
      </div>
      <div className="md:col-span-2">
        <label htmlFor="inq-message" className="label text-mute">
          About your wedding
        </label>
        <textarea
          id="inq-message"
          rows={4}
          value={values.message}
          onChange={set("message")}
          placeholder="Dates, places, what you have in mind."
          className={cn(field, "mt-3 resize-y")}
        />
        {error("message")}
      </div>
      <div>
        <Button type="submit">Send inquiry</Button>
      </div>
    </form>
  );
}
