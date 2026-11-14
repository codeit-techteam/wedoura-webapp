import { DM_Sans, Instrument_Serif } from "next/font/google";

// Display serif: Instrument Serif, regular weight only (it ships no others).
export const instrument = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

// Body and UI: DM Sans (variable), 400 with 500 for emphasis.
export const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
  display: "swap",
});
