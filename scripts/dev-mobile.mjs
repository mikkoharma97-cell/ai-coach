#!/usr/bin/env node
/**
 * Dev server: bind 0.0.0.0 + set LAN_DEV_ORIGINS so Next.js allows /_next/* from phone.
 * Jos PORT (oletus 3000) on varattu, kokeillaan seuraavia portteja — tulostettu linkki vastaa valittua porttia.
 * Usage: npm run dev:mobile
 */
import { spawn } from "node:child_process";
import { execSync } from "node:child_process";
import { createServer } from "node:net";

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

/**
 * @param {number} start
 * @param {number} maxAttempts
 * @returns {Promise<number>}
 */
function findFreePort(start, maxAttempts = 12) {
  return new Promise((resolve, reject) => {
    const tryListen = (port, left) => {
      const srv = createServer();
      srv.once("error", () => {
        srv.close();
        if (left <= 0) {
          reject(
            new Error(
              `No free port in range ${start}–${start + maxAttempts - 1}`,
            ),
          );
          return;
        }
        tryListen(port + 1, left - 1);
      });
      srv.listen(port, "0.0.0.0", () => {
        srv.close(() => resolve(port));
      });
    };
    tryListen(start, maxAttempts);
  });
}

const ip = getLanIp();
const extra = (process.env.LAN_DEV_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const origins = [...new Set([ip, ...extra].filter(Boolean))];
process.env.LAN_DEV_ORIGINS = origins.join(",");

const preferred = Number(process.env.PORT || "3000") || 3000;

let port;
try {
  port = await findFreePort(preferred);
} catch (e) {
  console.error("[dev:mobile]", e instanceof Error ? e.message : e);
  process.exit(1);
}

if (port !== preferred) {
  console.log("");
  console.log(
    `  [dev:mobile] Port ${preferred} was busy — using ${port} instead.`,
  );
}
process.env.PORT = String(port);

console.log("");
console.log("  Coach — mobile dev");
console.log(`  Same Wi‑Fi (Safari):  http://${ip || "<LAN-IP>"}:${port}`);
console.log(`  Local:                http://localhost:${port}`);
console.log("");
if (!ip) {
  console.warn(
    "  [warn] No en0/en1 IP — set LAN_DEV_ORIGINS manually, e.g. LAN_DEV_ORIGINS=192.168.1.5",
  );
  console.log("");
}

const child = spawn(
  "npx",
  ["next", "dev", "-H", "0.0.0.0", "-p", String(port)],
  {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32",
  },
);

child.on("exit", (code) => process.exit(code ?? 0));
