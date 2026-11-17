import Link from "next/link";
import { Wordmark } from "@/components/chrome/Wordmark";
import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Label } from "@/components/ui/Label";
import { Text } from "@/components/ui/Text";
import { SOCIALS } from "@/lib/site-config";

const columns = [
  {
    title: "For couples",
    links: [
      { href: "/vendors", label: "Explore Vendors" },
      { href: "/real-weddings", label: "Real Weddings" },
      { href: "/blogs", label: "Blogs" },
      { href: "/gallery", label: "Gallery" },
      { href: "/honeymoon", label: "Honeymoon" },
      { href: "/faq", label: "FAQs" },
    ],
  },
  {
    title: "For vendors",
    links: [
      { href: "/list-your-business", label: "List Your Business" },
      { href: "/login", label: "Vendor Login" },
      { href: "/vendor-studio", label: "Vendor Studio" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy-policy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

// One config for social links (src/lib/site-config.ts); an empty href there
// hides the network, and a network without an icon here never renders.
const SOCIAL_ICONS: Record<string, IconName> = {
  instagram: "instagram",
  pinterest: "pinterest",
  youtube: "youtube",
};
const socials = SOCIALS.map((s) => ({ ...s, icon: SOCIAL_ICONS[s.label.toLowerCase()] })).filter(
  (s): s is { label: string; href: string; icon: IconName } => s.icon !== undefined && s.href.length > 0,
);

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white text-ink">
      <Container className="py-section-sm">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_2fr] lg:gap-20">
          <div>
            <Wordmark size="footer" />
            <Text tone="mute" className="mt-5 max-w-xs">
              Wedding vendors across India. See their real work, shortlist the ones you love, and talk to them
              directly.
            </Text>
            {socials.length > 0 && (
            <ul className="mt-8 flex items-center gap-2" aria-label="Social">
              {socials.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label}
                    className="-ml-2 inline-flex tap items-center justify-center transition-chrome hover:text-gold"
                  >
                    <Icon name={social.icon} size={22} />
                  </a>
                </li>
              ))}
            </ul>
            )}
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <Label tone="ink">{column.title}</Label>
                <ul className="mt-4 flex flex-col">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-10 items-center text-body text-mute transition-chrome hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex flex-col gap-3 border-t border-line pt-6 md:flex-row md:items-center md:justify-between">
          <Label>© {new Date().getFullYear()} Wedoura. All rights reserved.</Label>
          <Label>Sample content while the site is being built.</Label>
        </div>
      </Container>
    </footer>
  );
}
