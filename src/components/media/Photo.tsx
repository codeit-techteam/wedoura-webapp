import Image from "next/image";
import type { Photo as PhotoData } from "@/data/types";
import { cn } from "@/lib/cn";

type Props = {
  photo: PhotoData;
  /** Responsive sizes hint, e.g. "(min-width: 768px) 50vw, 100vw". Required so the browser picks the right file. */
  sizes: string;
  /**
   * intrinsic (default): the box takes the photo's own aspect ratio, so the
   * whole photograph is shown and nothing shifts while it loads.
   * cover: fills the parent (which must be positioned and sized). Only for
   * hero and cover images where the brief allows a crop.
   */
  mode?: "intrinsic" | "cover";
  priority?: boolean;
  quality?: 60 | 75 | 90;
  className?: string;
  /** For cover mode: focal point, e.g. "50% 30%". */
  objectPosition?: string;
};

export function Photo({ photo, sizes, mode = "intrinsic", priority, quality = 75, className, objectPosition }: Props) {
  if (mode === "cover") {
    return (
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={quality}
        placeholder="blur"
        blurDataURL={photo.blurDataURL}
        className={cn("object-cover", className)}
        style={objectPosition ? { objectPosition } : undefined}
      />
    );
  }
  return (
    <Image
      src={photo.src}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      sizes={sizes}
      priority={priority}
      quality={quality}
      placeholder="blur"
      blurDataURL={photo.blurDataURL}
      className={cn("h-auto w-full", className)}
    />
  );
}
