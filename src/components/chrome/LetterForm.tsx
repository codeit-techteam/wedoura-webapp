"use client";

import { useState } from "react";

/** "The Wedoura Letter". Validates and shows a success line. Sends nothing. */
export function LetterForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  return (
    <form
      className="mt-8 max-w-xl"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        const value = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          setError("Enter an email address.");
          setDone(false);
          return;
        }
        setError("");
        setDone(true);
      }}
    >
      <div className="flex items-center gap-4 border-b-[1.5px] border-ink">
        <label htmlFor="wedoura-letter" className="sr-only">
          Email address
        </label>
        <input
          id="wedoura-letter"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Your email address"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setDone(false);
            setError("");
          }}
          className="min-w-0 flex-1 bg-transparent py-3.5 text-body text-ink outline-offset-4 placeholder:text-mute"
        />
        <button
          type="submit"
          className="min-h-12 shrink-0 font-sans text-[0.8125rem] font-medium tracking-[0.3em] text-ink uppercase hover:text-gold-deep"
        >
          Subscribe
        </button>
      </div>
      <p role="status" className="mt-3 min-h-6 font-sans text-small text-gold-deep">
        {error || (done ? "You’re on the list. One letter a month." : "")}
      </p>
    </form>
  );
}
