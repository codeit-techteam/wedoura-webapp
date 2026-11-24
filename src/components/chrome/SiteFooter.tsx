import Link from "next/link";
import { LetterForm } from "@/components/chrome/LetterForm";
import { listAllCities } from "@/lib/api";

const columns = [
  {
    title: "Couples",
    links: [
      { href: "/vendors", label: "Find vendors" },
      { href: "/real-weddings", label: "Real weddings" },
      { href: "/blogs", label: "Journal" },
      { href: "/honeymoon", label: "Honeymoon" },
      { href: "/soulmates", label: "Soulmates" },
      { href: "/saved", label: "Saved" },
    ],
  },
  {
    title: "Vendors",
    links: [
      { href: "/list-your-business", label: "List your business" },
      { href: "/vendor/login", label: "Vendor login" },
      { href: "/login", label: "Couple login" },
      { href: "/vendor-studio", label: "Vendor studio" },
      { href: "/list-your-business", label: "Founding Partners" },
    ],
  },
  {
    title: "Wedoura",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "FAQs" },
      { href: "/gallery", label: "Gallery" },
      { href: "/privacy-policy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

const MARK = ["W", "E", "D", "O", "U", "R", "A"] as const;

export async function SiteFooter() {
  const cityList = await listAllCities();
  const withCities = [
    columns[0],
    columns[1],
    {
      title: "Cities",
      links: cityList.map((city) => ({ href: `/vendors?city=${city.slug}`, label: city.name })),
    },
    columns[2],
  ];
  return (
    <footer className="border-t border-line bg-ivory pt-20 text-ink md:pt-28 xl:pt-36">
      <div className="container-site grid gap-14 xl:grid-cols-[1fr_1.75fr] xl:gap-24">
        <div>
          <h2 className="font-wordmark text-[clamp(2.875rem,5.4vw,5.75rem)] leading-none font-normal tracking-normal text-ink">
            The Wedoura <em className="mt-1 block text-gold-deep">Letter</em>
          </h2>
          <p className="mt-7 max-w-[26em] font-sans text-[1.1875rem] leading-relaxed text-mute">
            One short letter a month: a real wedding, a vendor worth knowing, a venue to see.
          </p>
          <LetterForm />
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-x-5 gap-y-9 xl:grid-cols-4 xl:gap-8">
          {withCities.map((column) => (
            <div key={column.title}>
              <h3 className="mb-5 font-sans text-[0.8125rem] font-medium tracking-[0.3em] text-ink uppercase">{column.title}</h3>
              <ul>
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`} className="mb-3.5">
                    <Link href={link.href} className="font-sans text-[1.0625rem] text-mute hover:text-gold-deep">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <p
        aria-hidden="true"
        className="mt-16 flex items-end justify-between px-2 font-wordmark text-[18.5vw] leading-[0.78] font-normal text-ink select-none xl:mt-28 xl:px-6 xl:text-[clamp(3.75rem,17.5vw,21.25rem)]"
      >
        {MARK.map((letter) => (
          <span key={letter}>{letter}</span>
        ))}
      </p>

      <div className="container-site flex flex-col gap-2 py-7 font-sans text-label font-medium tracking-[0.18em] text-mute uppercase md:flex-row md:justify-between">
        <span>© {new Date().getFullYear()} Wedoura</span>
        <span>Sample content while the site is being built.</span>
      </div>
    </footer>
  );
}
