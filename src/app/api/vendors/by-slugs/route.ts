import { NextResponse } from "next/server";
import { getVendorSummariesBySlugs } from "@/lib/api";

const MAX_SLUGS = 200;

/** GET /api/vendors/by-slugs?slugs=a,b,c — summaries for the visitor's saved
 *  shortlist (see docs/api-contract.md, GET /vendors?slugs=). Unknown and
 *  unpublished slugs are simply absent from the result. */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("slugs") ?? "";
  const slugs = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_SLUGS);
  const vendors = await getVendorSummariesBySlugs(slugs);
  return NextResponse.json({ vendors });
}
