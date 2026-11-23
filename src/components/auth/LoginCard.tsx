"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { cn } from "@/lib/cn";

export type LoginCardProps = {
  eyebrow: string;
  title: React.ReactNode;
  lead: string;
  emailPlaceholder?: string;
  demoHint: string;
  footer: React.ReactNode;
  successMessage: string;
  redirectTo: string;
  onLogin: (
    email: string,
    password: string,
  ) => Promise<{ ok: true; skipSuccess?: boolean } | { ok: false; error: string }>;
  onGoogle: () => Promise<{ ok: true; skipSuccess?: boolean } | { ok: false; error: string }>;
};

type Mode = "login" | "forgot" | "forgot-sent" | "success";

/**
 * Shared email/password login card: forgot password, Google mock,
 * and the "you're in" transition. No mobile OTP or magic link.
 */
export function LoginCard({
  eyebrow,
  title,
  lead,
  emailPlaceholder = "you@example.com",
  demoHint,
  footer,
  successMessage,
  redirectTo,
  onLogin,
  onGoogle,
}: LoginCardProps) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [keep, setKeep] = useState(true);
  const [forgotEmail, setForgotEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function finishOk() {
    setMode("success");
    window.setTimeout(() => router.push(redirectTo), 1200);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("An email address, please.");
      return;
    }
    if (!password) {
      setError("Your password, please.");
      return;
    }
    setPending(true);
    const result = await onLogin(email, password);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    void keep;
    if (result.skipSuccess) return;
    await finishOk();
  }

  async function onForgot(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(forgotEmail.trim())) {
      setError("An email address, please.");
      return;
    }
    setPending(true);
    await new Promise((r) => setTimeout(r, 400));
    setPending(false);
    setMode("forgot-sent");
  }

  async function onGoogleClick() {
    setError(null);
    setPending(true);
    const result = await onGoogle();
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.skipSuccess) return;
    await finishOk();
  }

  if (mode === "success") {
    return (
      <div className="auth-ok" role="status" aria-live="polite">
        <div className="seal">✓</div>
        <span className="label text-gold-deep">Logged in</span>
        <h2>
          You&apos;re <em>in</em>
        </h2>
        <p>{successMessage}</p>
      </div>
    );
  }

  if (mode === "forgot-sent") {
    return (
      <div className="auth-ok" role="status">
        <div className="seal">✓</div>
        <h2>
          Check your <em>inbox</em>
        </h2>
        <p>
          If an account exists for {forgotEmail.trim()}, we&apos;ll send a link to set a new password.
        </p>
        <button type="button" className="auth-tl" onClick={() => setMode("login")}>
          ← Back to log in
        </button>
      </div>
    );
  }

  if (mode === "forgot") {
    return (
      <div className="auth-box">
        <span className="label text-gold-deep">{eyebrow}</span>
        <h1>
          Reset your <em>password</em>
        </h1>
        <p className="auth-lead">Enter the email on your Wedoura account. We&apos;ll send a link to set a new password.</p>
        <form onSubmit={onForgot} noValidate>
          <label className={cn("auth-bf", error && "bad")}>
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              placeholder={emailPlaceholder}
            />
          </label>
          <p className="auth-err" role="alert">
            {error}
          </p>
          <button className="auth-btn wide" type="submit" disabled={pending}>
            Send reset link
          </button>
          <div className="auth-orow">
            <button type="button" className="auth-tl" onClick={() => { setMode("login"); setError(null); }}>
              ← Back to log in
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="auth-box">
      <span className="label text-gold-deep">{eyebrow}</span>
      <h1>{title}</h1>
      <p className="auth-lead">{lead}</p>

      <form onSubmit={onSubmit} noValidate>
        <label className={cn("auth-bf", error && "bad")}>
          <span>Email</span>
          <input
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={emailPlaceholder}
          />
        </label>
        <label className={cn("auth-bf", error && "bad")}>
          <span>Password</span>
          <div className="auth-pw">
            <input
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="auth-tl"
              aria-pressed={showPw}
              onClick={() => setShowPw((v) => !v)}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </label>
        <div className="auth-orow">
          <label className="auth-ck sm">
            <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} />
            <span>Keep me logged in</span>
          </label>
          <button type="button" className="auth-tl" onClick={() => { setMode("forgot"); setError(null); setForgotEmail(email); }}>
            Forgot password?
          </button>
        </div>
        <p className="auth-err" role="alert">
          {error}
        </p>
        <button className="auth-btn wide" type="submit" disabled={pending}>
          Log in
        </button>
      </form>

      <div className="auth-or">
        <span>or</span>
      </div>
      <button type="button" className="auth-btn ghost wide" disabled={pending} onClick={onGoogleClick} style={{ marginTop: 0 }}>
        Continue with Google
      </button>

      <div className="auth-foot">{footer}</div>
      <p className="auth-demo">{demoHint}</p>
    </div>
  );
}

/** Onboarding: names, wedding month, city — three questions after first couple login. */
export function CoupleOnboarding({
  onDone,
}: {
  onDone: (values: { names: string; weddingMonth: string; city: string }) => Promise<void>;
}) {
  const [names, setNames] = useState("");
  const [weddingMonth, setWeddingMonth] = useState("");
  const [city, setCity] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const months = Array.from({ length: 24 }, (_, i) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + i);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleString("en-IN", { month: "long", year: "numeric" });
    return { value, label };
  });

  const cities = [
    "Bengaluru",
    "Mumbai",
    "Delhi NCR",
    "Chennai",
    "Hyderabad",
    "Kolkata",
    "Pune",
    "Jaipur",
    "Udaipur",
    "Goa",
    "Kochi",
    "Mysuru",
    "Destination abroad",
    "Not decided yet",
  ];

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!names.trim()) {
      setError("Your names, please.");
      return;
    }
    if (!weddingMonth) {
      setError("Pick a wedding month.");
      return;
    }
    if (!city) {
      setError("Pick a city.");
      return;
    }
    if (!terms) {
      setError("Please agree to the terms to continue.");
      return;
    }
    setPending(true);
    setError(null);
    await onDone({ names: names.trim(), weddingMonth, city });
    setPending(false);
  }

  return (
    <div className="auth-box">
      <span className="label text-gold-deep">Welcome</span>
      <h1>
        Three quick <em>things</em>
      </h1>
      <p className="auth-lead">Welcome to Wedoura. Three quick things, and your wedding space is ready.</p>
      <form onSubmit={onSubmit} noValidate>
        <label className="auth-bf">
          <span>Your names</span>
          <input
            type="text"
            value={names}
            onChange={(e) => setNames(e.target.value)}
            placeholder="Ananya & Kabir"
            autoComplete="name"
          />
        </label>
        <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
          <label className="auth-bf">
            <span>Wedding month</span>
            <select value={weddingMonth} onChange={(e) => setWeddingMonth(e.target.value)}>
              <option value="">Choose a month</option>
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </label>
          <label className="auth-bf">
            <span>City</span>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option value="">Choose a city</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="auth-ck mt-4">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="border-b border-gold pb-0.5 text-ink">
              Wedoura terms
            </Link>
            . Vendors only see our number when we send them an enquiry.
          </span>
        </label>
        <p className="auth-err" role="alert">
          {error}
        </p>
        <button className="auth-btn wide" type="submit" disabled={pending}>
          Create our wedding space
        </button>
      </form>
    </div>
  );
}
