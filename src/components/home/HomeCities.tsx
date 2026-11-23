import Link from "next/link";

type CityItem = { slug: string; name: string };
type Props = { cities: CityItem[] };

export function HomeCities({ cities }: Props) {
  if (!cities.length) return null;
  return (
    <section aria-label="Find vendors in your city" className="border-t border-line bg-ivory py-16 md:py-20">
      <div className="mx-auto max-w-[90rem] px-[clamp(1.25rem,5vw,5.5rem)]">
        <p className="label text-gold-deep">Find vendors in your city</p>
        <ul className="mt-6 flex flex-wrap items-center gap-x-0 gap-y-3">
          {cities.map((city, i) => (
            <li key={city.slug} className="flex items-center">
              {i > 0 ? <span aria-hidden="true" className="mx-3 h-4 w-px bg-line md:mx-4" /> : null}
              <Link
                href={`/vendors?city=${city.slug}`}
                className="font-sans text-[1.1875rem] text-ink transition-chrome hover:text-gold-deep"
              >
                {city.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
