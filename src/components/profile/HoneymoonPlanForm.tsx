"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Props = {
  destinationName: string;
};

type Values = {
  name: string;
  partner: string;
  whatsapp: string;
  travelMonth: string;
  nights: string;
  message: string;
};

const EMPTY: Values = { name: "", partner: "", whatsapp: "", travelMonth: "", nights: "", message: "" };

function validate(values: Values): Partial<Record<keyof Values, string>> {
  const errors: Partial<Record<keyof Values, string>> = {};
  if (!values.name.trim()) errors.name = "Please tell us your name.";
  if (!/^(\+91)?[ -]?[6-9]\d{9}$/.test(values.whatsapp.replace(/\s/g, "")))
    errors.whatsapp = "A 10-digit Indian mobile number, with or without +91.";
  if (!values.message.trim() || values.message.trim().length < 10)
    errors.message = "A line or two about dates and pace helps us reply well.";
  return errors;
}

const field =
  "w-full border-b border-line bg-transparent pb-2 text-body text-ink outline-offset-4 placeholder:text-mute/60 focus:border-ink";

/**
 * Honeymoon planning inquiry. Screen only: validates, shows success, sends nothing.
 */
export function HoneymoonPlanForm({ destinationName }: Props) {
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
      <div className="bg-white px-6 py-10 md:px-10 md:py-12" role="status">
        <p className="font-serif text-h2">Thank you. We will reply with ideas for {destinationName}.</p>
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
          Send another note
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
    <form onSubmit={onSubmit} noValidate className="grid gap-x-10 gap-y-6 md:grid-cols-2 md:gap-y-8">
      <div>
        <label htmlFor="hm-name" className="label text-mute">
          Your name
        </label>
        <input id="hm-name" type="text" autoComplete="name" value={values.name} onChange={set("name")} className={cn(field, "mt-3")} />
        {error("name")}
      </div>
      <div>
        <label htmlFor="hm-partner" className="label text-mute">
          Partner&apos;s name (optional)
        </label>
        <input id="hm-partner" type="text" value={values.partner} onChange={set("partner")} className={cn(field, "mt-3")} />
      </div>
      <div>
        <label htmlFor="hm-whatsapp" className="label text-mute">
          WhatsApp number
        </label>
        <input
          id="hm-whatsapp"
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
        <label htmlFor="hm-month" className="label text-mute">
          When you are thinking of travelling
        </label>
        <input
          id="hm-month"
          type="text"
          placeholder="e.g. March 2027"
          value={values.travelMonth}
          onChange={set("travelMonth")}
          className={cn(field, "mt-3")}
        />
      </div>
      <div>
        <label htmlFor="hm-nights" className="label text-mute">
          How many nights (optional)
        </label>
        <input id="hm-nights" type="text" inputMode="numeric" value={values.nights} onChange={set("nights")} className={cn(field, "mt-3")} />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="hm-message" className="label text-mute">
          What you have in mind
        </label>
        <textarea
          id="hm-message"
          rows={4}
          value={values.message}
          onChange={set("message")}
          placeholder={`Dates, budget sense, and anything you want from ${destinationName}.`}
          className={cn(field, "mt-3 resize-y")}
        />
        {error("message")}
      </div>
      <div>
        <Button type="submit">Plan it with us</Button>
      </div>
    </form>
  );
}