"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/cn";
import { useFocusTrap } from "@/lib/focus-trap";
import { EASE } from "@/lib/motion";
import { getCoupleEmail } from "@/lib/couple-auth";
import { createInquiry } from "@/lib/vendor-api";
import type { EnquiryTarget } from "./enquiry-context";

/* ---------------------------------------------------------------- helpers */

function getMonthOptions(): { value: string; label: string }[] {
  const opts: { value: string; label: string }[] = [{ value: "", label: "Not decided yet" }];
  const now = new Date();
  for (let i = 0; i < 18; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const value = d.toISOString().slice(0, 7); // YYYY-MM
    const label = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    opts.push({ value, label });
  }
  return opts;
}

const GUEST_OPTIONS = [
  { value: "", label: "Not sure yet" },
  { value: "50", label: "Up to 50" },
  { value: "100", label: "50 – 100" },
  { value: "200", label: "100 – 200" },
  { value: "500", label: "200 – 500" },
  { value: "501", label: "500+" },
];

const QUICK_PROMPTS = [
  "What is your availability for my date?",
  "Can you share a package breakdown?",
  "Do you travel to my location?",
  "What is included in your starting price?",
];

/* ---------------------------------------------------------------- types */

interface Props {
  targets: EnquiryTarget[];
  onClose: () => void;
}

type FormState = "idle" | "submitting" | "success" | "error";

/* ---------------------------------------------------------------- component */

export function EnquiryDrawer({ targets, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const monthOptions = getMonthOptions();

  useFocusTrap(ref, targets.length > 0);

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

  function appendPrompt(text: string) {
    setMessage((prev) => (prev ? `${prev.trimEnd()}\n${text}` : text));
  }

  function validate() {
    let ok = true;
    if (!name.trim()) { setNameError("Please enter your name."); ok = false; }
    else setNameError("");
    const digits = whatsapp.replace(/\D/g, "");
    if (digits.length !== 10) { setPhoneError("Enter a 10-digit WhatsApp number."); ok = false; }
    else setPhoneError("");
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
            message: message.trim(),
            weddingMonth: weddingMonth || undefined,
            guests: guests ? Number(guests) : undefined,
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
    // Reset form after a brief delay so the animation completes first
    setTimeout(() => {
      setName(""); setWhatsapp(""); setWeddingMonth(""); setGuests(""); setCity(""); setMessage("");
      setNameError(""); setPhoneError(""); setFormState("idle");
    }, 400);
    onClose();
  }

  return (
    <AnimatePresence>
      {targets.length > 0 && (
        <motion.div
          className="fixed inset-0 z-[60] flex justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="absolute inset-0 bg-ink/40"
          />
          {/* Drawer */}
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={isMulti ? "Enquire with vendors" : `Enquire with ${targets[0]?.name}`}
            className="relative flex h-full w-full max-w-lg flex-col overflow-y-auto bg-white"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white px-6 py-4">
              <div>
                <p className="font-sans text-button font-medium tracking-button uppercase text-mute">Enquire</p>
                {isMulti ? (
                  <p className="mt-0.5 font-serif text-lead text-ink">
                    {targets.length} vendors on your shortlist
                  </p>
                ) : (
                  <p className="mt-0.5 font-serif text-lead text-ink">{targets[0]?.name}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Close enquiry drawer"
                className="tap flex size-10 items-center justify-center text-mute hover:text-ink"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            {formState === "success" ? (
              /* Success panel */
              <div className="flex flex-1 flex-col items-center justify-center gap-6 px-8 py-16 text-center">
                <span className="flex size-14 items-center justify-center rounded-full bg-ivory text-gold">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 13 5 5L19 7"/></svg>
                </span>
                <div>
                  <p className="font-serif text-h3 text-ink">Enquiry sent!</p>
                  <p className="mt-3 max-w-xs text-body text-mute">
                    {isMulti
                      ? `Your message has been sent to all ${targets.length} vendors. They'll be in touch on WhatsApp.`
                      : `${targets[0]?.name} will reach out on WhatsApp soon.`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="tap mt-4 font-sans text-button font-medium tracking-button uppercase text-ink hover:text-gold-deep link-draw"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6 px-6 py-7">
                {isMulti && (
                  <p className="text-small text-mute border-l-2 border-gold pl-4">
                    One message, sent to every vendor on your shortlist.
                  </p>
                )}

                {/* Name */}
                <div>
                  <label className="label block text-mute mb-2" htmlFor="enq-name">Your name</label>
                  <input
                    id="enq-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Aarav & Priya"
                    className={cn(
                      "w-full border border-line bg-transparent px-4 py-3 text-body text-ink placeholder:text-mute/50 focus:outline-none focus:border-ink",
                      nameError && "border-red-500",
                    )}
                    autoComplete="name"
                  />
                  {nameError && <p className="mt-1 text-small text-red-600">{nameError}</p>}
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="label block text-mute mb-2" htmlFor="enq-phone">WhatsApp number</label>
                  <div className="flex items-center border border-line focus-within:border-ink">
                    <span className="select-none border-r border-line px-3 py-3 text-small text-mute">+91</span>
                    <input
                      id="enq-phone"
                      type="tel"
                      inputMode="numeric"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="98765 43210"
                      maxLength={12}
                      className={cn(
                        "min-w-0 flex-1 bg-transparent px-4 py-3 text-body text-ink placeholder:text-mute/50 focus:outline-none",
                        phoneError && "text-red-700",
                      )}
                      autoComplete="tel-national"
                    />
                  </div>
                  {phoneError && <p className="mt-1 text-small text-red-600">{phoneError}</p>}
                </div>

                {/* Wedding month + guests (2-col) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label block text-mute mb-2" htmlFor="enq-month">Wedding month</label>
                    <select
                      id="enq-month"
                      value={weddingMonth}
                      onChange={(e) => setWeddingMonth(e.target.value)}
                      className="w-full border border-line bg-transparent px-4 py-3 text-body text-ink focus:outline-none focus:border-ink"
                    >
                      {monthOptions.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label block text-mute mb-2" htmlFor="enq-guests">Guest count</label>
                    <select
                      id="enq-guests"
                      value={guests}
                      onChange={(e) => setGuests(e.target.value)}
                      className="w-full border border-line bg-transparent px-4 py-3 text-body text-ink focus:outline-none focus:border-ink"
                    >
                      {GUEST_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Wedding city */}
                <div>
                  <label className="label block text-mute mb-2" htmlFor="enq-city">Wedding city</label>
                  <input
                    id="enq-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Jaipur, Udaipur…"
                    className="w-full border border-line bg-transparent px-4 py-3 text-body text-ink placeholder:text-mute/50 focus:outline-none focus:border-ink"
                    autoComplete="address-level2"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="label block text-mute mb-2" htmlFor="enq-message">Message</label>
                  <textarea
                    id="enq-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Tell them about your wedding…"
                    className="w-full resize-none border border-line bg-transparent px-4 py-3 text-body text-ink placeholder:text-mute/50 focus:outline-none focus:border-ink"
                  />
                  {/* Quick prompts */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    {QUICK_PROMPTS.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => appendPrompt(p)}
                        className="tap rounded-none border border-line px-3 py-1.5 text-small text-mute transition-chrome hover:border-ink hover:text-ink"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {formState === "error" && (
                  <p className="text-small text-red-600">
                    Something went wrong. Please try again.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={formState === "submitting"}
                  className="tap min-h-12 w-full bg-ink font-sans text-button font-medium tracking-button uppercase text-ivory transition-chrome hover:bg-gold-deep disabled:opacity-50"
                >
                  {formState === "submitting"
                    ? "Sending…"
                    : isMulti
                      ? `Enquire with all ${targets.length} vendors`
                      : "Send enquiry"}
                </button>
              </form>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
