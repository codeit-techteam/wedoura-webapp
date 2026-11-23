"use client";

import { useState } from "react";
import { Lightbox } from "@/components/media/Lightbox";
import { VideoTile } from "@/components/media/VideoTile";
import { Button } from "@/components/ui/Button";
import { MultiStepForm } from "@/components/ui/MultiStepForm";

const STEPS = [
  { numeral: "I", label: "Business" },
  { numeral: "II", label: "Contact" },
  { numeral: "III", label: "Review" },
];

type Props = { poster: string; alt: string };

/** Interactive specimens: lightbox, video tile, multi-step shell. */
export function FoundationsDemo({ poster, alt }: Props) {
  const [index, setIndex] = useState<number | null>(null);
  const [step, setStep] = useState(0);
  const [note, setNote] = useState("");
  const slides = [
    { src: poster, alt },
    { src: poster, alt: `${alt}, again` },
  ];

  return (
    <div className="mt-12 flex flex-col gap-16">
      <div>
        <Button type="button" onClick={() => setIndex(0)}>
          Open the lightbox
        </Button>
        <Lightbox slides={slides} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
      </div>
      <VideoTile
        src="/ref/home/video-01.mp4"
        poster={poster}
        alt={alt}
        title="Moments worth keeping"
        className="aspect-video max-w-3xl"
      />
      <MultiStepForm
        chrome={false}
        steps={STEPS}
        step={step}
        onStep={setStep}
        onExit={() => setNote("Saved. Nothing was sent.")}
        savedNote={note}
        onBack={step > 0 ? () => setStep((value) => value - 1) : undefined}
        onContinue={step < STEPS.length - 1 ? () => setStep((value) => value + 1) : undefined}
        continueLabel={step === STEPS.length - 1 ? "Submit" : "Continue"}
        review={
          <div>
            <p className="font-serif text-h3">Your business name</p>
            <p className="mt-2 text-mute">City · Category</p>
          </div>
        }
      >
        <p className="font-serif text-h2">
          Step {STEPS[step]?.numeral}
          <em> {STEPS[step]?.label}</em>
        </p>
        <p className="mt-4 max-w-prose text-mute">
          Roman numerals, Save and exit, and the review card. This specimen does not submit an application.
        </p>
      </MultiStepForm>
    </div>
  );
}
