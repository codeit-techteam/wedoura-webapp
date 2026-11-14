import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Drop a logo file at public/brand/wedoura.svg (and set its intrinsic size)
 * to replace the text wordmark everywhere. Keep height ≈ 1em of the mark.
 */
const LOGO: { src: string; width: number; height: number } | null = null;

type Props = {
  size?: "nav" | "footer" | "menu";
  className?: string;
};

export function Wordmark({ size = "nav", className }: Props) {
  // In the navbar the mark is centred from md up, where the trailing
  // letter-spacing needs balancing with an equal text-indent.
  const sizeClass =
    size === "nav"
      ? "md:text-wordmark-lg md:indent-(--tracking-wordmark)"
      : size === "menu"
        ? "text-wordmark"
        : "text-wordmark-lg";

  return (
    <Link href="/" aria-label="Wedoura, home" className={cn("inline-flex tap items-center", className)}>
      {LOGO ? (
        <Image src={LOGO.src} alt="Wedoura" width={LOGO.width} height={LOGO.height} priority className="h-6 w-auto md:h-7" />
      ) : (
        <span className={cn("wordmark", sizeClass)}>Wedoura</span>
      )}
    </Link>
  );
}
