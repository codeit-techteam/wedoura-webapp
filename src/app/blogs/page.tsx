import type { Metadata } from "next";
import { Placeholder } from "@/components/chrome/Placeholder";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Planning notes, venue guides and ideas that photograph well.",
};

export default function Page() {
  return (
    <Placeholder eyebrow="Blogs" title="From the blog" step={7} />
  );
}
