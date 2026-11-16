"use client";

import { Field, ScreenHeader, inputClass } from "@/components/studio/Field";
import { SaveState } from "@/components/studio/autosave";
import { ReorderButtons, ScreenSkeleton, moveItem, useListingForm } from "@/components/studio/screen";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Faq } from "@/data/types";

export default function FaqsPage() {
  const { form, apply, status, error } = useListingForm<{ faqs: Faq[] }>((l) => ({ faqs: l.faqs }));
  if (!form) return <ScreenSkeleton />;

  const save = (faqs: Faq[]) => apply({ faqs }, { faqs });
  const update = (index: number, patch: Partial<Faq>) => save(form.faqs.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  const add = () => save([...form.faqs, { question: "", answer: "" }]);

  return (
    <div className="max-w-3xl">
      <ScreenHeader
        title="FAQs"
        text="The questions couples ask before writing, answered once on your profile."
        right={<SaveState status={status} error={error} />}
      />
      {form.faqs.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No FAQs yet." text="Booking lead time, travel and delivery are the three everyone asks." action={{ label: "Add a question", onClick: add }} tone="white" />
        </div>
      ) : (
        <>
          <ul className="mt-8 grid gap-4">
            {form.faqs.map((faq, i) => (
              <li key={i} className="grid gap-4 border border-line bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <Field id={`fq-q-${i}`} label={`Question ${i + 1}`} className="min-w-0 flex-1">
                    <input id={`fq-q-${i}`} type="text" value={faq.question} onChange={(e) => update(i, { question: e.target.value })} className={inputClass} />
                  </Field>
                  <div className="flex shrink-0 items-center gap-2 pt-7">
                    <ReorderButtons index={i} total={form.faqs.length} onMove={(f, t) => save(moveItem(form.faqs, f, t))} label={`question ${i + 1}`} />
                    <button type="button" onClick={() => save(form.faqs.filter((_, j) => j !== i))} className="label tap px-2 text-mute transition-chrome hover:text-ink">
                      Delete
                    </button>
                  </div>
                </div>
                <Field id={`fq-a-${i}`} label="Answer">
                  <textarea id={`fq-a-${i}`} rows={3} value={faq.answer} onChange={(e) => update(i, { answer: e.target.value })} className={inputClass + " resize-y"} />
                </Field>
              </li>
            ))}
          </ul>
          <button type="button" onClick={add} className="label tap mt-5 border border-ink px-5 py-2.5 text-ink transition-chrome hover:bg-ink hover:text-white">
            Add a question
          </button>
        </>
      )}
    </div>
  );
}
