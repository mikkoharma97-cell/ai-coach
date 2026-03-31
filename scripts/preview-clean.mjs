/**
 * preview:clean — sammuttaa tyypilliset prosessit (Unix) ja poistaa .next
 */
import { execSync } from "node:child_process";
import { rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");

function tryExec(cmd) {
  try {
    execSync(cmd, { stdio: "ignore", shell: true });
  } catch {
    /* prosessia ei löytynyt */
  }
}

if (process.platform === "win32") {
  console.log(
    "[preview:clean] Windows: sulje 'next' / cloudflared manuaalisesti tarvittaessa.",
  );
} else {
  tryExec('pkill -f "next dev"');
  tryExec('pkill -f "next start"');
  tryExec('pkill -f "cloudflared tunnel"');
}

const nextDir = join(root, ".next");
if (existsSync(nextDir)) {
  rmSync(nextDir, { recursive: true, force: true });
  console.log("[preview:clean] removed .next");
} else {
  console.log("[preview:clean] .next (ei ollut)");
}

console.log("[preview:clean] valmis");
