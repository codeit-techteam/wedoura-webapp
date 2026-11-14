import type { ReactNode } from "react";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Props = {
  /** One entry per headline line. */
  lines: ReactNode[];
  as?: "h1" | "h2";
  size?: "h1" | "h2";
  /** One optional supporting sentence. */
  text?: string;
  link?: { label: string; href: string };
  className?: string;
};

/** The standard section opener: masked headline, optional line and link. */
export function SectionHeader({ lines, as = "h2", size = "h1", text, link, className }: Props) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-x-10 gap-y-5", className)}>
      <div className="max-w-3xl">
        <MaskedHeading as={as} className={cn("font-serif", size === "h1" ? "text-h1" : "text-h2")} lines={lines} />
        {text && <p className="mt-4 max-w-prose text-mute">{text}</p>}
      </div>
      {link && (
        <Button href={link.href} variant="link">
          {link.label}
        </Button>
      )}
    </div>
  );
}
