"use client";

import { Field, ScreenHeader, inputClass } from "@/components/studio/Field";
import { SaveState } from "@/components/studio/autosave";
import { ScreenSkeleton, useListingForm } from "@/components/studio/screen";

type Form = { whatsapp: string; email: string; instagram: string; website: string; phone: string };

const WHATSAPP_RE = /^(\+91)?[ -]?[6-9]\d{9}$/;
const EMAIL_RE = /^\S+@\S+\.\S+$/;
const URL_RE = /^https?:\/\/.+\..+/;

export default function ContactPage() {
  const { form, apply, status, error } = useListingForm<Form>((l) => ({
    whatsapp: l.contact.whatsapp ?? "",
    email: l.contact.email ?? "",
    instagram: l.contact.instagram ?? "",
    website: l.contact.website ?? "",
    phone: l.contact.phone ?? "",
  }));
  if (!form) return <ScreenSkeleton />;

  // Only valid values are saved; invalid input stays on screen with an error.
  const save = (next: Form) => {
    const contact = {
      whatsapp: WHATSAPP_RE.test(next.whatsapp.replace(/\s/g, "")) ? next.whatsapp.trim() : undefined,
      email: EMAIL_RE.test(next.email.trim()) ? next.email.trim() : undefined,
      instagram: URL_RE.test(next.instagram.trim()) ? next.instagram.trim() : undefined,
      website: URL_RE.test(next.website.trim()) ? next.website.trim() : undefined,
      phone: next.phone.trim() || undefined,
    };
    apply(next, { contact });
  };

  const err = (value: string, re: RegExp, message: string) => (value && !re.test(value.replace(/\s/g, "")) ? message : undefined);

  return (
    <div className="max-w-2xl">
      <ScreenHeader
        title="Contact"
        text="How couples reach you from your profile."
        right={<SaveState status={status} error={error} />}
      />
      <div className="mt-8 grid gap-7">
        <Field
          id="ct-whatsapp"
          label="WhatsApp number"
          hint="The WhatsApp button on your profile uses this number."
          error={err(form.whatsapp, WHATSAPP_RE, "A 10-digit Indian mobile number, with or without +91.")}
        >
          <input id="ct-whatsapp" type="tel" inputMode="tel" placeholder="+91" value={form.whatsapp} onChange={(e) => save({ ...form, whatsapp: e.target.value })} className={inputClass} />
        </Field>
        <Field id="ct-email" label="Email" error={err(form.email, EMAIL_RE, "An email address, please.")}>
          <input id="ct-email" type="email" value={form.email} onChange={(e) => save({ ...form, email: e.target.value })} className={inputClass} />
        </Field>
        <Field id="ct-instagram" label="Instagram" error={err(form.instagram, URL_RE, "A full link (https://…).")}>
          <input id="ct-instagram" type="url" placeholder="https://instagram.com/…" value={form.instagram} onChange={(e) => save({ ...form, instagram: e.target.value })} className={inputClass} />
        </Field>
        <Field id="ct-website" label="Website" error={err(form.website, URL_RE, "A full link (https://…).")}>
          <input id="ct-website" type="url" placeholder="https://" value={form.website} onChange={(e) => save({ ...form, website: e.target.value })} className={inputClass} />
        </Field>
        <Field id="ct-phone" label="Phone (never shown publicly)" hint="Only Wedoura uses this to reach you. It never appears on your profile or anywhere public.">
          <input id="ct-phone" type="tel" inputMode="tel" value={form.phone} onChange={(e) => save({ ...form, phone: e.target.value })} className={inputClass} />
        </Field>
      </div>
    </div>
  );
}
