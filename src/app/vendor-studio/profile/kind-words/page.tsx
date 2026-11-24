"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/studio/Field";
import { RepeatableList } from "@/components/studio/RepeatableList";
import { SectionCard } from "@/components/studio/SectionCard";
import { StudioDrawer } from "@/components/studio/StudioDrawer";
import { ScreenSkeleton, TagListInput, useListingForm } from "@/components/studio/screen";
import type { Testimonial } from "@/data/types";
import { publicProfileHref } from "@/lib/studio-profile-nav";

type Form = {
  press: string[];
  testimonials: Testimonial[];
};

const emptyTestimonial = (): Testimonial => ({ quote: "", couple: "", location: "" });

export default function ProfileKindWordsPage() {
  const { listing, form, apply } = useListingForm<Form>((l) => ({
    press: l.press ?? [],
    testimonials: l.testimonials ?? [],
  }));

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Testimonial | null>(null);

  if (!form || !listing) return <ScreenSkeleton />;

  function openEdit(index: number) {
    setDraft({ ...form!.testimonials[index] });
    setEditIndex(index);
  }

  function openAdd() {
    setDraft(emptyTestimonial());
    setEditIndex(-1);
  }

  function closeDrawer() {
    setEditIndex(null);
    setDraft(null);
  }

  function saveDrawer() {
    if (!draft || editIndex === null) return;
    const testimonials =
      editIndex === -1
        ? [...form!.testimonials, draft]
        : form!.testimonials.map((t, i) => (i === editIndex ? draft : t));
    apply({ testimonials }, { testimonials });
    closeDrawer();
  }

  return (
    <div className="grid gap-8">
      <SectionCard
        title="Press"
        help="Publication names shown in the Kind words band."
        shownOnProfile={Boolean(listing.press?.length)}
        seeOnProfileHref={publicProfileHref(listing, "kind-words")}
      >
        <Field id="pf-press" label="Publication names">
          <TagListInput
            id="pf-press"
            values={form.press}
            onChange={(press) => apply({ press }, { press })}
            placeholder="e.g. Vogue India"
          />
        </Field>
      </SectionCard>

      <SectionCard
        title="Kind words"
        help="Vendor-entered testimonials. Never shown as verified reviews."
        shownOnProfile={Boolean(listing.testimonials?.length)}
        seeOnProfileHref={publicProfileHref(listing, "kind-words")}
      >
        <RepeatableList
          items={form.testimonials}
          getId={(t, i) => `tst-${i}-${t.couple.slice(0, 8)}`}
          onReorder={(testimonials) => apply({ testimonials }, { testimonials })}
          onDelete={(index) => {
            const testimonials = form.testimonials.filter((_, i) => i !== index);
            apply({ testimonials }, { testimonials });
          }}
          onUndoDelete={(item, index) => {
            const testimonials = [...form.testimonials];
            testimonials.splice(index, 0, item);
            apply({ testimonials }, { testimonials });
          }}
          renderRow={(t) => (
            <div>
              <p className="line-clamp-2 font-serif text-h4 text-ink">{t.quote || "Quote"}</p>
              <p className="mt-1 text-[length:var(--text-dash-help)] text-mute">
                {[t.couple, t.location].filter(Boolean).join(" · ") || "No attribution yet"}
              </p>
            </div>
          )}
          onEdit={(_, index) => openEdit(index)}
          addLabel="+ Add testimonial"
          onAdd={openAdd}
          emptyTitle="No testimonials yet"
        />

        <StudioDrawer
          title={editIndex === -1 ? "Add testimonial" : "Edit testimonial"}
          open={editIndex !== null && draft !== null}
          onClose={closeDrawer}
          footer={
            <button type="button" className="studio-btn bg-ink text-ivory" onClick={saveDrawer}>
              Save
            </button>
          }
        >
          {draft ? (
            <div className="grid gap-4">
              <Field id="tst-quote" label="Quote">
                <textarea
                  id="tst-quote"
                  rows={4}
                  className={inputClass + " resize-y"}
                  value={draft.quote}
                  onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
                />
              </Field>
              <Field id="tst-couple" label="Couple names">
                <input
                  id="tst-couple"
                  className={inputClass}
                  value={draft.couple}
                  onChange={(e) => setDraft({ ...draft, couple: e.target.value })}
                />
              </Field>
              <Field id="tst-loc" label="Place">
                <input
                  id="tst-loc"
                  className={inputClass}
                  value={draft.location ?? ""}
                  onChange={(e) => setDraft({ ...draft, location: e.target.value.trim() || undefined })}
                />
              </Field>
            </div>
          ) : null}
        </StudioDrawer>
      </SectionCard>
    </div>
  );
}