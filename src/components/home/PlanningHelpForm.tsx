"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createPlanningRequest } from "@/lib/journey-api";

const CITY_OPTIONS = [
  { value: "bengaluru", label: "Bengaluru" },
  { value: "mumbai", label: "Mumbai" },
  { value: "delhi", label: "Delhi" },
  { value: "jaipur", label: "Jaipur" },
  { value: "udaipur", label: "Udaipur" },
  { value: "goa", label: "Goa" },
  { value: "other", label: "Other" },
];

const BUDGET_OPTIONS = [
  { value: "under-10", label: "Under ₹10 lakh" },
  { value: "10-25", label: "₹10 to 25 lakh" },
  { value: "25-50", label: "₹25 to 50 lakh" },
  { value: "50-plus", label: "₹50 lakh and above" },
];

type State = "idle" | "success";

const fieldBase =
  "w-full border border-line bg-transparent px-4 py-3 text-[1rem] text-ink placeholder:text-mute/60 focus:outline-none focus:border-ink transition-colors";
const labelBase = "label mb-1.5 block text-mute";

export function PlanningHelpForm() {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [city, setCity] = useState("");
  const [budget, setBudget] = useState("");
  const [nameError, setNameError] = useState("");
  const [waError, setWaError] = useState("");
  const [state, setState] = useState<State>("idle");

  function validate() {
    let ok = true;
    if (!name.trim()) {
      setNameError("Please add your names.");
      ok = false;
    } else {
      setNameError("");
    }
    if (!whatsapp.trim()) {
      setWaError("Please add a WhatsApp or phone number so we can reach you.");
      ok = false;
    } else {
      setWaError("");
    }
    return ok;
  }

  function submit() {
    if (!validate()) return;
    createPlanningRequest({
      name: name.trim(),
      whatsapp: whatsapp.trim(),
      weddingDate: weddingDate || undefined,
      city: city || undefined,
      budget: budget || undefined,
    });
    setState("success");
  }

  if (state === "success") {
    return (
      <div className="rounded-none border border-line bg-white px-8 py-10 text-center">
        <p className="font-serif text-[1.4rem] leading-snug text-ink">
          Thank you, {name.trim()}.<br />
          <span className="text-mute font-sans text-body">
            Our planning team will send your shortlist within 24 hours.
          </span>
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
      className="space-y-5"
    >
      {/* Names – full width */}
      <div>
        <label htmlFor="plan-names" className={labelBase}>
          Your names
        </label>
        <input
          id="plan-names"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Priya & Rahul"
          className={fieldBase}
          aria-describedby={nameError ? "plan-names-err" : undefined}
        />
        {nameError && (
          <p id="plan-names-err" className="mt-1.5 text-small text-red-600">
            {nameError}
          </p>
        )}
      </div>

      {/* 2-col grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        {/* WhatsApp */}
        <div>
          <label htmlFor="plan-wa" className={labelBase}>
            WhatsApp or phone
          </label>
          <input
            id="plan-wa"
            type="tel"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="+91 98765 43210"
            className={fieldBase}
            aria-describedby={waError ? "plan-wa-err" : undefined}
          />
          {waError && (
            <p id="plan-wa-err" className="mt-1.5 text-small text-red-600">
              {waError}
            </p>
          )}
        </div>

        {/* Wedding date */}
        <div>
          <label htmlFor="plan-date" className={labelBase}>
            Wedding date
          </label>
          <input
            id="plan-date"
            type="date"
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
            className={fieldBase}
          />
        </div>

        {/* City */}
        <div>
          <label htmlFor="plan-city" className={labelBase}>
            Wedding city
          </label>
          <select
            id="plan-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={fieldBase}
          >
            <option value="">Select a city</option>
            {CITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* Budget */}
        <div>
          <label htmlFor="plan-budget" className={labelBase}>
            Budget
          </label>
          <select
            id="plan-budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className={fieldBase}
          >
            <option value="">Select a range</option>
            {BUDGET_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Button type="submit" variant="solid" tone="ink">
          Get my shortlist
        </Button>
        <p className="text-small text-mute">Free, with no obligation. Replies within 24 hours.</p>
      </div>
    </form>
  );
}
