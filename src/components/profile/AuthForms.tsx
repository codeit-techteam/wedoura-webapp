"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const field =
  "w-full border-b border-line bg-transparent pb-2 text-body text-ink outline-offset-4 placeholder:text-mute/60 focus:border-ink";

/** The vendor login screen. Validates, shows a success state, sends nothing. */
export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [done, setDone] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) next.email = "An email address, please.";
    if (password.length < 8) next.password = "At least 8 characters.";
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true);
  }

  if (done) {
    return (
      <div role="status">
        <p className="font-serif text-h2">Signed in.</p>
        <p className="mt-3 text-mute">
          Screens only for now: no account exists yet. Head to the studio to see what vendors will manage.
        </p>
        <Button href="/vendor-studio" variant="link" className="mt-6">
          Open Vendor Studio
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8">
      <div>
        <label htmlFor="login-email" className="label text-mute">
          Email
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={cn(field, "mt-3")}
        />
        {errors.email && (
          <p className="mt-2 text-small text-ink" role="alert">
            {errors.email}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="login-password" className="label text-mute">
          Password
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={cn(field, "mt-3")}
        />
        {errors.password && (
          <p className="mt-2 text-small text-ink" role="alert">
            {errors.password}
          </p>
        )}
      </div>
      <div>
        <Button type="submit">Sign in</Button>
      </div>
    </form>
  );
}

/** The contact form. Validates, shows a success state, sends nothing. */
export function ContactForm() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [done, setDone] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = "Please tell us your name.";
    if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) next.email = "An email address, please.";
    if (values.message.trim().length < 10) next.message = "A line or two helps us reply well.";
    setErrors(next);
    if (Object.keys(next).length === 0) setDone(true);
  }

  if (done) {
    return (
      <div className="bg-ivory px-8 py-12" role="status">
        <p className="font-serif text-h2">Got it, {values.name}.</p>
        <p className="mt-3 max-w-prose text-mute">
          We read everything and reply within two working days. Nothing was actually sent yet; the form goes
          live with the backend.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8">
      <div>
        <label htmlFor="ct-name" className="label text-mute">
          Your name
        </label>
        <input id="ct-name" type="text" autoComplete="name" value={values.name} onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))} className={cn(field, "mt-3")} />
        {errors.name && (
          <p className="mt-2 text-small text-ink" role="alert">
            {errors.name}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="ct-email" className="label text-mute">
          Email
        </label>
        <input id="ct-email" type="email" autoComplete="email" value={values.email} onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))} className={cn(field, "mt-3")} />
        {errors.email && (
          <p className="mt-2 text-small text-ink" role="alert">
            {errors.email}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="ct-message" className="label text-mute">
          Message
        </label>
        <textarea id="ct-message" rows={5} value={values.message} onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))} className={cn(field, "mt-3 resize-y")} />
        {errors.message && (
          <p className="mt-2 text-small text-ink" role="alert">
            {errors.message}
          </p>
        )}
      </div>
      <div>
        <Button type="submit">Send message</Button>
      </div>
    </form>
  );
}
