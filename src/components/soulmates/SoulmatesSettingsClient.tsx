"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SoulmatesAuthGate } from "@/components/soulmates/SoulmatesAuthGate";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import {
  deleteMySoulmateProfile,
  publicDisplayName,
  setMySoulmateVisibility,
  unblockSoulmateProfile,
  updateMySoulmateSettings,
  useMyBlocks,
  useMySoulmateProfile,
} from "@/lib/soulmates-api";

function Settings() {
  const router = useRouter();
  const profile = useMySoulmateProfile();
  const blocks = useMyBlocks();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [deleteText, setDeleteText] = useState("");

  if (!profile) {
    return (
      <main className="bg-ivory pb-section-sm">
        <Container className="pt-12">
          <p className="text-body text-mute">No profile yet.</p>
          <Link href="/soulmates/create" className="mt-4 inline-block border-b border-gold pb-1">
            Create a profile
          </Link>
        </Container>
      </main>
    );
  }

  const canVisibility =
    profile.status === "live" || profile.status === "paused" || profile.status === "hidden";

  return (
    <main className="bg-ivory pb-section-sm">
      <Container className="max-w-3xl pt-8 md:pt-12">
        <Link
          href="/soulmates/me"
          className="inline-flex min-h-11 items-center font-sans text-[11.5px] font-medium tracking-[0.22em] text-mute uppercase"
        >
          ← Soulmates
        </Link>
        <Label className="mt-8 block">Privacy &amp; settings</Label>
        <h1 className="mt-3 font-serif text-h2 text-ink">Your controls</h1>
        <p className="mt-3 text-body text-mute">
          Changes here save immediately. Sensitive profile fields are edited under Edit profile.
        </p>

        <section className="mt-12 border-t border-line pt-8">
          <h2 className="font-serif text-h3 text-ink">Who can see your photos</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(
              [
                ["mutual", "After mutual interest", "Members see your initial until you both say yes."],
                ["verified", "Verified members", "Any verified member can see your photos."],
              ] as const
            ).map(([value, title, sub]) => (
              <label
                key={value}
                className={`cursor-pointer border p-5 ${
                  profile.photoVisibility === value ? "border-ink bg-sand" : "border-line bg-white"
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  checked={profile.photoVisibility === value}
                  onChange={async () => {
                    setBusy(true);
                    await updateMySoulmateSettings({ photoVisibility: value });
                    setBusy(false);
                    setMessage("Photo visibility saved.");
                  }}
                />
                <b className="font-serif text-[1.35rem] font-normal text-ink">{title}</b>
                <p className="mt-2 text-[14px] text-mute">{sub}</p>
              </label>
            ))}
          </div>
        </section>

        <section className="mt-12 border-t border-line pt-8">
          <label className="flex cursor-pointer items-center justify-between gap-4">
            <span>
              <b className="block font-serif text-[1.35rem] font-normal text-ink">Keep income private</b>
              <small className="mt-1 block text-[15px] text-mute">
                Only shared after mutual interest, if at all.
              </small>
            </span>
            <input
              type="checkbox"
              className="size-5 accent-[var(--color-gold-deep,#9A7A42)]"
              checked={profile.work.incomePrivate}
              disabled={busy}
              onChange={async (e) => {
                setBusy(true);
                await updateMySoulmateSettings({ incomePrivate: e.target.checked });
                setBusy(false);
                setMessage("Income privacy saved.");
              }}
            />
          </label>
          <label className="mt-6 flex cursor-pointer items-center justify-between gap-4 border-t border-line pt-6">
            <span>
              <b className="block font-serif text-[1.35rem] font-normal text-ink">
                Family can join conversations
              </b>
              <small className="mt-1 block text-[15px] text-mute">
                Parents or siblings may message on your behalf, with you in the loop.
              </small>
            </span>
            <input
              type="checkbox"
              className="size-5 accent-[var(--color-gold-deep,#9A7A42)]"
              checked={profile.about.familyCanJoin}
              disabled={busy}
              onChange={async (e) => {
                setBusy(true);
                await updateMySoulmateSettings({ familyCanJoin: e.target.checked });
                setBusy(false);
                setMessage("Family setting saved.");
              }}
            />
          </label>
        </section>

        {canVisibility ? (
          <section className="mt-12 border-t border-line pt-8">
            <h2 className="font-serif text-h3 text-ink">Profile visibility</h2>
            <div className="mt-5 grid gap-3">
              {(
                [
                  ["live", "Live", "You can receive new introductions."],
                  ["paused", "Paused", "No new introductions; existing matches stay."],
                  ["hidden", "Hidden", "Your profile is fully hidden from introductions."],
                ] as const
              ).map(([value, title, sub]) => (
                <label
                  key={value}
                  className={`flex cursor-pointer items-start gap-3 border p-4 ${
                    profile.status === value ? "border-ink bg-sand" : "border-line bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    className="mt-1"
                    checked={profile.status === value}
                    disabled={busy}
                    onChange={async () => {
                      setBusy(true);
                      const result = await setMySoulmateVisibility(value);
                      setBusy(false);
                      setMessage(result.ok ? `Profile is ${title.toLowerCase()}.` : result.error);
                    }}
                  />
                  <span>
                    <b className="font-serif text-[1.25rem] font-normal text-ink">{title}</b>
                    <p className="mt-1 text-[14px] text-mute">{sub}</p>
                  </span>
                </label>
              ))}
            </div>
          </section>
        ) : null}

        <section className="mt-12 border-t border-line pt-8">
          <h2 className="font-serif text-h3 text-ink">Blocked members</h2>
          {blocks.length === 0 ? (
            <p className="mt-4 text-body text-mute">You have not blocked anyone.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line border-t border-line">
              {blocks.map(({ profile: blocked }) => (
                <li key={blocked.id} className="flex items-center justify-between gap-4 py-4">
                  <span className="font-serif text-[1.25rem] text-ink">
                    {publicDisplayName(blocked)}
                  </span>
                  <button
                    type="button"
                    disabled={busy}
                    className="border-b border-gold pb-0.5 font-sans text-[11.5px] font-medium tracking-[0.2em] uppercase"
                    onClick={async () => {
                      setBusy(true);
                      await unblockSoulmateProfile(blocked.id);
                      setBusy(false);
                      setMessage("Unblocked.");
                    }}
                  >
                    Unblock
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-12 border border-[#9B2C2C]/30 bg-white p-6 md:p-8">
          <h2 className="font-serif text-h3 text-ink">Delete profile</h2>
          <p className="mt-3 text-body text-mute">
            This removes your profile and photos. Matches and introductions end. Type{" "}
            <strong className="font-medium text-ink">DELETE</strong> to confirm.
          </p>
          <input
            className="mt-4 w-full border border-line bg-ivory px-3 py-3 font-sans text-[15px] tracking-[0.2em]"
            value={deleteText}
            onChange={(e) => setDeleteText(e.target.value)}
            placeholder="DELETE"
            autoComplete="off"
          />
          <button
            type="button"
            disabled={busy || deleteText !== "DELETE"}
            className="mt-5 inline-flex min-h-12 items-center border border-[#9B2C2C] px-6 font-sans text-[12px] font-medium tracking-[0.24em] text-[#9B2C2C] uppercase disabled:opacity-40"
            onClick={async () => {
              setBusy(true);
              const result = await deleteMySoulmateProfile();
              setBusy(false);
              if (result.ok) {
                router.push("/soulmates");
              } else setMessage(result.error);
            }}
          >
            Delete my Soulmates profile
          </button>
        </section>

        {message ? <p className="mt-6 text-body text-mute">{message}</p> : null}
      </Container>
    </main>
  );
}

export function SoulmatesSettingsClient() {
  return (
    <SoulmatesAuthGate next="/soulmates/me/settings">
      <Settings />
    </SoulmatesAuthGate>
  );
}
