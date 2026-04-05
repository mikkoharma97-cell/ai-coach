#!/usr/bin/env node
/**
 * Ainoa tuettu iOS LAN-dev -polku: tyhjennä tila, käynnistä Next LAN:iin,
 * synkkaa Capacitor aina http://<LAN-IP>:3000 — ei manuaalista CAPACITOR_SERVER_URL:ia.
 */
import { execSync, spawn } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { getLanIp } from "./lib/lan-ip.mjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");
const port = 3000;

function killPort(p) {
  try {
    execSync(`kill -9 $(lsof -ti:${p}) 2>/dev/null || true`, {
      shell: true,
      stdio: "ignore",
      cwd: root,
    });
  } catch {
    /* ignore */
  }
}

function cleanNext() {
  try {
    rmSync(join(root, ".next"), { recursive: true, force: true });
  } catch {
    /* ignore */
  }
}

function cleanIosPublic() {
  try {
    rmSync(join(root, "ios", "App", "App", "public"), {
      recursive: true,
      force: true,
    });
  } catch {
    /* ignore */
  }
}

/**
 * @param {string} url
 * @param {number} maxMs
 */
async function waitForHttp(url, maxMs = 120000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (r.ok) return;
    } catch {
      /* not ready */
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  throw new Error(
    `[mobile:dev] Server did not respond at ${url} within ${maxMs}ms`,
  );
}

killPort(port);
cleanNext();
cleanIosPublic();

const ip = getLanIp();
if (!ip) {
  console.error(
    "[mobile:dev] No LAN IP (en0/en1/en2). Manuaalinen CAPACITOR_SERVER_URL on poistettu käytöstä — yhdistä Wi‑Fi tai Ethernet.",
  );
  process.exit(1);
}

const serverUrl = `http://${ip}:${port}`;

const extraOrigins = (process.env.LAN_DEV_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const origins = [...new Set([ip, ...extraOrigins].filter(Boolean))];
process.env.LAN_DEV_ORIGINS = origins.join(",");
process.env.PORT = String(port);

console.log("");
console.log("MODE: DEV (LAN)");
console.log(`PORT: ${port}`);
console.log(`URL: ${serverUrl}`);
console.log(`Using DEV URL: ${serverUrl}`);
console.log("");

const devEnv = {
  ...process.env,
  CAPACITOR_SERVER_URL: serverUrl,
  AI_COACH_FROM_MOBILE_DEV: "1",
};

const dev = spawn(
  "npx",
  ["next", "dev", "-H", "0.0.0.0", "-p", String(port)],
  {
    cwd: root,
    env: devEnv,
    stdio: "inherit",
  },
);

dev.on("exit", (code) => process.exit(code ?? 0));

void (async () => {
  try {
    await waitForHttp(`http://127.0.0.1:${port}/`);
    console.log("[mobile:dev] Dev server OK — running cap sync…");
    const syncEnv = {
      ...process.env,
      CAPACITOR_SERVER_URL: serverUrl,
      PORT: String(port),
      AI_COACH_FROM_MOBILE_DEV: "1",
    };
    execSync("node scripts/cap-sync-dev.mjs", {
      cwd: root,
      env: syncEnv,
      stdio: "inherit",
    });
    const ws = join(root, "ios/App/App.xcworkspace");
    if (existsSync(ws)) {
      execSync(`open "${ws}"`, { stdio: "inherit", shell: true });
      console.log("");
      console.log(
        "  [mobile:dev] Xcode workspace opened. Next dev still running — Ctrl+C to stop.",
      );
      console.log("");
    } else {
      console.warn("[mobile:dev] Missing:", ws, "— try: npm run cap:open");
    }
  } catch (e) {
    console.error(e instanceof Error ? e.message : e);
    try {
      dev.kill("SIGTERM");
    } catch {
      /* ignore */
    }
    process.exit(1);
  }
})();
