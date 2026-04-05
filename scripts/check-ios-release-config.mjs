#!/usr/bin/env node
/**
 * Release safety guard: iOS capacitor config must not point to LAN/dev URLs.
 * Used in TestFlight prep after production sync.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");
const cfgPath = join(root, "ios", "App", "App", "capacitor.config.json");

function fail(message) {
  console.error(`[ios-release-check] ${message}`);
  process.exit(1);
}

function isPrivateHost(hostname) {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1" || h.endsWith(".local")) return true;
  if (h.startsWith("10.")) return true;
  if (h.startsWith("192.168.")) return true;
  const m = /^172\.(\d{1,2})\./.exec(h);
  if (m) {
    const n = Number(m[1]);
    if (n >= 16 && n <= 31) return true;
  }
  return false;
}

let parsed;
try {
  parsed = JSON.parse(readFileSync(cfgPath, "utf8"));
} catch (error) {
  fail(
    `Unable to read ${cfgPath} (${error instanceof Error ? error.message : String(error)})`,
  );
}

const url = parsed?.server?.url;
if (!url) {
  fail(
    "Missing server.url in ios/App/App/capacitor.config.json. Run CAPACITOR_SERVER_URL=https://<prod-host> npm run cap:sync:prod",
  );
}

let u;
try {
  u = new URL(url);
} catch {
  fail(`Invalid server.url in ios/App/App/capacitor.config.json: ${String(url)}`);
}

if (u.protocol !== "https:") {
  fail(`server.url must use https for release builds. Found: ${u.toString()}`);
}
if (isPrivateHost(u.hostname)) {
  fail(
    `server.url points to private/dev host (${u.hostname}). Run CAPACITOR_SERVER_URL=https://<prod-host> npm run cap:sync:prod`,
  );
}

console.log(`[ios-release-check] OK: ${u.toString()}`);
