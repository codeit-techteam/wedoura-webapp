import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "solid" | "outline" | "link";
type Tone = "ink" | "white";

type Common = {
  variant?: Variant;
  /** White is for use on photographs. */
  tone?: Tone;
  children: ReactNode;
  className?: string;
};

type AsLink = Common & { href: string; onClick?: never; type?: never; disabled?: never };
type AsButton = Common & { href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>;

const base =
  "inline-flex items-center justify-center gap-3 font-sans text-button font-medium tracking-button uppercase transition-colors duration-300 ease-wedoura select-none disabled:cursor-not-allowed disabled:opacity-50";

const styles: Record<Variant, Record<Tone, string>> = {
  solid: {
    ink: "min-h-12 bg-ink text-ivory border border-ink px-8 hover:bg-gold-deep hover:border-gold-deep hover:text-white",
    white: "min-h-12 bg-white text-ink border border-white px-8 hover:bg-transparent hover:text-white",
  },
  outline: {
    ink: "min-h-12 border border-ink text-ink px-8 hover:bg-ink hover:text-ivory",
    white: "min-h-12 border border-white text-white px-8 hover:bg-white hover:text-ink",
  },
  link: {
    ink: "link-draw min-w-0 pb-1 text-ink",
    white: "link-draw min-w-0 pb-1 text-white",
  },
};

export function Button(props: AsLink | AsButton) {
  const { variant = "solid", tone = "ink", children, className } = props;
  const classes = cn(base, styles[variant][tone], className);

  if ("href" in props && props.href) {
    return (
      <Link href={props.href} className={classes}>
        {children}
      </Link>
    );
  }

  const { href: _href, variant: _v, tone: _t, className: _c, children: _ch, ...rest } = props as AsButton;
  void _href; void _v; void _t; void _c; void _ch;
  return (
    <button type="button" {...rest} className={classes}>
      {children}
    </button>
  );
}
