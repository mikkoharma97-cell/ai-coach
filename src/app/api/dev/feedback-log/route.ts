import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

import type { FeedbackEntryV2 } from "@/lib/feedbackStorage";
import type { Locale } from "@/lib/i18n";

export const runtime = "nodejs";

const LOG_REL = ["docs", "feedback-log.json"] as const;

type FeedbackLogPayload = FeedbackEntryV2 & { locale?: Locale };

type FeedbackLogFile = {
  version: 1;
  entries: Array<
    FeedbackEntryV2 & {
      locale?: Locale;
      receivedAt: string;
    }
  >;
};

function isDev(): boolean {
  return process.env.NODE_ENV === "development";
}

function isPayload(x: unknown): x is FeedbackLogPayload {
  if (!x || typeof x !== "object") return false;
  const o = x as Record<string, unknown>;
  return (
    typeof o.id === "string" &&
    typeof o.message === "string" &&
    (o.type === "bug" || o.type === "confusing" || o.type === "idea") &&
    typeof o.path === "string" &&
    typeof o.device === "string" &&
    typeof o.timestamp === "number" &&
    o.viewport !== null &&
    typeof o.viewport === "object" &&
    typeof (o.viewport as { w?: unknown }).w === "number" &&
    typeof (o.viewport as { h?: unknown }).h === "number" &&
    (o.locale === undefined || o.locale === "fi" || o.locale === "en")
  );
}

export async function POST(request: Request) {
  if (!isDev()) {
    return NextResponse.json({ error: "disabled" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!isPayload(body)) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const { locale, ...entry } = body;
  const filePath = path.join(process.cwd(), ...LOG_REL);
  const receivedAt = new Date().toISOString();

  const record: FeedbackLogFile["entries"][number] = {
    ...entry,
    ...(locale ? { locale } : {}),
    receivedAt,
  };

  let data: FeedbackLogFile = { version: 1, entries: [] };
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = JSON.parse(raw) as unknown;
    if (
      parsed &&
      typeof parsed === "object" &&
      Array.isArray((parsed as FeedbackLogFile).entries)
    ) {
      data = parsed as FeedbackLogFile;
    }
  } catch {
    /* ensimmäinen kirjoitus tai korruptio → aloita tyhjästä */
  }

  data.entries = [record, ...data.entries];

  await writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");

  return NextResponse.json({ ok: true });
}
