#!/usr/bin/env node
/**
 * Production/TestFlight-safe iOS sync:
 * - requires CAPACITOR_SERVER_URL
 * - requires https
 * - blocks localhost/LAN/private hosts
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { readFileSync } from "node:fs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");
const rawUrl = process.env.CAPACITOR_SERVER_URL?.trim() ?? "";

function fail(message) {
  console.error(`[cap-sync-prod] ${message}`);
  process.exit(1);
}

function isPrivateHost(hostname) {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".local")) return true;
  if (h === "127.0.0.1") return true;
  if (h.startsWith("10.")) return true;
  if (h.startsWith("192.168.")) return true;
  const m = /^172\.(\d{1,2})\./.exec(h);
  if (m) {
    const n = Number(m[1]);
    if (n >= 16 && n <= 31) return true;
  }
  return false;
}

if (!rawUrl) {
  fail("CAPACITOR_SERVER_URL is required (example: https://your-app.vercel.app).");
}

let parsed;
try {
  parsed = new URL(rawUrl);
} catch {
  fail(`Invalid CAPACITOR_SERVER_URL: ${rawUrl}`);
}

if (parsed.protocol !== "https:") {
  fail("CAPACITOR_SERVER_URL must use https for production/TestFlight.");
}
if (!parsed.hostname) {
  fail("CAPACITOR_SERVER_URL must include a hostname.");
}
if (isPrivateHost(parsed.hostname)) {
  fail(`Blocked private/dev host for production sync: ${parsed.hostname}`);
}

const env = { ...process.env, CAPACITOR_SERVER_URL: parsed.toString() };

function run(cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

console.log("[cap-sync-prod] CAPACITOR_SERVER_URL =", parsed.toString());
run("npm", ["run", "build"]);
run("npm", ["run", "cap:prepare"]);
run("npx", ["cap", "sync", "ios"]);

try {
  const cfgPath = join(root, "ios", "App", "App", "capacitor.config.json");
  const cfg = JSON.parse(readFileSync(cfgPath, "utf8"));
  const synced = cfg?.server?.url ?? "";
  if (!synced) fail("Sync completed but ios capacitor.config.json has no server.url.");
  if (synced !== parsed.toString()) {
    fail(`Sync mismatch: expected ${parsed.toString()}, found ${synced}`);
  }
  if (isPrivateHost(new URL(synced).hostname)) {
    fail(`Unsafe server.url remained after sync: ${synced}`);
  }
} catch (error) {
  fail(
    `Unable to validate ios/App/App/capacitor.config.json (${error instanceof Error ? error.message : String(error)})`,
  );
}

console.log("[cap-sync-prod] iOS sync is production-safe.");
