"use client";

import { useState } from "react";
import { createPlanningRequest } from "@/lib/journey-api";
import { clearPlan, usePlan } from "@/lib/honeymoon-plan";

const BUDGETS = ["Under ₹1 lakh", "₹1 to 2 lakh", "₹2 to 4 lakh", "₹4 lakh and above"];

type Props = { moods: string[] };

/**
 * The landing "Tell us your dream" form. Saves a PlanningRequest (names,
 * WhatsApp, travel month, mood, budget) and folds any moments from the plan
 * tray into the note.
 */
export function HoneymoonLandingPlanForm({ moods }: Props) {
  const plan = usePlan();
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [month, setMonth] = useState("");
  const [mood, setMood] = useState("");
  const [budget, setBudget] = useState("");
  const [error, setError] = useState("");
  const [sentTo, setSentTo] = useState("");

  function submit() {
    const nm = name.trim();
    const digits = whatsapp.replace(/[^\d+]/g, "");
    if (!nm) {
      setError("Please add your names.");
      return;
    }
    if (digits.length < 8) {
      setError("Please add a WhatsApp or phone number so we can reach you.");
      return;
    }
    setError("");
    createPlanningRequest({
      name: nm,
      whatsapp: digits,
      weddingMonth: month || undefined,
      mood: mood || undefined,
      budget: budget || undefined,
      note: plan.length > 0 ? `Moments in their plan: ${plan.map((i) => i.name).join(", ")}` : undefined,
    });
    clearPlan();
    setSentTo(nm);
  }

  if (sentTo) {
    return (
      <p className="note" role="status" style={{ marginTop: 28, fontSize: 18 }}>
        Thank you, {sentTo}. Our team will send honeymoon ideas within 24 hours.
      </p>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="fld">
        <label className="w">
          <span>Your names</span>
          <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
        </label>
        <label>
          <span>WhatsApp number</span>
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
          />
        </label>
        <label>
          <span>Travel month</span>
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        </label>
        <label>
          <span>Mood</span>
          <select value={mood} onChange={(e) => setMood(e.target.value)}>
            <option value="">Surprise me</option>
            {moods.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Budget per couple</span>
          <select value={budget} onChange={(e) => setBudget(e.target.value)}>
            <option value="">Choose a range</option>
            {BUDGETS.map((b) => (
              <option key={b}>{b}</option>
            ))}
          </select>
        </label>
      </div>
      {plan.length > 0 && <p className="picked">Your plan: {plan.map((i) => i.name).join(", ")}</p>}
      {error && <p className="berr">{error}</p>}
      <button className="btn" type="submit">
        Get honeymoon ideas
      </button>
      <p className="note" role="status">
        Free, with no obligation. Replies within 24 hours.
      </p>
    </form>
  );
}
