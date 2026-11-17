import Link from "next/link";
import { Photo } from "@/components/media/Photo";
import type { Photo as PhotoData } from "@/data/types";
import { cn } from "@/lib/cn";

type Props = {
  photo: PhotoData;
  title: string;
  /** One quiet line under the title, e.g. a vendor count. */
  meta?: string;
  href?: string;
  sizes: string;
  /** Fills its parent; give the parent the aspect or height. */
  className?: string;
  titleClassName?: string;
  /** Focal point when the tile fills its box (cover mode). */
  objectPosition?: string;
};

/** A photo tile with the name over a bottom gradient. Used for categories,
 *  cities and venue spaces. The parent sets the size. */
export function PhotoTile({ photo, title, meta, href, sizes, className, titleClassName, objectPosition }: Props) {
  const inner = (
    <>
      <Photo
        photo={photo}
        mode="cover"
        sizes={sizes}
        objectPosition={objectPosition}
        className="transition-transform duration-1200 ease-wedoura group-hover:scale-104"
      />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-ink/75 to-transparent" />
      <p className={cn("absolute inset-x-0 bottom-0 p-5 font-serif text-h3 text-white md:p-6", titleClassName)}>
        {title}
        {meta && <span className="mt-1 block font-sans text-small text-white/80">{meta}</span>}
      </p>
    </>
  );
  const classes = cn("group relative block h-full overflow-hidden bg-ivory", className);
  if (href) {
    return (
      <Link href={href} className={classes}>
        {inner}
      </Link>
    );
  }
  return <div className={classes}>{inner}</div>;
}
