"use client";

import Link from "next/link";
import {
  ageFromDob,
  publicDisplayName,
  type SoulmateIntroView,
} from "@/lib/soulmates-api";
import { TINTS } from "@/components/soulmates/soulmates-create-constants";

type Props = {
  view: SoulmateIntroView;
  badge?: string;
  onInterested?: () => void;
  onNotForMe?: () => void;
  busy?: boolean;
};

export function IntroductionCard({ view, badge, onInterested, onNotForMe, busy }: Props) {
  const { profile, mutual, myResponse, theirResponse } = view;
  const name = publicDisplayName(profile);
  const age = ageFromDob(profile.basics.dateOfBirth);
  const tint = TINTS[(profile.basics.firstName.charCodeAt(0) || 0) % 4]!;
  const initial = (profile.basics.firstName[0] || "W").toUpperCase();

  return (
    <article className="border border-line bg-white">
      <div
        className="relative flex aspect-[4/4.4] items-center justify-center overflow-hidden"
        style={{ background: tint[0], color: tint[1] }}
      >
        <span className="absolute top-0 left-0 bg-white px-3 py-2 font-sans text-[10.5px] font-medium tracking-[0.18em] text-[#A39C8F] uppercase">
          {mutual ? "✓ Mutual" : theirResponse === "interested" ? "Interested in you" : "Introduction"}
        </span>
        <span
          className="font-[family-name:var(--font-bodoni,Bodoni_Moda,serif)] text-[clamp(5rem,12vw,7.5rem)] italic leading-none"
          style={{ fontFamily: '"Bodoni Moda", Didot, serif' }}
        >
          {initial}
        </span>
        <span className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-2 font-sans text-[10.5px] font-medium tracking-[0.18em] uppercase">
          Photo shared after mutual interest
        </span>
      </div>
      <div className="p-6">
        {badge ? (
          <p className="font-sans text-[11px] font-medium tracking-[0.22em] text-gold-deep uppercase">
            {badge}
          </p>
        ) : null}
        <h3 className="mt-1 font-serif text-[1.75rem] leading-tight text-ink">
          {name}
          {age ? <span className="text-mute">, {age}</span> : null}
        </h3>
        <p className="mt-1 font-sans text-[11px] tracking-[0.2em] text-gold-deep uppercase">
          {[profile.basics.city, profile.work.profession].filter(Boolean).join(" · ")}
        </p>
        {profile.about.text ? (
          <p className="mt-3 line-clamp-3 text-[17px] leading-relaxed text-mute">
            {profile.about.text}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Link
            href={`/soulmates/profile/${profile.id}`}
            className="inline-flex min-h-11 items-center border-b border-gold pb-1 font-sans text-[11.5px] font-medium tracking-[0.22em] uppercase"
          >
            View profile
          </Link>
          {myResponse === "pending" && view.introduction.status === "pending" ? (
            <>
              <button
                type="button"
                disabled={busy}
                onClick={onInterested}
                className="inline-flex min-h-11 items-center border border-ink bg-ink px-5 font-sans text-[11.5px] font-medium tracking-[0.22em] text-ivory uppercase disabled:opacity-40"
              >
                Interested
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onNotForMe}
                className="inline-flex min-h-11 items-center border border-line px-5 font-sans text-[11.5px] font-medium tracking-[0.22em] uppercase disabled:opacity-40"
              >
                Not for me
              </button>
            </>
          ) : null}
        </div>
      </div>
    </article>
  );
}
