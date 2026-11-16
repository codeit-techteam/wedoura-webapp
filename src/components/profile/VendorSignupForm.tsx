"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import type { CategorySlug } from "@/data/types";
import { cn } from "@/lib/cn";
import { submitApplication } from "@/lib/vendor-api";

type Option = { value: string; label: string };

type Props = {
  categories: Option[];
  cities: Option[];
};

type Values = {
  business: string;
  category: string;
  city: string;
  contactName: string;
  whatsapp: string;
  email: string;
  password: string;
  workLink: string;
  consent: boolean;
};

const EMPTY: Values = {
  business: "",
  category: "",
  city: "",
  contactName: "",
  whatsapp: "",
  email: "",
  password: "",
  workLink: "",
  consent: false,
};

const field =
  "w-full border-b border-line bg-transparent pb-2 text-body text-ink outline-offset-4 placeholder:text-mute/60 focus:border-ink";

const urlOk = (value: string) => /^https?:\/\/.+\..+/.test(value.trim());

function validate(v: Values): Partial<Record<keyof Values, string>> {
  const errors: Partial<Record<keyof Values, string>> = {};
  if (!v.business.trim()) errors.business = "What is the business called?";
  if (!v.category) errors.category = "Pick the closest category.";
  if (!v.city) errors.city = "Pick your home city.";
  if (!v.contactName.trim()) errors.contactName = "Who should couples ask for?";
  if (!/^(\+91)?[ -]?[6-9]\d{9}$/.test(v.whatsapp.replace(/\s/g, "")))
    errors.whatsapp = "A 10-digit Indian mobile number, with or without +91.";
  if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) errors.email = "An email we can reach you on.";
  if (v.password.length < 8) errors.password = "At least 8 characters.";
  if (!urlOk(v.workLink)) errors.workLink = "One link to your work: Instagram or website (https://…).";
  if (!v.consent) errors.consent = "Please confirm so we can review your application.";
  return errors;
}

/**
 * The vendor application: one short form matching VendorApplication, saved
 * to the mock store so the review flow can be demonstrated end to end.
 */
export function VendorSignupForm({ categories, cities }: Props) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [sent, setSent] = useState(false);

  const set = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const result = await submitApplication({
      businessName: values.business,
      category: values.category as CategorySlug,
      baseCity: values.city,
      contactName: values.contactName,
      whatsapp: values.whatsapp,
      email: values.email,
      password: values.password,
      workLink: values.workLink,
      consent: true,
    });
    if (!result.ok) {
      setErrors({ email: result.error });
      return;
    }
    setSent(true);
  }

  const error = (key: keyof Values) =>
    errors[key] ? (
      <p className="mt-2 text-small text-ink" role="alert">
        {errors[key]}
      </p>
    ) : null;

  if (sent) {
    return (
      <div className="bg-white px-8 py-14 md:px-12" role="status">
        <p className="font-serif text-h2">Thank you, {values.contactName || values.business}.</p>
        <p className="mt-4 max-w-prose text-mute">
          We review every application by hand and reply within a few days. You can log in any time with your
          email and password to check where things stand.
        </p>
        <Button href="/login" variant="link" className="mt-6">
          Go to login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8 bg-white p-6 md:grid-cols-2 md:gap-x-10 md:p-12">
      <div>
        <label htmlFor="su-business" className="label text-mute">
          Business name
        </label>
        <input id="su-business" type="text" value={values.business} onChange={set("business")} className={cn(field, "mt-3")} />
        {error("business")}
      </div>
      <div>
        <label htmlFor="su-contact" className="label text-mute">
          Contact person
        </label>
        <input id="su-contact" type="text" autoComplete="name" value={values.contactName} onChange={set("contactName")} className={cn(field, "mt-3")} />
        {error("contactName")}
      </div>
      <div>
        <label htmlFor="su-category" className="label text-mute">
          Category
        </label>
        <select id="su-category" value={values.category} onChange={set("category")} className={cn(field, "mt-3 cursor-pointer appearance-none")}>
          <option value="">Choose one</option>
          {categories.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {error("category")}
      </div>
      <div>
        <label htmlFor="su-city" className="label text-mute">
          Base city
        </label>
        <select id="su-city" value={values.city} onChange={set("city")} className={cn(field, "mt-3 cursor-pointer appearance-none")}>
          <option value="">Choose one</option>
          {cities.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        {error("city")}
      </div>
      <div>
        <label htmlFor="su-whatsapp" className="label text-mute">
          WhatsApp number
        </label>
        <input id="su-whatsapp" type="tel" inputMode="tel" placeholder="+91" autoComplete="tel" value={values.whatsapp} onChange={set("whatsapp")} className={cn(field, "mt-3")} />
        {error("whatsapp")}
      </div>
      <div>
        <label htmlFor="su-email" className="label text-mute">
          Email
        </label>
        <input id="su-email" type="email" autoComplete="email" value={values.email} onChange={set("email")} className={cn(field, "mt-3")} />
        {error("email")}
      </div>
      <div>
        <label htmlFor="su-password" className="label text-mute">
          Password
        </label>
        <input id="su-password" type="password" autoComplete="new-password" value={values.password} onChange={set("password")} className={cn(field, "mt-3")} />
        {error("password")}
      </div>
      <div>
        <label htmlFor="su-worklink" className="label text-mute">
          Your work: Instagram or website
        </label>
        <input id="su-worklink" type="url" placeholder="https://" value={values.workLink} onChange={set("workLink")} className={cn(field, "mt-3")} />
        {error("workLink")}
      </div>
      <div className="md:col-span-2">
        <label htmlFor="su-consent" className="tap flex cursor-pointer items-start gap-3 py-1">
          <input
            id="su-consent"
            type="checkbox"
            checked={values.consent}
            onChange={set("consent")}
            className="mt-1 size-4 shrink-0 accent-ink"
          />
          <span className="text-small text-mute">
            The work I am submitting is my own, and Wedoura may contact me about this application.
          </span>
        </label>
        {error("consent")}
      </div>
      <div>
        <Button type="submit">Submit application</Button>
      </div>
    </form>
  );
}
