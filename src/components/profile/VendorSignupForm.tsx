"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  IdentityDocumentFields,
  type IdentityDraft,
} from "@/components/profile/IdentityDocumentFields";
import { FormSelect } from "@/components/ui/FormSelect";
import { MultiStepForm } from "@/components/ui/MultiStepForm";
import type { CategorySlug } from "@/data/types";
import { cn } from "@/lib/cn";
import { idTypeNeedsBack, VENDOR_ID_TYPE_LABEL } from "@/lib/identity-document";
import { submitApplication } from "@/lib/vendor-api";

type Option = { value: string; label: string };

type Props = {
  categories: Option[];
  cities: Option[];
  /** Optional sample cover for the "how couples will see you" card. */
  previewImage?: string;
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
  foundingPartner: boolean;
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
  foundingPartner: false,
  consent: false,
};

const EMPTY_IDENTITY: IdentityDraft = {
  type: "masked_aadhaar",
  front: null,
  back: null,
  consent: false,
};

const STEPS = [
  { numeral: "I", label: "Business" },
  { numeral: "II", label: "Contact" },
  { numeral: "III", label: "Identity" },
  { numeral: "IV", label: "Review" },
];

const field =
  "w-full border-b border-line bg-transparent pb-2 text-body text-ink outline-offset-4 placeholder:text-mute/60 focus:border-ink";

const urlOk = (value: string) => /^https?:\/\/.+\..+/.test(value.trim());

/**
 * Short vendor application: business, contact, identity, then review —
 * with the "how couples will see you" card and optional Founding Partner checkbox.
 */
export function VendorSignupForm({ categories, cities, previewImage }: Props) {
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<Values>(EMPTY);
  const [identity, setIdentity] = useState<IdentityDraft>(EMPTY_IDENTITY);
  const [errors, setErrors] = useState<Partial<Record<keyof Values, string>>>({});
  const [idErrors, setIdErrors] = useState<Partial<Record<"type" | "front" | "back" | "consent", string>>>({});
  const [sent, setSent] = useState(false);
  const [refNo, setRefNo] = useState("");
  const [busy, setBusy] = useState(false);

  const set = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setValues((v) => ({
      ...v,
      [key]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value,
    }));

  const categoryLabel = useMemo(
    () => categories.find((c) => c.value === values.category)?.label ?? "",
    [categories, values.category],
  );
  const cityLabel = useMemo(
    () => cities.find((c) => c.value === values.city)?.label ?? "",
    [cities, values.city],
  );

  function validateStep(index: number): boolean {
    const next: Partial<Record<keyof Values, string>> = {};
    const nextId: Partial<Record<"type" | "front" | "back" | "consent", string>> = {};
    if (index === 0) {
      if (!values.business.trim()) next.business = "What is the business called?";
      if (!values.category) next.category = "Pick the closest category.";
      if (!values.city) next.city = "Pick your home city.";
      if (!urlOk(values.workLink)) next.workLink = "One link to your work: Instagram or website (https://…).";
    }
    if (index === 1) {
      if (!values.contactName.trim()) next.contactName = "Who should couples ask for?";
      if (!/^(\+91)?[ -]?[6-9]\d{9}$/.test(values.whatsapp.replace(/\s/g, "")))
        next.whatsapp = "A 10-digit Indian mobile number, with or without +91.";
      if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) next.email = "An email we can reach you on.";
      if (values.password.length < 8) next.password = "At least 8 characters.";
    }
    if (index === 2) {
      if (!identity.type) nextId.type = "Pick an ID type.";
      if (!identity.front) nextId.front = "Upload the front of your ID.";
      if (idTypeNeedsBack(identity.type) && !identity.back) nextId.back = "Upload the back of your ID.";
      if (!identity.consent || !identity.consentAt) {
        nextId.consent = "Please agree so we can use this document to verify your identity.";
      }
    }
    if (index === 3) {
      if (!values.consent) next.consent = "Please confirm so we can review your application.";
      if (!identity.front || (idTypeNeedsBack(identity.type) && !identity.back) || !identity.consent) {
        nextId.front = "Go back and finish the identity step.";
      }
    }
    setErrors(next);
    setIdErrors(nextId);
    return Object.keys(next).length === 0 && Object.keys(nextId).length === 0;
  }

  async function submit() {
    if (!validateStep(3)) return;
    if (!identity.front || !identity.consentAt) return;
    setBusy(true);
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
      foundingPartner: values.foundingPartner || undefined,
      document: {
        type: identity.type,
        front: identity.front,
        back: identity.back,
        consent: true,
        consentAt: identity.consentAt,
      },
    });
    setBusy(false);
    if (!result.ok) {
      setErrors({ email: result.error });
      setStep(1);
      return;
    }
    setRefNo(`WV-${String(Date.now()).slice(-5)}`);
    setSent(true);
  }

  const error = (key: keyof Values) =>
    errors[key] ? (
      <p className="mt-2 text-small text-ink" role="alert">
        {errors[key]}
      </p>
    ) : null;

  const fileNames = [identity.front?.name, identity.back?.name].filter(Boolean) as string[];

  const preview = (
    <div>
      <div className="aspect-4/5 overflow-hidden bg-sand">
        {previewImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewImage} alt="" aria-hidden="true" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-end p-4 text-small text-mute">Your cover photo appears here after approval.</div>
        )}
      </div>
      <h3 className="mt-4 font-serif text-h3">{values.business.trim() || "Your business name"}</h3>
      <p className="mt-1 text-small text-gold-deep">
        {[categoryLabel, cityLabel].filter(Boolean).join(" · ") || "Category · City"}
      </p>
      <p className="mt-3 text-small text-mute">Open pricing and a direct line, once your profile is live.</p>
    </div>
  );

  if (sent) {
    return (
      <section className="mx-auto max-w-2xl px-[clamp(1.25rem,5vw,5.5rem)] py-16 text-center" role="status">
        <p className="label text-gold-deep">Application received</p>
        <h1 className="mt-4 font-serif text-h1">
          Thank you, <em>{values.contactName || "friend"}</em>.
        </h1>
        <p className="mt-4 text-mute">Your reference number is</p>
        <p className="mt-2 font-serif text-h2 text-ink">{refNo}</p>
        <ul className="mt-12 grid gap-8 text-left md:grid-cols-3">
          <li className="border-t border-ink pt-5">
            <h3 className="font-serif text-h3">We review your work</h3>
            <p className="mt-2 text-small text-mute">Our team looks through your portfolio within two working days.</p>
          </li>
          <li className="border-t border-ink pt-5">
            <h3 className="font-serif text-h3">A short call</h3>
            <p className="mt-2 text-small text-mute">We call to confirm your details and answer questions.</p>
          </li>
          <li className="border-t border-ink pt-5">
            <h3 className="font-serif text-h3">Your profile goes live</h3>
            <p className="mt-2 text-small text-mute">Upload albums and films in the dashboard after approval.</p>
          </li>
        </ul>
        <div className="mt-12 flex flex-col items-center gap-4">
          <Link
            href="/vendor/login"
            className="inline-flex min-h-12 items-center bg-ink px-8 font-sans text-button font-medium tracking-button text-ivory uppercase hover:bg-gold-deep"
          >
            Open my dashboard
          </Link>
          <Link href="/" className="border-b border-gold pb-1 font-sans text-button font-medium tracking-[0.2em] uppercase">
            Wedoura home
          </Link>
        </div>
      </section>
    );
  }

  if (!started) {
    return (
      <section className="mx-auto grid max-w-[1440px] items-center gap-12 px-[clamp(1.25rem,5vw,5.5rem)] py-16 md:grid-cols-2 md:gap-20 md:py-24">
        <div>
          <p className="label text-gold-deep">For wedding professionals</p>
          <h1 className="mt-4 font-serif text-h1">
            Your work deserves a <em>beautiful</em> home
          </h1>
          <p className="mt-5 max-w-prose text-mute">
            Join Wedoura and meet couples who value what you do. Apply in a few minutes; our team reviews every
            application by hand.
          </p>
          <ul className="mt-8 grid gap-5">
            <li className="border-t border-line pt-5">
              <p className="font-serif text-h3">A magazine-style profile</p>
              <p className="mt-2 text-mute">
                Albums, films and open pricing —{" "}
                <Link href="/vendors/aperture-marigold" className="border-b border-gold pb-0.5 text-ink">
                  see a sample
                </Link>
                .
              </p>
            </li>
            <li className="border-t border-line pt-5">
              <p className="font-serif text-h3">Couples who are ready</p>
              <p className="mt-2 text-mute">Verified enquiries with date, city and budget, straight to your WhatsApp.</p>
            </li>
          </ul>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <button
              type="button"
              onClick={() => setStarted(true)}
              className="inline-flex min-h-12 items-center bg-ink px-8 font-sans text-button font-medium tracking-button text-ivory uppercase hover:bg-gold-deep"
            >
              Start my application
            </button>
            <span className="text-small text-mute">A few short steps · Identity check · Review before you send</span>
          </div>
          <p className="mt-8 text-mute">
            Already on Wedoura?{" "}
            <Link href="/vendor/login" className="border-b border-gold pb-0.5 text-ink">
              Log in
            </Link>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-1" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ref/vendor-signup/image-02.webp" alt="" className="aspect-4/5 object-cover" />
          <div className="grid gap-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ref/vendor-signup/image-03.webp" alt="" className="aspect-square object-cover" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ref/vendor-signup/image-04.webp" alt="" className="aspect-square object-cover" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <MultiStepForm
      steps={STEPS}
      step={step}
      onExit={() => setStarted(false)}
      exitLabel="Save & exit"
      review={preview}
      onBack={() => {
        setErrors({});
        setIdErrors({});
        if (step === 0) setStarted(false);
        else setStep((s) => s - 1);
      }}
      onContinue={() => {
        if (busy) return;
        if (step < 3) {
          if (validateStep(step)) setStep((s) => s + 1);
          return;
        }
        void submit();
      }}
      continueLabel={step === 3 ? (busy ? "Submitting…" : "Submit application") : "Continue"}
      chrome={false}
    >
      {step === 0 && (
        <div className="grid gap-8">
          <div>
            <h1 className="font-serif text-h2">Tell us about your business</h1>
            <p className="mt-3 text-mute">Start with the basics. Everything else is filled in the dashboard after approval.</p>
          </div>
          <div>
            <label htmlFor="su-business" className="label text-mute">
              Business name
            </label>
            <input id="su-business" type="text" value={values.business} onChange={set("business")} className={cn(field, "mt-3")} />
            {error("business")}
          </div>
          <div>
            <label htmlFor="su-category" className="label text-mute">
              Category
            </label>
            <FormSelect
              id="su-category"
              value={values.category}
              options={categories}
              onChange={(category) => setValues((current) => ({ ...current, category }))}
            />
            {error("category")}
          </div>
          <div>
            <label htmlFor="su-city" className="label text-mute">
              Base city
            </label>
            <FormSelect
              id="su-city"
              value={values.city}
              options={cities}
              onChange={(city) => setValues((current) => ({ ...current, city }))}
            />
            {error("city")}
          </div>
          <div>
            <label htmlFor="su-worklink" className="label text-mute">
              Your work: Instagram or website
            </label>
            <input id="su-worklink" type="url" placeholder="https://" value={values.workLink} onChange={set("workLink")} className={cn(field, "mt-3")} />
            {error("workLink")}
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="grid gap-8">
          <div>
            <h1 className="font-serif text-h2">How we reach you</h1>
            <p className="mt-3 text-mute">Couples never see your personal number until you reply on WhatsApp.</p>
          </div>
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
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-8">
          <div>
            <h1 className="font-serif text-h2">Verify your identity</h1>
            <p className="mt-3 text-mute">
              We use this only to confirm you are a real wedding professional. Documents stay private — never on your
              public profile.
            </p>
          </div>
          <IdentityDocumentFields value={identity} onChange={setIdentity} errors={idErrors} />
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-8">
          <div>
            <h1 className="font-serif text-h2">Review and submit</h1>
            <p className="mt-3 text-mute">Check your details. You can edit any section.</p>
          </div>
          <dl className="grid gap-4 border border-line bg-white p-6 text-small">
            <div className="flex justify-between gap-4">
              <dt className="text-mute">Business</dt>
              <dd className="text-right text-ink">{values.business}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mute">Category</dt>
              <dd className="text-right text-ink">{categoryLabel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mute">City</dt>
              <dd className="text-right text-ink">{cityLabel}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mute">Contact</dt>
              <dd className="text-right text-ink">{values.contactName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mute">Email</dt>
              <dd className="text-right text-ink">{values.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-mute">Work link</dt>
              <dd className="max-w-[14rem] truncate text-right text-ink">{values.workLink}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-line pt-4">
              <dt className="text-mute">Identity document</dt>
              <dd className="text-right text-ink">
                {fileNames.length > 0 ? (
                  <>
                    <span>added</span>
                    <span className="mt-1 block text-mute">
                      {VENDOR_ID_TYPE_LABEL[identity.type]} · {fileNames.join(", ")}
                    </span>
                  </>
                ) : (
                  "—"
                )}
              </dd>
            </div>
          </dl>
          {idErrors.front ? (
            <p className="text-small text-ink" role="alert">
              {idErrors.front}
            </p>
          ) : null}
          <label className="tap flex cursor-pointer items-start gap-3 py-1">
            <input
              type="checkbox"
              checked={values.foundingPartner}
              onChange={set("foundingPartner")}
              className="mt-1 size-4 shrink-0 accent-ink"
            />
            <span className="text-small text-mute">
              Consider me for Founding Partner — early profile features and a Founding Partner certificate, for a
              small number of exceptional vendors.
            </span>
          </label>
          <label htmlFor="su-consent" className="tap flex cursor-pointer items-start gap-3 py-1">
            <input
              id="su-consent"
              type="checkbox"
              checked={values.consent}
              onChange={set("consent")}
              className="mt-1 size-4 shrink-0 accent-ink"
            />
            <span className="text-small text-mute">
              I confirm these details are accurate and I agree to the Wedoura vendor terms.
            </span>
          </label>
          {error("consent")}
          {error("email")}
        </div>
      )}
    </MultiStepForm>
  );
}
