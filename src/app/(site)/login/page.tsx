import type { Metadata } from "next";
import Link from "next/link";
import { MaskedHeading } from "@/components/motion/MaskedHeading";
import { LoginForm } from "@/components/profile/AuthForms";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "Vendor Login",
  description: "Sign in to your Wedoura vendor profile.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-[70vh] items-center pb-section-sm">
      <Container className="w-full">
        <div className="mx-auto max-w-md border border-line bg-white p-8 md:p-12">
          <MaskedHeading as="h1" className="font-serif text-h2" lines={["Welcome back."]} />
          <p className="mt-3 text-small text-mute">
            Sign in with the email and password from your application. To look around, the demo login
            vendor@gmail.com / 123456 always works.
          </p>
          <div className="mt-8">
            <LoginForm />
          </div>
          <p className="mt-8 border-t border-line pt-5 text-small text-mute">
            Not on Wedoura yet?{" "}
            <Link href="/list-your-business" className="link-draw text-ink">
              List your business
            </Link>
          </p>
        </div>
      </Container>
    </main>
  );
}
