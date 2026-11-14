import type { Metadata } from "next";
import { Placeholder } from "@/components/chrome/Placeholder";

export const metadata: Metadata = {
  title: "Vendors",
  description: "Every category and city, with filters for both.",
};

export default function Page() {
  return (
    <Placeholder eyebrow="Vendors" title="All vendors" step={5} />
  );
}
