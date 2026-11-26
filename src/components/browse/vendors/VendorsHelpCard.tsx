import Image from "next/image";
import Link from "next/link";

/** Dark planning-help interrupter after the third list/grid result. */
export function VendorsHelpCard() {
  return (
    <aside className="intr rv">
      <div className="im relative">
        <Image
          src="/ref/vendors-final/image-05.webp"
          alt=""
          fill
          sizes="(min-width: 64rem) 40vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="tx">
        <span className="cap">Free planning help</span>
        <h3>
          Not sure where to <em>start</em>?
        </h3>
        <p>
          Tell us your date, city and budget. Our team sends you a shortlist of vendors who fit,
          within a day.
        </p>
        <Link href="/#plan" className="btn">
          Get my free shortlist
        </Link>
      </div>
    </aside>
  );
}
