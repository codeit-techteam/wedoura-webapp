"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Field, ScreenHeader, StudioCard, inputClass } from "@/components/studio/Field";
import { ScreenSkeleton } from "@/components/studio/screen";
import { Button } from "@/components/ui/Button";
import { logout, useMyAccount } from "@/lib/vendor-api";

export default function AccountPage() {
  const account = useMyAccount();
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});
  const [done, setDone] = useState(false);
  if (!account) return <ScreenSkeleton />;

  const emailValue = email ?? account.email;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(emailValue.trim())) next.email = "An email address, please.";
    if (password && password.length < 8) next.password = "At least 8 characters.";
    if (password && password !== confirm) next.confirm = "The passwords do not match.";
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true);
  }

  return (
    <div className="max-w-xl">
      <ScreenHeader title="Account" text="Your login details. Changes here are screens only until the backend arrives." />
      {done ? (
        <div className="mt-8 border border-line bg-white p-6" role="status">
          <p className="font-serif text-h3">Saved.</p>
          <p className="mt-2 text-small text-mute">
            Nothing was actually changed; account updates go live with the backend. You still sign in with your
            original details.
          </p>
          <Button variant="link" className="mt-4" onClick={() => setDone(false)}>
            Back to account
          </Button>
        </div>
      ) : (
        <StudioCard title="Login details" className="mt-8">
        <form onSubmit={onSubmit} noValidate className="grid gap-6">
          <Field id="ac-email" label="Email" error={errors.email}>
            <input id="ac-email" type="email" autoComplete="email" value={emailValue} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
          </Field>
          <Field id="ac-password" label="New password" hint="Leave empty to keep your current password." error={errors.password}>
            <input id="ac-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
          </Field>
          <Field id="ac-confirm" label="Confirm new password" error={errors.confirm}>
            <input id="ac-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
          </Field>
          <div>
            <Button type="submit">Save changes</Button>
          </div>
        </form>
        </StudioCard>
      )}
      <p className="mt-10 border-t border-line pt-5">
        <button
          type="button"
          onClick={() => {
            void logout().then(() => router.push("/"));
          }}
          className="link-draw tap text-small text-mute hover:text-ink"
        >
          Sign out of the studio
        </button>
      </p>
    </div>
  );
}
