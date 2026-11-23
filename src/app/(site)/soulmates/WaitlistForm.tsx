"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createSoulmatesWaitlist } from "@/lib/journey-api";

const fieldBase =
  "w-full border border-line bg-transparent px-4 py-3 text-[1rem] text-ink placeholder:text-mute/60 focus:outline-none focus:border-ink transition-colors";
const labelBase = "label mb-1.5 block text-mute";

/** Soulmates waiting-list signup: name, email, optional city. Nothing else. */
export function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [done, setDone] = useState(false);

  function validate() {
    let ok = true;
    if (!name.trim()) {
      setNameError("Please add your name.");
      ok = false;
    } else {
      setNameError("");
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError("Please add an email address we can write to.");
      ok = false;
    } else {
      setEmailError("");
    }
    return ok;
  }

  function submit() {
    if (!validate()) return;
    createSoulmatesWaitlist({ name, email, city: city || undefined });
    setDone(true);
  }

  if (done) {
    return (
      <div className="border border-line bg-white px-8 py-10 text-center" role="status">
        <p className="font-serif text-h3 text-ink">You&rsquo;re on the list, {name.trim()}.</p>
        <p className="mt-3 text-body text-mute">
          We&rsquo;ll write to {email.trim().toLowerCase()} when Soulmates opens. Nothing else, no newsletters.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      noValidate
      className="border border-line bg-white p-6 md:p-8"
      aria-label="Join the Soulmates waiting list"
    >
      <div className="space-y-5">
        <div>
          <label htmlFor="sm-name" className={labelBase}>
            Your name
          </label>
          <input
            id="sm-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Meera"
            className={fieldBase}
            aria-describedby={nameError ? "sm-name-err" : undefined}
          />
          {nameError && (
            <p id="sm-name-err" className="mt-1.5 text-small text-red-600">
              {nameError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="sm-email" className={labelBase}>
            Email
          </label>
          <input
            id="sm-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={fieldBase}
            aria-describedby={emailError ? "sm-email-err" : undefined}
          />
          {emailError && (
            <p id="sm-email-err" className="mt-1.5 text-small text-red-600">
              {emailError}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="sm-city" className={labelBase}>
            City <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="sm-city"
            type="text"
            autoComplete="address-level2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Bengaluru"
            className={fieldBase}
          />
        </div>
      </div>

      <div className="mt-7 flex flex-col items-start gap-4">
        <Button type="submit" variant="solid" tone="ink" className="w-full sm:w-auto">
          Join the waiting list
        </Button>
        <p className="text-small text-mute">
          One email when it opens. No date of birth, no income, no documents — ever.
        </p>
      </div>
    </form>
  );
}
