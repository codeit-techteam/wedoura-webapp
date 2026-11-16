import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

type Props = {
  title: string;
  text?: string;
  action?: { label: string; href?: string; onClick?: () => void };
  tone?: "white" | "ivory";
  className?: string;
  children?: ReactNode;
};

/** A designed empty state: serif line, one sentence, one action. */
export function EmptyState({ title, text, action, tone = "ivory", className, children }: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-center gap-4 px-8 py-16 md:items-center md:px-12 md:py-24 md:text-center",
        tone === "ivory" ? "bg-ivory" : "bg-white",
        className,
      )}
    >
      <p className="font-serif text-h3 text-balance">{title}</p>
      {text && <p className="max-w-md text-body text-mute">{text}</p>}
      {action &&
        (action.href ? (
          <Button href={action.href} variant="link" className="mt-2">
            {action.label}
          </Button>
        ) : (
          <Button variant="link" onClick={action.onClick} className="mt-2">
            {action.label}
          </Button>
        ))}
      {children}
    </div>
  );
}
