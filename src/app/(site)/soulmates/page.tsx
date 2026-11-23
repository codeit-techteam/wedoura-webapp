import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import { Text } from "@/components/ui/Text";

export const metadata: Metadata = {
  title: "Soulmates",
  description: "Wedoura Soulmates is a waiting list for now.",
};

/** A holding page so the new navigation has somewhere to land. The full page is a later session. */
export default function SoulmatesPage() {
  return (
    <main>
      <Container className="py-section-sm">
        <Label>Soulmates</Label>
        <Heading level={1} className="mt-4">
          A quieter way to <em>meet</em>
        </Heading>
        <Text tone="mute" className="mt-6 max-w-prose">
          Soulmates is not open yet. The waiting list arrives with the rest of this page. Nothing here asks for a
          date of birth, an income, or an identity document.
        </Text>
      </Container>
    </main>
  );
}
