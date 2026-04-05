#!/usr/bin/env node
/**
 * Synkkaa iOS:n DEV-tilaan: aina http://<LAN-IP>:<PORT> — ei https / ei manuaalista prod-URL:ia.
 * Kutsutaan npm run mobile:dev -ketjusta tai cap:sync:dev (sama URL-logiikka).
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { getLanIp } from "./lib/lan-ip.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");

const port = String(Number(process.env.PORT || "3000") || 3000);
const raw = process.env.CAPACITOR_SERVER_URL?.trim() ?? "";

if (raw.includes("https://")) {
  console.error(
    "[cap-sync-dev] DEV SYNC yrittää käyttää production URL:ia",
  );
  process.exit(1);
}

const ip = getLanIp();
if (!ip) {
  console.error(
    "[cap-sync-dev] No LAN IP — cannot resolve DEV server URL. Use npm run mobile:dev on a Mac with Wi‑Fi.",
  );
  process.exit(1);
}

const url = `http://${ip}:${port}`;

console.log("MODE: DEV (LAN)");
console.log(`[cap-sync-dev] CAPACITOR_SERVER_URL = ${url}`);

const env = { ...process.env, CAPACITOR_SERVER_URL: url };

function run(cmd, args) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    stdio: "inherit",
    env,
    shell: process.platform === "win32",
  });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

run(process.execPath, [join(root, "scripts/prepare-cap-web.mjs")]);
run(process.execPath, [join(root, "scripts/run-cap-sync-ios.mjs")]);
