import { BottomBar } from "@/components/chrome/BottomBar";
import { SiteFooter } from "@/components/chrome/SiteFooter";
import { SiteHeader } from "@/components/chrome/SiteHeader";

/** The public site's chrome: navbar, footer, mobile bottom bar. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col pb-bottombar">
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
      </div>
      <BottomBar />
    </>
  );
}
