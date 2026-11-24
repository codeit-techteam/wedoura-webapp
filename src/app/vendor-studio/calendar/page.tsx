import { redirect } from "next/navigation";

/** Calendar removed from the dashboard; availability types remain for later. */
export default function CalendarRemovedPage() {
  redirect("/vendor-studio");
}
