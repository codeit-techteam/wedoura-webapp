"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge360 } from "@/components/media/Badge360";
import { cardRatioClass, useCardRatio, type CardRatio } from "@/components/media/CardRow";
import { Photo } from "@/components/media/Photo";
import type { Photo as PhotoData } from "@/data/types";
import { cn } from "@/lib/cn";
import { zoom } from "@/lib/motion";

type Props = {
  photo: PhotoData;
  sizes: string;
  /**
   * Shared ratio for a row of cards. Inherited from a surrounding CardRow
   * when omitted. With no ratio at all (galleries), the photo is shown whole.
   */
  ratio?: CardRatio;
  /** Focal point when cropped to a ratio, e.g. "50% 30%". */
  objectPosition?: string;
  /** Small uppercase line above the title. */
  eyebrow?: ReactNode;
  title?: ReactNode;
  meta?: ReactNode;
  href?: string;
  onClick?: () => void;
  /** Shared-element id for the full-screen viewer. */
  layoutId?: string;
  priority?: boolean;
  /** Smaller caption for dense rows such as the vendors panel. */
  compact?: boolean;
  className?: string;
};

/**
 * Photograph card with the slow zoom on hover or press (motion 2).
 * Square corners, no shadow. Wrap in <Reveal> for the enter animation.
 */
export function PhotoCard({
  photo,
  sizes,
  ratio: ratioProp,
  objectPosition,
  eyebrow,
  title,
  meta,
  href,
  onClick,
  layoutId,
  priority,
  compact,
  className,
}: Props) {
  const rowRatio = useCardRatio();
  const ratio = ratioProp ?? rowRatio;

  const image = (
    <motion.div
      className={cn("relative overflow-hidden bg-ivory", ratio && cardRatioClass(ratio))}
      initial="rest"
      whileHover="hover"
      whileTap="hover"
      whileFocus="hover"
    >
      <motion.div
        variants={zoom}
        transition={zoom.transition}
        layoutId={layoutId}
        className={cn("will-change-transform", ratio && "absolute inset-0")}
      >
        {ratio ? (
          <Photo photo={photo} sizes={sizes} priority={priority} mode="cover" objectPosition={objectPosition} />
        ) : (
          <Photo photo={photo} sizes={sizes} priority={priority} />
        )}
      </motion.div>
      {photo.projection === "equirectangular" && <Badge360 />}
    </motion.div>
  );

  const caption = (title || eyebrow || meta) && (
    <figcaption className={compact ? "mt-3" : "mt-4"}>
      {eyebrow && <p className="label text-mute">{eyebrow}</p>}
      {title && <p className={cn("mt-1 font-serif", compact ? "text-lead" : "text-h3")}>{title}</p>}
      {meta && <p className="mt-1 text-small text-mute">{meta}</p>}
    </figcaption>
  );

  const body = (
    <>
      {image}
      {caption}
    </>
  );

  const interactive = "block w-full text-left outline-offset-4";

  return (
    <figure className={cn("group", className)}>
      {href ? (
        <Link href={href} className={interactive}>
          {body}
        </Link>
      ) : onClick ? (
        <button type="button" onClick={onClick} className={interactive} aria-label={`Open ${photo.alt}`}>
          {body}
        </button>
      ) : (
        body
      )}
    </figure>
  );
}
