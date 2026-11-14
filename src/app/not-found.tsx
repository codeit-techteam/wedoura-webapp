import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col">
      <Container className="flex flex-1 flex-col items-start justify-center py-section">
        <Label>404</Label>
        <Heading level={1} size="h1" className="mt-4">
          This page has <em>wandered off</em>.
        </Heading>
        <Button href="/" variant="link" className="mt-10">
          Back to the homepage
        </Button>
      </Container>
    </main>
  );
}
