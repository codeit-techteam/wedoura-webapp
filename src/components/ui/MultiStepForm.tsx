"use client";

import type { ReactNode } from "react";
import { Wordmark } from "@/components/chrome/Wordmark";
import { cn } from "@/lib/cn";

export type FormStep = {
  numeral: string;
  label: string;
};

type Props = {
  steps: FormStep[];
  /** Zero-based current step. */
  step: number;
  onStep?: (index: number) => void;
  onExit?: () => void;
  exitLabel?: string;
  savedNote?: string;
  children: ReactNode;
  /** The "how couples will see you" card, or any review summary. */
  review?: ReactNode;
  onBack?: () => void;
  onContinue?: () => void;
  continueLabel?: string;
  backLabel?: string;
  /** The wordmark bar. Off when the page already has the site header. */
  chrome?: boolean;
};

/**
 * The vendor application shell: Roman-numeral steps, Save and exit,
 * and a review card beside the current step.
 */
export function MultiStepForm({
  steps,
  step,
  onStep,
  onExit,
  exitLabel = "Save & exit",
  savedNote,
  children,
  review,
  onBack,
  onContinue,
  continueLabel = "Continue",
  backLabel = "← Back",
  chrome = true,
}: Props) {
  const current = steps[step];
  const progress = steps.length === 0 ? 0 : ((step + 1) / steps.length) * 100;

  return (
    <div className="bg-ivory text-copy">
      {chrome ? (
      <div className="sticky top-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-line bg-ivory/95 px-[clamp(1.25rem,5vw,5.5rem)] py-4 backdrop-blur-md">
        <span />
        <Wordmark />
        <div className="flex items-center justify-end gap-4">
          {savedNote ? <span className="font-sans text-small text-gold-deep">{savedNote}</span> : null}
          {onExit ? (
            <button
              type="button"
              onClick={onExit}
              className="min-h-11 border-b border-gold py-2 font-sans text-button font-medium tracking-[0.22em] uppercase"
            >
              {exitLabel}
            </button>
          ) : null}
        </div>
      </div>
      ) : null}

      <div className="mx-auto max-w-[1440px] px-[clamp(1.25rem,5vw,5.5rem)] pt-8">
        {!chrome && onExit ? (
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={onExit}
              className="min-h-11 border-b border-gold py-2 font-sans text-button font-medium tracking-[0.22em] uppercase"
            >
              {exitLabel}
            </button>
          </div>
        ) : null}
        <div className="h-0.5 bg-line" aria-hidden="true">
          <div className="h-full bg-gold-deep transition-[width] duration-700 ease-wedoura" style={{ width: `${progress}%` }} />
        </div>
        <ol className="mt-3.5 hidden list-none justify-between gap-2.5 xl:flex">
          {steps.map((item, index) => {
            const state = index < step ? "done" : index === step ? "on" : "";
            return (
              <li key={item.numeral}>
                <button
                  type="button"
                  onClick={() => onStep?.(index)}
                  disabled={!onStep || index > step}
                  className={cn(
                    "flex items-center gap-2 font-sans text-label font-medium tracking-[0.2em] uppercase",
                    state === "on" ? "text-ink" : state === "done" ? "text-mute" : "text-mute/70",
                  )}
                >
                  <b
                    className={cn(
                      "font-wordmark text-[0.9375rem] font-normal tracking-normal",
                      state === "" ? "text-mute/70" : "text-gold-deep",
                    )}
                  >
                    {item.numeral}
                  </b>
                  {item.label}
                </button>
              </li>
            );
          })}
        </ol>
        {current ? (
          <p className="mt-3 font-sans text-label font-medium tracking-[0.22em] text-mute uppercase xl:hidden">
            {current.numeral} · {current.label}
          </p>
        ) : null}
      </div>

      <div className="mx-auto grid max-w-[1440px] items-start gap-10 px-[clamp(1.25rem,5vw,5.5rem)] py-12 xl:grid-cols-[minmax(0,1.45fr)_minmax(18.75rem,0.85fr)] xl:gap-24 xl:py-20">
        <div>
          {children}
          <div className="mt-10 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={onBack}
              disabled={!onBack || step === 0}
              className="min-h-12 font-sans text-button font-medium tracking-[0.2em] uppercase disabled:opacity-40"
            >
              {backLabel}
            </button>
            <button
              type="button"
              onClick={onContinue}
              disabled={!onContinue}
              className="inline-flex min-h-12 items-center bg-ink px-8 font-sans text-button font-medium tracking-button text-ivory uppercase hover:bg-gold-deep disabled:opacity-40"
            >
              {continueLabel}
            </button>
          </div>
        </div>
        {review ? (
          <aside aria-label="Review" className="border border-line bg-white p-6">
            <p className="font-sans text-label font-medium tracking-[0.3em] text-gold-deep uppercase">How couples will see you</p>
            <div className="mt-5">{review}</div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
