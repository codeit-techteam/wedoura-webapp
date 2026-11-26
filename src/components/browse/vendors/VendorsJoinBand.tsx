import Link from "next/link";

/** “For wedding professionals” band for the vendors directory only. */
export function VendorsJoinBand() {
  return (
    <section className="join" id="join">
      <span className="cap">For wedding professionals</span>
      <h2>
        Your work deserves a <em>beautiful</em> home
      </h2>
      <p>
        Build a magazine-style profile with albums, films and open pricing, and meet couples who
        value what you do.
      </p>
      <Link href="/list-your-business" className="btn">
        List your business
      </Link>
    </section>
  );
}
