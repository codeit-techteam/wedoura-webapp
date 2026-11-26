const STEPS = [
  {
    num: "1",
    title: "Tell us about your wedding",
    body: "Share your city, date and budget, or simply start browsing by category.",
  },
  {
    num: "2",
    title: "Compare trusted vendors",
    body: "See portfolios, films, open prices and work from couples who booked.",
  },
  {
    num: "3",
    title: "Enquire and book with confidence",
    body: "Check availability in one tap, and message the vendors you love directly.",
  },
] as const;

export function HomeHow() {
  return (
    <section id="how" aria-label="How Wedoura works" className="bg-white py-[clamp(4rem,8vw,8rem)]">
      <div className="mx-auto max-w-[90rem] px-[clamp(1.25rem,5vw,5.5rem)]">
        <p className="label text-gold-deep">How Wedoura works</p>
        <h2 className="mt-4 font-serif text-[clamp(2.625rem,5vw,4.75rem)] leading-[1.02] text-ink">
          Three simple <em>steps</em>
        </h2>
        <ol className="mt-[clamp(3.75rem,6.5vw,6.25rem)] grid gap-12 md:grid-cols-3 md:gap-[clamp(3rem,7vw,8.125rem)]">
          {STEPS.map((step) => (
            <li key={step.num}>
              <p className="font-serif text-[4.75rem] leading-none text-gold">{step.num}</p>
              <h3 className="mt-5 font-serif text-[2.125rem] leading-tight text-ink">{step.title}</h3>
              <p className="mt-4 max-w-[22em] text-[1.1875rem] leading-relaxed text-mute">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
