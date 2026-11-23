import { Bodoni_Moda, EB_Garamond, Jost } from "next/font/google";

// Display serif. The client's files use EB Garamond (the earlier note said
// Cormorant; the files win). Italic 400 and 500 are the accent words.
export const ebGaramond = EB_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-eb-garamond",
  display: "swap",
});

// The WEDOURA wordmark only. Wide tracking is set on the wordmark utility.
export const bodoni = Bodoni_Moda({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bodoni",
  display: "swap",
});

// Body and UI. 400 for text, 500 for navigation, buttons and labels.
export const jost = Jost({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});
