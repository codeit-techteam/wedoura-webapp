"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/studio/Field";
import { RepeatableList } from "@/components/studio/RepeatableList";
import { SectionCard } from "@/components/studio/SectionCard";
import { StudioDrawer } from "@/components/studio/StudioDrawer";
import { ScreenSkeleton, useListingForm } from "@/components/studio/screen";
import type { Interview } from "@/data/types";
import { publicProfileHref } from "@/lib/studio-profile-nav";

type Form = {
  interviewTitle: string;
  interviewBy: string;
  interviewLede: string;
  interviewParagraphs: string;
  interviewYoutube: string;
  interviewDuration: string;
  interviewQuestions: { question: string; answer: string }[];
};

const emptyQa = () => ({ question: "", answer: "" });

export default function ProfileInterviewPage() {
  const { listing, form, apply } = useListingForm<Form>((l) => {
    const interview = l.pendingInterview ?? l.interview;
    return {
      interviewTitle: interview?.title ?? "",
      interviewBy: interview?.by ?? "",
      interviewLede: interview?.lede ?? "",
      interviewParagraphs: (interview?.paragraphs ?? []).join("\n\n"),
      interviewYoutube: interview?.youtubeUrl ?? "",
      interviewDuration: interview?.durationLabel ?? "",
      interviewQuestions: interview?.questions ?? [],
    };
  });

  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [draftQa, setDraftQa] = useState<{ question: string; answer: string } | null>(null);

  function saveInterview(patch: Partial<Form>) {
    if (!form || !listing) return;
    const next = { ...form, ...patch };
    const paragraphs = next.interviewParagraphs
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    const questions = next.interviewQuestions
      .map((q) => ({ question: q.question.trim(), answer: q.answer.trim() }))
      .filter((q) => q.question || q.answer);
    const empty =
      !next.interviewTitle.trim() &&
      !next.interviewBy.trim() &&
      !next.interviewLede.trim() &&
      paragraphs.length === 0 &&
      !next.interviewYoutube.trim() &&
      !next.interviewDuration.trim() &&
      questions.length === 0;
    const interview: Interview | undefined = empty
      ? undefined
      : {
          title: next.interviewTitle.trim() || "In conversation",
          by: next.interviewBy.trim() || "Wedoura",
          lede: next.interviewLede.trim() || undefined,
          paragraphs: paragraphs.length ? paragraphs : undefined,
          questions: questions.length ? questions : undefined,
          youtubeUrl: next.interviewYoutube.trim() || undefined,
          durationLabel: next.interviewDuration.trim() || undefined,
          poster: listing.pendingInterview?.poster ?? listing.interview?.poster,
        };
    apply(
      {
        interviewTitle: next.interviewTitle,
        interviewBy: next.interviewBy,
        interviewLede: next.interviewLede,
        interviewParagraphs: next.interviewParagraphs,
        interviewYoutube: next.interviewYoutube,
        interviewDuration: next.interviewDuration,
        interviewQuestions: next.interviewQuestions,
      },
      { interview },
    );
  }

  if (!form || !listing) return <ScreenSkeleton />;

  const currentForm = form;

  function saveQaDrawer() {
    if (!draftQa || editIndex === null) return;
    const interviewQuestions =
      editIndex === -1
        ? [...currentForm.interviewQuestions, draftQa]
        : currentForm.interviewQuestions.map((q, i) => (i === editIndex ? draftQa : q));
    saveInterview({ interviewQuestions });
    setEditIndex(null);
    setDraftQa(null);
  }

  return (
    <SectionCard
      title="Interview"
      help="Written with Wedoura. While published, edits stay in review until approved."
      shownOnProfile={Boolean(listing.interview || listing.pendingInterview)}
      seeOnProfileHref={publicProfileHref(listing, "voices")}
    >
      {listing.pendingInterview ? (
        <p className="mb-4 inline-flex border border-gold px-3 py-1.5 font-sans text-label font-medium tracking-label text-gold-deep uppercase">
          In review
        </p>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <Field id="pf-iv-title" label="Title">
          <input
            id="pf-iv-title"
            className={inputClass}
            value={form.interviewTitle}
            onChange={(e) => saveInterview({ interviewTitle: e.target.value })}
          />
        </Field>
        <Field id="pf-iv-by" label="By">
          <input
            id="pf-iv-by"
            className={inputClass}
            value={form.interviewBy}
            placeholder="Wedoura"
            onChange={(e) => saveInterview({ interviewBy: e.target.value })}
          />
        </Field>
        <Field id="pf-iv-lede" label="Lede">
          <input
            id="pf-iv-lede"
            className={inputClass}
            value={form.interviewLede}
            onChange={(e) => saveInterview({ interviewLede: e.target.value })}
          />
        </Field>
        <Field id="pf-iv-duration" label="Duration label">
          <input
            id="pf-iv-duration"
            className={inputClass}
            value={form.interviewDuration}
            placeholder="4 min"
            onChange={(e) => saveInterview({ interviewDuration: e.target.value })}
          />
        </Field>
        <Field id="pf-iv-yt" label="YouTube link">
          <input
            id="pf-iv-yt"
            className={inputClass}
            value={form.interviewYoutube}
            placeholder="https://"
            onChange={(e) => saveInterview({ interviewYoutube: e.target.value })}
          />
        </Field>
      </div>
      <Field id="pf-iv-paras" label="Introductory paragraphs" hint="A blank line starts a new paragraph.">
        <textarea
          id="pf-iv-paras"
          rows={4}
          className={inputClass + " mt-3 resize-y"}
          value={form.interviewParagraphs}
          onChange={(e) => saveInterview({ interviewParagraphs: e.target.value })}
        />
      </Field>

      <p className="label mt-8 text-mute">Questions and answers</p>
      <div className="mt-3">
        <RepeatableList
          items={form.interviewQuestions}
          getId={(qa, i) => `iv-q-${i}`}
          onReorder={(interviewQuestions) => saveInterview({ interviewQuestions })}
          onDelete={(index) => {
            const interviewQuestions = form.interviewQuestions.filter((_, i) => i !== index);
            saveInterview({ interviewQuestions });
          }}
          onUndoDelete={(item, index) => {
            const interviewQuestions = [...form.interviewQuestions];
            interviewQuestions.splice(index, 0, item);
            saveInterview({ interviewQuestions });
          }}
          renderRow={(qa) => (
            <div>
              <p className="font-serif text-h4 text-ink">{qa.question || "Question"}</p>
              {qa.answer ? (
                <p className="mt-1 line-clamp-2 text-[length:var(--text-dash-help)] text-mute">{qa.answer}</p>
              ) : null}
            </div>
          )}
          onEdit={(_, index) => {
            setDraftQa({ ...form.interviewQuestions[index] });
            setEditIndex(index);
          }}
          addLabel="+ Add question"
          onAdd={() => {
            setDraftQa(emptyQa());
            setEditIndex(-1);
          }}
          emptyTitle="No Q&A yet"
        />
      </div>

      <StudioDrawer
        title={editIndex === -1 ? "Add question" : "Edit question"}
        open={editIndex !== null && draftQa !== null}
        onClose={() => {
          setEditIndex(null);
          setDraftQa(null);
        }}
        footer={
          <button type="button" className="studio-btn bg-ink text-ivory" onClick={saveQaDrawer}>
            Save
          </button>
        }
      >
        {draftQa ? (
          <div className="grid gap-4">
            <Field id="iv-q" label="Question">
              <input
                id="iv-q"
                className={inputClass}
                value={draftQa.question}
                onChange={(e) => setDraftQa({ ...draftQa, question: e.target.value })}
              />
            </Field>
            <Field id="iv-a" label="Answer">
              <textarea
                id="iv-a"
                rows={4}
                className={inputClass + " resize-y"}
                value={draftQa.answer}
                onChange={(e) => setDraftQa({ ...draftQa, answer: e.target.value })}
              />
            </Field>
          </div>
        ) : null}
      </StudioDrawer>
    </SectionCard>
  );
}