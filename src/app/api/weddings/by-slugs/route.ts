import { NextResponse } from "next/server";
import { listWeddings } from "@/lib/api";

const MAX_SLUGS = 200;

/** GET /api/weddings/by-slugs?slugs=a,b,c — the saved page's shortlisted
 *  stories (see docs/api-contract.md, GET /weddings?slugs=). */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("slugs") ?? "";
  const slugs = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_SLUGS);
  if (slugs.length === 0) return NextResponse.json({ weddings: [] });
  const page = await listWeddings({ slugs, limit: MAX_SLUGS });
  return NextResponse.json({ weddings: page.items });
}
