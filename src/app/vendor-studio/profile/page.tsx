"use client";

import { useEffect, useState } from "react";
import { Field, inputClass, selectClass } from "@/components/studio/Field";
import { VenueFields } from "@/components/studio/VenueFields";
import { ScreenSkeleton, TagListInput, useListingForm } from "@/components/studio/screen";
import type {
  Category,
  CategoryFieldDef,
  CategorySlug,
  City,
  Contact,
  Faq,
  FounderProfile,
  Interview,
  Package,
  PriceUnit,
  Testimonial,
  VenueDetails,
} from "@/data/types";
import { listAllCategories, listAllCities } from "@/lib/api";
import { submitListingForReview } from "@/lib/vendor-api";

type Form = {
  name: string;
  tagline: string;
  about: string;
  team: string;
  yearsActive: string;
  press: string;
  category: CategorySlug;
  services: string[];
  styles: string[];
  categoryValues: Record<string, string | string[] | number | boolean>;
  venue?: VenueDetails;
  baseCity: string;
  citiesServed: string[];
  travels: string;
  contact: Contact;
  startingPriceINR: string;
  priceUnit: PriceUnit;
  packages: Package[];
  faqs: Faq[];
  testimonials: Testimonial[];
  founderCaption: string;
  founderName: string;
  founderAbout: string;
  founderYoutube: string;
  interviewTitle: string;
  interviewBy: string;
  interviewLede: string;
  interviewParagraphs: string;
  interviewYoutube: string;
  interviewDuration: string;
  interviewQuestions: { question: string; answer: string }[];
};

const JUMP = [
  { id: "basics", label: "Basics" },
  { id: "about", label: "About" },
  { id: "founder", label: "Founder" },
  { id: "interview", label: "Interview" },
  { id: "category", label: "Category" },
  { id: "locations", label: "Locations" },
  { id: "contact", label: "Contact" },
  { id: "pricing", label: "Pricing" },
  { id: "faqs", label: "FAQs" },
  { id: "kind", label: "Kind words" },
  { id: "submit", label: "Submit" },
];

export default function ProfilePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([listAllCategories(), listAllCities()]).then(([cats, cts]) => {
      setCategories(cats);
      setCities(cts);
    });
  }, []);

  const { listing, form, apply } = useListingForm<Form>((l) => {
    const interview = l.pendingInterview ?? l.interview;
    return {
      name: l.name,
      tagline: l.tagline,
      about: l.about.join("\n\n"),
      team: l.team ?? "",
      yearsActive: l.yearsActive ? String(l.yearsActive) : "",
      press: (l.press ?? []).join(", "),
      category: l.category,
      services: l.services,
      styles: l.styles,
      categoryValues: l.categoryValues,
      venue: l.venue,
      baseCity: l.baseCity,
      citiesServed: l.citiesServed,
      travels: l.travels ?? "",
      contact: l.contact,
      startingPriceINR: l.startingPriceINR != null ? String(l.startingPriceINR) : "",
      priceUnit: l.priceUnit,
      packages: l.packages,
      faqs: l.faqs,
      testimonials: l.testimonials ?? [],
      founderCaption: l.founder?.caption ?? "",
      founderName: l.founder?.name ?? "",
      founderAbout: (l.founder?.about ?? []).join("\n\n"),
      founderYoutube: l.founder?.youtubeUrl ?? "",
      interviewTitle: interview?.title ?? "",
      interviewBy: interview?.by ?? "",
      interviewLede: interview?.lede ?? "",
      interviewParagraphs: (interview?.paragraphs ?? []).join("\n\n"),
      interviewYoutube: interview?.youtubeUrl ?? "",
      interviewDuration: interview?.durationLabel ?? "",
      interviewQuestions: interview?.questions ?? [],
    };
  });

  function saveInterview(patch: Partial<Form>) {
    const next = { ...form!, ...patch };
    const paragraphs = next.interviewParagraphs
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    const questions = next.interviewQuestions
      .map((q) => ({ question: q.question.trim(), answer: q.answer.trim() }))
      .filter((q) => q.question || q.answer);
    const empty =
      !next.interviewTitle.trim() &&
      !next.interviewBy.trim() &&
      !next.interviewLede.trim() &&
      paragraphs.length === 0 &&
      !next.interviewYoutube.trim() &&
      !next.interviewDuration.trim() &&
      questions.length === 0;
    const interview: Interview | undefined = empty
      ? undefined
      : {
          title: next.interviewTitle.trim() || "In conversation",
          by: next.interviewBy.trim() || "Wedoura",
          lede: next.interviewLede.trim() || undefined,
          paragraphs: paragraphs.length ? paragraphs : undefined,
          questions: questions.length ? questions : undefined,
          youtubeUrl: next.interviewYoutube.trim() || undefined,
          durationLabel: next.interviewDuration.trim() || undefined,
          poster: listing!.pendingInterview?.poster ?? listing!.interview?.poster,
        };
    apply(
      {
        interviewTitle: next.interviewTitle,
        interviewBy: next.interviewBy,
        interviewLede: next.interviewLede,
        interviewParagraphs: next.interviewParagraphs,
        interviewYoutube: next.interviewYoutube,
        interviewDuration: next.interviewDuration,
        interviewQuestions: next.interviewQuestions,
      },
      { interview },
    );
  }

  function saveFounder(patch: Partial<Form>) {
    const next = { ...form!, ...patch };
    const caption = next.founderCaption.trim();
    const about = next.founderAbout
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean);
    const existing = listing!.founder;
    if (!caption && !next.founderName.trim() && about.length === 0 && !next.founderYoutube.trim()) {
      apply(
        {
          founderCaption: "",
          founderName: "",
          founderAbout: "",
          founderYoutube: "",
        },
        { founder: undefined },
      );
      return;
    }
    if (!existing?.poster && !listing!.cover && listing!.portfolio.length === 0) {
      return;
    }
    const founder: FounderProfile = {
      caption: caption || "About the founder",
      name: next.founderName.trim() || undefined,
      about: about.length ? about : undefined,
      youtubeUrl: next.founderYoutube.trim() || undefined,
      poster: existing?.poster ?? listing!.cover ?? listing!.portfolio[0],
      previewSrc: existing?.previewSrc,
    };
    apply(
      {
        founderCaption: next.founderCaption,
        founderName: next.founderName,
        founderAbout: next.founderAbout,
        founderYoutube: next.founderYoutube,
      },
      { founder },
    );
  }

  if (!form || !listing || categories.length === 0 || cities.length === 0) return <ScreenSkeleton />;

  const active = categories.find((c) => c.slug === form.category);
  const isVenue = form.category === "venues";

  const setValue = (key: string, value: string | string[] | number | boolean | undefined) => {
    const categoryValues = { ...form.categoryValues };
    if (value === undefined || value === "") delete categoryValues[key];
    else categoryValues[key] = value;
    apply({ categoryValues }, { categoryValues });
  };

  return (
    <div>
      <p className="mb-4 max-w-prose text-[length:var(--text-dash-body)] text-mute">
        Everything couples see on your Wedoura page. Complete each section below.
      </p>

      <nav className="jump" aria-label="Jump to section">
        {JUMP.filter((j) => (j.id === "venue" ? isVenue : true)).map((j) => (
          <a key={j.id} href={`#${j.id}`}>
            {j.label}
          </a>
        ))}
        {isVenue ? (
          <a href="#venue">Venue</a>
        ) : null}
      </nav>

      <section id="basics" className="scroll-mt-24 border border-line bg-white p-6">
        <h2 className="font-serif text-h3">01 · Basics</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Field id="pf-name" label="Business name">
            <input
              id="pf-name"
              className={inputClass}
              value={form.name}
              onChange={(e) => apply({ name: e.target.value }, { name: e.target.value.trim() || form.name })}
            />
          </Field>
          <Field id="pf-tag" label="Tagline">
            <input
              id="pf-tag"
              className={inputClass}
              value={form.tagline}
              onChange={(e) => apply({ tagline: e.target.value }, { tagline: e.target.value.trim() })}
            />
          </Field>
          <Field id="pf-team" label="Team">
            <input
              id="pf-team"
              className={inputClass}
              value={form.team}
              onChange={(e) => apply({ team: e.target.value }, { team: e.target.value.trim() || undefined })}
            />
          </Field>
          <Field id="pf-years" label="Years active">
            <input
              id="pf-years"
              className={inputClass}
              inputMode="numeric"
              value={form.yearsActive}
              onChange={(e) => {
                const yearsActive = e.target.value;
                apply(
                  { yearsActive },
                  { yearsActive: /^\d+$/.test(yearsActive) ? Number(yearsActive) : undefined },
                );
              }}
            />
          </Field>
          <Field id="pf-press" label="Press" hint="Publication names, comma separated.">
            <input
              id="pf-press"
              className={inputClass}
              value={form.press}
              onChange={(e) => {
                const press = e.target.value;
                apply(
                  { press },
                  {
                    press: press
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                );
              }}
            />
          </Field>
        </div>
      </section>

      <section id="about" className="mt-8 scroll-mt-24 border border-line bg-white p-6">
        <h2 className="font-serif text-h3">02 · About</h2>
        <Field id="pf-about" label="About text" hint="A blank line starts a new paragraph.">
          <textarea
            id="pf-about"
            rows={7}
            className={inputClass + " mt-3 resize-y"}
            value={form.about}
            onChange={(e) =>
              apply(
                { about: e.target.value },
                {
                  about: e.target.value
                    .split(/\n\s*\n/)
                    .map((p) => p.trim())
                    .filter(Boolean),
                },
              )
            }
          />
        </Field>
      </section>

      <section id="founder" className="mt-8 scroll-mt-24 border border-line bg-white p-6">
        <h2 className="font-serif text-h3">02b · About the founder</h2>
        <p className="mt-2 max-w-prose text-small text-mute">
          Shows on your public profile under Voices. Uses your cover photograph as the poster until you
          set one in Photos and videos.
        </p>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Field id="pf-founder-caption" label="Caption">
            <input
              id="pf-founder-caption"
              className={inputClass}
              value={form.founderCaption}
              placeholder="Hello from behind the camera"
              onChange={(e) => saveFounder({ founderCaption: e.target.value })}
            />
          </Field>
          <Field id="pf-founder-name" label="Name (optional)">
            <input
              id="pf-founder-name"
              className={inputClass}
              value={form.founderName}
              onChange={(e) => saveFounder({ founderName: e.target.value })}
            />
          </Field>
          <Field id="pf-founder-yt" label="YouTube link (optional)">
            <input
              id="pf-founder-yt"
              className={inputClass}
              value={form.founderYoutube}
              placeholder="https://"
              onChange={(e) => saveFounder({ founderYoutube: e.target.value })}
            />
          </Field>
        </div>
        <Field id="pf-founder-about" label="About paragraphs" hint="A blank line starts a new paragraph.">
          <textarea
            id="pf-founder-about"
            rows={5}
            className={inputClass + " mt-3 resize-y"}
            value={form.founderAbout}
            onChange={(e) => saveFounder({ founderAbout: e.target.value })}
          />
        </Field>
      </section>

      <section id="interview" className="mt-8 scroll-mt-24 border border-line bg-white p-6">
        <h2 className="font-serif text-h3">02c · Interview</h2>
        <p className="mt-2 max-w-prose text-small text-mute">
          Written with Wedoura. While your listing is published, edits stay in review until Wedoura approves them —
          the live Voices section keeps the last approved interview.
        </p>
        {listing.pendingInterview ? (
          <p className="mt-3 inline-flex border border-gold px-3 py-1.5 font-sans text-label font-medium tracking-label text-gold-deep uppercase">
            In review
          </p>
        ) : null}
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Field id="pf-iv-title" label="Title">
            <input
              id="pf-iv-title"
              className={inputClass}
              value={form.interviewTitle}
              onChange={(e) => saveInterview({ interviewTitle: e.target.value })}
            />
          </Field>
          <Field id="pf-iv-by" label="By">
            <input
              id="pf-iv-by"
              className={inputClass}
              value={form.interviewBy}
              placeholder="Wedoura"
              onChange={(e) => saveInterview({ interviewBy: e.target.value })}
            />
          </Field>
          <Field id="pf-iv-lede" label="Lede">
            <input
              id="pf-iv-lede"
              className={inputClass}
              value={form.interviewLede}
              onChange={(e) => saveInterview({ interviewLede: e.target.value })}
            />
          </Field>
          <Field id="pf-iv-duration" label="Duration label">
            <input
              id="pf-iv-duration"
              className={inputClass}
              value={form.interviewDuration}
              placeholder="4 min"
              onChange={(e) => saveInterview({ interviewDuration: e.target.value })}
            />
          </Field>
          <Field id="pf-iv-yt" label="YouTube link">
            <input
              id="pf-iv-yt"
              className={inputClass}
              value={form.interviewYoutube}
              placeholder="https://"
              onChange={(e) => saveInterview({ interviewYoutube: e.target.value })}
            />
          </Field>
        </div>
        <Field id="pf-iv-paras" label="Introductory paragraphs" hint="A blank line starts a new paragraph.">
          <textarea
            id="pf-iv-paras"
            rows={4}
            className={inputClass + " mt-3 resize-y"}
            value={form.interviewParagraphs}
            onChange={(e) => saveInterview({ interviewParagraphs: e.target.value })}
          />
        </Field>
        <p className="label mt-6 text-mute">Questions and answers</p>
        <ul className="mt-3 grid gap-4">
          {form.interviewQuestions.map((qa, i) => (
            <li key={i} className="grid gap-3 border border-line p-4">
              <input
                className={inputClass}
                value={qa.question}
                placeholder="Question"
                onChange={(e) => {
                  const interviewQuestions = form.interviewQuestions.map((row, idx) =>
                    idx === i ? { ...row, question: e.target.value } : row,
                  );
                  saveInterview({ interviewQuestions });
                }}
              />
              <textarea
                className={inputClass + " resize-y"}
                rows={3}
                value={qa.answer}
                placeholder="Answer"
                onChange={(e) => {
                  const interviewQuestions = form.interviewQuestions.map((row, idx) =>
                    idx === i ? { ...row, answer: e.target.value } : row,
                  );
                  saveInterview({ interviewQuestions });
                }}
              />
              <button
                type="button"
                className="text-small text-mute"
                onClick={() => {
                  const interviewQuestions = form.interviewQuestions.filter((_, idx) => idx !== i);
                  saveInterview({ interviewQuestions });
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-4 border-b border-gold pb-1 text-button tracking-[0.2em] uppercase"
          onClick={() =>
            saveInterview({
              interviewQuestions: [...form.interviewQuestions, { question: "", answer: "" }],
            })
          }
        >
          + Add question
        </button>
      </section>

      <section id="category" className="mt-8 scroll-mt-24 border border-line bg-white p-6">
        <h2 className="font-serif text-h3">03 · Category & services</h2>
        <div className="mt-6 grid gap-6">
          <Field id="pf-cat" label="Main category">
            <select
              id="pf-cat"
              className={selectClass}
              value={form.category}
              onChange={(e) => {
                const category = e.target.value as CategorySlug;
                apply({ category, categoryValues: {} }, { category, categoryValues: {} });
              }}
            >
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="pf-services" label="Services">
            <TagListInput
              id="pf-services"
              values={form.services}
              onChange={(services) => apply({ services }, { services })}
              placeholder="e.g. Wedding photography"
            />
          </Field>
          <Field id="pf-styles" label="Styles">
            <TagListInput
              id="pf-styles"
              values={form.styles}
              onChange={(styles) => apply({ styles }, { styles })}
              placeholder="e.g. Editorial"
            />
          </Field>
          {active?.fields.map((def) => (
            <CategoryFieldInput
              key={def.key}
              def={def}
              value={form.categoryValues[def.key]}
              onChange={(v) => setValue(def.key, v)}
            />
          ))}
        </div>
      </section>

      {isVenue ? (
        <section id="venue" className="mt-8 scroll-mt-24 border border-line bg-white p-6">
          <h2 className="font-serif text-h3">Venue details</h2>
          <p className="mt-2 text-mute">
            Capacity, spaces, food, rules, location and your 360° tour — everything couples see on a venue
            profile.
          </p>
          <div className="mt-6">
            <VenueFields
              venue={form.venue ?? { capacity: { min: 50, max: 200 }, spaces: [] }}
              portfolio={listing.portfolio}
              onChange={(venue) => apply({ venue }, { venue })}
            />
          </div>
        </section>
      ) : null}

      <section id="locations" className="mt-8 scroll-mt-24 border border-line bg-white p-6">
        <h2 className="font-serif text-h3">04 · Locations</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Field id="pf-city" label="Base city">
            <select
              id="pf-city"
              className={selectClass}
              value={form.baseCity}
              onChange={(e) => apply({ baseCity: e.target.value }, { baseCity: e.target.value })}
            >
              {cities.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field id="pf-travels" label="Travels">
            <input
              id="pf-travels"
              className={inputClass}
              value={form.travels}
              onChange={(e) => apply({ travels: e.target.value }, { travels: e.target.value.trim() || undefined })}
              placeholder="Across India"
            />
          </Field>
        </div>
        <Field id="pf-served" label="Also serves" hint="City slugs couples can filter by.">
          <TagListInput
            id="pf-served"
            values={form.citiesServed}
            onChange={(citiesServed) => apply({ citiesServed }, { citiesServed })}
            placeholder="e.g. mumbai"
          />
        </Field>
      </section>

      <section id="contact" className="mt-8 scroll-mt-24 border border-line bg-white p-6">
        <h2 className="font-serif text-h3">05 · Contact</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {(
            [
              ["whatsapp", "WhatsApp"],
              ["email", "Email"],
              ["instagram", "Instagram"],
              ["website", "Website"],
            ] as const
          ).map(([key, label]) => (
            <Field key={key} id={`pf-${key}`} label={label}>
              <input
                id={`pf-${key}`}
                className={inputClass}
                value={form.contact[key] ?? ""}
                onChange={(e) => {
                  const contact = { ...form.contact, [key]: e.target.value.trim() || undefined };
                  apply({ contact }, { contact });
                }}
              />
            </Field>
          ))}
        </div>
      </section>

      <section id="pricing" className="mt-8 scroll-mt-24 border border-line bg-white p-6">
        <h2 className="font-serif text-h3">06 · Pricing</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <Field id="pf-price" label="Starting price (INR)">
            <input
              id="pf-price"
              className={inputClass}
              inputMode="numeric"
              value={form.startingPriceINR}
              onChange={(e) => {
                const startingPriceINR = e.target.value;
                apply(
                  { startingPriceINR },
                  {
                    startingPriceINR: /^\d+$/.test(startingPriceINR)
                      ? Number(startingPriceINR)
                      : undefined,
                  },
                );
              }}
            />
          </Field>
          <Field id="pf-unit" label="Priced per">
            <select
              id="pf-unit"
              className={selectClass}
              value={form.priceUnit}
              onChange={(e) =>
                apply({ priceUnit: e.target.value as PriceUnit }, { priceUnit: e.target.value as PriceUnit })
              }
            >
              <option value="per_event">Event</option>
              <option value="per_day">Day</option>
              <option value="per_plate">Guest</option>
              <option value="on_request">On request</option>
            </select>
          </Field>
        </div>
        <div className="mt-6">
          <p className="label text-mute">Packages</p>
          <ul className="mt-3 grid gap-4">
            {form.packages.map((pkg, i) => (
              <li key={i} className="border border-line p-4">
                <input
                  className={inputClass}
                  value={pkg.label}
                  placeholder="Package name"
                  onChange={(e) => {
                    const packages = form.packages.map((p, idx) =>
                      idx === i ? { ...p, label: e.target.value } : p,
                    );
                    apply({ packages }, { packages });
                  }}
                />
                <input
                  className={inputClass + " mt-3"}
                  inputMode="numeric"
                  value={pkg.priceINR ?? ""}
                  placeholder="Price INR"
                  onChange={(e) => {
                    const packages = form.packages.map((p, idx) =>
                      idx === i
                        ? { ...p, priceINR: e.target.value ? Number(e.target.value) : undefined }
                        : p,
                    );
                    apply({ packages }, { packages });
                  }}
                />
                <select
                  className={selectClass + " mt-3"}
                  value={pkg.unit}
                  aria-label="Package unit"
                  onChange={(e) => {
                    const packages = form.packages.map((p, idx) =>
                      idx === i ? { ...p, unit: e.target.value as PriceUnit } : p,
                    );
                    apply({ packages }, { packages });
                  }}
                >
                  <option value="per_event">Event</option>
                  <option value="per_day">Day</option>
                  <option value="per_plate">Guest</option>
                  <option value="on_request">On request</option>
                </select>
                <input
                  className={inputClass + " mt-3"}
                  value={pkg.note ?? ""}
                  placeholder="Short note under the price"
                  onChange={(e) => {
                    const packages = form.packages.map((p, idx) =>
                      idx === i ? { ...p, note: e.target.value } : p,
                    );
                    apply({ packages }, { packages });
                  }}
                />
                <textarea
                  className={inputClass + " mt-3 resize-y"}
                  rows={3}
                  value={(pkg.inclusions ?? []).join("\n")}
                  placeholder="What is included (one line each)"
                  onChange={(e) => {
                    const inclusions = e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean);
                    const packages = form.packages.map((p, idx) =>
                      idx === i ? { ...p, inclusions } : p,
                    );
                    apply({ packages }, { packages });
                  }}
                />
                <label className="mt-3 flex items-center gap-2 text-small text-ink">
                  <input
                    type="checkbox"
                    checked={Boolean(pkg.featured)}
                    onChange={(e) => {
                      const packages = form.packages.map((p, idx) =>
                        idx === i ? { ...p, featured: e.target.checked } : p,
                      );
                      apply({ packages }, { packages });
                    }}
                  />
                  Mark as most booked
                </label>
                <button
                  type="button"
                  className="mt-3 text-small text-mute"
                  onClick={() => {
                    const packages = form.packages.filter((_, idx) => idx !== i);
                    apply({ packages }, { packages });
                  }}
                >
                  Remove package
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="mt-4 border-b border-gold pb-1 text-button tracking-[0.2em] uppercase"
            onClick={() => {
              const packages: Package[] = [
                ...form.packages,
                {
                  label: "New package",
                  priceINR: undefined,
                  unit: form.priceUnit,
                  note: "",
                  inclusions: [],
                },
              ];
              apply({ packages }, { packages });
            }}
          >
            + Add package
          </button>
        </div>
      </section>

      <section id="faqs" className="mt-8 scroll-mt-24 border border-line bg-white p-6">
        <h2 className="font-serif text-h3">07 · FAQs</h2>
        <ul className="mt-6 grid gap-4">
          {form.faqs.map((faq, i) => (
            <li key={i} className="grid gap-3 border border-line p-4">
              <input
                className={inputClass}
                value={faq.question}
                placeholder="Question"
                onChange={(e) => {
                  const faqs = form.faqs.map((f, idx) =>
                    idx === i ? { ...f, question: e.target.value } : f,
                  );
                  apply({ faqs }, { faqs });
                }}
              />
              <textarea
                className={inputClass + " resize-y"}
                rows={3}
                value={faq.answer}
                placeholder="Answer"
                onChange={(e) => {
                  const faqs = form.faqs.map((f, idx) =>
                    idx === i ? { ...f, answer: e.target.value } : f,
                  );
                  apply({ faqs }, { faqs });
                }}
              />
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-4 border-b border-gold pb-1 text-button tracking-[0.2em] uppercase"
          onClick={() => {
            const faqs = [...form.faqs, { question: "", answer: "" }];
            apply({ faqs }, { faqs });
          }}
        >
          + Add FAQ
        </button>
      </section>

      <section id="kind" className="mt-8 scroll-mt-24 border border-line bg-white p-6">
        <h2 className="font-serif text-h3">08 · Kind words</h2>
        <p className="mt-2 text-mute">Vendor-entered testimonials. Shown as kind words, never as verified reviews.</p>
        <ul className="mt-6 grid gap-4">
          {form.testimonials.map((t, i) => (
            <li key={i} className="grid gap-3 border border-line p-4">
              <textarea
                className={inputClass + " resize-y"}
                rows={3}
                value={t.quote}
                placeholder="Quote"
                onChange={(e) => {
                  const testimonials = form.testimonials.map((x, idx) =>
                    idx === i ? { ...x, quote: e.target.value } : x,
                  );
                  apply({ testimonials }, { testimonials });
                }}
              />
              <input
                className={inputClass}
                value={t.couple}
                placeholder="Couple names"
                onChange={(e) => {
                  const testimonials = form.testimonials.map((x, idx) =>
                    idx === i ? { ...x, couple: e.target.value } : x,
                  );
                  apply({ testimonials }, { testimonials });
                }}
              />
              <input
                className={inputClass}
                value={t.location ?? ""}
                placeholder="Place (city or destination)"
                onChange={(e) => {
                  const testimonials = form.testimonials.map((x, idx) =>
                    idx === i ? { ...x, location: e.target.value.trim() || undefined } : x,
                  );
                  apply({ testimonials }, { testimonials });
                }}
              />
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="mt-4 border-b border-gold pb-1 text-button tracking-[0.2em] uppercase"
          onClick={() => {
            const testimonials = [...form.testimonials, { quote: "", couple: "", location: "" }];
            apply({ testimonials }, { testimonials });
          }}
        >
          + Add kind words
        </button>
      </section>

      <section id="submit" className="mt-8 scroll-mt-24 border border-line bg-sand/50 p-6">
        <h2 className="font-serif text-h3">Submit for review</h2>
        <p className="mt-2 text-mute">
          When your profile feels ready, send it to Wedoura. Photos and films you add while published wait for approval.
        </p>
        <button
          type="button"
          className="mt-6 min-h-12 bg-ink px-6 font-sans text-button font-medium tracking-button text-ivory uppercase disabled:opacity-40"
          disabled={listing.status !== "draft" && listing.status !== "changes_requested"}
          onClick={async () => {
            const result = await submitListingForReview();
            setSubmitMsg(result.ok ? "Submitted for review." : result.error);
          }}
        >
          Submit for review
        </button>
        {submitMsg ? (
          <p className="mt-3 text-small" role="status">
            {submitMsg}
          </p>
        ) : null}
      </section>
    </div>
  );
}

function CategoryFieldInput({
  def,
  value,
  onChange,
}: {
  def: CategoryFieldDef;
  value: string | string[] | number | boolean | undefined;
  onChange: (v: string | string[] | number | boolean | undefined) => void;
}) {
  if (def.input === "toggle") {
    return (
      <label className="tap flex items-center gap-3">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          className="size-4 accent-ink"
        />
        <span>{def.label}</span>
      </label>
    );
  }
  if (def.input === "select") {
    return (
      <Field id={`cf-${def.key}`} label={def.label}>
        <select
          id={`cf-${def.key}`}
          className={selectClass}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value || undefined)}
        >
          <option value="">Choose one</option>
          {(def.options ?? []).map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </Field>
    );
  }
  if (def.input === "multiselect") {
    const selected = Array.isArray(value) ? value : [];
    return (
      <Field id={`cf-${def.key}`} label={def.label}>
        <TagListInput
          id={`cf-${def.key}`}
          values={selected.map(String)}
          onChange={(vals) => onChange(vals)}
          placeholder="Add"
        />
      </Field>
    );
  }
  return (
    <Field id={`cf-${def.key}`} label={def.label}>
      <input
        id={`cf-${def.key}`}
        className={inputClass}
        inputMode={def.input === "number" ? "numeric" : "text"}
        value={value == null || Array.isArray(value) ? "" : String(value)}
        onChange={(e) => {
          const raw = e.target.value;
          if (def.input === "number") onChange(raw ? Number(raw) : undefined);
          else onChange(raw || undefined);
        }}
      />
    </Field>
  );
}
