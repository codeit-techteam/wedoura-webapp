"use client";

import { createContext, useContext, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Aspect ratios a row of cards may share. Galleries use none and show each photo whole. */
export type CardRatio = "4/5" | "3/4" | "1/1" | "4/3" | "3/2" | "16/9";

const ratioClass: Record<CardRatio, string> = {
  "4/5": "aspect-4/5",
  "3/4": "aspect-3/4",
  "1/1": "aspect-square",
  "4/3": "aspect-4/3",
  "3/2": "aspect-3/2",
  "16/9": "aspect-video",
};

const CardRowContext = createContext<CardRatio | null>(null);

/** Read by PhotoCard: when inside a CardRow, the card adopts the row's ratio. */
export function useCardRatio(): CardRatio | null {
  return useContext(CardRowContext);
}

export function cardRatioClass(ratio: CardRatio): string {
  return ratioClass[ratio];
}

type Props = {
  /** One ratio for every card in the row. */
  ratio: CardRatio;
  /** Columns from the tablet breakpoint up. Phones get `mobileColumns`. */
  columns?: 2 | 3 | 4 | 6;
  mobileColumns?: 1 | 2;
  children: ReactNode;
  className?: string;
  as?: "ul" | "div";
};

const cols = { 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4", 6: "md:grid-cols-3 xl:grid-cols-6" };
const mobileCols = { 1: "grid-cols-1", 2: "grid-cols-2" };

/**
 * A row of cards that share one aspect ratio, chosen per row, so edges line
 * up. Photos are cropped to the ratio with their focal point kept. For
 * galleries, where every photo must be shown whole, do not use this; lay
 * PhotoCards out directly.
 */
export function CardRow({ ratio, columns = 3, mobileColumns = 1, children, className, as: Tag = "ul" }: Props) {
  return (
    <CardRowContext.Provider value={ratio}>
      <Tag className={cn("grid gap-x-5 gap-y-10 md:gap-x-6", mobileCols[mobileColumns], cols[columns], className)}>
        {children}
      </Tag>
    </CardRowContext.Provider>
  );
}
