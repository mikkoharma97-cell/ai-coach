#!/usr/bin/env node
/**
 * Print once when npm runs a full cap sync chain (not via mobile:dev / cap-sync-* wrappers).
 */
if (
  process.env.AI_COACH_CAP_SYNC_ALLOWED === "1" ||
  process.env.AI_COACH_FROM_MOBILE_DEV === "1"
) {
  process.exit(0);
}

console.warn("");
console.warn(
  "[ai-coach] Varoitus: suora `cap sync` / täysi cap:sync ei ole LAN-dev-polku.",
);
console.warn("           iOS LAN -kehitys (yksi tuettu komento): npm run mobile:dev");
console.warn("           TestFlight / HTTPS-prod: npm run cap:sync:prod");
console.warn("");

process.exit(0);
