import { cn } from "@/lib/cn";

export type IconName =
  | "search"
  | "bookmark"
  | "menu"
  | "close"
  | "home"
  | "grid"
  | "stories"
  | "arrow-right"
  | "arrow-left"
  | "chevron-down"
  | "instagram"
  | "pinterest"
  | "youtube"
  | "whatsapp";

// Thin, single-weight line icons. Stroke only, so they take the text colour.
const paths: Record<IconName, React.ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.8-3.8" />
    </>
  ),
  bookmark: <path d="M6 4h12v17l-6-4.5L6 21z" />,
  menu: (
    <>
      <path d="M3 7h18" />
      <path d="M3 12h18" />
      <path d="M3 17h18" />
    </>
  ),
  close: (
    <>
      <path d="m5 5 14 14" />
      <path d="M19 5 5 19" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-7 9 7" />
      <path d="M5 10v10h14V10" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" />
      <rect x="13" y="4" width="7" height="7" />
      <rect x="4" y="13" width="7" height="7" />
      <rect x="13" y="13" width="7" height="7" />
    </>
  ),
  stories: (
    <>
      <path d="M4 5h16v14H4z" />
      <path d="M4 10h16" />
      <path d="M9 10v9" />
    </>
  ),
  "arrow-right": (
    <>
      <path d="M4 12h16" />
      <path d="m14 6 6 6-6 6" />
    </>
  ),
  "arrow-left": (
    <>
      <path d="M20 12H4" />
      <path d="m10 6-6 6 6 6" />
    </>
  ),
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  instagram: (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
    </>
  ),
  pinterest: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10.5 20.5 12.4 13" />
      <path d="M9.2 13.6c-.8-1 -1-2.3-.5-3.6.7-1.9 2.6-2.9 4.4-2.4 1.7.5 2.5 2.1 2 3.9-.5 1.8-1.9 3-3.3 2.6" />
    </>
  ),
  youtube: (
    <>
      <path d="M3.5 8.5c0-1.2 1-2.2 2.2-2.2h12.6c1.2 0 2.2 1 2.2 2.2v7c0 1.2-1 2.2-2.2 2.2H5.7c-1.2 0-2.2-1-2.2-2.2z" />
      <path d="m10.5 9.5 4.5 2.5-4.5 2.5z" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M4 20l1.3-3.9A8.5 8.5 0 1 1 8.4 19z" />
      <path d="M9.3 8.8c.2-.4.5-.4.8-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.1-.1.3 0 .5.5.9 1.4 1.8 2.4 2.3.2.1.4.1.5 0l.6-.6c.2-.2.4-.2.6-.1l1.5.7c.2.1.4.3.4.5v.6c0 .4-.2.7-.5.9-.5.4-1.1.5-1.7.4-2.6-.6-4.8-2.8-5.6-5.4-.2-.6-.1-1.2.1-1.7z" />
    </>
  ),
};

type Props = {
  name: IconName;
  /** Pixel size. Default 22. */
  size?: number;
  className?: string;
  /** Set when the icon carries meaning on its own. Otherwise it is hidden from AT. */
  label?: string;
};

export function Icon({ name, size = 22, className, label }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={label ? undefined : true}
      role={label ? "img" : undefined}
      aria-label={label}
      className={cn("shrink-0", className)}
    >
      {paths[name]}
    </svg>
  );
}
