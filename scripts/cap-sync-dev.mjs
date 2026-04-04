#!/usr/bin/env node
/**
 * Synkkaa iOS:n CAPACITOR_SERVER_URL:lla → LAN Next-dev (http).
 * Ei aja `npm run build` — käytä kun `npm run dev:mobile` pyöii.
 * Vaatii: ios/ + Info.plist NSAllowsLocalNetworking (repo).
 */
import { spawnSync } from "node:child_process";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");

function getLanIp() {
  for (const iface of ["en0", "en1", "en2"]) {
    try {
      const ip = execSync(`ipconfig getifaddr ${iface}`, {
        encoding: "utf8",
      }).trim();
      if (ip && !ip.startsWith("127.")) return ip;
    } catch {
      /* next */
    }
  }
  return "";
}

const port = String(Number(process.env.PORT || "3000") || 3000);
const explicit = process.env.CAPACITOR_SERVER_URL?.trim();
const ip = getLanIp();
const url =
  explicit ||
  (ip ? `http://${ip}:${port}` : "");

if (!url) {
  console.error(
    "[cap-sync-dev] Set CAPACITOR_SERVER_URL (e.g. http://192.168.x.x:3000) or use a Mac with en0 LAN IP.",
  );
  process.exit(1);
}

console.log("[cap-sync-dev] CAPACITOR_SERVER_URL =", url);

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
run("npx", ["cap", "sync", "ios"]);
