import { NextRequest, NextResponse } from "next/server";
import { getTrainingIntelligenceStore } from "@/lib/content/getArticles";
import { profileFromSearchParams } from "@/lib/content/profileQuery";
import { selectTrainingHighlight } from "@/lib/content/selectHighlight";

export const dynamic = "force-dynamic";

/**
 * Palauttaa yhden kuratoidun korostuksen — ei koko listaa (ei feediä).
 */
export async function GET(req: NextRequest) {
  const store = await getTrainingIntelligenceStore();
  const profile = profileFromSearchParams(req.nextUrl.searchParams);
  const highlight = selectTrainingHighlight(profile, store.articles);
  return NextResponse.json({
    highlight,
    lastRefreshedAt: store.lastRefreshedAt,
  });
}
