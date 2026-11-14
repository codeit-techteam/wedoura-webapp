"use client";

import { motion } from "motion/react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Photo } from "@/components/media/Photo";
import type { Photo as PhotoData } from "@/data/types";
import { cn } from "@/lib/cn";
import { zoom } from "@/lib/motion";

type Props = {
  photo: PhotoData;
  sizes: string;
  /** Small uppercase line above the title. */
  eyebrow?: ReactNode;
  title?: ReactNode;
  meta?: ReactNode;
  href?: string;
  onClick?: () => void;
  /** Shared-element id for the full-screen viewer. */
  layoutId?: string;
  priority?: boolean;
  className?: string;
};

/**
 * Photograph shown whole at its own aspect ratio, with the slow zoom on hover
 * or press (motion 2). Square corners, no shadow. Wrap in <Reveal> for the
 * enter animation.
 */
export function PhotoCard({ photo, sizes, eyebrow, title, meta, href, onClick, layoutId, priority, className }: Props) {
  const image = (
    <motion.div
      className="relative overflow-hidden bg-ivory"
      initial="rest"
      whileHover="hover"
      whileTap="hover"
      whileFocus="hover"
    >
      <motion.div variants={zoom} transition={zoom.transition} layoutId={layoutId} className="will-change-transform">
        <Photo photo={photo} sizes={sizes} priority={priority} />
      </motion.div>
    </motion.div>
  );

  const caption = (title || eyebrow || meta) && (
    <figcaption className="mt-4">
      {eyebrow && <p className="label text-mute">{eyebrow}</p>}
      {title && <p className="mt-1 font-serif text-h3 leading-tight">{title}</p>}
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
