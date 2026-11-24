"use client";

import { Field, inputClass } from "@/components/studio/Field";
import { SectionCard } from "@/components/studio/SectionCard";
import { ScreenSkeleton, useListingForm } from "@/components/studio/screen";
import type { Contact } from "@/data/types";
import { publicProfileHref } from "@/lib/studio-profile-nav";

type Form = { contact: Contact };

export default function ProfileContactPage() {
  const { listing, form, apply } = useListingForm<Form>((l) => ({ contact: l.contact }));

  if (!form || !listing) return <ScreenSkeleton />;

  const fields = [
    ["whatsapp", "WhatsApp"],
    ["email", "Email"],
    ["instagram", "Instagram"],
    ["website", "Website"],
  ] as const;

  return (
    <SectionCard
      title="Contact"
      help="WhatsApp, enquiry email, Instagram and website — used in Inquire and JSON-LD."
      shownOnProfile={Boolean(listing.contact.whatsapp)}
      seeOnProfileHref={publicProfileHref(listing, "inquire")}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {fields.map(([key, label]) => (
          <Field key={key} id={`pf-${key}`} label={label}>
            <input
              id={`pf-${key}`}
              className={inputClass}
              value={form.contact[key] ?? ""}
              onChange={(e) => {
                const contact = { ...form.contact, [key]: e.target.value.trim() || undefined };
                apply({ contact }, { contact });
              }}
            />
          </Field>
        ))}
      </div>
    </SectionCard>
  );
}