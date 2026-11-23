import { redirect } from "next/navigation";

export default function LegacySubmitPage() {
  redirect("/vendor-studio/profile#submit");
}
