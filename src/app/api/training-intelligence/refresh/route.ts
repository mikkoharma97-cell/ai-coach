import { NextRequest, NextResponse } from "next/server";
import { refreshTrainingIntelligence } from "@/lib/content/refresh";

export const dynamic = "force-dynamic";

/**
 * Taustapäivitys — kutsu cronista 1–2×/pv (Authorization: Bearer CRON_SECRET).
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await refreshTrainingIntelligence();
  return NextResponse.json(result);
}
