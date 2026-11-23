"use client";

import { useState } from "react";
import { Label } from "@/components/ui/Label";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Reveal } from "@/components/motion/Reveal";
import type { Interview } from "@/data/types";

type Props = {
  interview: Interview;
};

/**
 * Voices section: an interview written by Wedoura. Shows a lede, then Q&A
 * pairs that expand with "Read the full interview". An optional YouTube
 * button opens a video version.
 */
export function InterviewBlock({ interview }: Props) {
  const [expanded, setExpanded] = useState(false);
  const hasQA = interview.questions && interview.questions.length > 0;

  return (
    <section id="voices" aria-label="Voices" className="scroll-profile-anchor border-t border-line py-section-sm">
      <Label className="mb-4">Voices</Label>
      <MaskedHeading as="h2" className="font-serif text-h2" lines={["In their words, and ours"]} />

      <Reveal className="mt-10">
        <article className="max-w-2xl">
          {interview.durationLabel && (
            <p className="label text-mute mb-3">The interview · {interview.durationLabel}</p>
          )}
          <h3 className="font-serif text-h3 italic leading-snug">&ldquo;{interview.title}&rdquo;</h3>
          <p className="label mt-2 text-mute">{interview.by}</p>

          {interview.lede && (
            <p className="mt-5 max-w-prose text-mute leading-relaxed">{interview.lede}</p>
          )}

          {interview.paragraphs && interview.paragraphs.length > 0 && (
            <div className="mt-5 flex flex-col gap-4">
              {interview.paragraphs.map((p, i) => (
                <p key={i} className="max-w-prose text-mute">
                  {p}
                </p>
              ))}
            </div>
          )}

          {hasQA && (
            <>
              <div
                id="interview-full"
                className={expanded ? "mt-8 flex flex-col gap-6" : "hidden"}
                aria-hidden={!expanded}
              >
                {interview.questions!.map((qa, i) => (
                  <div key={i}>
                    <p className="font-medium text-ink">{qa.question}</p>
                    <p className="mt-2 max-w-prose text-mute leading-relaxed">{qa.answer}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                aria-controls="interview-full"
                className="tap mt-6 inline-flex items-center gap-2 border border-line px-5 py-3 text-small transition-chrome hover:border-ink"
              >
                {expanded ? "Close interview" : "Read the full interview"}
              </button>
            </>
          )}

          {interview.youtubeUrl && (
            <a
              href={interview.youtubeUrl}
              target="_blank"
              rel="noreferrer"
              className="tap mt-4 ml-3 inline-flex items-center gap-2 border border-line px-5 py-3 text-small transition-chrome hover:border-ink"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {interview.durationLabel ? `Interview · ${interview.durationLabel}` : "Watch interview"}
            </a>
          )}
        </article>
      </Reveal>
    </section>
  );
}
