import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import { Text } from "@/components/ui/Text";

type Props = {
  eyebrow: string;
  title: ReactNode;
  /** Build-order step from the brief that delivers this page. */
  step: number;
  children?: ReactNode;
};

/** Empty page shell so no link is broken while routes are being built. */
export function Placeholder({ eyebrow, title, step, children }: Props) {
  return (
    <main className="flex flex-1 flex-col">
      <Container className="flex flex-1 flex-col items-start justify-center py-section">
        <Label>{eyebrow}</Label>
        <Heading level={1} size="h1" className="mt-4 max-w-4xl">
          {title}
        </Heading>
        <Text tone="mute" className="mt-6 max-w-prose">
          This page is on the build list (step {step}). The navigation around it is real; the content is not here
          yet.
        </Text>
        {children}
        <Button href="/" variant="link" className="mt-10">
          Back to the homepage
        </Button>
      </Container>
    </main>
  );
}
