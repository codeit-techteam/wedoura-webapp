import { NextResponse } from "next/server";
import { searchSuggestions } from "@/lib/api";

/** GET /api/search?q= — capped suggestions for the search overlay (see
 *  docs/api-contract.md, GET /search). The full vendor index never ships
 *  to the browser. */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q") ?? "";
  const suggestions = await searchSuggestions(q);
  return NextResponse.json(suggestions);
}
