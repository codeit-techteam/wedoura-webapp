import { redirect } from "next/navigation";

/** Albums stay editable from the profile media pool for now. */
export default function LegacyAlbumsPage() {
  redirect("/vendor-studio/media");
}
