"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/studio/Field";
import { RepeatableList } from "@/components/studio/RepeatableList";
import { SectionCard } from "@/components/studio/SectionCard";
import { StudioDrawer } from "@/components/studio/StudioDrawer";
import { ScreenSkeleton, useListingForm } from "@/components/studio/screen";
import type { Faq } from "@/data/types";
import { publicProfileHref } from "@/lib/studio-profile-nav";

type Form = { faqs: Faq[] };

const emptyFaq = (): Faq => ({ question: "", answer: "" });

export default function ProfileFaqsPage() {
  const { listing, form, apply } = useListingForm<Form>((l) => ({ faqs: l.faqs }));

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Faq | null>(null);

  if (!form || !listing) return <ScreenSkeleton />;

  function openEdit(index: number) {
    setDraft({ ...form!.faqs[index] });
    setEditIndex(index);
  }

  function openAdd() {
    setDraft(emptyFaq());
    setEditIndex(-1);
  }

  function closeDrawer() {
    setEditIndex(null);
    setDraft(null);
  }

  function saveDrawer() {
    if (!draft || editIndex === null) return;
    const faqs =
      editIndex === -1
        ? [...form!.faqs, draft]
        : form!.faqs.map((f, i) => (i === editIndex ? draft : f));
    apply({ faqs }, { faqs });
    closeDrawer();
  }

  return (
    <SectionCard
      title="FAQs"
      help="Questions couples ask before they write."
      shownOnProfile={listing.faqs.length > 0}
      seeOnProfileHref={publicProfileHref(listing, "faq")}
    >
      <RepeatableList
        items={form.faqs}
        getId={(faq, i) => `faq-${i}-${faq.question.slice(0, 12)}`}
        onReorder={(faqs) => apply({ faqs }, { faqs })}
        onDelete={(index) => {
          const faqs = form.faqs.filter((_, i) => i !== index);
          apply({ faqs }, { faqs });
        }}
        onUndoDelete={(item, index) => {
          const faqs = [...form.faqs];
          faqs.splice(index, 0, item);
          apply({ faqs }, { faqs });
        }}
        renderRow={(faq) => (
          <div>
            <p className="font-serif text-h4 text-ink">{faq.question || "Untitled question"}</p>
            {faq.answer ? (
              <p className="mt-1 line-clamp-2 text-[length:var(--text-dash-help)] text-mute">{faq.answer}</p>
            ) : null}
          </div>
        )}
        onEdit={(_, index) => openEdit(index)}
        addLabel="+ Add question"
        onAdd={openAdd}
        emptyTitle="No questions yet"
      />

      <StudioDrawer
        title={editIndex === -1 ? "Add question" : "Edit question"}
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
            <Field id="faq-q" label="Question">
              <input
                id="faq-q"
                className={inputClass}
                value={draft.question}
                onChange={(e) => setDraft({ ...draft, question: e.target.value })}
              />
            </Field>
            <Field id="faq-a" label="Answer">
              <textarea
                id="faq-a"
                rows={5}
                className={inputClass + " resize-y"}
                value={draft.answer}
                onChange={(e) => setDraft({ ...draft, answer: e.target.value })}
              />
            </Field>
          </div>
        ) : null}
      </StudioDrawer>
    </SectionCard>
  );
}