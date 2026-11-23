import { redirect } from "next/navigation";

/** 360 tour scenes are managed with portfolio 360 photos; full editor returns in a later pass. */
export default function LegacyTourPage() {
  redirect("/vendor-studio/media");
}
