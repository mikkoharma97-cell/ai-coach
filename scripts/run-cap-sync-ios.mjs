#!/usr/bin/env node
/**
 * Single choke point for `npx cap sync ios` — sets guard env so npm scripts can
 * distinguish intentional sync from ad-hoc CLI usage.
 */
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "..");

const env = {
  ...process.env,
  AI_COACH_CAP_SYNC_ALLOWED: "1",
};

const r = spawnSync("npx", ["cap", "sync", "ios"], {
  cwd: root,
  stdio: "inherit",
  env,
  shell: process.platform === "win32",
});

process.exit(r.status ?? 1);
