import { redirect } from "next/navigation";

export default function LegacyLocationsPage() {
  redirect("/vendor-studio/profile#locations");
}
