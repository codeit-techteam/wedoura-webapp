import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import { SaveButton } from "@/components/ui/SaveButton";
import type { RealWedding } from "@/data/types";
import { cn } from "@/lib/cn";

type Props = {
  wedding: RealWedding;
  cityName?: string;
  sizes: string;
  /** large: the scroller/featured cover; small: grid cells. */
  variant?: "large" | "small";
  className?: string;
};

export function photographerOf(wedding: RealWedding): string | undefined {
  return wedding.credits.find((c) => c.role === "Photography" || c.role === "Films")?.name;
}

/** The one real-wedding story card: cover, city, title, couple, credit. */
export function StoryCard({ wedding, cityName, sizes, variant = "large", className }: Props) {
  const credit = photographerOf(wedding);
  const large = variant === "large";
  return (
    <div className={cn("relative", className)}>
      <Link href={`/real-weddings/${wedding.slug}`} className="group block">
      <div
        className={cn(
          "relative overflow-hidden bg-ivory",
          large ? "aspect-4/3 md:aspect-auto md:h-[72vh]" : "aspect-3/4",
        )}
      >
        <Photo
          photo={wedding.cover}
          mode="cover"
          sizes={sizes}
          className="transition-transform duration-1200 ease-wedoura group-hover:scale-104"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-ink/75 to-transparent"
        />
        <div className={cn("absolute inset-x-0 bottom-0 text-white", large ? "p-6 md:p-10" : "p-5")}>
          <p className="label text-white/80">
            {cityName}
            {wedding.style ? `${cityName ? " · " : ""}${wedding.style}` : ""}
          </p>
          <p className={cn("mt-2 font-serif leading-none", large ? "text-h2" : "text-h3")}>{wedding.title}</p>
          <p className="mt-3 text-small text-white/85">
            {wedding.couple}
            {large && credit ? ` · Photographs by ${credit}` : ""}
          </p>
        </div>
      </div>
      </Link>
      <SaveButton slug={wedding.slug} name={wedding.title} kind="story" className="absolute top-2 right-2" />
    </div>
  );
}
