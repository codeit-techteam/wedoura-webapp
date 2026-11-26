"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { useFocusTrap } from "@/lib/focus-trap";
import { getCoupleEmail } from "@/lib/couple-auth";
import { createInquiry } from "@/lib/vendor-api";
import type { EnquiryTarget } from "./enquiry-context";

function getMonthOptions(): { value: string; label: string }[] {
  const opts: { value: string; label: string }[] = [{ value: "", label: "Not decided yet" }];
  const now = new Date();
  for (let i = 0; i < 18; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    opts.push({ value, label });
  }
  return opts;
}

const GUEST_OPTIONS = [
  { value: "", label: "Not sure yet" },
  { value: "100", label: "Under 100" },
  { value: "300", label: "100 – 300" },
  { value: "600", label: "300 – 600" },
  { value: "601", label: "600+" },
];

const QUICK_PROMPTS = [
  "Is my date available?",
  "Can you share your full price list?",
  "Do you travel for destination weddings?",
];

interface Props {
  targets: EnquiryTarget[];
  onClose: () => void;
}

type FormState = "idle" | "submitting" | "success" | "error";

/** Right-side enquiry drawer for the vendors directory. */
export function EnquiryDrawer({ targets, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const monthOptions = getMonthOptions();
  const open = targets.length > 0;

  useFocusTrap(ref, open);

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [weddingMonth, setWeddingMonth] = useState("");
  const [guests, setGuests] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");

  const isMulti = targets.length > 1;

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function appendPrompt(text: string) {
    setMessage((prev) => (prev ? `${prev.trimEnd()}\n${text}` : text));
  }

  function validate() {
    let ok = true;
    if (!name.trim()) {
      setNameError("Please enter your name.");
      ok = false;
    } else setNameError("");
    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length !== 10) {
      setPhoneError("Enter a 10-digit WhatsApp number.");
      ok = false;
    } else setPhoneError("");
    return ok;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setFormState("submitting");
    try {
      await Promise.all(
        targets.map((t) =>
          createInquiry({
            vendorSlug: t.slug,
            name: name.trim(),
            whatsapp: whatsapp.replace(/\D/g, ""),
            city: city.trim(),
            message: message.trim() || "Shortlist enquiry from Wedoura.",
            weddingMonth: weddingMonth || undefined,
            guests: guests ? Number(guests) : undefined,
            source: "shortlist",
            coupleEmail: getCoupleEmail() ?? undefined,
          }),
        ),
      );
      setFormState("success");
    } catch {
      setFormState("error");
    }
  }

  function handleClose() {
    setTimeout(() => {
      setName("");
      setWhatsapp("");
      setWeddingMonth("");
      setGuests("");
      setCity("");
      setMessage("");
      setNameError("");
      setPhoneError("");
      setFormState("idle");
    }, 300);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="vendors-dir">
      <div className="dw" id="eq" role="dialog" aria-modal="true" aria-labelledby="eqT">
        <div className="bgx" onClick={handleClose} aria-hidden />
        <div className="dwp" ref={ref} data-lenis-prevent>
          <div className="dwh">
            <div>
              <span className="cap gold">{isMulti ? "Your shortlist" : "Send an enquiry"}</span>
              <h2 id="eqT">{isMulti ? "Enquire with all" : "Check availability"}</h2>
            </div>
            <button type="button" className="dwx" onClick={handleClose}>
              Close ✕
            </button>
          </div>

          <div className="dwb" id="eqBody">
            {formState === "success" ? (
              <div className="okk">
                <div className="seal" aria-hidden>
                  ✓
                </div>
                <h3>Enquiry sent</h3>
                <p>
                  {isMulti
                    ? `Your message has been sent to all ${targets.length} vendors. They’ll be in touch on WhatsApp.`
                    : `${targets[0]?.name} will reach out on WhatsApp soon.`}
                </p>
              </div>
            ) : (
              <>
                {!isMulti && targets[0] ? (
                  <div className="eqv">
                    <div>
                      <b>{targets[0].name}</b>
                      <small>You’ll get their reply on WhatsApp.</small>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: "var(--vd-mute)", fontSize: 16, marginBottom: 8 }}>
                    One message, sent to every vendor on your shortlist.
                  </p>
                )}

                <form className="eqf" id="eqF" onSubmit={handleSubmit} noValidate>
                  <div className="row2">
                    <label className={cn("bf", nameError && "bad")}>
                      <span>Your names</span>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="name"
                        placeholder="Ananya & Kabir"
                      />
                    </label>
                    <label className={cn("bf", phoneError && "bad")}>
                      <span>WhatsApp</span>
                      <div className="pre">
                        <em>+91</em>
                        <input
                          type="tel"
                          inputMode="numeric"
                          maxLength={10}
                          value={whatsapp}
                          onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        />
                      </div>
                    </label>
                  </div>
                  {nameError ? <p className="berr">{nameError}</p> : null}
                  {phoneError ? <p className="berr">{phoneError}</p> : null}

                  <div className="row2">
                    <label className="bf">
                      <span>Wedding month</span>
                      <select value={weddingMonth} onChange={(e) => setWeddingMonth(e.target.value)}>
                        {monthOptions.map((o) => (
                          <option key={o.value || "none"} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="bf">
                      <span>Guests</span>
                      <select value={guests} onChange={(e) => setGuests(e.target.value)}>
                        {GUEST_OPTIONS.map((o) => (
                          <option key={o.value || "none"} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <label className="bf">
                    <span>Wedding city</span>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Bengaluru"
                      autoComplete="address-level2"
                    />
                  </label>

                  <label className="bf">
                    <span>Message</span>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                      placeholder="Tell them about your wedding…"
                    />
                  </label>

                  <div className="qs">
                    {QUICK_PROMPTS.map((p) => (
                      <button key={p} type="button" onClick={() => appendPrompt(p)}>
                        {p}
                      </button>
                    ))}
                  </div>

                  {formState === "error" ? (
                    <p className="berr">Something went wrong. Please try again.</p>
                  ) : null}
                </form>
              </>
            )}
          </div>

          {formState !== "success" ? (
            <div className="dwf">
              <button
                type="submit"
                form="eqF"
                className="btn"
                disabled={formState === "submitting"}
              >
                {formState === "submitting"
                  ? "Sending…"
                  : isMulti
                    ? `Enquire with all`
                    : "Send enquiry"}
              </button>
              <p>
                {isMulti
                  ? "Free. Your number is shared only with these vendors."
                  : "Free. Your number is shared only with this vendor."}
              </p>
            </div>
          ) : (
            <div className="dwf">
              <button type="button" className="btn" onClick={handleClose}>
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
