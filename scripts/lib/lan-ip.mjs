/**
 * Jaettu LAN-IPv4 (macOS: ipconfig getifaddr). Käyttö: dev-mobile, cap-sync-dev, mobile-dev.
 */
import { execSync } from "node:child_process";

const IFACES = ["en0", "en1", "en2"];

/**
 * @returns {string} Esim. "192.168.1.5" tai "" jos ei löydy.
 */
export function getLanIp() {
  for (const iface of IFACES) {
    try {
      const ip = execSync(`ipconfig getifaddr ${iface}`, {
        encoding: "utf8",
      }).trim();
      if (ip && !ip.startsWith("127.")) return ip;
    } catch {
      /* next iface */
    }
  }
  return "";
}
