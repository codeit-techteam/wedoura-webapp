import Link from "next/link";

/** The "for professionals" band. Copy and colours from the homepage reference. */
export function JoinBand() {
  return (
    <section className="bg-ink px-[6vw] py-28 text-center text-ivory md:py-40 xl:py-52">
      <p className="font-sans text-label font-medium tracking-[0.3em] text-gold uppercase">For wedding professionals</p>
      <h2 className="mx-auto mt-5 max-w-[14em] font-serif text-[clamp(2.625rem,5.4vw,5.125rem)] leading-[1.04] text-ivory">
        Your work deserves a <em className="text-gold">beautiful</em> home
      </h2>
      <p className="mx-auto mt-6 max-w-[32em] text-[1.25rem] leading-relaxed text-mist">
        Build a magazine-style profile with albums, films and open pricing, and meet couples who value what you do.
      </p>
      <Link
        href="/list-your-business"
        className="mt-10 inline-flex min-h-12 items-center justify-center border border-gold bg-gold px-9 font-sans text-button font-medium tracking-button text-ink uppercase hover:border-ivory hover:bg-ivory"
      >
        Create your profile
      </Link>
    </section>
  );
}
