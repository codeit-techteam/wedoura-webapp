"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import type { VendorAccount } from "@/data/types";
import { logout } from "@/lib/vendor-api";

/** What non-approved accounts see instead of the portal. */
export function AccountStatusScreen({ account }: { account: VendorAccount }) {
  return (
    <main className="flex min-h-dvh flex-col justify-center bg-ivory py-16">
      <Container>
        {account.status === "applied" && (
          <Card label="Application received" title="Your application is under review." role="status">
            <p className="mt-4 text-mute">
              We look at every application by hand, usually within a few days. Once you are approved, this
              page becomes your studio: you build your profile here and submit it for review.
            </p>
          </Card>
        )}
        {account.status === "rejected" && (
          <Card label="Application update" title="We could not approve this application." role="status">
            <p className="mt-4 text-mute">{account.rejectionNote || "Write to us if you think we got this wrong."}</p>
            <div className="mt-8">
              <Button href="/contact" variant="outline">
                Contact us
              </Button>
            </div>
          </Card>
        )}
        {account.status === "suspended" && (
          <Card label="Account" title="This account is suspended." role="status">
            <p className="mt-4 text-mute">
              Your listing is not shown to couples right now. Write to us to sort it out.
            </p>
            <div className="mt-8">
              <Button href="/contact" variant="outline">
                Contact us
              </Button>
            </div>
          </Card>
        )}
      </Container>
    </main>
  );
}

function Card({
  label,
  title,
  role,
  children,
}: {
  label: string;
  title: string;
  role?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="mx-auto w-full max-w-xl border border-line bg-white p-8 md:p-12" role={role}>
      <Label>{label}</Label>
      <p className="mt-3 font-serif text-h2">{title}</p>
      {children}
      <p className="mt-8 border-t border-line pt-5">
        <button
          type="button"
          onClick={() => {
            void logout().then(() => router.push("/"));
          }}
          className="link-draw tap text-small text-mute hover:text-ink"
        >
          Sign out
        </button>
      </p>
    </div>
  );
}
