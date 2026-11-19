import { Cormorant_Garamond, Jost } from "next/font/google";

// Display serif: Cormorant Garamond, light + regular, with the light italic
// for the single gold accent word in headlines.
export const cormorant = Cormorant_Garamond({
  weight: ["300", "400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

// Body and UI: Jost. 400 body, 500 for nav/buttons/labels, 300 for large
// lead paragraphs only (20px and up).
export const jost = Jost({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});
