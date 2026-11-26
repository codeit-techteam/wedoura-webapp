import { SiteFooter } from "@/components/chrome/SiteFooter";
import { SiteHeader } from "@/components/chrome/SiteHeader";

/** The public site's chrome: header and footer. */
export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-1 flex-col">{children}</div>
        <SiteFooter />
      </div>
    </>
  );
}
