"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { EASE } from "@/lib/motion";

type Option = { value: string; label: string };

type Props = {
  categories: Option[];
  cities: Option[];
};

type Values = {
  business: string;
  tagline: string;
  category: string;
  city: string;
  website: string;
  instagram: string;
  workLink: string;
  contactName: string;
  whatsapp: string;
  email: string;
};

const EMPTY: Values = {
  business: "",
  tagline: "",
  category: "",
  city: "",
  website: "",
  instagram: "",
  workLink: "",
  contactName: "",
  whatsapp: "",
  email: "",
};

const STEPS = ["Your business", "What and where", "Your work", "Contact"] as const;

const field =
  "w-full border-b border-line bg-transparent pb-2 text-body text-ink outline-offset-4 placeholder:text-mute/60 focus:border-ink";

const urlOk = (value: string) => value === "" || /^https?:\/\/.+\..+/.test(value.trim());

function validateStep(step: number, v: Values): Partial<Record<keyof Values, string>> {
  const errors: Partial<Record<keyof Values, string>> = {};
  if (step === 0) {
    if (!v.business.trim()) errors.business = "What is the business called?";
  }
  if (step === 1) {
    if (!v.category) errors.category = "Pick the closest category.";
    if (!v.city) errors.city = "Pick your home city.";
  }
  if (step === 2) {
    if (!v.website.trim() && !v.instagram.trim() && !v.workLink.trim())
      errors.workLink = "Give us at least one place to see your work.";
    if (!urlOk(v.website)) errors.website = "That does not look like a link (https://…).";
    if (!urlOk(v.instagram)) errors.instagram = "That does not look like a link (https://…).";
    if (!urlOk(v.workLink)) errors.workLink = errors.workLink ?? "That does not look like a link (https://…).";
  }
  if (step === 3) {
    if (!v.contactName.trim()) errors.contactName = "Who should couples ask for?";
    if (!/^(\+91)?[ -]?[6-9]\d{9}$/.test(v.whatsapp.replace(/\s/g, "")))
      errors.whatsapp = "A 10-digit Indian mobile number, with or without +91.";
    if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) errors.email = "An email we can reach you on.";
  }
  return errors;
}

/** The vendor signup: four short steps, validation, success screen. Screen only. */
export function VendorSignupForm({ categories, cities }: Props) {
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [sent, setSent] = useState(false);

  const set = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  function next(e: FormEvent) {
    e.preventDefault();
    const found = validateStep(step, values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else setSent(true);
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
          We review every profile by hand and reply on WhatsApp within a few days. Nothing was actually sent
          yet; signups go live with the backend.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={next} noValidate className="bg-white p-6 md:p-12">
      {/* Step indicator */}
      <ol className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Signup steps">
        {STEPS.map((label, i) => (
          <li
            key={label}
            aria-current={i === step ? "step" : undefined}
            className={cn(
              "label border-b pb-1 transition-chrome",
              i === step ? "border-ink text-ink" : i < step ? "border-line text-ink/60" : "border-transparent text-mute",
            )}
          >
            {i + 1}. {label}
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="mt-10 grid gap-8 md:max-w-xl"
        >
          {step === 0 && (
            <>
              <div>
                <label htmlFor="su-business" className="label text-mute">
                  Business name
                </label>
                <input id="su-business" type="text" value={values.business} onChange={set("business")} className={cn(field, "mt-3")} />
                {error("business")}
              </div>
              <div>
                <label htmlFor="su-tagline" className="label text-mute">
                  One line about what you do (optional)
                </label>
                <input
                  id="su-tagline"
                  type="text"
                  value={values.tagline}
                  onChange={set("tagline")}
                  placeholder="Quiet, editorial wedding photography"
                  className={cn(field, "mt-3")}
                />
              </div>
            </>
          )}

          {step === 1 && (
            <>
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
                  Home city
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
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-small text-mute">At least one link where we can see real, recent work.</p>
              <div>
                <label htmlFor="su-website" className="label text-mute">
                  Website
                </label>
                <input id="su-website" type="url" value={values.website} onChange={set("website")} placeholder="https://" className={cn(field, "mt-3")} />
                {error("website")}
              </div>
              <div>
                <label htmlFor="su-instagram" className="label text-mute">
                  Instagram
                </label>
                <input id="su-instagram" type="url" value={values.instagram} onChange={set("instagram")} placeholder="https://instagram.com/…" className={cn(field, "mt-3")} />
                {error("instagram")}
              </div>
              <div>
                <label htmlFor="su-worklink" className="label text-mute">
                  A full wedding or album
                </label>
                <input id="su-worklink" type="url" value={values.workLink} onChange={set("workLink")} placeholder="https://" className={cn(field, "mt-3")} />
                {error("workLink")}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div>
                <label htmlFor="su-contact" className="label text-mute">
                  Contact person
                </label>
                <input id="su-contact" type="text" autoComplete="name" value={values.contactName} onChange={set("contactName")} className={cn(field, "mt-3")} />
                {error("contactName")}
              </div>
              <div>
                <label htmlFor="su-whatsapp" className="label text-mute">
                  WhatsApp number
                </label>
                <input id="su-whatsapp" type="tel" inputMode="tel" placeholder="+91" value={values.whatsapp} onChange={set("whatsapp")} className={cn(field, "mt-3")} />
                {error("whatsapp")}
              </div>
              <div>
                <label htmlFor="su-email" className="label text-mute">
                  Email
                </label>
                <input id="su-email" type="email" autoComplete="email" value={values.email} onChange={set("email")} className={cn(field, "mt-3")} />
                {error("email")}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 flex items-center gap-4">
        {step > 0 && (
          <Button variant="outline" type="button" onClick={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        <Button type="submit">{step < STEPS.length - 1 ? "Continue" : "Submit profile"}</Button>
      </div>
    </form>
  );
}
