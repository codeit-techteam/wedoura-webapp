"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { DirtyProvider } from "@/components/studio/autosave";
import { AccountStatusScreen } from "@/components/studio/StatusScreens";
import { StudioShell } from "@/components/studio/StudioShell";
import { Skeleton } from "@/components/ui/Skeleton";
import { useMyAccount, useMyListing, useSessionHydrated } from "@/lib/vendor-api";

/**
 * The portal gate and shell. Logged-out visitors go to /login; applied,
 * rejected and suspended accounts see their status screen; approved vendors
 * get the studio around every child screen.
 */
export default function VendorStudioLayout({ children }: { children: ReactNode }) {
  const hydrated = useSessionHydrated();
  const account = useMyAccount();
  const listing = useMyListing();
  const router = useRouter();

  useEffect(() => {
    if (hydrated && !account) router.replace("/login");
  }, [hydrated, account, router]);

  if (!hydrated || !account) {
    return (
      <div className="min-h-dvh bg-ivory/60 p-gutter lg:flex lg:gap-10 lg:p-0" aria-busy="true">
        <Skeleton className="hidden h-dvh w-64 lg:block" />
        <div className="flex-1 space-y-4 py-10 lg:pr-10">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-2/3" />
        </div>
      </div>
    );
  }

  if (account.status !== "approved") {
    return <AccountStatusScreen account={account} />;
  }

  return (
    <DirtyProvider>
      <StudioShell account={account} listing={listing}>
        {children}
      </StudioShell>
    </DirtyProvider>
  );
}
